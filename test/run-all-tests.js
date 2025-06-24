// 🚀 Test Suite Completo del Webhook
import { runParsingTests } from './test-parsing.js';
import { testHubSpotConnection } from './test-hubspot.js';

console.log(`
🧪 ===============================================
🚀 WEBHOOK INTELIGENTE - SUITE DE PRUEBAS
🧪 ===============================================
`);

async function runAllTests() {
  console.log('📋 Ejecutando todos los tests...\n');
  
  try {
    // 🧠 Test 1: Parsing de mensajes
    console.log('🧠 === TEST 1: PARSING DE MENSAJES ===');
    await runParsingTests();
    
    console.log('\n\n🏢 === TEST 2: CONEXIÓN HUBSPOT ===');
    await testHubSpotConnection();
    
    console.log(`
✅ ===============================================
🎉 TODOS LOS TESTS COMPLETADOS
✅ ===============================================
    `);
    
  } catch (error) {
    console.error('💥 Error general en tests:', error);
  }
}

// 🎯 Ejecutar suite completa
runAllTests();
