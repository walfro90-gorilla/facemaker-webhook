// test/test-integration-webhook.js
// Script de integración para validar el flujo completo del webhook inteligente
// - Envía mensajes simulados al endpoint real
// - Verifica la respuesta del webhook
// - Consulta HubSpot para confirmar actualización de contacto y deal

import assert from 'assert';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { Client } from '@hubspot/api-client';

dotenv.config();

const WEBHOOK_URL = 'http://localhost:3000/api/webhook';
const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;
const hubspot = new Client({ accessToken: HUBSPOT_TOKEN });

async function sendWebhookMessage({ mensaje, psid, nombre }) {
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensaje, psid, nombre })
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function getContactByEmail(email) {
  const res = await hubspot.crm.contacts.searchApi.doSearch({
    filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
    properties: ['email', 'firstname', 'lastname', 'phone', 'updated'],
    limit: 1
  });
  return res.results?.[0] || null;
}

async function getDealByPsid(psid) {
  const res = await hubspot.crm.deals.searchApi.doSearch({
    filterGroups: [{ filters: [
      { propertyName: 'manychat_psid', operator: 'EQ', value: psid }
    ]}],
    properties: ['dealname', 'dealstage', 'description', 'manychat_psid'],
    limit: 2
  });
  return res.results?.[0] || null;
}

async function testWebhookIntegration() {
  const testData = {
    mensaje: 'Hola, soy Ana López, mi teléfono es 5512345678 y quiero información de botox.',
    psid: 'psid-test-integration',
    nombre: 'Ana López'
  };
  const email = `${testData.psid}@facemaker.chat`;

  // 1. Envía mensaje al webhook
  const { status, data } = await sendWebhookMessage(testData);
  assert(status === 200, 'El webhook debe responder 200');
  assert(data && data.success !== false, 'El webhook debe responder éxito');
  console.log('✅ Webhook respondió correctamente');

  // 2. Verifica contacto en HubSpot
  const contact = await getContactByEmail(email);
  assert(contact, 'El contacto debe existir en HubSpot');
  assert(contact.properties.firstname === 'Ana', 'El nombre debe ser Ana');
  assert(contact.properties.lastname === 'López', 'El apellido debe ser López');
  assert(contact.properties.phone === '5512345678', 'El teléfono debe ser 5512345678');
  console.log('✅ Contacto actualizado correctamente en HubSpot');

  // 3. Verifica deal en HubSpot
  const deal = await getDealByPsid(testData.psid);
  assert(deal, 'El deal debe existir en HubSpot');
  assert(deal.properties.dealname.includes('Botox - Ana López'), 'El nombre del deal debe contener Botox - Ana López');
  assert(deal.properties.manychat_psid === testData.psid, 'El deal debe tener el PSID correcto');
  assert(deal.properties.description.includes('Ana López'), 'La descripción del deal debe contener el nombre');
  console.log('✅ Deal actualizado correctamente en HubSpot');

  console.log('🎉 Todas las validaciones de integración pasaron.');
}

testWebhookIntegration().catch(e => {
  console.error('❌ Error en integración:', e);
  process.exit(1);
});
