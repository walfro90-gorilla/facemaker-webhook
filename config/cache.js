// =====================================================
// 💾 SISTEMA DE CACHE REDIS/MEMORIA HÍBRIDO
// =====================================================

import { createClient } from 'redis';

export class HybridCache {
  constructor(options = {}) {
    this.memoryCache = new Map();
    this.redisClient = null;
    this.useRedis = options.useRedis !== false && process.env.REDIS_URL;
    this.defaultTTL = options.defaultTTL || 30 * 60 * 1000; // 30 minutos
    this.maxMemorySize = options.maxMemorySize || 1000; // máximo items en memoria
    this.compressionThreshold = options.compressionThreshold || 1024; // comprimir si > 1KB
    
    // Estadísticas
    this.stats = {
      hits: { memory: 0, redis: 0 },
      misses: 0,
      sets: { memory: 0, redis: 0 },
      deletes: { memory: 0, redis: 0 },
      errors: { redis: 0 },
      compressions: 0
    };
    
    this.initializeRedis();
    this.startCleanupInterval();
  }

  async initializeRedis() {
    if (!this.useRedis) return;
    
    try {
      this.redisClient = createClient({
        url: process.env.REDIS_URL,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.warn('Redis connection refused, falling back to memory cache');
            return undefined; // No retry
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.redisClient.on('error', (err) => {
        console.error('Redis error:', err);
        this.stats.errors.redis++;
        this.useRedis = false; // Fallback to memory only
      });

      this.redisClient.on('connect', () => {
        console.log('Redis connected successfully');
        this.useRedis = true;
      });

      this.redisClient.on('disconnect', () => {
        console.warn('Redis disconnected, using memory cache only');
        this.useRedis = false;
      });

      await this.redisClient.connect();
    } catch (error) {
      console.warn('Failed to initialize Redis, using memory cache only:', error.message);
      this.useRedis = false;
    }
  }

  // ===== OPERACIONES DE CACHE =====
  
  async get(key, options = {}) {
    const startTime = Date.now();
    
    try {
      // Intentar memoria primero (más rápido)
      const memoryResult = this.getFromMemory(key);
      if (memoryResult !== null) {
        this.stats.hits.memory++;
        return memoryResult;
      }

      // Si no está en memoria y Redis está disponible, intentar Redis
      if (this.useRedis && this.redisClient) {
        const redisResult = await this.getFromRedis(key);
        if (redisResult !== null) {
          this.stats.hits.redis++;
          // Guardar en memoria para próximas consultas
          this.setInMemory(key, redisResult, options.ttl);
          return redisResult;
        }
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.errors.redis++;
      return null;
    }
  }

  async set(key, value, options = {}) {
    const ttl = options.ttl || this.defaultTTL;
    
    try {
      // Siempre guardar en memoria
      this.setInMemory(key, value, ttl);
      this.stats.sets.memory++;

      // Guardar en Redis si está disponible
      if (this.useRedis && this.redisClient) {
        await this.setInRedis(key, value, ttl);
        this.stats.sets.redis++;
      }

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      this.stats.errors.redis++;
      return false;
    }
  }

  async delete(key) {
    try {
      // Eliminar de memoria
      const memoryDeleted = this.memoryCache.delete(key);
      if (memoryDeleted) this.stats.deletes.memory++;

      // Eliminar de Redis si está disponible
      if (this.useRedis && this.redisClient) {
        const redisDeleted = await this.redisClient.del(key);
        if (redisDeleted) this.stats.deletes.redis++;
      }

      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      this.stats.errors.redis++;
      return false;
    }
  }

  async clear() {
    try {
      // Limpiar memoria
      this.memoryCache.clear();

      // Limpiar Redis si está disponible
      if (this.useRedis && this.redisClient) {
        await this.redisClient.flushAll();
      }

      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      this.stats.errors.redis++;
      return false;
    }
  }

  // ===== OPERACIONES DE MEMORIA =====
  
  getFromMemory(key) {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    // Verificar expiración
    if (Date.now() > item.expires) {
      this.memoryCache.delete(key);
      return null;
    }

    return this.deserializeValue(item.value);
  }

  setInMemory(key, value, ttl = this.defaultTTL) {
    // Limpiar cache si está lleno
    if (this.memoryCache.size >= this.maxMemorySize) {
      this.evictOldestMemoryItems();
    }

    const serializedValue = this.serializeValue(value);
    
    this.memoryCache.set(key, {
      value: serializedValue,
      expires: Date.now() + ttl,
      created: Date.now()
    });
  }

  // ===== OPERACIONES DE REDIS =====
  
  async getFromRedis(key) {
    if (!this.redisClient) return null;

    try {
      const value = await this.redisClient.get(key);
      if (!value) return null;

      return this.deserializeValue(value);
    } catch (error) {
      console.error('Redis get error:', error);
      this.stats.errors.redis++;
      return null;
    }
  }

  async setInRedis(key, value, ttl = this.defaultTTL) {
    if (!this.redisClient) return false;

    try {
      const serializedValue = this.serializeValue(value);
      const ttlSeconds = Math.ceil(ttl / 1000);
      
      await this.redisClient.setEx(key, ttlSeconds, serializedValue);
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      this.stats.errors.redis++;
      return false;
    }
  }

  // ===== SERIALIZACIÓN Y COMPRESIÓN =====
  
  serializeValue(value) {
    try {
      const jsonString = JSON.stringify(value);
      
      // Comprimir si es grande
      if (jsonString.length > this.compressionThreshold) {
        const zlib = require('zlib');
        const compressed = zlib.gzipSync(jsonString);
        this.stats.compressions++;
        return `gzip:${compressed.toString('base64')}`;
      }
      
      return jsonString;
    } catch (error) {
      console.error('Serialization error:', error);
      return JSON.stringify(value); // Fallback
    }
  }

  deserializeValue(serializedValue) {
    try {
      if (typeof serializedValue !== 'string') {
        return serializedValue;
      }

      // Verificar si está comprimido
      if (serializedValue.startsWith('gzip:')) {
        const zlib = require('zlib');
        const compressed = Buffer.from(serializedValue.slice(5), 'base64');
        const decompressed = zlib.gunzipSync(compressed);
        return JSON.parse(decompressed.toString());
      }
      
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error('Deserialization error:', error);
      return null;
    }
  }

  // ===== LIMPIEZA Y MANTENIMIENTO =====
  
  evictOldestMemoryItems() {
    // Eliminar 10% de los items más antiguos
    const itemsToRemove = Math.ceil(this.memoryCache.size * 0.1);
    const entries = Array.from(this.memoryCache.entries())
      .sort((a, b) => a[1].created - b[1].created)
      .slice(0, itemsToRemove);

    for (const [key] of entries) {
      this.memoryCache.delete(key);
    }
  }

  startCleanupInterval() {
    // Limpiar items expirados cada 5 minutos
    setInterval(() => {
      this.cleanupExpiredMemoryItems();
    }, 5 * 60 * 1000);
  }

  cleanupExpiredMemoryItems() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expires) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned ${cleaned} expired cache items`);
    }
  }

  // ===== MÉTODOS ESPECÍFICOS PARA EL WEBHOOK =====
  
  async getDeal(psid) {
    return this.get(`deal:${psid}`);
  }

  async setDeal(psid, dealData, ttl) {
    return this.set(`deal:${psid}`, dealData, { ttl });
  }

  async deleteDeal(psid) {
    return this.delete(`deal:${psid}`);
  }

  async getContact(psid) {
    return this.get(`contact:${psid}`);
  }

  async setContact(psid, contactData, ttl) {
    return this.set(`contact:${psid}`, contactData, { ttl });
  }

  async deleteContact(psid) {
    return this.delete(`contact:${psid}`);
  }

  // Cache para parsing results (más corto TTL)
  async getParsingResult(messageHash) {
    return this.get(`parsing:${messageHash}`);
  }

  async setParsingResult(messageHash, result) {
    return this.set(`parsing:${messageHash}`, result, { ttl: 5 * 60 * 1000 }); // 5 minutos
  }

  // ===== ESTADÍSTICAS Y MONITOREO =====
  
  getStats() {
    return {
      ...this.stats,
      memory: {
        size: this.memoryCache.size,
        max_size: this.maxMemorySize,
        usage_percent: (this.memoryCache.size / this.maxMemorySize * 100).toFixed(2) + '%'
      },
      redis: {
        connected: this.useRedis && this.redisClient?.isReady,
        url: process.env.REDIS_URL ? 'configured' : 'not_configured'
      },
      hit_rate: {
        total: this.getTotalHitRate(),
        memory: this.getMemoryHitRate(),
        redis: this.getRedisHitRate()
      }
    };
  }

  getTotalHitRate() {
    const totalHits = this.stats.hits.memory + this.stats.hits.redis;
    const totalRequests = totalHits + this.stats.misses;
    return totalRequests > 0 ? (totalHits / totalRequests * 100).toFixed(2) + '%' : '0%';
  }

  getMemoryHitRate() {
    const totalRequests = this.stats.hits.memory + this.stats.hits.redis + this.stats.misses;
    return totalRequests > 0 ? (this.stats.hits.memory / totalRequests * 100).toFixed(2) + '%' : '0%';
  }

  getRedisHitRate() {
    const totalRequests = this.stats.hits.memory + this.stats.hits.redis + this.stats.misses;
    return totalRequests > 0 ? (this.stats.hits.redis / totalRequests * 100).toFixed(2) + '%' : '0%';
  }

  // ===== HEALTH CHECK =====
  
  async healthCheck() {
    const health = {
      memory: { status: 'healthy', size: this.memoryCache.size },
      redis: { status: 'not_configured' }
    };

    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.ping();
        health.redis = { status: 'healthy', connected: true };
      } catch (error) {
        health.redis = { status: 'unhealthy', error: error.message };
      }
    }

    return health;
  }

  // ===== CLEANUP =====
  
  async close() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    this.memoryCache.clear();
  }
}

// Instancia global de cache
export const cache = new HybridCache({
  useRedis: process.env.NODE_ENV === 'production',
  defaultTTL: 30 * 60 * 1000, // 30 minutos
  maxMemorySize: 1000,
  compressionThreshold: 1024
});