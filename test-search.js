import handler from './api/webhook.js';

console.log('🧪 Test específico de búsqueda de deals');
console.log('=====================================');

// Test con el PSID que sabemos que tiene deals
const testPSID = 'deal_update_456';

// Test 1: Buscar deal existente que sabemos que existe
console.log('\n📝 Test: Buscar deal existente para botox');
const mockReq = {
  method: 'POST',
  body: {
    mensaje: "Quiero más información de botox",
    psid: testPSID,
    nombre: "Ana Pérez"
  }
};

const mockRes = {
  status: (code) => {
    console.log(`📊 Status: ${code}`);
    return mockRes;
  },
  json: (data) => {
    console.log('📤 Respuesta de búsqueda:');
    console.log('- Deal encontrado:', data.hubspot?.deal?.action);
    console.log('- Deal ID:', data.hubspot?.deal?.hubspotDealId);
    console.log('- Action:', data.hubspot?.deal?.action);
    console.log('- Deal Name:', data.hubspot?.deal?.dealName);
    return mockRes;
  }
};

await handler(mockReq, mockRes);

console.log('\n✅ Test de búsqueda completado');
