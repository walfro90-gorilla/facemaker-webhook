// =====================================================
// 📊 SISTEMA DE MÉTRICAS AVANZADO
// =====================================================

export class AdvancedMetrics {
  constructor() {
    this.metrics = {
      // Contadores básicos
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        rate_limited: 0,
        security_blocked: 0
      },
      
      // Tiempos de procesamiento
      processing_times: {
        webhook_total: [],
        message_parsing: [],
        hubspot_contact: [],
        hubspot_deal: [],
        cache_operations: []
      },
      
      // Métricas de HubSpot
      hubspot: {
        contacts: { created: 0, updated: 0, errors: 0 },
        deals: { created: 0, updated: 0, closed: 0, errors: 0 },
        api_calls: { total: 0, retries: 0, circuit_breaker_trips: 0 },
        response_times: []
      },
      
      // Métricas de cache
      cache: {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        expired_cleanups: 0
      },
      
      // Métricas de parsing
      parsing: {
        phone_extracted: 0,
        date_extracted: 0,
        time_extracted: 0,
        intent_detected: { 
          agendar_cita: 0,
          pedir_informacion: 0,
          realizar_pago: 0,
          cancelar: 0,
          emergencia: 0
        },
        product_detected: {
          botox: 0,
          rellenos: 0,
          liposuccion: 0,
          rinoplastia: 0,
          aumento_senos: 0,
          abdominoplastia: 0,
          lifting: 0,
          depilacion_laser: 0,
          tratamiento_facial: 0
        }
      },
      
      // Métricas de errores
      errors: {
        by_type: {},
        by_endpoint: {},
        recent_errors: [] // últimos 50 errores
      }
    };
    
    this.startTime = Date.now();
    this.maxArraySize = 1000; // Máximo tamaño para arrays de métricas
    
    // Limpiar métricas antiguas cada 5 minutos
    setInterval(() => this.cleanOldMetrics(), 5 * 60 * 1000);
  }

  // ===== MÉTRICAS DE REQUESTS =====
  recordRequest(success = true, type = 'normal') {
    this.metrics.requests.total++;
    if (success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }
    
    if (type === 'rate_limited') {
      this.metrics.requests.rate_limited++;
    } else if (type === 'security_blocked') {
      this.metrics.requests.security_blocked++;
    }
  }

  // ===== MÉTRICAS DE TIEMPO =====
  recordProcessingTime(category, timeMs) {
    if (!this.metrics.processing_times[category]) {
      this.metrics.processing_times[category] = [];
    }
    
    this.metrics.processing_times[category].push({
      time: timeMs,
      timestamp: Date.now()
    });
    
    // Mantener solo los últimos registros
    if (this.metrics.processing_times[category].length > this.maxArraySize) {
      this.metrics.processing_times[category].shift();
    }
  }

  // ===== MÉTRICAS DE HUBSPOT =====
  recordHubSpotOperation(type, operation, success = true, responseTime = 0) {
    if (success) {
      this.metrics.hubspot[type][operation]++;
    } else {
      this.metrics.hubspot[type].errors++;
    }
    
    this.metrics.hubspot.api_calls.total++;
    
    if (responseTime > 0) {
      this.metrics.hubspot.response_times.push({
        time: responseTime,
        timestamp: Date.now(),
        type,
        operation
      });
      
      if (this.metrics.hubspot.response_times.length > this.maxArraySize) {
        this.metrics.hubspot.response_times.shift();
      }
    }
  }

  recordHubSpotRetry() {
    this.metrics.hubspot.api_calls.retries++;
  }

  recordCircuitBreakerTrip() {
    this.metrics.hubspot.api_calls.circuit_breaker_trips++;
  }

  // ===== MÉTRICAS DE CACHE =====
  recordCacheOperation(operation) {
    this.metrics.cache[operation]++;
  }

  // ===== MÉTRICAS DE PARSING =====
  recordParsingResult(result) {
    if (result.telefono) this.metrics.parsing.phone_extracted++;
    if (result.fecha) this.metrics.parsing.date_extracted++;
    if (result.hora) this.metrics.parsing.time_extracted++;
    
    if (result.intencion && this.metrics.parsing.intent_detected[result.intencion] !== undefined) {
      this.metrics.parsing.intent_detected[result.intencion]++;
    }
    
    if (result.producto && this.metrics.parsing.product_detected[result.producto] !== undefined) {
      this.metrics.parsing.product_detected[result.producto]++;
    }
  }

  // ===== MÉTRICAS DE ERRORES =====
  recordError(error, endpoint = 'unknown', requestId = null) {
    const errorType = error.name || 'UnknownError';
    
    // Contar por tipo
    if (!this.metrics.errors.by_type[errorType]) {
      this.metrics.errors.by_type[errorType] = 0;
    }
    this.metrics.errors.by_type[errorType]++;
    
    // Contar por endpoint
    if (!this.metrics.errors.by_endpoint[endpoint]) {
      this.metrics.errors.by_endpoint[endpoint] = 0;
    }
    this.metrics.errors.by_endpoint[endpoint]++;
    
    // Guardar error reciente
    this.metrics.errors.recent_errors.push({
      timestamp: Date.now(),
      type: errorType,
      message: error.message,
      endpoint,
      requestId,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Mantener solo los últimos 50 errores
    if (this.metrics.errors.recent_errors.length > 50) {
      this.metrics.errors.recent_errors.shift();
    }
  }

  // ===== OBTENER ESTADÍSTICAS =====
  getStats() {
    const now = Date.now();
    const uptimeMs = now - this.startTime;
    
    return {
      timestamp: new Date().toISOString(),
      uptime: {
        ms: uptimeMs,
        seconds: Math.floor(uptimeMs / 1000),
        minutes: Math.floor(uptimeMs / (1000 * 60)),
        hours: Math.floor(uptimeMs / (1000 * 60 * 60))
      },
      requests: {
        ...this.metrics.requests,
        success_rate: this.metrics.requests.total > 0 
          ? (this.metrics.requests.success / this.metrics.requests.total * 100).toFixed(2) + '%'
          : '0%',
        requests_per_minute: this.metrics.requests.total / (uptimeMs / (1000 * 60))
      },
      performance: this.getPerformanceStats(),
      hubspot: this.getHubSpotStats(),
      cache: this.getCacheStats(),
      parsing: this.metrics.parsing,
      errors: {
        ...this.metrics.errors,
        error_rate: this.metrics.requests.total > 0 
          ? (this.metrics.requests.errors / this.metrics.requests.total * 100).toFixed(2) + '%'
          : '0%'
      }
    };
  }

  getPerformanceStats() {
    const stats = {};
    
    for (const [category, times] of Object.entries(this.metrics.processing_times)) {
      if (times.length === 0) {
        stats[category] = { avg: 0, min: 0, max: 0, count: 0 };
        continue;
      }
      
      const values = times.map(t => t.time);
      const sum = values.reduce((a, b) => a + b, 0);
      
      stats[category] = {
        avg: Math.round(sum / values.length),
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
        p95: this.calculatePercentile(values, 95),
        p99: this.calculatePercentile(values, 99)
      };
    }
    
    return stats;
  }

  getHubSpotStats() {
    const responseTimeValues = this.metrics.hubspot.response_times.map(rt => rt.time);
    
    return {
      ...this.metrics.hubspot,
      avg_response_time: responseTimeValues.length > 0 
        ? Math.round(responseTimeValues.reduce((a, b) => a + b, 0) / responseTimeValues.length)
        : 0,
      success_rate: this.metrics.hubspot.api_calls.total > 0
        ? ((this.metrics.hubspot.api_calls.total - this.metrics.hubspot.contacts.errors - this.metrics.hubspot.deals.errors) / this.metrics.hubspot.api_calls.total * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  getCacheStats() {
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    
    return {
      ...this.metrics.cache,
      hit_rate: total > 0 
        ? (this.metrics.cache.hits / total * 100).toFixed(2) + '%'
        : '0%',
      total_operations: total
    };
  }

  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  cleanOldMetrics() {
    const cutoffTime = Date.now() - (60 * 60 * 1000); // 1 hora atrás
    
    // Limpiar tiempos de procesamiento antiguos
    for (const category of Object.keys(this.metrics.processing_times)) {
      this.metrics.processing_times[category] = this.metrics.processing_times[category]
        .filter(entry => entry.timestamp > cutoffTime);
    }
    
    // Limpiar tiempos de respuesta de HubSpot antiguos
    this.metrics.hubspot.response_times = this.metrics.hubspot.response_times
      .filter(entry => entry.timestamp > cutoffTime);
    
    // Limpiar errores antiguos (mantener solo últimas 2 horas)
    const errorCutoff = Date.now() - (2 * 60 * 60 * 1000);
    this.metrics.errors.recent_errors = this.metrics.errors.recent_errors
      .filter(error => error.timestamp > errorCutoff);
  }

  // ===== ALERTAS =====
  checkAlerts() {
    const alerts = [];
    const stats = this.getStats();
    
    // Alert: Alta tasa de errores
    const errorRate = parseFloat(stats.errors.error_rate);
    if (errorRate > 10) {
      alerts.push({
        level: 'warning',
        type: 'high_error_rate',
        message: `Tasa de errores alta: ${errorRate}%`,
        threshold: '10%'
      });
    }
    
    // Alert: Tiempo de respuesta alto
    const avgResponseTime = stats.performance.webhook_total?.avg || 0;
    if (avgResponseTime > 5000) {
      alerts.push({
        level: 'warning',
        type: 'slow_response',
        message: `Tiempo de respuesta promedio alto: ${avgResponseTime}ms`,
        threshold: '5000ms'
      });
    }
    
    // Alert: Baja tasa de cache hits
    const cacheHitRate = parseFloat(stats.cache.hit_rate);
    if (cacheHitRate < 50 && stats.cache.total_operations > 100) {
      alerts.push({
        level: 'info',
        type: 'low_cache_hit_rate',
        message: `Baja tasa de cache hits: ${cacheHitRate}%`,
        threshold: '50%'
      });
    }
    
    // Alert: Circuit breaker trips
    if (stats.hubspot.api_calls.circuit_breaker_trips > 0) {
      alerts.push({
        level: 'error',
        type: 'circuit_breaker_trips',
        message: `Circuit breaker activado ${stats.hubspot.api_calls.circuit_breaker_trips} veces`,
        threshold: '0'
      });
    }
    
    return alerts;
  }

  // ===== RESET MÉTRICAS =====
  reset() {
    this.metrics = {
      requests: { total: 0, success: 0, errors: 0, rate_limited: 0, security_blocked: 0 },
      processing_times: { webhook_total: [], message_parsing: [], hubspot_contact: [], hubspot_deal: [], cache_operations: [] },
      hubspot: { contacts: { created: 0, updated: 0, errors: 0 }, deals: { created: 0, updated: 0, closed: 0, errors: 0 }, api_calls: { total: 0, retries: 0, circuit_breaker_trips: 0 }, response_times: [] },
      cache: { hits: 0, misses: 0, sets: 0, deletes: 0, expired_cleanups: 0 },
      parsing: { phone_extracted: 0, date_extracted: 0, time_extracted: 0, intent_detected: { agendar_cita: 0, pedir_informacion: 0, realizar_pago: 0, cancelar: 0, emergencia: 0 }, product_detected: { botox: 0, rellenos: 0, liposuccion: 0, rinoplastia: 0, aumento_senos: 0, abdominoplastia: 0, lifting: 0, depilacion_laser: 0, tratamiento_facial: 0 } },
      errors: { by_type: {}, by_endpoint: {}, recent_errors: [] }
    };
    this.startTime = Date.now();
  }
}

// Instancia global de métricas
export const metrics = new AdvancedMetrics();