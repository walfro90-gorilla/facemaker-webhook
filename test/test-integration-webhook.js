// test/test-integration-webhook.js
// Script de integración para validar el parsing y la actualización en HubSpot con 3 usuarios distintos
// Cada mensaje incluye todos los campos: nombre, teléfono, intención, producto, fecha, hora, PSID, mensaje original

import assert from 'assert';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { Client } from '@hubspot/api-client';

dotenv.config();

const WEBHOOK_URL = 'http://localhost:3000/api/webhook';
const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;
const hubspot = new Client({ accessToken: HUBSPOT_TOKEN });

const TEST_PREFIX = '⚠️⚠️⚠️TESTING⚠️⚠️⚠️ ';

const testUsers = [
  {
    psid: 'psid-test-1',
    nombre: 'Ana López',
    telefono: '5512345678',
    intencion: 'agendar cita',
    producto: 'botox',
    fecha: 'mañana',
    hora: '10:00 am',
    mensaje: 'Hola, mi nombre es Ana López, mi teléfono es 5512345678. Quiero agendar cita para botox mañana a las 10:00 am.'
  },
  {
    psid: 'psid-test-2',
    nombre: 'Carlos Ramírez',
    telefono: '5587654321',
    intencion: 'pedir información',
    producto: 'rinoplastia',
    fecha: 'viernes',
    hora: '16:30',
    mensaje: 'Buen día, soy Carlos Ramírez, mi teléfono es 5587654321. Me interesa pedir información sobre rinoplastia para el viernes a las 16:30.'
  },
  {
    psid: 'psid-test-3',
    nombre: 'María Torres',
    telefono: '5598765432',
    intencion: 'cancelar',
    producto: 'suero',
    fecha: 'hoy',
    hora: '12:00 pm',
    mensaje: 'Hola, soy María Torres, mi teléfono es 5598765432. Quiero cancelar mi cita de suero hoy a las 12:00 pm.'
  }
];

// Solo enviar el mensaje natural del usuario, no la ficha completa
function buildFullMessage(user) {
  return user.mensaje;
}

async function sendWebhookMessage({ mensaje, psid, nombre }) {
  // Agrega el prefijo de testing al nombre antes de enviar
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje, psid, nombre: TEST_PREFIX + nombre }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    let data;
    try {
      data = await res.json();
    } catch (e) {
      console.error('❌ Error parseando JSON de respuesta del webhook:', e);
      throw new Error('Respuesta del webhook no es JSON válido');
    }
    return { status: res.status, data };
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('❌ Timeout esperando respuesta del webhook');
      throw new Error('Timeout esperando respuesta del webhook');
    }
    throw err;
  }
}

async function getContactByEmail(email) {
  try {
    const res = await hubspot.crm.contacts.searchApi.doSearch({
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
      properties: ['email', 'firstname', 'lastname', 'phone', 'updated'],
      limit: 1
    });
    return res.results?.[0] || null;
  } catch (e) {
    console.error('❌ Error consultando contacto en HubSpot:', e);
    throw e;
  }
}

async function getDealByPsid(psid) {
  try {
    const res = await hubspot.crm.deals.searchApi.doSearch({
      filterGroups: [{ filters: [
        { propertyName: 'manychat_psid', operator: 'EQ', value: psid }
      ]}],
      properties: ['dealname', 'dealstage', 'description', 'manychat_psid'],
      limit: 2
    });
    return res.results?.[0] || null;
  } catch (e) {
    console.error('❌ Error consultando deal en HubSpot:', e);
    throw e;
  }
}

async function testWebhookIntegration() {
  for (const user of testUsers) {
    const mensaje = buildFullMessage(user);
    const email = `${user.psid}@facemaker.chat`;
    const nombreEsperado = TEST_PREFIX + user.nombre;
    console.log(`\n--- Probando usuario: ${user.nombre} (${user.psid}) ---`);
    // 1. Envía mensaje al webhook
    let status, data;
    try {
      ({ status, data } = await sendWebhookMessage({ mensaje, psid: user.psid, nombre: user.nombre }));
      console.log('✅ Webhook respondió:', status, data);
    } catch (e) {
      console.error('❌ Error al enviar mensaje al webhook:', e);
      continue;
    }
    try {
      assert(status === 200, 'El webhook debe responder 200');
      assert(data && data.success !== false, 'El webhook debe responder éxito');
    } catch (e) {
      console.error('❌ Error en validación de respuesta del webhook:', e);
      continue;
    }

    // 2. Verifica contacto en HubSpot
    let contact;
    try {
      contact = await getContactByEmail(email);
      console.log('Contacto encontrado:', contact && contact.properties);
      assert(contact, 'El contacto debe existir en HubSpot');
      assert(contact.properties.firstname === nombreEsperado.split(' ')[0], 'El nombre debe coincidir (con prefijo de testing)');
      assert(contact.properties.lastname === nombreEsperado.split(' ').slice(1).join(' '), 'El apellido debe coincidir (con prefijo de testing)');
      assert(contact.properties.phone === user.telefono, 'El teléfono debe coincidir');
      console.log('✅ Contacto actualizado correctamente en HubSpot');
    } catch (e) {
      console.error('❌ Error en validación de contacto:', e);
      continue;
    }

    // 3. Verifica deal en HubSpot
    let deal;
    try {
      deal = await getDealByPsid(user.psid);
      console.log('Deal encontrado:', deal && deal.properties);
      assert(deal, 'El deal debe existir en HubSpot');
      assert(deal.properties.dealname.includes(nombreEsperado), 'El nombre del deal debe contener el nombre (con prefijo de testing)');
      assert(deal.properties.manychat_psid === user.psid, 'El deal debe tener el PSID correcto');
      assert(deal.properties.description.includes(nombreEsperado), 'La descripción del deal debe contener el nombre (con prefijo de testing)');
      assert(deal.properties.description.includes(user.telefono), 'La descripción del deal debe contener el teléfono');
      assert(deal.properties.description.includes(user.producto), 'La descripción del deal debe contener el producto');
      assert(deal.properties.description.includes(user.fecha), 'La descripción del deal debe contener la fecha');
      assert(deal.properties.description.includes(user.hora), 'La descripción del deal debe contener la hora');
      assert(deal.properties.description.includes(user.mensaje), 'La descripción del deal debe contener el mensaje original');
      console.log('✅ Deal actualizado correctamente en HubSpot');
    } catch (e) {
      console.error('❌ Error en validación de deal:', e);
      continue;
    }
  }
  console.log('\n🎉 Todas las validaciones de integración terminaron. Revisa los errores anteriores si hubo fallos.');
}

testWebhookIntegration().catch(e => {
  console.error('❌ Error en integración:', e);
  process.exit(1);
});
