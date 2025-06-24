// 🧪 Test de Producción - Webhook Inteligente
// Cambia la URL por tu endpoint de producción

const PRODUCTION_URL = 'https://tu-proyecto.vercel.app/api/webhook';

async function testProduccion() {
  console.log('🧪 Testing webhook en producción...');
  console.log('📡 URL:', PRODUCTION_URL);
  console.log('================================\n');

  const testCases = [
    {
      name: 'Test 1: Botox con cita',
      data: {
        mensaje: 'Hola, quiero agendar una cita para botox mañana a las 3pm, mi número es 5512345678',
        psid: 'prod_test_001',
        nombre: 'María Producción'
      }
    },
    {
      name: 'Test 2: Información de liposucción',
      data: {
        mensaje: 'Necesito información sobre precios de liposucción',
        psid: 'prod_test_002',
        nombre: 'Ana Cliente'
      }
    },
    {
      name: 'Test 3: Pago de rinoplastia',
      data: {
        mensaje: 'Quiero pagar mi rinoplastia, cuando puedo hacer el depósito',
        psid: 'prod_test_003',
        nombre: 'Carlos Paciente'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 ${testCase.name}`);
    console.log('-'.repeat(40));
    
    try {
      const response = await fetch(PRODUCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      console.log(`📊 Status: ${response.status}`);
      console.log('📤 Respuesta:');
      console.log(JSON.stringify(result, null, 2));
      
      // Verificar respuesta
      if (result.success) {
        console.log('✅ Test EXITOSO');
        if (result.hubspot?.contacto?.hubspotContactId) {
          console.log(`👤 Contacto creado: ${result.hubspot.contacto.hubspotContactId}`);
        }
        if (result.hubspot?.deal?.hubspotDealId) {
          console.log(`💼 Deal creado: ${result.hubspot.deal.hubspotDealId}`);
        }
      } else {
        console.log('❌ Test FALLÓ');
      }
      
    } catch (error) {
      console.error('❌ Error en test:', error.message);
    }
    
    // Esperar entre tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✅ Tests de producción completados');
}

// Instrucciones de uso
console.log(`
🚀 INSTRUCCIONES:
1. Actualiza PRODUCTION_URL con tu endpoint real de Vercel
2. Ejecuta: node test-produccion.js
3. Verifica que los contactos y deals se creen en HubSpot

💡 Ejemplo de URL de producción:
https://webhook-inteligente-123.vercel.app/api/webhook
`);

// Ejecutar solo si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testProduccion();
}

export { testProduccion };
