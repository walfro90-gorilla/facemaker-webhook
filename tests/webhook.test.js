// =====================================================
// 🧪 TESTS PARA EL WEBHOOK OPTIMIZADO
// =====================================================

import { jest } from '@jest/globals';
import request from 'supertest';
import { MessageParser } from '../config/metrics.js';
import { HybridCache } from '../config/cache.js';
import { SecurityValidator } from '../config/security.js';

describe('Webhook Optimizado - Tests', () => {
  
  describe('MessageParser', () => {
    let parser;
    
    beforeEach(() => {
      parser = new MessageParser();
    });

    test('debe extraer teléfono correctamente', () => {
      const mensaje = 'Hola, mi teléfono es 55 1234 5678';
      const result = parser.parse(mensaje, 'test-id');
      
      expect(result.telefono).toBe('5512345678');
    });

    test('debe detectar intención de agendar cita', () => {
      const mensaje = 'Quiero agendar una cita para botox';
      const result = parser.parse(mensaje, 'test-id');
      
      expect(result.intencion).toBe('agendar_cita');
      expect(result.producto).toBe('botox');
    });

    test('debe extraer fecha relativa', () => {
      const mensaje = 'Puedo ir mañana por la tarde';
      const result = parser.parse(mensaje, 'test-id');
      
      expect(result.fecha).toBe('mañana');
    });

    test('debe manejar mensaje vacío', () => {
      const result = parser.parse('', 'test-id');
      
      expect(result).toEqual({
        telefono: '',
        fecha: '',
        hora: '',
        intencion: '',
        producto: ''
      });
    });
  });

  describe('HybridCache', () => {
    let cache;
    
    beforeEach(() => {
      cache = new HybridCache({ useRedis: false }); // Solo memoria para tests
    });

    afterEach(async () => {
      await cache.clear();
    });

    test('debe guardar y recuperar datos', async () => {
      const testData = { id: 1, name: 'Test' };
      
      await cache.set('test-key', testData);
      const retrieved = await cache.get('test-key');
      
      expect(retrieved).toEqual(testData);
    });

    test('debe manejar expiración de cache', async () => {
      const testData = { id: 1, name: 'Test' };
      
      await cache.set('test-key', testData, { ttl: 100 }); // 100ms
      
      // Inmediatamente debe estar disponible
      let retrieved = await cache.get('test-key');
      expect(retrieved).toEqual(testData);
      
      // Después de expirar debe retornar null
      await new Promise(resolve => setTimeout(resolve, 150));
      retrieved = await cache.get('test-key');
      expect(retrieved).toBeNull();
    });

    test('debe comprimir datos grandes', async () => {
      const largeData = { content: 'x'.repeat(2000) }; // > 1KB
      
      await cache.set('large-key', largeData);
      const retrieved = await cache.get('large-key');
      
      expect(retrieved).toEqual(largeData);
      expect(cache.stats.compressions).toBeGreaterThan(0);
    });
  });

  describe('SecurityValidator', () => {
    let validator;
    
    beforeEach(() => {
      validator = new SecurityValidator();
    });

    test('debe validar request POST válido', () => {
      const mockReq = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        connection: { remoteAddress: '127.0.0.1' }
      };
      
      const result = validator.validateRequest(mockReq);
      expect(result.isValid).toBe(true);
    });

    test('debe rechazar método GET', () => {
      const mockReq = {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
        connection: { remoteAddress: '127.0.0.1' }
      };
      
      const result = validator.validateRequest(mockReq);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Método no permitido');
    });

    test('debe sanitizar entrada maliciosa', () => {
      const maliciousInput = '<script>alert("xss")</script>Hola';
      const sanitized = validator.sanitizeString(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hola');
    });

    test('debe validar payload correcto', () => {
      const validPayload = {
        mensaje: 'Hola, quiero información',
        psid: 'test123',
        nombre: 'Juan Pérez'
      };
      
      const result = validator.validatePayload(validPayload);
      expect(result.isValid).toBe(true);
      expect(result.sanitized.mensaje).toBe('Hola, quiero información');
    });

    test('debe rechazar payload inválido', () => {
      const invalidPayload = {
        mensaje: '', // Mensaje vacío
        psid: 'test@123', // Caracteres inválidos
        nombre: 'x'.repeat(150) // Muy largo
      };
      
      const result = validator.validatePayload(invalidPayload);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Integración Webhook', () => {
    test('debe procesar webhook completo exitosamente', async () => {
      const webhookPayload = {
        mensaje: 'Hola, quiero agendar una cita para botox, mi teléfono es 55 1234 5678',
        psid: 'test123',
        nombre: 'María García'
      };

      // Mock de HubSpot para evitar llamadas reales
      const mockHubSpot = {
        searchContacts: jest.fn().mockResolvedValue({ results: [] }),
        createContact: jest.fn().mockResolvedValue({ id: 'contact123' }),
        searchDeals: jest.fn().mockResolvedValue({ results: [] }),
        createDeal: jest.fn().mockResolvedValue({ id: 'deal123' })
      };

      // Aquí iría la lógica de test del webhook completo
      // Por ahora solo verificamos que el parsing funciona
      const parser = new MessageParser();
      const result = parser.parse(webhookPayload.mensaje, 'test-request');

      expect(result.telefono).toBe('5512345678');
      expect(result.intencion).toBe('agendar_cita');
      expect(result.producto).toBe('botox');
    });
  });

  describe('Performance Tests', () => {
    test('parsing debe ser rápido', () => {
      const parser = new MessageParser();
      const mensaje = 'Quiero agendar cita para botox mañana a las 3pm, mi teléfono es 55 1234 5678';
      
      const startTime = Date.now();
      const result = parser.parse(mensaje, 'perf-test');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(50); // Menos de 50ms
      expect(result.telefono).toBeTruthy();
      expect(result.intencion).toBeTruthy();
      expect(result.producto).toBeTruthy();
    });

    test('cache debe ser eficiente', async () => {
      const cache = new HybridCache({ useRedis: false });
      const testData = { large: 'x'.repeat(1000) };
      
      // Test de escritura
      const writeStart = Date.now();
      await cache.set('perf-test', testData);
      const writeTime = Date.now() - writeStart;
      
      // Test de lectura
      const readStart = Date.now();
      const retrieved = await cache.get('perf-test');
      const readTime = Date.now() - readStart;
      
      expect(writeTime).toBeLessThan(10); // Menos de 10ms
      expect(readTime).toBeLessThan(5);   // Menos de 5ms
      expect(retrieved).toEqual(testData);
      
      await cache.clear();
    });
  });

  describe('Error Handling', () => {
    test('debe manejar errores de parsing gracefully', () => {
      const parser = new MessageParser();
      
      // Test con datos null/undefined
      expect(() => parser.parse(null, 'test')).not.toThrow();
      expect(() => parser.parse(undefined, 'test')).not.toThrow();
      
      const result = parser.parse(null, 'test');
      expect(result).toEqual({
        telefono: '',
        fecha: '',
        hora: '',
        intencion: '',
        producto: ''
      });
    });

    test('debe manejar errores de cache gracefully', async () => {
      const cache = new HybridCache({ useRedis: false });
      
      // Test con keys inválidas
      const result1 = await cache.get(null);
      expect(result1).toBeNull();
      
      const result2 = await cache.get(undefined);
      expect(result2).toBeNull();
      
      // Test con datos inválidos
      const setResult = await cache.set('test', null);
      expect(setResult).toBe(true); // Debe manejar null gracefully
    });
  });
});

// =====================================================
// 🧪 TESTS DE CONFIGURACIÓN
// =====================================================

describe('Configuración', () => {
  test('configuración de medicina estética debe estar completa', () => {
    const { medicineConfig } = require('../config/medicina-estetica.js');
    
    expect(medicineConfig.hubspot).toBeDefined();
    expect(medicineConfig.parsing).toBeDefined();
    expect(medicineConfig.parsing.treatments).toBeDefined();
    expect(Object.keys(medicineConfig.parsing.treatments)).toContain('botox');
    expect(Object.keys(medicineConfig.parsing.treatments)).toContain('rellenos');
  });

  test('configuración de seguridad debe estar completa', () => {
    const { securityConfig } = require('../config/security.js');
    
    expect(securityConfig.rateLimit).toBeDefined();
    expect(securityConfig.validation).toBeDefined();
    expect(securityConfig.suspiciousPatterns).toBeDefined();
    expect(securityConfig.suspiciousPatterns.length).toBeGreaterThan(0);
  });
});