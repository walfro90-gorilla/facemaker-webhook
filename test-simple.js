// 🧪 Test simple para verificar el webhook
import handler from './api/webhook.js';

// 🎭 Mock de objetos req y res
const mockReq = {
  method: 'POST',
  body: {
    mensaje: 'Hola, quiero agendar una cita para botox mañana a las 3pm, mi número es 5512345678',
    psid: 'test_psid_123',
    nombre: 'María Test'
  }
};

const mockRes = {
  status: (code) => {
    console.log(`📊 Status: ${code}`);
    return mockRes;
  },
  json: (data) => {
    console.log('📤 Respuesta:', JSON.stringify(data, null, 2));
    return mockRes;
  }
};

// 🚀 Ejecutar test
console.log('🧪 Iniciando test del webhook...');
console.log('📥 Request:', JSON.stringify(mockReq.body, null, 2));

try {
  await handler(mockReq, mockRes);
  console.log('✅ Test completado');
} catch (error) {
  console.error('❌ Error en test:', error);
}
