#!/usr/bin/env node

// 🧪 TEST RÁPIDO - Validar que el webhook funciona
import { webhook } from './api/webhook.js';

console.log('🚀 Iniciando test rápido...');

// Test básico
const mockReq = {
  method: 'POST',
  body: {
    mensaje: "quisiera mas informacion de botox y una cita para mañana",
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
  console.log('✅ Test completado exitosamente');
} catch (error) {
  console.error('❌ Error en test:', error.message);
}
