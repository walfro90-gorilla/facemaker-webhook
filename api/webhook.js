// 🚀 Webhook Inteligente con HubSpot Integration
import { Client } from '@hubspot/api-client';
import dotenv from 'dotenv';

// 🔧 Cargar variables de entorno
dotenv.config();

// 🔧 Inicializar HubSpot Client
const hubspot = new Client({ 
  accessToken: process.env.HUBSPOT_TOKEN || 'your_hubspot_token_here'
});

// 📝 Función súper mejorada para parsear mensajes con IA avanzada
function parseMensaje(mensaje) {
  console.log('📥 Iniciando parsing súper inteligente:', mensaje);
  
  const texto = (mensaje || "").toLowerCase().trim();
  
  if (!texto) {
    console.log('⚠️ Mensaje vacío recibido');
    return { telefono: "", fecha: "", hora: "", intencion: "", producto: "" };
  }

  // 📞 Detector de teléfonos súper robusto (múltiples patrones internacionales)
  const telefonoPatterns = [
    /\b(?:\+?52\s?)?(?:1\s?)?(?:\d{3}[\s\-\(\)]?\d{3}[\s\-\(\)]?\d{4})\b/g, // México formato completo
    /\b(?:\+?52\s?)?\d{2}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, // México celular
    /\b\d{3}[\s\-\(\)]?\d{3}[\s\-\(\)]?\d{4}\b/g, // Formato US/General
    /\b\d{10,15}\b/g, // Números largos genéricos
    /\b\d{8,12}\b/g // Números medianos
  ];
  
  let telefono = "";
  for (const pattern of telefonoPatterns) {
    const matches = texto.match(pattern);
    if (matches) {
      // Tomar el número más largo encontrado (más probable que sea completo)
      telefono = matches
        .map(t => t.replace(/[\s\-\(\)]/g, ''))
        .filter(t => t.length >= 8)
        .sort((a, b) => b.length - a.length)[0] || "";
      if (telefono) break;
    }
  }

  // 📅 Detector de fechas súper inteligente
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
  
  let fecha = "";
  for (const { pattern, transform } of fechaPatterns) {
    const match = texto.match(pattern);
    if (match) {
      fecha = transform(match);
      break;
    }
  }

  // 🕐 Detector de horas súper preciso
  const horaPatterns = [
    /\b(\d{1,2}):(\d{2})\s?(am|pm|a\.?m\.?|p\.?m\.?)\b/i,
    /\b(\d{1,2})\s?(am|pm|a\.?m\.?|p\.?m\.?)\b/i,
    /\b(\d{1,2}):(\d{2})\b/,
    /\b(\d{1,2})\s?(de\s?la\s?)?(mañana|tarde|noche)\b/i,
    /\b(medio\s?día|mediodía)\b/i,
    /\b(media\s?noche|medianoche)\b/i
  ];
  
  let hora = "";
  for (const pattern of horaPatterns) {
    const match = texto.match(pattern);
    if (match) {
      hora = match[0];
      break;
    }
  }

  // 🎯 Detector de intenciones súper inteligente con scoring avanzado
  const intencionesMap = {
    agendar_cita: {
      keywords: ['cita', 'agendar', 'apartar', 'reservar', 'programar', 'consulta', 'appointment', 'agenda', 'cuando', 'disponible'],
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
    cancelar: {
      keywords: ['cancelar', 'anular', 'no puedo ir', 'cambiar fecha', 'suspender', 'posponer'],
      weight: 1.1
    },
    emergencia: {
      keywords: ['urgente', 'emergencia', 'dolor', 'problema', 'ayuda', 'inmediato', 'ya', 'rápido', 'pronto'],
      weight: 1.3
    }
  };

  let intencion = "";
  let maxScore = 0;
  
  for (const [intent, config] of Object.entries(intencionesMap)) {
    let score = 0;
    for (const keyword of config.keywords) {
      if (texto.includes(keyword)) {
        // Scoring avanzado: palabras más largas + peso específico + posición en el texto
        const wordWeight = keyword.split(' ').length;
        const positionWeight = texto.indexOf(keyword) < 20 ? 1.2 : 1.0; // Palabras al inicio tienen más peso
        score += (wordWeight * config.weight * positionWeight);
      }
    }
    if (score > maxScore) {
      maxScore = score;
      intencion = intent;
    }
  }

  // 💉 Detector de productos/servicios súper completo
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

  const resultado = { telefono, fecha, hora, intencion, producto };
  console.log('✅ Resultado parsing súper inteligente:', {
    ...resultado,
    scores: { intencionScore: maxScore, productoScore: maxProductScore },
    textLength: texto.length,
    processingTime: Date.now()
  });
  
  return resultado;
}

// 🎯 Cache temporal para deals recién creados (para evitar duplicados antes de indexación)
const recentDeals = new Map();

// 💼 Función para crear/actualizar deal en HubSpot
async function upsertDealHubspot({ psid, producto, intencion, hubspotContactId, telefono }) {
  console.log('💼 Iniciando upsert Deal HubSpot:', { psid, producto, intencion, hubspotContactId });
  
  if (!hubspotContactId) {
    console.log('❌ Contact ID requerido para crear Deal');
    return { hubspotDealId: null, dealstage: "error - sin contacto", action: "failed" };
  }

  // 🎯 Mapeo de productos a nombres de deals
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
  // 📊 Mapeo de intenciones a etapas de deal (usando IDs numéricos válidos)
  const intencionStageMap = {
    agendar_cita: "1561068259",      // Cita agendada
    pedir_informacion: "1561068258",  // Información solicitada  
    realizar_pago: "1561068261",      // Listo para pagar
    cancelar: "1561068264",           // Perdido
    emergencia: "1561068259"          // Cita agendada
  };

  const dealName = productoDealMap[producto] || `Consulta Estética - ${psid}`;
  const dealstage = intencionStageMap[intencion] || "1561068258"; // Por defecto: Información solicitada  // 🎯 Clave única mejorada para identificar deals
  const dealIdentifier = `${psid}_${producto || 'consulta'}`;
  const cacheKey = `${psid}_${producto || 'general'}`;

  try {
    console.log('🔍 Iniciando búsqueda avanzada de deal:', { 
      psid, 
      producto, 
      dealIdentifier,
      cacheKey,
      timestamp: new Date().toISOString() 
    });
    
    // 🚀 BÚSQUEDA 0: Cache temporal (deals recién creados) - Optimizada
    const cachedDeal = recentDeals.get(cacheKey);    
    if (cachedDeal && Date.now() - cachedDeal.timestamp < 300000) { // 5 minutos
      console.log('⚡ Deal encontrado en cache temporal:', {
        dealId: cachedDeal.dealId,
        dealName: cachedDeal.dealName,
        cacheAge: Math.floor((Date.now() - cachedDeal.timestamp) / 1000) + 's',
        producto: cachedDeal.producto
      });
      
      // ⚡ Verificación de cambio de intención antes de actualizar
      const currentStage = dealstage;
      const willUpdate = cachedDeal.lastStage !== currentStage;
      
      console.log('🔍 Verificando si necesita actualización:', {
        cacheStage: cachedDeal.lastStage,
        newStage: currentStage,
        needsUpdate: willUpdate
      });
      
      if (willUpdate) {
        console.log('🔄 Actualizando deal desde cache con nueva intención:', {
          anterior: cachedDeal.lastStage,
          nueva: currentStage
        });
        
        try {
          const updateProperties = {
            dealstage: currentStage,
            hs_lastmodifieddate: new Date().toISOString()
          };

          await hubspot.crm.deals.basicApi.update(cachedDeal.dealId, {
            properties: updateProperties
          });
          
          // Actualizar cache con nueva etapa
          cachedDeal.lastStage = currentStage;
          cachedDeal.timestamp = Date.now(); // Renovar TTL
          recentDeals.set(cacheKey, cachedDeal);

          console.log('✅ Deal actualizado desde cache con nueva etapa');
          return { 
            hubspotDealId: cachedDeal.dealId, 
            dealstage: currentStage,
            action: "updated_from_cache",
            dealName: cachedDeal.dealName,
            cacheHit: true,
            stageChanged: true,
            previousStage: cachedDeal.lastStage
          };
        } catch (updateError) {
          console.error('⚠️ Error actualizando deal desde cache:', updateError.message);
          // Si falla la actualización, continuar con búsqueda normal
        }
      } else {
        console.log('➡️ Deal en cache sin cambios - retornando info existente');
        return { 
          hubspotDealId: cachedDeal.dealId, 
          dealstage: currentStage,
          action: "found_in_cache",
          dealName: cachedDeal.dealName,
          cacheHit: true,
          stageChanged: false
        };
      }
    }
    // 🎯 ESTRATEGIA MÚLTIPLE DE BÚSQUEDA SÚPER ROBUSTA
    let existingDeal = null;
    const searchStrategies = []; // Para tracking de estrategias usadas

    // 1️⃣ BÚSQUEDA PRIMARIA: Por PSID + producto en nombre (más precisa)
    console.log('🔍 Estrategia 1: Búsqueda por PSID+producto');
    
    try {
      const searchByPsidProduct = await hubspot.crm.deals.searchApi.doSearch({
        filterGroups: [{ 
          filters: [
            { 
              propertyName: "dealname", 
              operator: "CONTAINS_TOKEN", 
              value: psid 
            },
            producto ? { 
              propertyName: "dealname", 
              operator: "CONTAINS_TOKEN", 
              value: producto 
            } : null
          ].filter(Boolean) // Remover filtros null
        }],
        properties: ["dealname", "dealstage", "amount", "closedate", "createdate"],
        limit: 10,
        sorts: [{ propertyName: "createdate", direction: "DESCENDING" }] // Más recientes primero
      });

      if (searchByPsidProduct?.body?.results?.length > 0) {
        console.log('📋 Estrategia 1 - Deals encontrados:', searchByPsidProduct.body.results.map(d => ({
          id: d.id,
          name: d.properties.dealname,
          stage: d.properties.dealstage,
          created: d.properties.createdate
        })));

        // Buscar coincidencia exacta con PSID y producto
        existingDeal = searchByPsidProduct.body.results.find(deal => {
          const dealName = deal.properties.dealname.toLowerCase();
          const psidMatch = dealName.includes(psid.toLowerCase());
          const productMatch = !producto || dealName.includes(producto.toLowerCase());
          
          console.log(`🔍 Evaluando deal "${deal.properties.dealname}":`, {
            psidMatch,
            productMatch,
            shouldMatch: psidMatch && productMatch
          });
          
          return psidMatch && productMatch;
        });

        if (existingDeal) {
          console.log('✅ Estrategia 1 exitosa - Deal encontrado:', existingDeal.id);
          searchStrategies.push('psid_product_exact');
        }
      }
    } catch (searchError) {
      console.error('⚠️ Error en estrategia 1:', searchError.message);
    }    // 2️⃣ BÚSQUEDA SECUNDARIA: Por formato exacto del deal name
    if (!existingDeal && producto) {
      console.log('🔍 Estrategia 2: Por formato exacto de nombre');
      
      try {
        const exactDealName = `${productoDealMap[producto] || producto} [${psid}]`;
        const searchByExactName = await hubspot.crm.deals.searchApi.doSearch({
          filterGroups: [{ 
            filters: [{ 
              propertyName: "dealname", 
              operator: "EQ", 
              value: exactDealName 
            }] 
          }],
          properties: ["dealname", "dealstage", "amount", "closedate", "createdate"],
          limit: 5
        });

        if (searchByExactName?.body?.results?.length > 0) {
          existingDeal = searchByExactName.body.results[0];
          console.log('✅ Estrategia 2 exitosa - Deal por nombre exacto:', existingDeal.id);
          searchStrategies.push('exact_name');
        }
      } catch (searchError) {
        console.error('⚠️ Error en estrategia 2:', searchError.message);
      }
    }

    // 3️⃣ BÚSQUEDA TERCIARIA: Por PSID únicamente (fallback más amplio)
    if (!existingDeal) {
      console.log('🔍 Estrategia 3: Por PSID únicamente (fallback)');
      
      try {
        const searchByPsidOnly = await hubspot.crm.deals.searchApi.doSearch({
          filterGroups: [{ 
            filters: [{ 
              propertyName: "dealname", 
              operator: "CONTAINS_TOKEN", 
              value: psid 
            }] 
          }],
          properties: ["dealname", "dealstage", "amount", "closedate", "createdate"],
          limit: 20,
          sorts: [{ propertyName: "hs_lastmodifieddate", direction: "DESCENDING" }]
        });

        if (searchByPsidOnly?.body?.results?.length > 0) {
          console.log('📋 Estrategia 3 - Deals con PSID encontrados:', 
            searchByPsidOnly.body.results.map(d => d.properties.dealname)
          );

          // Priorizar deals con producto similar si no hay coincidencia exacta
          existingDeal = searchByPsidOnly.body.results.find(deal => {
            const dealName = deal.properties.dealname.toLowerCase();
            return producto ? dealName.includes(producto.toLowerCase()) : true;
          }) || searchByPsidOnly.body.results[0]; // Tomar el más reciente si no hay producto

          if (existingDeal) {
            console.log('✅ Estrategia 3 exitosa - Deal por PSID fallback:', existingDeal.id);
            searchStrategies.push('psid_fallback');
          }
        }
      } catch (searchError) {
        console.error('⚠️ Error en estrategia 3:', searchError.message);
      }
    }    console.log('📊 Resultado búsqueda súper robusta:', {
      dealEncontrado: !!existingDeal,
      dealId: existingDeal?.id || null,
      dealName: existingDeal?.properties?.dealname || null,
      dealStage: existingDeal?.properties?.dealstage || null,
      strategiesUsed: searchStrategies,
      totalStrategies: 3,
      cacheChecked: true,
      timestamp: new Date().toISOString()
    });// 🎯 DECISIÓN INTELIGENTE: Actualizar vs Crear
    if (existingDeal) {
      console.log('🔄 ACTUALIZANDO deal existente:', existingDeal.id);
      
      const currentStage = existingDeal.properties.dealstage;
      const newStage = dealstage;
      
      // � Lógica inteligente de actualización de etapas
      const stageHierarchy = {
        "1561068258": 1, // Información solicitada
        "1561068259": 2, // Cita agendada  
        "1561068260": 3, // Propuesta enviada
        "1561068261": 4, // Listo para pagar
        "1561068262": 5, // Cerrado ganado
        "1561068263": 6, // Cerrado perdido
        "1561068264": 0  // Cancelado/Perdido
      };
      
      const currentLevel = stageHierarchy[currentStage] || 1;
      const newLevel = stageHierarchy[newStage] || 1;
      
      // Solo actualizar si la nueva etapa es igual o superior (progreso del cliente)
      const shouldUpdateStage = newLevel >= currentLevel;
      
      console.log('📊 Análisis de etapas:', {
        currentStage,
        newStage,
        currentLevel,
        newLevel,
        shouldUpdateStage
      });

      // 📝 Propiedades a actualizar
      const updateProperties = {
        hs_lastmodifieddate: new Date().toISOString()
      };

      // Solo actualizar etapa si es progreso
      if (shouldUpdateStage) {
        updateProperties.dealstage = newStage;
        console.log('⬆️ Actualizando etapa del deal:', currentStage, '→', newStage);
      } else {
        console.log('➡️ Manteniendo etapa actual (no retroceder):', currentStage);
      }

      // Actualizar monto si se detectó intención de pago
      if (intencion === 'realizar_pago' && existingDeal.properties.amount === '0') {
        updateProperties.amount = '1000'; // Monto estimado por defecto
        console.log('💰 Agregando monto estimado al deal');
      }

      await hubspot.crm.deals.basicApi.update(existingDeal.id, {
        properties: updateProperties
      });

      // 📊 Actualizar cache con nueva información
      const updatedCacheEntry = {
        dealId: existingDeal.id,
        dealName: existingDeal.properties.dealname,
        lastStage: shouldUpdateStage ? newStage : currentStage,
        timestamp: Date.now(),
        producto: producto,
        psid: psid
      };
      recentDeals.set(cacheKey, updatedCacheEntry);

      console.log('✅ Deal actualizado súper exitosamente');
      return { 
        hubspotDealId: existingDeal.id, 
        dealstage: shouldUpdateStage ? newStage : currentStage,
        action: "updated",
        dealName: existingDeal.properties.dealname,
        stageChanged: shouldUpdateStage,
        previousStage: currentStage,
        updateReason: isCancellation ? 'cancellation' : (isProgression ? 'progression' : 'no_change'),
        searchStrategies: searchStrategies,
        amountUpdated: !!updateProperties.amount
      };
    } else {      console.log('➕ CREANDO nuevo deal (no existe para este cliente+producto)');
      
      // ➕ Crear nuevo deal con identificador único
      const uniqueDealName = `${dealName} [${psid}]`; // Agregar PSID para unicidad
      
      const createProperties = {
        dealname: uniqueDealName,
        dealstage,
        pipeline: "default",
        amount: intencion === 'realizar_pago' ? "1000" : "0", // Monto inteligente
        closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
        // Agregar propiedades personalizadas si están disponibles
        hs_createdate: new Date().toISOString()
      };

      console.log('📝 Propiedades para crear deal único:', createProperties);

      const dealResponse = await hubspot.crm.deals.basicApi.create({
        properties: createProperties
      });      const dealId = dealResponse?.body?.id || dealResponse?.id;
      console.log('✅ Nuevo deal creado con ID:', dealId);      // 🎯 GUARDAR EN CACHE TEMPORAL AVANZADO
      const cacheEntry = {
        dealId,
        dealName: uniqueDealName,
        lastStage: dealstage,
        timestamp: Date.now(),
        producto: producto || 'general',
        psid: psid,
        created: true
      };
      recentDeals.set(cacheKey, cacheEntry);
      
      // 🧹 Limpiar cache inteligentemente (mantener solo últimas 100 entradas)
      if (recentDeals.size > 100) {
        const sortedEntries = Array.from(recentDeals.entries())
          .sort(([,a], [,b]) => b.timestamp - a.timestamp)
          .slice(0, 50); // Mantener solo las 50 más recientes
        
        recentDeals.clear();
        sortedEntries.forEach(([key, value]) => recentDeals.set(key, value));
        
        console.log('🧹 Cache limpiado - mantenidas últimas 50 entradas');
      }
      
      console.log('💾 Deal guardado en cache temporal súper optimizado:', {
        cacheKey,
        dealId,
        cacheSize: recentDeals.size
      });

      // 🔗 ASOCIACIÓN MEJORADA: Deal con contacto
      try {
        console.log('🔗 Asociando deal con contacto...');
        
        // Intentar múltiples métodos de asociación para máxima compatibilidad
        try {
          // Método v4 (más reciente)
          await hubspot.crm.associations.v4.basicApi.create(
            'deals',
            dealId,
            'contacts',
            hubspotContactId,
            [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
          );
          console.log('✅ Deal asociado con contacto (método v4)');
        } catch (v4Error) {
          console.log('⚠️ Método v4 falló, intentando método alternativo...');
          
          // Método alternativo (batch)
          await hubspot.crm.associations.batchApi.create('deals', 'contacts', {
            inputs: [{
              from: { id: dealId },
              to: { id: hubspotContactId },
              type: 'deal_to_contact'
            }]
          });
          console.log('✅ Deal asociado con contacto (método batch)');
        }
      } catch (assocError) {
        console.error('⚠️ Error en asociación final:', assocError.message);
        // No fallar completamente - el deal ya está creado
        console.log('ℹ️ Deal creado exitosamente, asociación pendiente');
      }

      return { 
        hubspotDealId: dealId, 
        dealstage,
        action: "created",
        dealName: uniqueDealName,
        isNewDeal: true
      };
    }  } catch (err) {
    console.error('❌ ERROR CRÍTICO SÚPER DETALLADO en Deal HubSpot:', {
      errorMessage: err.message,
      errorType: err.constructor.name,
      timestamp: new Date().toISOString(),
      context: {
        psid,
        producto,
        intencion,
        hubspotContactId,
        dealName: productoDealMap[producto] || `Consulta Estética - ${psid}`,
        dealstage: intencionStageMap[intencion] || "1561068258"
      }
    });
    
    console.error('📝 Stack trace completo:', err.stack);
    
    // 🔍 Análisis súper detallado del error HTTP
    if (err.response) {
      console.error('🌐 Detalles HTTP súper completos:', {
        status: err.response.status,
        statusText: err.response.statusText,
        headers: err.response.headers,
        data: err.response.data,
        url: err.response.config?.url,
        method: err.response.config?.method
      });
      
      // 🎯 Análisis específico por tipo de error
      if (err.response.status === 401) {
        console.error('🔐 ERROR DE AUTENTICACIÓN: Token de HubSpot inválido o expirado');
      } else if (err.response.status === 403) {
        console.error('🚫 ERROR DE PERMISOS: Token no tiene permisos para deals');
      } else if (err.response.status === 429) {
        console.error('⏰ ERROR DE RATE LIMIT: Demasiadas peticiones a HubSpot');
      } else if (err.response.status >= 500) {
        console.error('🔥 ERROR DEL SERVIDOR HUBSPOT: Problema interno de HubSpot');
      }
    }
    
    // 🧠 Análisis del código de error para mejor debugging
    const errorAnalysis = {
      isNetworkError: !err.response && (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED'),
      isAuthError: err.response?.status === 401,
      isPermissionError: err.response?.status === 403,
      isRateLimitError: err.response?.status === 429,
      isServerError: err.response?.status >= 500,
      isClientError: err.response?.status >= 400 && err.response?.status < 500,
      hasValidToken: !!process.env.HUBSPOT_TOKEN && process.env.HUBSPOT_TOKEN !== 'your_hubspot_token_here'
    };
    
    console.error('🧠 Análisis inteligente del error:', errorAnalysis);
    
    return {
      hubspotDealId: null,
      dealstage: "error",
      error: err.message,
      action: "failed",
      errorDetails: {
        type: err.constructor.name,
        httpStatus: err.response?.status,
        httpStatusText: err.response?.statusText,
        timestamp: new Date().toISOString(),
        context: { psid, producto, intencion, hubspotContactId },
        analysis: errorAnalysis,
        debugging: {
          hasToken: !!process.env.HUBSPOT_TOKEN,
          tokenLength: process.env.HUBSPOT_TOKEN?.length || 0,
          tokenPreview: process.env.HUBSPOT_TOKEN ? `${process.env.HUBSPOT_TOKEN.substring(0, 8)}...` : 'No token'
        }
      }
    };
  }
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
      });      // 💼 LÓGICA INTELIGENTE: Crear/actualizar deal
      if (hubspotResult.hubspotContactId && producto) {
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
          telefono
        });
        
        // 📊 Log del resultado para monitoreo
        console.log('📊 Resultado del procesamiento de deal:', {
          dealId: dealResult.hubspotDealId,
          action: dealResult.action,
          stageChanged: dealResult.stageChanged || false,
          isNewDeal: dealResult.isNewDeal || false
        });
        
      } else if (!producto) {
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

// Exportar la función webhook para testing
export { handler as webhook };
