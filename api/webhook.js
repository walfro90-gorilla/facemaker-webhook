// =============================================
// 🚀 WEBHOOK INTELIGENTE CON HUBSPOT INTEGRATION
// =============================================
// Este archivo implementa un endpoint webhook para procesar mensajes,
// extraer información relevante (teléfono, fecha, hora, intención, producto),
// y sincronizar contactos y deals con HubSpot de forma inteligente.
// Incluye lógica avanzada de parsing y manejo de duplicados.
//
// Autor: Walfre Gorilla-Labs
// Última actualización: 2025-06-27
// =============================================





// 📦 Importa el cliente oficial de HubSpot y dotenv para variables de entorno
import { Client } from '@hubspot/api-client'; // Cliente oficial para interactuar con la API de HubSpot
import dotenv from 'dotenv'; // Permite cargar variables de entorno desde un archivo .env

// 🔧 Carga las variables de entorno desde .env
// Necesario para obtener el token de HubSpot
dotenv.config();

// 🔧 Inicializa el cliente de HubSpot con el token de acceso
const hubspot = new Client({ 
  accessToken: process.env.HUBSPOT_TOKEN || 'your_hubspot_token_here' // Token de autenticación para la API
});


// =====================================================
// 📝 FUNCION PRINCIPAL DE PARSING DE MENSAJES
// =====================================================
// Extrae teléfono, fecha, hora, intención y producto de un mensaje de texto
// Utiliza expresiones regulares y lógica de scoring para mayor precisión
function parseMensaje(mensaje) {
  console.log('📥 Iniciando parsing súper inteligente:', mensaje); // Log para depuración
  
  // 🔍 Normaliza el mensaje a minúsculas y elimina espacios innecesarios
  const texto = (mensaje || "").toLowerCase().trim(); // Normaliza el texto
  
  // ⚠️ Si el mensaje está vacío, retorna valores por defecto
  // Esto evita errores en el procesamiento posterior
  if (!texto) {
    console.log('⚠️ Mensaje vacío recibido');
    return { telefono: "", fecha: "", hora: "", intencion: "", producto: "" };
  }

  // 📞 Busca teléfonos en el texto usando varios patrones internacionales
  const telefonoPatterns = [
    /\b(?:\+?52\s?)?(?:1\s?)?(?:\d{3}[\s\-\(\)]?\d{3}[\s\-\(\)]?\d{4})\b/g, // México formato completo
    /\b(?:\+?52\s?)?\d{2}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, // México celular
    /\b\d{3}[\s\-\(\)]?\d{3}[\s\-\(\)]?\d{4}\b/g, // Formato US/General
    /\b\d{10,15}\b/g, // Números largos genéricos
    /\b\d{8,12}\b/g // Números medianos
  ];
  
  // 📞 Busca todos los patrones de teléfono en el text
  // o toma el número más largo encontrado (más probable que sea completo)
  let telefono = "";
  for (const pattern of telefonoPatterns) {
    const matches = texto.match(pattern); // Busca coincidencias con el patrón actual
    if (matches) {
      // Tomar el número más largo encontrado (más probable que sea completo)
      telefono = matches
        .map(t => t.replace(/[\s\-\(\)]/g, '')) // Elimina espacios y guiones
        .filter(t => t.length >= 8) // Solo números con longitud válida
        .sort((a, b) => b.length - a.length)[0] || ""; // Ordena por longitud descendente
      if (telefono) break; // Si encuentra un teléfono válido, termina la búsqueda
    }
  }

  // 📅 Busca fechas usando palabras clave y formatos comunes
  const fechaPatterns = [
    { pattern: /\b(hoy|today)\b/i, transform: () => 'hoy' },
    { pattern: /\b(mañana|tomorrow|mañ)\b/i, transform: () => 'mañana' },
    { pattern: /\b(pasado\s?mañana|day after tomorrow)\b/i, transform: () => 'pasado mañana' },
    { pattern: /\b(lunes|monday|lun)\b/i, transform: () => 'lunes' },
    { pattern: /\b(martes|tuesday|mar)\b/i, transform: () => 'martes' },
    { pattern: /\b(miércoles|wednesday|mie|mier)\b/i, transform: () => 'miércoles' },
    { pattern: /\b(jueves|thursday|jue)\b/i, transform: () => 'jueves' },
    { pattern: /\b(viernes|friday|vie)\b/i, transform: () => 'viernes' },
    { pattern: /\b(sábado|saturday|sab)\b/i, transform: () => 'sábado' },
    { pattern: /\b(domingo|sunday|dom)\b/i, transform: () => 'domingo' },
    { pattern: /\b(\d{1,2})\s?(?:de|\/|\-)\s?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/i, transform: (match) => match[0] },
    { pattern: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/, transform: (match) => match[0] }
  ];

  // 🗓️ Busca fechas en el texto usando los patrones definidos
  // y toma la primera coincidencia encontrada
  let fecha = "";
  for (const { pattern, transform } of fechaPatterns) {
    const match = texto.match(pattern); // Busca coincidencia de fecha
    if (match) {
      fecha = transform(match); // Aplica la transformación para obtener el valor legible
      break;
    }
  }

  // 🕐 Busca horas en diferentes formatos (12/24h, con o sin am/pm)
  const horaPatterns = [
    /\b(\d{1,2}):(\d{2})\s?(am|pm|a\.?m\.?|p\.?m\.?)\b/i,
    /\b(\d{1,2})\s?(am|pm|a\.?m\.?|p\.?m\.?)\b/i,
    /\b(\d{1,2}):(\d{2})\b/,
    /\b(\d{1,2})\s?(de\s?la\s?)?(mañana|tarde|noche)\b/i,
    /\b(medio\s?día|mediodía)\b/i,
    /\b(media\s?noche|medianoche)\b/i
  ];
  
  // 🎯 Busca la primera coincidencia de hora en el texto
  // y toma el formato más común
  let hora = "";
  for (const pattern of horaPatterns) {
    const match = texto.match(pattern); // Busca coincidencia de hora
    if (match) {
      hora = match[0]; // Toma la coincidencia encontrada
      break;
    }
  }
  

  // 🎯 Detecta la intención del mensaje usando keywords y un sistema de scoring
  // Define un mapa de intenciones con palabras clave y pesos
  const intencionesMap = {
    cancelar: {
      keywords: ['cancelar', 'anular', 'no puedo ir', 'cambiar fecha', 'suspender', 'posponer', 'cancela', 'mejor cancela', 'mejor cancelar', 'mejor anula', 'mejor suspende'],
      weight: 2.0 // Prioridad máxima
    },
    agendar_cita: {
      keywords: ['sita','cita', 'agendar', 'apartar', 'reservar', 'programar', 'consulta', 'appointment', 'agenda', 'cuando', 'disponible'],
      weight: 1.0
    },
    pedir_informacion: {
      keywords: ['precio', 'costo', 'cuánto', 'información', 'detalles', 'me interesa', 'quisiera saber', 'info', 'dime', 'cuéntame', 'pregunta'],
      weight: 0.8
    },
    realizar_pago: {
      keywords: ['pagar', 'pago', 'depósito', 'apartar con', 'transferencia', 'anticipo', 'dinero', 'efectivo', 'tarjeta'],
      weight: 1.2
    },
    emergencia: {
      keywords: ['urgente', 'emergencia', 'dolor', 'problema', 'ayuda', 'inmediato', 'ya', 'rápido', 'pronto'],
      weight: 1.3
    }
  };

  // 💡 Scoring avanzado: evalúa cada intención y calcula un score basado en las keywords
  // Itera sobre las intenciones y calcula un score basado en la presencia de keywords
  let intencion = "";
  let maxScore = 0;
  let cancelarScore = 0;
  for (const [intent, config] of Object.entries(intencionesMap)) {
    let score = 0;
    for (const keyword of config.keywords) {
      if (texto.includes(keyword)) {
        // Scoring avanzado: palabras más largas + peso específico + posición en el texto
        const wordWeight = keyword.split(' ').length; // Palabras compuestas valen más
        const positionWeight = texto.indexOf(keyword) < 20 ? 1.2 : 1.0; // Palabras al inicio tienen más peso
        score += (wordWeight * config.weight * positionWeight);
      }
    }
    // 💡 Si la intención es cancelar, guarda el score para forzarla al final
    if (intent === 'cancelar') cancelarScore = score;
    if (score > maxScore) {
      maxScore = score;
      intencion = intent;
    }
  }
  // Si hay score de cancelar, forzar cancelar aunque haya empate
  if (cancelarScore > 0) intencion = 'cancelar';

  // 💉 Detecta el producto/servicio mencionado usando un diccionario de variaciones
  const productosMap = {
    "aumento mamario": ["aumento mamario", "aumento de busto", "implantes mamarios", "busto", "senos", "pechos"],
    "botox": ["botox", "bótox", "toxina botulínica", "toxina", "botulínica"],
    "láser": ["láser", "laser", "depilación láser", "depilación", "depilar"],
    "rinoplastia": ["rinoplastia", "nariz", "cirugía de nariz", "operación nariz"],
    "liposucción": ["liposucción", "lipo", "grasa", "reducir grasa"],
    "suero": ["suero", "vitaminas", "sueros", "vitaminico"],
    "emerald": ["emerald", "emerald láser", "tratamiento emerald"],
    "cirugía": ["cirugía", "operación", "cirugía estética"],
    "bichectomía": ["bichectomía", "cachetes", "mejillas"],
    "lifting": ["lifting", "estiramiento"],
    "peeling": ["peeling", "exfoliación"],
    "rellenos": ["rellenos", "ácido hialurónico", "hialurónico"]
  };

  let producto = "";
  let maxProductScore = 0;
  
  for (const [prodKey, variations] of Object.entries(productosMap)) {
    let productScore = 0;
    for (const variation of variations) {
      if (texto.includes(variation)) {
        productScore += variation.split(' ').length; // Términos más específicos = más peso
      }
    }
    if (productScore > maxProductScore) {
      maxProductScore = productScore;
      producto = prodKey;
    }
  }

  const resultado = { telefono, fecha, hora, intencion, producto }; // Objeto con los datos extraídos

  // 🛠️ Si hay producto pero no intención, asume que pide información
  if (producto && !intencion) {
    resultado.intencion = 'pedir_informacion'; // Si hay producto pero no intención, asume que pide información
    intencion = 'pedir_informacion';
  }

  console.log('✅ Resultado parsing súper inteligente:', {
    ...resultado,
    scores: { intencionScore: maxScore, productoScore: maxProductScore },
    textLength: texto.length,
    processingTime: Date.now()
  }); // Log de depuración con los resultados y métricas
  
  return resultado;
}

// =====================================================
// 🗺️ MAPEO DE INTENCIONES A TEXTO LEGIBLE
// =====================================================
// Utilidad para mostrar la intención en texto humano
const intencionMap = {
  agendar_cita: "Agendar Cita",
  pedir_informacion: "Pedir Información",
  realizar_pago: "Realizar Pago",
  cancelar: "Cancelar",
  emergencia: "Emergencia"
};

// =====================================================
// 🔄 ACTUALIZACIÓN DE VARIABLES EN MANYCHAT (PSEUDOCÓDIGO)
// =====================================================
// Solo actualiza la variable si está vacía (debes implementar la integración real)
async function updateManyChatVariable(psid, variable, value) {
  const currentValue = await getManyChatVariable(psid, variable); // Obtiene el valor actual de la variable
  if (!currentValue) {
    await setManyChatVariable(psid, variable, value); // Solo actualiza si está vacía
  }
}

// =====================================================
// 🗃️ CACHE TEMPORAL DE DEALS RECIENTES
// =====================================================
// Evita duplicados de deals antes de que HubSpot los indexe
const recentDeals = new Map(); // Mapa en memoria para cachear deals recientes

// =====================================================
// 💼 FUNCION PRINCIPAL PARA CREAR/ACTUALIZAR DEALS EN HUBSPOT
// =====================================================
// Busca si ya existe un deal abierto para el usuario (por PSID),
// si existe lo actualiza, si no existe lo crea, y si la intención es cancelar lo cierra.
// Usa un cache local para evitar duplicados y espera para indexación.
async function upsertDealHubspot({ psid, producto, intencion, hubspotContactId, telefono, nombre, fecha, hora, mensaje }) {
  console.log('💼 Iniciando upsert Deal HubSpot (solo 1 deal abierto por usuario):', { psid, producto, intencion, hubspotContactId }); // Log de inicio
  if (!hubspotContactId) {
    console.log('❌ Contact ID requerido para crear Deal'); // Valida que haya contacto
    return { hubspotDealId: null, dealstage: "error - sin contacto", action: "failed" };
  }

  // Mapeos
  const productoDealMap = {
    "aumento mamario": "Aumento Mamario - Consulta",
    "aumento de busto": "Aumento de Busto - Consulta", 
    "implantes": "Implantes Mamarios - Consulta",
    "botox": "Botox - Tratamiento",
    "bótox": "Botox - Tratamiento",
    "toxina botulínica": "Toxina Botulínica - Tratamiento",
    "láser": "Tratamiento Láser - Consulta",
    "laser": "Tratamiento Láser - Consulta",
    "depilación": "Depilación Láser - Consulta",
    "rinoplastia": "Rinoplastia - Consulta",
    "nariz": "Cirugía de Nariz - Consulta",
    "liposucción": "Liposucción - Consulta",
    "lipo": "Liposucción - Consulta",
    "suero": "Sueros y Vitaminas - Tratamiento",
    "vitaminas": "Sueros y Vitaminas - Tratamiento",
    "emerald": "Tratamiento Emerald - Consulta",
    "cirugía": "Cirugía Estética - Consulta",
    "operación": "Cirugía Estética - Consulta"
  };
  const intencionStageMap = {
    agendar_cita: "1561068259",      // Cita agendada
    pedir_informacion: "1561068258",  // Información solicitada  
    realizar_pago: "1561068261",      // Listo para pagar
    cancelar: "1561068264",           // Perdido
    emergencia: "1561068259"          // Cita agendada
  };
  const stageFinales = ["1561068262", "1561068263", "1561068264"];

  // Nombre dinámico
  // Si la intención es cancelar y hay un producto en cache, usa ese producto para el dealName
  let lastProduct = producto;
  if (intencion === 'cancelar') {
    const cached = recentDeals.get(psid);
    if (!producto && cached && cached.producto) {
      lastProduct = cached.producto;
    }
  }
  // NUEVA NOMENCLATURA DEL DEAL
  const dealName = `${(lastProduct || "Servicio").charAt(0).toUpperCase() + (lastProduct || "Servicio").slice(1)} - ${nombre || "Usuario"} - ${intencionMap[intencion] || intencion}`;
  const dealstage = intencionStageMap[intencion] || "1561068258";

  // Descripción completa para el asesor
  const description = `\n🧑 Nombre: ${nombre || "No proporcionado"}\n📞 Teléfono: ${telefono || "No proporcionado"}\n🎯 Intención: ${intencionMap[intencion] || intencion}\n💉 Producto: ${lastProduct || "No detectado"}\n📅 Fecha: ${fecha || "No proporcionada"}\n🕙 Hora: ${hora || "No proporcionada"}\n🆔 PSID: ${psid}\n💬 Mensaje original: ${mensaje}\n`;

  // 1. Buscar en cache local primero
  let cached = recentDeals.get(psid); // Busca en el cache local
  if (cached) {
    if (!stageFinales.includes(cached.lastStage)) {
      console.log('⚡ Deal ABIERTO encontrado en cache local, solo se actualizará:', cached); // Si hay deal abierto, actualiza
      try {
        const updateProperties = {
          dealname: dealName,
          dealstage,
          hs_lastmodifieddate: new Date().toISOString(), // Fecha de última modificación
          manychat_psid: psid,
          description
        };
        // Si la intención es cancelar, solo cambia el stage y nombre
        const updateResult = await hubspot.crm.deals.basicApi.update(cached.dealId, { properties: updateProperties });
        console.log('📝 Deal actualizado (cache):', JSON.stringify(updateResult?.body || updateResult, null, 2));
        recentDeals.set(psid, {
          dealId: cached.dealId,
          dealName,
          lastStage: dealstage,
          timestamp: Date.now(),
          producto,
          psid
        });
        // Si se cerró el deal, limpiar cache
        if (intencion === 'cancelar' && dealstage === '1561068264') {
          recentDeals.delete(psid);
        }
        return {
          hubspotDealId: cached.dealId,
          dealstage,
          action: intencion === 'cancelar' ? 'closed-cache' : 'updated-cache',
          dealName,
          stageChanged: true,
          previousStage: cached.lastStage
        };
      } catch (err) {
        console.error('❌ Error actualizando deal desde cache, se intentará buscar en HubSpot:', err.message);
      }
    } else {
      console.log('🟠 El último deal en cache está CERRADO. Se elimina del cache para permitir crear uno nuevo.');
      recentDeals.delete(psid);
      cached = null;
    }
  }

  // 2. Si no está en cache o el último está cerrado, esperar 3s antes de buscar en HubSpot
  if (!cached || (cached && stageFinales.includes(cached.lastStage))) {
    console.log('⏳ Esperando 3s para permitir indexado de HubSpot...'); // Espera para evitar duplicados
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // 3. Buscar en HubSpot deals abiertos
  try {
    console.log('🔍 Buscando deals abiertos con manychat_psid:', psid); // Busca deals abiertos por PSID
    const searchOpenDeals = await hubspot.crm.deals.searchApi.doSearch({
      filterGroups: [{
        filters: [
          { propertyName: "manychat_psid", operator: "EQ", value: psid },
          { propertyName: "dealstage", operator: "NOT_IN", values: stageFinales }
        ]
      }],
      properties: ["dealname", "dealstage", "amount", "closedate", "manychat_psid"],
      limit: 5
    });
    console.log('🔎 Resultado deals encontrados:', JSON.stringify(searchOpenDeals?.body?.results, null, 2));
    let existingDeal = searchOpenDeals?.body?.results?.[0] || null; // Toma el primer deal abierto encontrado

    // 🔍 Si no se encontró deal abierto, buscar por nombre de deal como fallback
    if (!existingDeal) {
      const fallbackDealName = `${productoDealMap[producto] || producto || "Oportunidad Messenger"} [${psid}]`;
      console.log('🔍 Fallback: buscando deal por nombre:', fallbackDealName);
      const searchByName = await hubspot.crm.deals.searchApi.doSearch({
        filterGroups: [{
          filters: [
            { propertyName: "dealname", operator: "EQ", value: fallbackDealName },
            { propertyName: "dealstage", operator: "NOT_IN", values: stageFinales }
          ]
        }],
        properties: ["dealname", "dealstage", "amount", "closedate", "manychat_psid"],
        limit: 1
      });
      console.log('🔎 Resultado deals encontrados por nombre:', JSON.stringify(searchByName?.body?.results, null, 2));
      existingDeal = searchByName?.body?.results?.[0] || null;
    }

    if (existingDeal) {
      console.log('⚡ Deal ABIERTO encontrado en HubSpot, solo se actualizará:', existingDeal.id); // Si hay deal abierto en HubSpot, actualiza
      const updateProperties = {
        dealname: dealName,
        dealstage,
        hs_lastmodifieddate: new Date().toISOString(),
        manychat_psid: psid,
        description
      };
      if (intencion === 'realizar_pago' && (existingDeal.properties.amount === '0' || !existingDeal.properties.amount)) {
        updateProperties.amount = '1000'; // Si es pago, actualiza el monto
      }
      const updateResult = await hubspot.crm.deals.basicApi.update(existingDeal.id, { properties: updateProperties });
      console.log('📝 Deal actualizado (HubSpot):', JSON.stringify(updateResult?.body || updateResult, null, 2));
      recentDeals.set(psid, {
        dealId: existingDeal.id,
        dealName,
        lastStage: dealstage,
        timestamp: Date.now(),
        producto,
        psid
      });
      // Si se cerró el deal, limpiar cache
      if (intencion === 'cancelar' && dealstage === '1561068264') {
        recentDeals.delete(psid);
      }
      return {
        hubspotDealId: existingDeal.id,
        dealstage,
        action: intencion === 'cancelar' ? 'closed' : 'updated',
        dealName,
        stageChanged: true,
        previousStage: existingDeal.properties.dealstage
      };
    } else if (intencion === 'cancelar') {
      // No hay deal abierto, pero se pidió cancelar: no hacer nada
      return {
        hubspotDealId: null,
        dealstage: '1561068264',
        action: 'no-open-deal-to-close',
        dealName: null,
        stageChanged: false
      };
    } else {
      console.log('🟢 No hay deal abierto en cache ni en HubSpot. Se creará uno nuevo.'); // Si no hay deal, crea uno nuevo
      const createProperties = {
        dealname: dealName,
        dealstage,
        pipeline: "default",
        amount: intencion === 'realizar_pago' ? "1000" : "0",
        closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Fecha de cierre estimada
        hs_createdate: new Date().toISOString(),
        manychat_psid: psid,
        description
      };
      const dealResponse = await hubspot.crm.deals.basicApi.create({ properties: createProperties });
      const dealId = dealResponse?.body?.id || dealResponse?.id;
      console.log('🆕 Deal creado:', JSON.stringify(dealResponse?.body || dealResponse, null, 2));
      recentDeals.set(psid, {
        dealId,
        dealName,
        lastStage: dealstage,
        timestamp: Date.now(),
        producto,
        psid
      });
      try {
        await hubspot.crm.associations.v4.basicApi.create(
          'deals',
          dealId,
          'contacts',
          hubspotContactId,
          [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
        ); // Asocia el contacto al deal
      } catch (e) {
        console.error('⚠️ Error asociando contacto al deal:', e.message);
      }
      return {
        hubspotDealId: dealId,
        dealstage,
        action: "created",
        dealName,
        isNewDeal: true
      };
    }
  } catch (err) {
    console.error('❌ Error en upsertDealHubspot:', err.message); // Log de error
    return { hubspotDealId: null, dealstage: "error", action: "failed" };
  }
}

// =====================================================
// 🏢 FUNCION PRINCIPAL PARA CREAR/ACTUALIZAR CONTACTOS EN HUBSPOT
// =====================================================
// Busca si ya existe el contacto (por email generado con PSID),
// si existe lo actualiza, si no existe lo crea. Maneja errores y duplicados.
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
    }  } catch (err) {
    console.error('❌ Error con HubSpot:', err.message);
    console.error('📝 Detalles del error:', {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      body: err.response?.body,
      code: err.code
    });
    
    // 🔧 Manejar error 409 (contacto ya existe) y extraer ID existente
    if (err.code === 409 && err.message.includes('Contact already exists')) {
      const match = err.message.match(/Existing ID: (\d+)/);
      if (match) {
        const existingContactId = match[1];
        console.log('✅ Contacto existente encontrado via error 409:', existingContactId);
        
        try {
          // Actualizar el contacto existente
          const updateProperties = {
            hs_lead_status
          };
          
          if (telefono && telefono.length >= 10) {
            updateProperties.phone = telefono;
          }

          await hubspot.crm.contacts.basicApi.update(existingContactId, {
            properties: updateProperties
          });

          console.log('✅ Contacto existente actualizado via ID del error');
          return { 
            hubspotContactId: existingContactId, 
            leadstatus: hs_lead_status, 
            action: "updated_via_error",
            email 
          };
        } catch (updateErr) {
          console.error('❌ Error actualizando contacto existente:', updateErr.message);
        }
      }
    }
    
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

// =====================================================
// 🚀 HANDLER PRINCIPAL DEL WEBHOOK (FORMATO VERCEL)
// =====================================================
// Endpoint principal que recibe el request, valida, parsea el mensaje,
// sincroniza con HubSpot y responde con los datos extraídos y resultados.
export default async function handler(req, res) {
  console.log('🚀 Webhook iniciado:', req.method, new Date().toISOString());
  
  // ✅ Solo permite método POST
  if (req.method !== 'POST') {
    console.log('❌ Método no permitido:', req.method);
    return res.status(405).json({ 
      error: '❌ Método no permitido',
      permitidos: ['POST']
    });
  }

  try {
    // 📥 Extrae datos del request y valida el mensaje
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

    // 🧠 Parseo del mensaje y procesamiento de HubSpot (contacto y deal)
    const { telefono, fecha, hora, intencion, producto } = parseMensaje(mensaje);    // 🏢 Procesar HubSpot (solo si hay PSID)
    let hubspotResult = { 
      hubspotContactId: null, 
      leadstatus: "sin procesar - falta PSID",
      action: "skipped"
    };

    let dealResult = {
      dealId: null,
      dealName: null,
      dealStage: null,
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
      // 💼 LÓGICA INTELIGENTE: Crear/actualizar/cerrar deal
      // 1. Si la intención es cancelar, procesar cierre aunque no haya producto
      if (hubspotResult.hubspotContactId && intencion === 'cancelar') {
        console.log('💼 Procesando cierre de deal por intención cancelar para:', {
          contacto: hubspotResult.hubspotContactId,
          intencion
        });
        dealResult = await upsertDealHubspot({
          psid,
          producto: '', // No importa el producto para cancelar
          intencion: 'cancelar',
          hubspotContactId: hubspotResult.hubspotContactId,
          telefono,
          nombre, // <-- AGREGADO
          fecha,
          hora,
          mensaje
        });
        // Si el deal fue cerrado, limpiar cache
        if (dealResult.dealstage === '1561068264') {
          recentDeals.delete(psid);
        }
      } else if (hubspotResult.hubspotContactId && producto) {
        console.log('💼 Procesando deal inteligente para:', {
          contacto: hubspotResult.hubspotContactId,
          producto,
          intencion
        });
        dealResult = await upsertDealHubspot({
          psid,
          producto,
          intencion,
          hubspotContactId: hubspotResult.hubspotContactId,
          telefono,
          nombre, // <-- AGREGADO
          fecha,
          hora,
          mensaje
        });
        // 📊 Log del resultado para monitoreo
        console.log('📊 Resultado del procesamiento de deal:', {
          dealId: dealResult.hubspotDealId,
          action: dealResult.action,
          stageChanged: dealResult.stageChanged || false,
          isNewDeal: dealResult.isNewDeal || false
        });
      } else if (!producto && intencion !== 'cancelar') {
        console.log('⚠️ Sin producto detectado - no se procesará deal');
        dealResult = {
          hubspotDealId: null,
          dealstage: null,
          action: "skipped - sin producto",
          reason: "No se detectó producto específico en el mensaje"
        };
      } else {
        console.log('⚠️ Sin contacto válido - no se puede crear deal');
        dealResult = {
          hubspotDealId: null,
          dealstage: null,
          action: "skipped - sin contacto",
          reason: "No se pudo crear/obtener contacto en HubSpot"
        };
      }
    } else {
      console.log('⚠️ PSID no proporcionado, saltando HubSpot');
    }

    // 📤 Responde con los datos extraídos y resultados de HubSpot
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
      hubspot: {
        contacto: hubspotResult,
        deal: dealResult
      },
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

// =====================================================
// 🧪 EXPORTS PARA TESTING
// =====================================================
// Exporta el handler y la función de deals para pruebas unitarias
export { handler as webhook, upsertDealHubspot };
