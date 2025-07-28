// =====================================================
// 🚀 WEBHOOK INTELIGENTE SIMPLIFICADO PARA PRUEBAS
// =====================================================

import { Client } from '@hubspot/api-client';
import dotenv from 'dotenv';
import http from 'http';
import url from 'url';

// Cargar variables de entorno
dotenv.config();

// Configuración básica
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Cliente HubSpot (mock para pruebas)
const hubspot = new Client({ 
  accessToken: process.env.HUBSPOT_TOKEN || 'test_token'
});

// Cache en memoria simple
const cache = new Map();

// Métricas básicas
const metrics = {
  requests: 0,
  successes: 0,
  errors: 0,
  startTime: Date.now()
};

// =====================================================
// 📝 PARSER DE MENSAJES SIMPLIFICADO
// =====================================================

function parseMensaje(mensaje) {
  if (!mensaje || typeof mensaje !== 'string') {
    return { telefono: '', fecha: '', hora: '', intencion: '', producto: '' };
  }

  const texto = mensaje.toLowerCase().trim();
  
  // Extraer teléfono
  const telefonoMatch = texto.match(/(\+?52\s?)?(\d{2,3}[\s\-]?\d{3,4}[\s\-]?\d{4})/);
  const telefono = telefonoMatch ? telefonoMatch[0].replace(/[\s\-]/g, '') : '';
  
  // Detectar intención
  let intencion = '';
  if (texto.includes('agendar') || texto.includes('cita') || texto.includes('reservar')) {
    intencion = 'agendar_cita';
  } else if (texto.includes('información') || texto.includes('info') || texto.includes('precio')) {
    intencion = 'pedir_informacion';
  } else if (texto.includes('pago') || texto.includes('pagar')) {
    intencion = 'realizar_pago';
  } else if (texto.includes('cancelar')) {
    intencion = 'cancelar';
  }
  
  // Detectar producto/servicio
  let producto = '';
  if (texto.includes('botox')) producto = 'botox';
  else if (texto.includes('relleno') || texto.includes('ácido hialurónico')) producto = 'rellenos';
  else if (texto.includes('lifting') || texto.includes('estiramiento')) producto = 'lifting';
  else if (texto.includes('peeling')) producto = 'peeling';
  else if (texto.includes('láser')) producto = 'laser';
  
  // Extraer fecha (simplificado)
  let fecha = '';
  if (texto.includes('mañana')) fecha = 'mañana';
  else if (texto.includes('hoy')) fecha = 'hoy';
  else if (texto.includes('lunes')) fecha = 'lunes';
  else if (texto.includes('martes')) fecha = 'martes';
  else if (texto.includes('miércoles')) fecha = 'miércoles';
  else if (texto.includes('jueves')) fecha = 'jueves';
  else if (texto.includes('viernes')) fecha = 'viernes';
  
  // Extraer hora (simplificado)
  const horaMatch = texto.match(/(\d{1,2}):?(\d{2})?\s?(am|pm|hrs?)?/);
  const hora = horaMatch ? horaMatch[0] : '';
  
  return { telefono, fecha, hora, intencion, producto };
}

// =====================================================
// 🏥 SIMULACIÓN DE HUBSPOT (PARA PRUEBAS)
// =====================================================

async function mockHubSpotContact(data) {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    id: `contact_${Date.now()}`,
    properties: {
      email: `${data.psid}@manychat.test`,
      firstname: data.nombre || 'Usuario',
      phone: data.telefono || '',
      lead_status: 'new'
    }
  };
}

async function mockHubSpotDeal(data) {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 150));
  
  return {
    id: `deal_${Date.now()}`,
    properties: {
      dealname: `${data.producto || 'Consulta'} - ${data.nombre || 'Usuario'}`,
      dealstage: 'new_inquiry',
      amount: '0',
      pipeline: 'default'
    }
  };
}

// =====================================================
// 🌐 SERVIDOR HTTP SIMPLIFICADO
// =====================================================

const server = http.createServer(async (req, res) => {
  const startTime = Date.now();
  metrics.requests++;
  
  // Headers CORS básicos
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  try {
    // OPTIONS para CORS
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    // Health check
    if (path === '/api/health' && req.method === 'GET') {
      const uptime = Date.now() - metrics.startTime;
      const health = {
        status: 'healthy',
        uptime: Math.floor(uptime / 1000),
        metrics: {
          requests: metrics.requests,
          successes: metrics.successes,
          errors: metrics.errors,
          success_rate: metrics.requests > 0 ? (metrics.successes / metrics.requests * 100).toFixed(2) + '%' : '0%'
        },
        timestamp: new Date().toISOString()
      };
      
      res.writeHead(200);
      res.end(JSON.stringify(health, null, 2));
      return;
    }
    
    // Métricas
    if (path === '/api/metrics' && req.method === 'GET') {
      const uptime = Date.now() - metrics.startTime;
      const metricsData = {
        ...metrics,
        uptime_seconds: Math.floor(uptime / 1000),
        cache_size: cache.size,
        memory_usage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      };
      
      res.writeHead(200);
      res.end(JSON.stringify(metricsData, null, 2));
      return;
    }
    
    // Webhook principal
    if (path === '/api/webhook' && req.method === 'POST') {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const { mensaje, psid, nombre } = data;
          
          // Validación básica
          if (!mensaje || !psid) {
            res.writeHead(400);
            res.end(JSON.stringify({ 
              error: 'Faltan campos requeridos: mensaje, psid',
              timestamp: new Date().toISOString()
            }));
            metrics.errors++;
            return;
          }
          
          // Parsear mensaje
          const parsed = parseMensaje(mensaje);
          
          // Simular creación de contacto y deal
          const contact = await mockHubSpotContact({ psid, nombre, telefono: parsed.telefono });
          const deal = await mockHubSpotDeal({ 
            psid, 
            nombre, 
            producto: parsed.producto,
            intencion: parsed.intencion 
          });
          
          // Guardar en cache
          const cacheKey = `webhook_${psid}_${Date.now()}`;
          cache.set(cacheKey, {
            request: data,
            parsed,
            contact,
            deal,
            timestamp: new Date().toISOString()
          });
          
          // Respuesta exitosa
          const response = {
            success: true,
            requestId: cacheKey,
            processing_time_ms: Date.now() - startTime,
            extracted_data: parsed,
            hubspot: {
              contact_id: contact.id,
              deal_id: deal.id
            },
            timestamp: new Date().toISOString()
          };
          
          res.writeHead(200);
          res.end(JSON.stringify(response, null, 2));
          metrics.successes++;
          
        } catch (error) {
          console.error('Error procesando webhook:', error);
          res.writeHead(500);
          res.end(JSON.stringify({ 
            error: 'Error interno del servidor',
            message: error.message,
            timestamp: new Date().toISOString()
          }));
          metrics.errors++;
        }
      });
      
      return;
    }
    
    // Página de pruebas
    if (path === '/' && req.method === 'GET') {
      const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webhook Inteligente - Pruebas</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .container { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 10px 0; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        textarea { width: 100%; height: 100px; margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        input { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .metric-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
    </style>
</head>
<body>
    <h1>🚀 Webhook Inteligente - Panel de Pruebas</h1>
    
    <div class="container">
        <h2>📊 Estado del Sistema</h2>
        <div id="health-status">Cargando...</div>
        <button onclick="checkHealth()">Verificar Estado</button>
        <button onclick="getMetrics()">Ver Métricas</button>
    </div>
    
    <div class="container">
        <h2>🧪 Probar Webhook</h2>
        <form onsubmit="testWebhook(event)">
            <input type="text" id="nombre" placeholder="Nombre del usuario" value="María García">
            <input type="text" id="psid" placeholder="PSID (ID único)" value="test123">
            <textarea id="mensaje" placeholder="Mensaje a procesar">Hola, quiero agendar una cita para botox, mi teléfono es 55 1234 5678</textarea>
            <button type="submit">Enviar Webhook</button>
        </form>
        
        <h3>Ejemplos de mensajes:</h3>
        <button onclick="setExample(1)">Agendar Cita</button>
        <button onclick="setExample(2)">Pedir Información</button>
        <button onclick="setExample(3)">Realizar Pago</button>
        <button onclick="setExample(4)">Cancelar</button>
    </div>
    
    <div class="container">
        <h2>📋 Resultados</h2>
        <div id="results"></div>
    </div>

    <script>
        const examples = {
            1: "Hola, quiero agendar una cita para botox mañana a las 3pm, mi teléfono es 55 1234 5678",
            2: "Me puedes dar información sobre los precios de rellenos faciales?",
            3: "Quiero realizar el pago de mi tratamiento de láser",
            4: "Necesito cancelar mi cita de mañana"
        };
        
        function setExample(num) {
            document.getElementById('mensaje').value = examples[num];
        }
        
        async function checkHealth() {
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                
                const statusDiv = document.getElementById('health-status');
                statusDiv.innerHTML = '<div class="success"><h3>✅ Sistema Saludable</h3><pre>' + JSON.stringify(data, null, 2) + '</pre></div>';
            } catch (error) {
                document.getElementById('health-status').innerHTML = '<div class="error"><h3>❌ Error</h3><p>' + error.message + '</p></div>';
            }
        }
        
        async function getMetrics() {
            try {
                const response = await fetch('/api/metrics');
                const data = await response.json();
                
                const statusDiv = document.getElementById('health-status');
                statusDiv.innerHTML = '<div class="container"><h3>📊 Métricas del Sistema</h3><pre>' + JSON.stringify(data, null, 2) + '</pre></div>';
            } catch (error) {
                document.getElementById('health-status').innerHTML = '<div class="error"><h3>❌ Error</h3><p>' + error.message + '</p></div>';
            }
        }
        
        async function testWebhook(event) {
            event.preventDefault();
            
            const data = {
                nombre: document.getElementById('nombre').value,
                psid: document.getElementById('psid').value,
                mensaje: document.getElementById('mensaje').value
            };
            
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '<p>⏳ Procesando...</p>';
            
            try {
                const response = await fetch('/api/webhook', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    resultsDiv.innerHTML = '<div class="success"><h3>✅ Webhook Procesado Exitosamente</h3><pre>' + JSON.stringify(result, null, 2) + '</pre></div>';
                } else {
                    resultsDiv.innerHTML = '<div class="error"><h3>❌ Error en Webhook</h3><pre>' + JSON.stringify(result, null, 2) + '</pre></div>';
                }
            } catch (error) {
                resultsDiv.innerHTML = '<div class="error"><h3>❌ Error de Conexión</h3><p>' + error.message + '</p></div>';
            }
        }
        
        // Cargar estado inicial
        checkHealth();
    </script>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(html);
      return;
    }
    
    // 404 para rutas no encontradas
    res.writeHead(404);
    res.end(JSON.stringify({ 
      error: 'Ruta no encontrada',
      available_endpoints: [
        'GET /',
        'GET /api/health',
        'GET /api/metrics',
        'POST /api/webhook'
      ],
      timestamp: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('Error en servidor:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ 
      error: 'Error interno del servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    }));
    metrics.errors++;
  }
});

// =====================================================
// 🚀 INICIAR SERVIDOR
// =====================================================

server.listen(PORT, () => {
  console.log(`
🚀 Webhook Inteligente iniciado exitosamente!

📍 Servidor: http://localhost:${PORT}
🌐 Panel de pruebas: http://localhost:${PORT}
🏥 Health check: http://localhost:${PORT}/api/health
📊 Métricas: http://localhost:${PORT}/api/metrics
🔗 Webhook endpoint: http://localhost:${PORT}/api/webhook

🔧 Modo: ${NODE_ENV}
⏰ Iniciado: ${new Date().toLocaleString()}
  `);
});

// Manejo de errores
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado exitosamente');
    process.exit(0);
  });
});

export default server;