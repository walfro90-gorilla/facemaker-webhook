// Archivo de pruebas para el webhook inteligente
const webhook = require('../api/webhook.js').default;

// Mock de request y response para testing
function createMockReq(mensaje) {
  return {
    method: 'POST',
    body: { mensaje }
  };
}

function createMockRes() {
  const res = {};
  res.status = (statusCode) => {
    res.statusCode = statusCode;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
}

// Casos de prueba
const testCases = [
  {
    nombre: 'Agendar cita con teléfono',
    mensaje: 'Hola, quiero agendar una cita para botox, mi teléfono es 55-1234-5678, mañana por la tarde si es posible'
  },
  {
    nombre: 'Solicitar información de precios',
    mensaje: 'Buenos días, quisiera saber cuánto cuesta el aumento mamario y qué incluye'
  },
  {
    nombre: 'Pago y datos de contacto',
    mensaje: 'Quiero apartar mi cita con un depósito, me llamo Ana García, mi email es ana@email.com'
  },
  {
    nombre: 'Urgencia médica',
    mensaje: 'Necesito ayuda urgente, tengo dolor después de mi cirugía, mi teléfono 5512345678'
  },
  {
    nombre: 'Fecha específica',
    mensaje: 'Puedo agendar para el 15 de diciembre a las 3:30 pm para láser?'
  },
  {
    nombre: 'Cancelación',
    mensaje: 'Necesito cancelar mi cita del viernes, no podré asistir'
  },
  {
    nombre: 'Múltiples servicios',
    mensaje: 'Me interesa botox, rellenos y también depilación láser, cuánto saldría todo?'
  },
  {
    nombre: 'Ubicación',
    mensaje: 'Podrían darme la dirección de la clínica? Cómo llego en transporte público?'
  }
];

console.log('🧪 Iniciando pruebas del webhook inteligente\n');

testCases.forEach((testCase, index) => {
  console.log(`\n📝 Prueba ${index + 1}: ${testCase.nombre}`);
  console.log(`💬 Mensaje: "${testCase.mensaje}"`);
  
  const req = createMockReq(testCase.mensaje);
  const res = createMockRes();
  
  try {
    webhook(req, res);
    
    if (res.statusCode === 200) {
      console.log('✅ Status: 200 OK');
      console.log('📊 Resultado:', JSON.stringify(res.data, null, 2));
    } else {
      console.log(`❌ Status: ${res.statusCode}`);
      console.log('❌ Error:', res.data);
    }
  } catch (error) {
    console.log('❌ Error de ejecución:', error.message);
  }
  
  console.log('─'.repeat(80));
});

console.log('\n🎉 Pruebas completadas');
