// 🏢 Test específico para HubSpot Integration
import { Client } from '@hubspot/api-client';
import dotenv from 'dotenv';

dotenv.config();

// 🔧 Configurar HubSpot client
const hubspot = new Client({ 
  accessToken: process.env.HUBSPOT_TOKEN 
});

// 🧪 Tests de HubSpot
async function testHubSpotConnection() {
  console.log('🏢 Testing HubSpot Connection...\n');
  
  try {
    // ✅ Test 1: Verificar conexión
    console.log('📡 Test 1: Verificando conexión con HubSpot...');
    const accountInfo = await hubspot.crm.owners.basicApi.getPage();
    console.log('✅ Conexión exitosa! Owners encontrados:', accountInfo.body.results.length);
    
    // ✅ Test 2: Crear contacto de prueba
    console.log('\n👤 Test 2: Creando contacto de prueba...');
    const testEmail = `test-${Date.now()}@facemaker.chat`;
    
    const newContact = await hubspot.crm.contacts.basicApi.create({
      properties: {
        email: testEmail,
        firstname: 'Test Usuario',
        phone: '5555555555',
        lifecyclestage: 'lead',
        leadstatus: 'nuevo lead'
      }
    });
    
    console.log('✅ Contacto creado! ID:', newContact.id);
    
    // ✅ Test 3: Buscar contacto
    console.log('\n🔍 Test 3: Buscando contacto creado...');
    const searchResult = await hubspot.crm.contacts.searchApi.doSearch({
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: testEmail
        }]
      }],
      properties: ['email', 'firstname', 'phone', 'leadstatus']
    });
    
    console.log('✅ Contacto encontrado!', searchResult.body.results[0]?.properties);
    
    // ✅ Test 4: Actualizar contacto
    console.log('\n📝 Test 4: Actualizando contacto...');
    await hubspot.crm.contacts.basicApi.update(newContact.id, {
      properties: {
        leadstatus: 'informado',
        phone: '5566778899'
      }
    });
    
    console.log('✅ Contacto actualizado!');
    
    // ✅ Test 5: Eliminar contacto de prueba
    console.log('\n🗑️ Test 5: Limpiando contacto de prueba...');
    await hubspot.crm.contacts.basicApi.archive(newContact.id);
    console.log('✅ Contacto eliminado!');
    
    console.log('\n🎉 Todos los tests de HubSpot pasaron exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en test HubSpot:', error.message);
    console.error('📝 Detalles:', error.response?.body || error);
    
    // 🔍 Diagnóstico común
    if (error.message.includes('401')) {
      console.log('\n💡 Solución: Verifica que tu HUBSPOT_TOKEN sea válido');
    }
    if (error.message.includes('403')) {
      console.log('\n💡 Solución: Tu token no tiene permisos suficientes');
    }
    if (error.message.includes('429')) {
      console.log('\n💡 Solución: Has alcanzado el límite de rate de la API');
    }
  }
}

// 🧪 Test del flujo completo del webhook
async function testWebhookFlow() {
  console.log('\n🔄 Testing flujo completo del webhook...\n');
  
  const testMessages = [
    {
      mensaje: 'Quiero agendar cita para botox, mi teléfono es 5544332211',
      psid: `test-${Date.now()}`,
      nombre: 'Test User'
    },
    {
      mensaje: '¿Cuánto cuesta el aumento mamario?',
      psid: `test-${Date.now() + 1}`,
      nombre: 'Test User 2'
    }
  ];
  
  for (const testData of testMessages) {
    console.log(`📤 Enviando: "${testData.mensaje}"`);
    
    try {
      // Simular llamada al webhook
      const response = await fetch('http://localhost:3000/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      const result = await response.json();
      console.log('📥 Respuesta:', result);
      
    } catch (error) {
      console.log('❌ Error en test de flujo:', error.message);
    }
    
    console.log('─'.repeat(50));
  }
}

// 🚀 Ejecutar tests
async function runAllHubSpotTests() {
  console.log('🧪 Iniciando tests de HubSpot...\n');
  
  await testHubSpotConnection();
  // await testWebhookFlow(); // Descomentar si tienes servidor local corriendo
  
  console.log('\n✅ Tests completados!');
}

// 🚀 Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllHubSpotTests();
}

export { testHubSpotConnection, testWebhookFlow };
