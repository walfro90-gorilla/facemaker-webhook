// =====================================================
// 🔒 CONFIGURACIÓN DE SEGURIDAD AVANZADA
// =====================================================

export const securityConfig = {
  // Rate limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 60, // máximo 60 requests por minuto por IP
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Validación de entrada
  validation: {
    maxMessageLength: 5000,
    maxNameLength: 100,
    maxPsidLength: 50,
    allowedPsidPattern: /^[a-zA-Z0-9_-]+$/
  },

  // Patrones sospechosos para detectar ataques
  suspiciousPatterns: [
    // XSS
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    
    // SQL Injection
    /union\s+select/gi,
    /drop\s+table/gi,
    /delete\s+from/gi,
    /insert\s+into/gi,
    /update\s+set/gi,
    
    // Path Traversal
    /\.\.\//g,
    /\.\.\\/g,
    
    // Command Injection
    /;\s*rm\s+-rf/gi,
    /;\s*cat\s+/gi,
    /;\s*ls\s+/gi,
    /\|\s*nc\s+/gi
  ],

  // Headers de seguridad requeridos
  requiredHeaders: {
    'content-type': 'application/json',
    'user-agent': true // debe existir
  },

  // IPs bloqueadas (ejemplo)
  blockedIPs: [
    // Agregar IPs maliciosas conocidas
  ],

  // Configuración de CORS
  cors: {
    allowedOrigins: [
      'https://manychat.com',
      'https://*.manychat.com',
      process.env.ALLOWED_ORIGIN
    ].filter(Boolean),
    allowedMethods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
};

// Función para validar webhook signature (si ManyChat lo soporta)
export function validateWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) return true; // Skip si no está configurado
  
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Sanitización avanzada de strings
export function sanitizeInput(input, type = 'general') {
  if (!input || typeof input !== 'string') return input;
  
  let sanitized = input.trim();
  
  // Remover caracteres de control
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Normalizar espacios
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  switch (type) {
    case 'message':
      // Para mensajes, mantener más caracteres pero limpiar scripts
      sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
      sanitized = sanitized.replace(/javascript:/gi, '');
      break;
      
    case 'name':
      // Para nombres, solo letras, espacios y algunos caracteres especiales
      sanitized = sanitized.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-'\.]/g, '');
      break;
      
    case 'psid':
      // Para PSID, solo alfanuméricos, guiones y guiones bajos
      sanitized = sanitized.replace(/[^a-zA-Z0-9_-]/g, '');
      break;
  }
  
  return sanitized;
}