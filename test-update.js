import handler from './api/webhook.js';

console.log('🧪 Test de actualización de deals');
console.log('================================');

// Test 1: Crear deal inicial
console.log('\n📝 Test 1: Creando deal inicial...');

const mockReq1 = {
  method: 'POST',
  body: {
    mensaje: "Quiero botox",
    psid: "deal_update_456", 
    nombre: "Ana Pérez"
  }
};

const mockRes1 = {
  status: (code) => {
    console.log(`📊 Status: ${code}`);
    return mockRes1;
  },
  json: (data) => {
    console.log('📤 Respuesta 1:', JSON.stringify(data, null, 2));
    return mockRes1;
  }
};

await handler(mockReq1, mockRes1);

// Esperar un poco
await new Promise(resolve => setTimeout(resolve, 3000));

// Test 2: Actualizar con más información 
console.log('\n📝 Test 2: Actualizando deal con más info...');

const mockReq2 = {
  method: 'POST',
  body: {
    mensaje: "Quiero agendar mi cita de botox para el viernes y pagar",
    psid: "deal_update_456",
    nombre: "Ana Pérez"
  }
};

const mockRes2 = {
  status: (code) => {
    console.log(`📊 Status: ${code}`);
    return mockRes2;
  },
  json: (data) => {
    console.log('📤 Respuesta 2:', JSON.stringify(data, null, 2));
    return mockRes2;
  }
};

await handler(mockReq2, mockRes2);

console.log('\n✅ Test de actualización completado');
