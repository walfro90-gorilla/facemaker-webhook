#!/usr/bin/env node

// 🧪 TEST INMEDIATO - Probar cache en la misma instancia
import { webhook } from './api/webhook.js';

console.log('🚀 TEST INMEDIATO - Cache en misma instancia');

// Test 1: Crear deal
console.log('\n📋 TEST 1: Crear deal inicial');
const mockReq1 = {
  method: 'POST',
  body: {
    mensaje: "quisiera botox urgente",
    psid: "test123456789",
    nombre: "TestUser"
  }
};

let result1 = null;
const mockRes1 = {
  status: (code) => ({
    json: (data) => {
      result1 = { status: code, data };
      console.log(`✅ Test 1 completado - Status: ${code}`);
      console.log(`   Deal ID: ${data.hubspot?.deal?.hubspotDealId || 'N/A'}`);
      console.log(`   Acción: ${data.hubspot?.deal?.action || 'N/A'}`);
      return result1;
    }
  })
};

// Test 2: Actualizar inmediatamente (debería usar cache)
console.log('\n📋 TEST 2: Actualización inmediata (debe usar cache)');
const mockReq2 = {
  method: 'POST',
  body: {
    mensaje: "perfecto, quiero pagar el botox ya",
    psid: "test123456789",
    nombre: "TestUser"
  }
};

let result2 = null;
const mockRes2 = {
  status: (code) => ({
    json: (data) => {
      result2 = { status: code, data };
      console.log(`✅ Test 2 completado - Status: ${code}`);
      console.log(`   Deal ID: ${data.hubspot?.deal?.hubspotDealId || 'N/A'}`);
      console.log(`   Acción: ${data.hubspot?.deal?.action || 'N/A'}`);
      console.log(`   Cache Hit: ${data.hubspot?.deal?.cacheHit || false}`);
      return result2;
    }
  })
};

try {
  // Ejecutar ambos tests secuencialmente
  await webhook(mockReq1, mockRes1);
  
  console.log('\n⏱️ Esperando 1 segundo...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await webhook(mockReq2, mockRes2);
  
  // Análisis final
  console.log('\n🎯 ANÁLISIS FINAL:');
  console.log(`Test 1 - Deal creado: ${result1?.data?.hubspot?.deal?.hubspotDealId || 'Falló'}`);
  console.log(`Test 2 - Deal actualizado: ${result2?.data?.hubspot?.deal?.hubspotDealId || 'Falló'}`);
  console.log(`Cache funcionó: ${result2?.data?.hubspot?.deal?.cacheHit || false ? '✅' : '❌'}`);
  
  if (result1?.data?.hubspot?.deal?.hubspotDealId === result2?.data?.hubspot?.deal?.hubspotDealId) {
    console.log('🎉 ¡PERFECTO! Se actualizó el mismo deal');
  } else {
    console.log('⚠️ Se crearon deals diferentes - revisar lógica');
  }
  
} catch (error) {
  console.error('❌ Error en tests:', error.message);
}
