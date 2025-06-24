
// 🚀 Webhook Inteligente con HubSpot Integration
import { Client } from '@hubspot/api-client';
import dotenv from 'dotenv';

// 🔧 Cargar variables de entorno
dotenv.config();

// 🔧 Inicializar HubSpot Client
const hubspot = new Client({ 
  accessToken: process.env.HUBSPOT_TOKEN || 'your_hubspot_token_here'
});

// 📝 Función mejorada para parsear mensajes
function parseMensaje(mensaje) {
  console.log('📥 Parseando mensaje:', mensaje);
  
  const texto = (mensaje || "").toLowerCase().trim();
  
  if (!texto) {
    console.log('⚠️ Mensaje vacío recibido');
    return { telefono: "", fecha: "", hora: "", intencion: "", producto: "" };
  }

  // 📞 Detectar teléfonos mejorado (múltiples formatos)
  const telefonoPatterns = [
    /\b(?:\+?52\s?)?(?:\d{2}[\s\-]?)?\d{4}[\s\-]?\d{4}\b/g, // Mexicanos
    /\b\d{3}[\s\-]?\d{3}[\s\-]?\d{4}\b/g, // General
    /\b\d{10,15}\b/g // Números largos
  ];
  
  let telefono = "";
  for (const pattern of telefonoPatterns) {
    const match = texto.match(pattern);
    if (match) {
      telefono = match[0].replace(/[\s\-\(\)]/g, '');
      break;
    }
  }

  // 📅 Detectar fechas mejorado
  const fechaPatterns = [
    /\b(hoy|mañana|pasado mañana)\b/i,
    /\b(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b/i,
    /\b(\d{1,2})\s?(?:de|\/|\-)\s?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/i,
    /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/
  ];
  
  let fecha = "";
  for (const pattern of fechaPatterns) {
    const match = texto.match(pattern);
    if (match) {
      fecha = match[0];
      break;
    }
  }

  // 🕐 Detectar horas mejorado
  const horaMatch = texto.match(/\b(\d{1,2})(?::(\d{2}))?\s?(am|pm|a\.m\.|p\.m\.|de la mañana|de la tarde|de la noche)?\b/i);
  const hora = horaMatch ? horaMatch[0] : "";

  // 🎯 Detectar intenciones mejorado con scoring
  const intencionesMap = {
    agendar_cita: ['cita', 'agendar', 'apartar', 'reservar', 'programar', 'consulta', 'appointment'],
    pedir_informacion: ['precio', 'costo', 'cuánto', 'información', 'detalles', 'me interesa', 'quisiera saber'],
    realizar_pago: ['pagar', 'pago', 'depósito', 'apartar con', 'transferencia', 'anticipo'],
    cancelar: ['cancelar', 'anular', 'no puedo ir', 'cambiar fecha'],
    emergencia: ['urgente', 'emergencia', 'dolor', 'problema', 'ayuda', 'inmediato']
  };

  let intencion = "";
  let maxScore = 0;
  
  for (const [intent, keywords] of Object.entries(intencionesMap)) {
    let score = 0;
    for (const keyword of keywords) {
      if (texto.includes(keyword)) {
        score += keyword.split(' ').length; // Palabras más largas = más peso
      }
    }
    if (score > maxScore) {
      maxScore = score;
      intencion = intent;
    }
  }

  // 💉 Detectar productos/servicios
  const productos = [
    "aumento mamario", "aumento de busto", "implantes",
    "botox", "bótox", "toxina botulínica", 
    "láser", "laser", "depilación",
    "rinoplastia", "nariz",
    "liposucción", "lipo",
    "suero", "vitaminas", "emerald",
    "cirugía", "operación"
  ];
  const producto = productos.find(p => texto.includes(p)) || "";

  const resultado = { telefono, fecha, hora, intencion, producto };
  console.log('✅ Resultado parsing:', resultado);
  
  return resultado;
}

// 🏢 Función para crear/actualizar contacto en HubSpot
async function upsertLeadHubspot({ psid, nombre, telefono, intencion, producto }) {
  console.log('🏢 Iniciando upsert HubSpot:', { psid, nombre, telefono, intencion });
  
  if (!psid) {
    console.log('❌ PSID requerido para HubSpot');
    return { hubspotContactId: null, leadstatus: "error - sin PSID" };
  }

  const email = `${psid}@facemaker.chat`;
    // 📊 Mapeo inteligente usando valores estándar de HubSpot
  const leadstatusMap = {
    agendar_cita: "NEW",
    pedir_informacion: "OPEN", 
    realizar_pago: "CONNECTED",
    cancelar: "UNQUALIFIED",
    emergencia: "ATTEMPTED_TO_CONTACT"
  };
  const hs_lead_status = leadstatusMap[intencion] || "NEW";
  try {
    console.log('🔍 Buscando contacto existente...', email);
    
    // 🔐 Verificar que el token de HubSpot esté configurado
    if (!process.env.HUBSPOT_TOKEN || process.env.HUBSPOT_TOKEN === 'your_hubspot_token_here') {
      console.log('❌ Token de HubSpot no configurado en Vercel');
      return { 
        hubspotContactId: null, 
        leadstatus: "error - token no configurado",
        error: "HUBSPOT_TOKEN no está configurado en las variables de entorno",
        action: "failed"
      };
    }

    // 🔍 Buscar contacto existente por email
    const searchResponse = await hubspot.crm.contacts.searchApi.doSearch({
      filterGroups: [{ 
        filters: [{ 
          propertyName: "email", 
          operator: "EQ", 
          value: email 
        }] 
      }],
      properties: ["email", "firstname", "phone", "hs_lead_status", "lifecyclestage"],
      limit: 1
    });

    console.log('📊 Respuesta de búsqueda HubSpot:', {
      status: searchResponse?.status,
      hasBody: !!searchResponse?.body,
      hasResults: !!searchResponse?.body?.results,
      resultsLength: searchResponse?.body?.results?.length || 0
    });

    const existing = searchResponse?.body?.results?.[0];

    if (existing) {
      console.log('✅ Contacto existente encontrado:', existing.id);
        // 📝 Actualizar contacto existente (solo propiedades válidas)
      const updateProperties = {
        hs_lead_status
      };
        // Solo actualizar teléfono si es válido
      if (telefono && telefono.length >= 10) {
        updateProperties.phone = telefono;
      }

      await hubspot.crm.contacts.basicApi.update(existing.id, {
        properties: updateProperties
      });
        console.log('✅ Contacto actualizado exitosamente');
      return { 
        hubspotContactId: existing.id, 
        leadstatus: hs_lead_status, 
        action: "updated",
        email 
      };
    } else {
      console.log('➕ Creando nuevo contacto...');
        // ➕ Crear nuevo contacto (solo propiedades válidas)
      const createProperties = {
        email,
        firstname: nombre || "Usuario Messenger",
        lifecyclestage: "lead",
        hs_lead_status
      };
        // Solo agregar teléfono si es válido
      if (telefono && telefono.length >= 10) {
        createProperties.phone = telefono;
      }console.log('📝 Propiedades para crear contacto:', createProperties);

      const response = await hubspot.crm.contacts.basicApi.create({
        properties: createProperties
      });

      console.log('✅ Nuevo contacto creado:', response?.body?.id || response?.id);
      return { 
        hubspotContactId: response?.body?.id || response?.id, 
        leadstatus: hs_lead_status,
        action: "created",
        email
      };
    }
  } catch (err) {
    console.error('❌ Error con HubSpot:', err.message);
    console.error('📝 Detalles del error:', {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      body: err.response?.body,
      code: err.code
    });
    
    // 🔍 Información adicional para debugging
    const errorDetails = {
      hubspotContactId: null,
      leadstatus: "error",
      error: err.message,
      action: "failed",
      debug: {
        hasToken: !!process.env.HUBSPOT_TOKEN,
        tokenLength: process.env.HUBSPOT_TOKEN?.length || 0,
        errorType: err.constructor.name,
        httpStatus: err.response?.status
      }
    };
    
    return errorDetails;
  }
}

// 🚀 Handler principal del webhook (Formato Vercel)
export default async function handler(req, res) {
  console.log('🚀 Webhook iniciado:', req.method, new Date().toISOString());
  
  // ✅ Validar método HTTP
  if (req.method !== 'POST') {
    console.log('❌ Método no permitido:', req.method);
    return res.status(405).json({ 
      error: '❌ Método no permitido',
      permitidos: ['POST']
    });
  }

  try {
    // 📥 Extraer datos del request
    const { mensaje, psid, nombre } = req.body || {};
    
    console.log('📥 Datos recibidos:', { mensaje, psid, nombre });
    
    // ✅ Validar mensaje
    if (!mensaje) {
      console.log('❌ Mensaje requerido');
      return res.status(400).json({
        error: '❌ Mensaje requerido',
        formato: 'El campo "mensaje" es obligatorio'
      });
    }

    // 🧠 Parsear mensaje
    const { telefono, fecha, hora, intencion, producto } = parseMensaje(mensaje);
    
    // 🏢 Procesar HubSpot (solo si hay PSID)
    let hubspotResult = { 
      hubspotContactId: null, 
      leadstatus: "sin procesar - falta PSID",
      action: "skipped"
    };
    
    if (psid) {
      hubspotResult = await upsertLeadHubspot({ 
        psid, 
        nombre, 
        telefono, 
        intencion, 
        producto 
      });
    } else {
      console.log('⚠️ PSID no proporcionado, saltando HubSpot');
    }

    // 📤 Respuesta final
    const respuesta = {
      success: true,
      timestamp: new Date().toISOString(),
      datos_extraidos: {
        telefono: telefono || null,
        fecha: fecha || null, 
        hora: hora || null,
        intencion: intencion || null,
        producto: producto || null
      },
      hubspot: hubspotResult,
      metadata: {
        mensaje_original: mensaje,
        psid: psid || null,
        nombre: nombre || null
      }
    };

    console.log('✅ Respuesta enviada:', respuesta);
    return res.status(200).json(respuesta);
    
  } catch (error) {
    console.error('💥 Error general:', error);
    return res.status(500).json({
      success: false,
      error: '💥 Error interno del servidor',
      mensaje: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
