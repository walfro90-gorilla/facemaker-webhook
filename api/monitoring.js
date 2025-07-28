// =====================================================
// 📊 ENDPOINT DE MÉTRICAS Y MONITOREO
// =====================================================

import { metrics } from '../config/metrics.js';
import { cache } from '../config/cache.js';

// Health check endpoint
export async function healthCheck(req, res) {
  try {
    const startTime = Date.now();
    
    // Verificar componentes críticos
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      components: {}
    };

    // Check cache
    try {
      const cacheHealth = await cache.healthCheck();
      health.components.cache = cacheHealth;
    } catch (error) {
      health.components.cache = { status: 'unhealthy', error: error.message };
      health.status = 'degraded';
    }

    // Check HubSpot (simple ping)
    try {
      // Aquí podrías hacer un ping a HubSpot si es necesario
      health.components.hubspot = { status: 'healthy', note: 'Not tested in health check' };
    } catch (error) {
      health.components.hubspot = { status: 'unhealthy', error: error.message };
      health.status = 'degraded';
    }

    // Verificar métricas básicas
    const stats = metrics.getStats();
    health.metrics_summary = {
      total_requests: stats.requests.total,
      success_rate: stats.requests.success_rate,
      avg_response_time: stats.performance.webhook_total?.avg || 0,
      cache_hit_rate: stats.cache.hit_rate.total
    };

    // Verificar alertas
    const alerts = metrics.checkAlerts();
    if (alerts.length > 0) {
      health.alerts = alerts;
      if (alerts.some(alert => alert.level === 'error')) {
        health.status = 'unhealthy';
      } else if (health.status === 'healthy') {
        health.status = 'warning';
      }
    }

    health.response_time_ms = Date.now() - startTime;

    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'warning' ? 200 : 503;

    return res.status(statusCode).json(health);
  } catch (error) {
    return res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Métricas detalladas
export async function getMetrics(req, res) {
  try {
    const stats = metrics.getStats();
    const cacheStats = cache.getStats();
    
    const response = {
      timestamp: new Date().toISOString(),
      metrics: stats,
      cache: cacheStats,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.version,
        platform: process.platform
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to get metrics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Reset métricas (solo en desarrollo)
export async function resetMetrics(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Not allowed in production',
      timestamp: new Date().toISOString()
    });
  }

  try {
    metrics.reset();
    
    return res.status(200).json({
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to reset metrics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Alertas activas
export async function getAlerts(req, res) {
  try {
    const alerts = metrics.checkAlerts();
    
    return res.status(200).json({
      alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to get alerts',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Estadísticas de cache
export async function getCacheStats(req, res) {
  try {
    const stats = cache.getStats();
    const health = await cache.healthCheck();
    
    return res.status(200).json({
      stats,
      health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to get cache stats',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Limpiar cache (solo en desarrollo)
export async function clearCache(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Not allowed in production',
      timestamp: new Date().toISOString()
    });
  }

  try {
    await cache.clear();
    
    return res.status(200).json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}