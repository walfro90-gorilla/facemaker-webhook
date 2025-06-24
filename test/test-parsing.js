// 🧪 Test de Parsing de Mensajes
import webhook from '../api/webhook.js';

// 🎯 Casos de prueba para parsing
const testCases = [
  {
    name: '📞 Agendar cita con teléfono',
    input: {
      mensaje: 'Hola, quiero agendar una cita para botox mañana a las 3pm, mi teléfono es 55-1234-5678',
      psid: '1234567890',
      nombre: 'María García'
    },
    expected: {
      telefono: '5512345678',
      fecha: 'mañana',
      hora: '3pm',
      intencion: 'agendar_cita',
      producto: 'botox'
    }
  },
  {
    name: '💰 Consulta de precio',
    input: {
      mensaje: '¿Cuánto cuesta el aumento mamario? Me interesa saber los precios',
      psid: '9876543210',
      nombre: 'Ana López'
    },
    expected: {
      intencion: 'pedir_informacion',
      producto: 'aumento mamario'
    }
  },
  {
    name: '🚨 Emergencia médica',
    input: {
      mensaje: 'Urgente! Tengo dolor después de mi cirugía, mi número 5544332211',
      psid: '5555555555',
      nombre: 'Laura Martín'
    },
    expected: {
      telefono: '5544332211',
      intencion: 'emergencia',
      producto: 'cirugía'
    }
  },
  {
    name: '❌ Cancelación',
    input: {
      mensaje: 'Necesito cancelar mi cita del viernes, no podré asistir',
      psid: '1111111111',
      nombre: 'Carlos Ruiz'
    },
    expected: {
      intencion: 'cancelar'
    }
  },
  {
    name: '📅 Fecha específica',
    input: {
      mensaje: 'Puedo agendar para el 15 de diciembre a las 2:30 de la tarde para láser?',
      psid: '2222222222',
      nombre: 'Sofia Herrera'
    },
    expected: {
      fecha: '15 de diciembre',
      hora: '2:30 de la tarde',
      intencion: 'agendar_cita',
      producto: 'láser'
    }
  }
];

// 🔧 Mock para simular req/res
function createMockRequest(body) {
  return {
    method: 'POST',
    body
  };
}

function createMockResponse() {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
}

// 🧪 Ejecutar pruebas
async function runParsingTests() {
  console.log('🚀 Iniciando tests de parsing...\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test ${i + 1}: ${testCase.name}`);
    console.log(`💬 Input: "${testCase.input.mensaje}"`);
    
    try {
      const req = createMockRequest(testCase.input);
      const res = createMockResponse();
      
      await webhook(req, res);
      
      if (res.statusCode === 200) {
        console.log('✅ Status: 200 OK');
        const result = res.data;
        
        // 🔍 Verificar resultados esperados
        let allPassed = true;
        
        for (const [key, expectedValue] of Object.entries(testCase.expected)) {
          const actualValue = result.datos_extraidos?.[key];
          
          if (actualValue === expectedValue || (expectedValue && actualValue?.includes(expectedValue))) {
            console.log(`  ✅ ${key}: "${actualValue}" ✓`);
          } else {
            console.log(`  ❌ ${key}: esperado "${expectedValue}", obtuvo "${actualValue}"`);
            allPassed = false;
          }
        }
        
        console.log(`\n📊 HubSpot: ${result.hubspot?.action || 'no procesado'}`);
        console.log(`🎯 Resultado: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
        
      } else {
        console.log(`❌ Status: ${res.statusCode}`);
        console.log('❌ Error:', res.data);
      }
      
    } catch (error) {
      console.log('💥 Error en test:', error.message);
    }
    
    console.log('─'.repeat(80));
  }
  
  console.log('\n🎉 Tests de parsing completados!');
}

// 🚀 Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runParsingTests();
}

export { runParsingTests };
