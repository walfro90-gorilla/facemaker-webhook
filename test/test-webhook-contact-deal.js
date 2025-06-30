// Test automatizado para verificar creación de contacto y deal en el webhook
// Ejecuta: node test/test-webhook-contact-deal.js
import fetch from 'node-fetch';

const WEBHOOK_URL = 'http://localhost:3000/api/webhook'; // Cambia el puerto si es necesario

async function testWebhook({ mensaje, psid, nombre }) {
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensaje, psid, nombre })
  });
  const data = await res.json();
  console.log('\n--- Prueba ---');
  console.log('Enviado:', { mensaje, psid, nombre });
  console.log('Respuesta:', data);
  return data;
}

(async () => {
  // Caso 1: Nombre completo, teléfono y producto
  await testWebhook({
    mensaje: 'Hola, mi nombre es Juan Pérez y mi teléfono es 5512345678. Quiero información ahora de Emerald Laser.',
    psid: 'psid1',
    nombre: 'Juan Pérez'
  });

  // Caso 2: Solo nombre y teléfono
  await testWebhook({
    mensaje: 'Soy Ana y mi número es 5612345678',
    psid: 'psid2',
    nombre: 'Ana'
  });

  // Caso 3: Nombre completo, sin teléfono, con intención de cita
  await testWebhook({
    mensaje: 'Hola, quiero agendar una cita para consulta',
    psid: 'psid3',
    nombre: 'Carlos López'
  });

  // Caso 4: Solo teléfono, sin nombre ni producto
  await testWebhook({
    mensaje: 'Mi número es 5512345678',
    psid: 'psid4',
    nombre: ''
  });

  // Caso 5: Nombre completo, teléfono inválido (menos de 10 dígitos)
  await testWebhook({
    mensaje: 'Soy Pedro y mi número es 12345',
    psid: 'psid5',
    nombre: 'Pedro Martínez'
  });
})();
