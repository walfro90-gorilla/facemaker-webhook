#!/usr/bin/env node

// 🧪 TEST FLUJO DEAL ÚNICO POR USUARIO (VISUAL CON EMOJIS)
import { webhook } from './api/webhook.js';

const psid = 'testpsid12345';
const nombre = 'TestUser';

const tests = [
  {
    name: '1️⃣ Primer mensaje: producto botox',
    body: {
      mensaje: 'Hola, quiero información de botox',
      psid,
      nombre
    },
    expect: {
      producto: 'botox',
      intencion: 'pedir_informacion',
      action: 'created',
      dealName: 'Botox - Tratamiento [testpsid12345]'
    }
  },
  {
    name: '2️⃣ Cambio de producto: liposucción',
    body: {
      mensaje: 'Ahora me interesa la liposucción',
      psid,
      nombre
    },
    expect: {
      producto: 'liposucción',
      intencion: 'pedir_informacion',
      action: 'updated-cache',
      dealName: 'Liposucción - Consulta [testpsid12345]'
    }
  },
  {
    name: '3️⃣ Cambio de intención: quiero agendar',
    body: {
      mensaje: 'Quiero agendar la cita de lipo',
      psid,
      nombre
    },
    expect: {
      producto: 'liposucción',
      intencion: 'agendar_cita',
      action: 'updated-cache',
      dealName: 'Liposucción - Consulta [testpsid12345]'
    }
  },
  {
    name: '4️⃣ Cerrar deal: cancelar',
    body: {
      mensaje: 'Mejor cancela la cita',
      psid,
      nombre
    },
    expect: {
      intencion: 'cancelar',
      action: 'closed-cache',
      dealName: 'Liposucción - Consulta [testpsid12345]'
    }
  },
  {
    name: '5️⃣ Nuevo producto tras cierre: botox',
    body: {
      mensaje: 'Quiero botox otra vez',
      psid,
      nombre
    },
    expect: {
      producto: 'botox',
      intencion: 'pedir_informacion',
      action: 'created',
      dealName: 'Botox - Tratamiento [testpsid12345]'
    }
  }
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

let lastDealId = null;
let testResults = [];

async function runTest(test, idx) {
  let status = '❓';
  let details = '';
  let color = '\x1b[33m'; // amarillo
  let ok = false;
  let dealId = null;
  let dealName = null;
  let action = null;
  let producto = null;
  let intencion = null;

  const mockReq = { method: 'POST', body: test.body };
  let responseData = null;
  let responseStatus = null;
  const mockRes = {
    status: (code) => ({
      json: (data) => {
        responseStatus = code;
        responseData = data;
        return { status: code, data };
      }
    })
  };
  await webhook(mockReq, mockRes);

  if (responseStatus === 200) {
    const d = responseData.hubspot.deal;
    dealId = d.hubspotDealId;
    dealName = d.dealName;
    action = d.action;
    producto = responseData.datos_extraidos.producto;
    intencion = responseData.datos_extraidos.intencion;
    // Validar acción, producto, intencion y dealName
    let errors = [];
    if (test.expect.action && action !== test.expect.action) errors.push(`Acción esperada: ${test.expect.action}, recibida: ${action}`);
    if (test.expect.producto && producto !== test.expect.producto) errors.push(`Producto esperado: ${test.expect.producto}, recibido: ${producto}`);
    if (test.expect.intencion && intencion !== test.expect.intencion) errors.push(`Intención esperada: ${test.expect.intencion}, recibida: ${intencion}`);
    if (test.expect.dealName && dealName !== test.expect.dealName) errors.push(`DealName esperado: ${test.expect.dealName}, recibido: ${dealName}`);
    // Validar unicidad de dealId
    if (idx > 0 && test.expect.action === 'created' && dealId === lastDealId) errors.push('Se esperaba un nuevo dealId, pero es igual al anterior');
    if (idx > 0 && test.expect.action !== 'created' && dealId !== lastDealId) errors.push('Se esperaba el mismo dealId, pero cambió');
    if (errors.length === 0) {
      status = '✅';
      color = '\x1b[32m'; // verde
      ok = true;
    } else {
      status = '❌';
      color = '\x1b[31m'; // rojo
      details += errors.map(e => `\n     ⚠️ ${e}`).join('');
    }
    details = `Deal: ${dealId || 'N/A'} | Acción: ${action || 'N/A'} | Producto: ${producto || 'N/A'} | Intención: ${intencion || 'N/A'} | DealName: ${dealName || 'N/A'}` + details;
    lastDealId = dealId;
  } else {
    status = '❌';
    color = '\x1b[31m';
    details = 'Error HTTP ' + responseStatus;
  }

  // Visual
  console.log(`${color}${status} ${test.name}\x1b[0m`);
  console.log(`   ${details}`);
  testResults.push({
    name: test.name,
    status,
    ok,
    errors: details.includes('⚠️') ? details.split('\n').filter(l => l.includes('⚠️')) : [],
    dealId,
    action,
    producto,
    intencion,
    dealName
  });
}

(async () => {
  console.log('\n🧪 TEST FLUJO DEAL ÚNICO POR USUARIO (VISUAL)\n');
  let okCount = 0;
  lastDealId = null;
  for (let i = 0; i < tests.length; i++) {
    const ok = await runTest(tests[i], i);
    if (ok) okCount++;
    await sleep(1500); // evitar rate limit
  }
  const total = tests.length;
  const color = okCount === total ? '\x1b[32m' : '\x1b[31m';
  console.log(`\n${color}RESULTADO FINAL: ${okCount}/${total} tests OK\x1b[0m\n`);

  // 📝 RESUMEN DETALLADO
  console.log('📝 RESUMEN DETALLADO DE PRUEBAS:');
  testResults.forEach((r, i) => {
    const c = r.ok ? '\x1b[32m' : '\x1b[31m';
    console.log(`${c}${r.status} ${r.name}\x1b[0m`);
    console.log(`   DealId: ${r.dealId || 'N/A'} | Acción: ${r.action || 'N/A'} | Producto: ${r.producto || 'N/A'} | Intención: ${r.intencion || 'N/A'} | DealName: ${r.dealName || 'N/A'}`);
    if (r.errors && r.errors.length > 0) {
      r.errors.forEach(e => console.log(`     ${e}`));
    }
  });
})();
