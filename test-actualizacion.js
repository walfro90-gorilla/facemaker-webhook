#!/usr/bin/env node

// 🧪 TEST DE ACTUALIZACIÓN - Probar la lógica de cache y actualización
import { webhook } from './api/webhook.js';

console.log('🚀 Iniciando test de actualización...');

// Test de actualización (debería encontrar el deal en cache o HubSpot)
const mockReq = {
  method: 'POST',
  body: {
    mensaje: "perfecto, quiero pagar el botox ya",
    psid: "9795399437224381",
    nombre: "Luna"
  }
};

let responseData = null;
let responseStatus = null;

const mockRes = {
  status: (code) => ({
    json: (data) => {
      responseStatus = code;
      responseData = data;
      console.log(`📤 Status: ${code}`);
      console.log('📦 Response:', JSON.stringify(data, null, 2));
      return { status: code, data };
    }
  })
};

try {
  await webhook(mockReq, mockRes);
  console.log('✅ Test de actualización completado');
  
  // Verificar si fue actualización
  if (responseData.hubspot.deal.action === 'updated_from_cache') {
    console.log('🚀 ¡CACHE HIT! Deal encontrado en cache temporal');
  } else if (responseData.hubspot.deal.action === 'updated') {
    console.log('🔄 Deal actualizado desde HubSpot');
  } else {
    console.log('❓ Resultado inesperado:', responseData.hubspot.deal.action);
  }
  
} catch (error) {
  console.error('❌ Error en test:', error.message);
}
