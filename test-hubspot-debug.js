// 🧪 Test completo para diagnosticar problemas de HubSpot
import handler from './api/webhook.js';

// 🎭 Test con los datos exactos que están fallando
const testCases = [
  {
    name: "Test original que falla",
    request: {
      method: 'POST',
      body: {
        mensaje: 'hola, quisiera ifnormacion del botox para tene runa cita y pagar para la otra semana',
        psid: '9795399437224381',
        nombre: 'Luna'
      }
    }
  },
  {
    name: "Test con datos más simples",
    request: {
      method: 'POST',
      body: {
        mensaje: 'quiero botox',
        psid: 'test123',
        nombre: 'Test'
      }
    }
  }
];

const mockRes = {
  status: (code) => {
    console.log(`📊 Status: ${code}`);
    return mockRes;
  },
  json: (data) => {
    console.log('📤 Respuesta completa:', JSON.stringify(data, null, 2));
    return mockRes;
  }
};

// 🚀 Ejecutar todos los tests
async function runTests() {
  console.log('🧪 DIAGNÓSTICO COMPLETO DE HUBSPOT');
  console.log('=====================================');
  
  // 🔐 Verificar variables de entorno
  console.log('\n🔐 VERIFICACIÓN DE TOKEN:');
  console.log('- HUBSPOT_TOKEN existe:', !!process.env.HUBSPOT_TOKEN);
  console.log('- Token length:', process.env.HUBSPOT_TOKEN?.length || 0);
  console.log('- Token starts with "pat-":', process.env.HUBSPOT_TOKEN?.startsWith('pat-') || false);
  
  for (const testCase of testCases) {
    console.log(`\n🧪 ${testCase.name}`);
    console.log('=====================================');
    console.log('📥 Request:', JSON.stringify(testCase.request.body, null, 2));
    
    try {
      await handler(testCase.request, mockRes);
    } catch (error) {
      console.error('💥 Error en test:', error);
    }
    
    console.log('\n---\n');
  }
}

runTests().catch(console.error);
