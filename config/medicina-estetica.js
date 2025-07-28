// =====================================================
// 🔧 CONFIGURACIÓN OPTIMIZADA PARA MEDICINA ESTÉTICA
// =====================================================

export const medicineConfig = {
  // Configuración de HubSpot
  hubspot: {
    // Propiedades personalizadas
    customProperties: {
      contact: {
        manychat_psid: 'manychat_psid',
        lead_source: 'hs_lead_status',
        treatment_interest: 'treatment_interest',
        consultation_date: 'consultation_date',
        budget_range: 'budget_range',
        urgency_level: 'urgency_level'
      },
      deal: {
        manychat_psid: 'manychat_psid',
        treatment_type: 'treatment_type',
        consultation_scheduled: 'consultation_scheduled',
        follow_up_date: 'follow_up_date',
        lead_quality_score: 'lead_quality_score'
      }
    },

    // Pipelines y stages
    pipelines: {
      default: 'default',
      aesthetic_medicine: 'aesthetic_medicine'
    },

    stages: {
      // Stages para medicina estética
      new_inquiry: 'new_inquiry',
      consultation_scheduled: 'appointmentscheduled',
      consultation_completed: 'consultation_completed',
      treatment_proposed: 'presentationscheduled',
      contract_sent: 'decisionmakerboughtin',
      closed_won: 'closedwon',
      closed_lost: 'closedlost',
      follow_up_needed: 'follow_up_needed'
    },

    // Mapeo de intenciones a stages
    intentToStage: {
      'agendar_cita': 'appointmentscheduled',
      'pedir_informacion': 'new_inquiry',
      'realizar_pago': 'decisionmakerboughtin',
      'cancelar': 'closedlost',
      'emergencia': 'new_inquiry'
    },

    // Mapeo de intenciones a lead status
    intentToLeadStatus: {
      'agendar_cita': 'new',
      'pedir_informacion': 'open',
      'realizar_pago': 'in_progress',
      'cancelar': 'unqualified',
      'emergencia': 'new'
    }
  },

  // Configuración de parsing mejorada para medicina estética
  parsing: {
    // Palabras clave de intención con pesos específicos
    intentKeywords: {
      agendar_cita: {
        keywords: [
          // Español
          'cita', 'agendar', 'reservar', 'programar', 'apartar', 'separar',
          'consulta', 'consultoria', 'evaluacion', 'valoracion',
          'cuando puedo', 'que dia', 'horario', 'disponibilidad',
          'appointment', 'schedule', 'book', 'reserve',
          // Variaciones coloquiales
          'quiero una cita', 'necesito cita', 'agendar consulta',
          'cuando me pueden atender', 'que horarios tienen'
        ],
        weight: 4,
        confidence_boost: 0.2
      },

      pedir_informacion: {
        keywords: [
          // Información general
          'info', 'información', 'informacion', 'detalles', 'details',
          'precio', 'costo', 'cuanto', 'cost', 'price', 'presupuesto',
          'que incluye', 'como es', 'en que consiste',
          // Preguntas específicas
          'tell me', 'explain', 'explica', 'platícame', 'cuentame',
          'me interesa', 'quiero saber', 'quisiera información'
        ],
        weight: 2,
        confidence_boost: 0.1
      },

      realizar_pago: {
        keywords: [
          'pago', 'pagar', 'payment', 'pay', 'cobrar',
          'tarjeta', 'transferencia', 'efectivo', 'cash',
          'financiamiento', 'mensualidades', 'plazos',
          'cuanto debo', 'saldo', 'balance',
          'quiero pagar', 'como pago', 'metodos de pago'
        ],
        weight: 5,
        confidence_boost: 0.3
      },

      cancelar: {
        keywords: [
          'cancelar', 'cancel', 'anular', 'suspender',
          'no puedo', 'no voy', 'cambiar fecha',
          'posponer', 'postpone', 'reagendar',
          'ya no quiero', 'me arrepenti'
        ],
        weight: 6,
        confidence_boost: 0.4
      },

      emergencia: {
        keywords: [
          'emergencia', 'urgente', 'emergency', 'urgent',
          'ayuda', 'help', 'problema', 'complicacion',
          'dolor', 'inflamacion', 'reaccion',
          'algo malo', 'se ve mal', 'preocupada'
        ],
        weight: 8,
        confidence_boost: 0.5
      }
    },

    // Diccionario expandido de tratamientos
    treatments: {
      // Tratamientos faciales no invasivos
      botox: {
        variations: [
          'botox', 'bótox', 'toxina botulinica', 'toxina botulínica',
          'botulinum', 'arrugas', 'lineas de expresion',
          'patas de gallo', 'entrecejo', 'frente'
        ],
        category: 'facial_non_invasive',
        priority: 'high',
        typical_price_range: '$3000-8000'
      },

      rellenos: {
        variations: [
          'relleno', 'rellenos', 'ácido hialurónico', 'acido hialuronico',
          'filler', 'fillers', 'volumen', 'labios',
          'pómulos', 'pomulos', 'ojeras', 'surcos'
        ],
        category: 'facial_non_invasive',
        priority: 'high',
        typical_price_range: '$4000-12000'
      },

      // Cirugías faciales
      rinoplastia: {
        variations: [
          'rinoplastia', 'nariz', 'nose job', 'cirugía nariz',
          'cirugia nariz', 'operacion nariz', 'cambiar nariz',
          'arreglar nariz', 'nariz perfecta'
        ],
        category: 'facial_surgery',
        priority: 'medium',
        typical_price_range: '$80000-150000'
      },

      lifting: {
        variations: [
          'lifting', 'estiramiento facial', 'facelift',
          'rejuvenecimiento', 'cara nueva', 'lifting facial',
          'cirugia facial', 'estiramiento'
        ],
        category: 'facial_surgery',
        priority: 'medium',
        typical_price_range: '$120000-250000'
      },

      // Cirugías corporales
      liposuccion: {
        variations: [
          'liposucción', 'liposuccion', 'lipo', 'lipoescultura',
          'grasa', 'abdomen', 'cintura', 'muslos',
          'brazos', 'papada', 'eliminar grasa'
        ],
        category: 'body_surgery',
        priority: 'high',
        typical_price_range: '$60000-120000'
      },

      aumento_senos: {
        variations: [
          'aumento senos', 'implantes', 'mamoplastia',
          'breast augmentation', 'senos', 'busto',
          'implantes mamarios', 'aumento busto',
          'senos más grandes', 'operacion senos'
        ],
        category: 'body_surgery',
        priority: 'high',
        typical_price_range: '$80000-150000'
      },

      abdominoplastia: {
        variations: [
          'abdominoplastia', 'tummy tuck', 'cirugía abdomen',
          'cirugia abdomen', 'abdomen plano',
          'eliminar piel', 'estiramiento abdomen'
        ],
        category: 'body_surgery',
        priority: 'medium',
        typical_price_range: '$90000-160000'
      },

      // Tratamientos corporales no invasivos
      depilacion_laser: {
        variations: [
          'depilación láser', 'depilacion laser',
          'laser hair removal', 'quitar vello',
          'eliminar vello', 'depilacion definitiva',
          'laser diodo', 'alexandrita'
        ],
        category: 'body_non_invasive',
        priority: 'high',
        typical_price_range: '$2000-15000'
      },

      tratamiento_facial: {
        variations: [
          'facial', 'limpieza facial', 'peeling',
          'microdermoabrasión', 'microdermoabrasion',
          'hidrafacial', 'radiofrecuencia',
          'ultrasonido', 'rejuvenecimiento'
        ],
        category: 'facial_non_invasive',
        priority: 'medium',
        typical_price_range: '$800-3000'
      },

      // Tratamientos especializados
      coolsculpting: {
        variations: [
          'coolsculpting', 'criolipolisis', 'congelar grasa',
          'eliminar grasa sin cirugia', 'reducir grasa'
        ],
        category: 'body_non_invasive',
        priority: 'medium',
        typical_price_range: '$15000-40000'
      },

      hifu: {
        variations: [
          'hifu', 'ultrasonido focalizado', 'lifting sin cirugia',
          'tensar piel', 'reafirmar', 'ultherapy'
        ],
        category: 'facial_non_invasive',
        priority: 'medium',
        typical_price_range: '$20000-50000'
      }
    },

    // Patrones de fecha mejorados para español mexicano
    datePatterns: [
      // Fechas relativas
      { pattern: /\b(hoy|today|ahorita)\b/i, transform: () => 'hoy' },
      { pattern: /\b(mañana|tomorrow|mañ)\b/i, transform: () => 'mañana' },
      { pattern: /\b(pasado\s?mañana|day after tomorrow)\b/i, transform: () => 'pasado mañana' },
      
      // Días de la semana
      { pattern: /\b(lunes|monday|lun)\b/i, transform: () => 'lunes' },
      { pattern: /\b(martes|tuesday|mar)\b/i, transform: () => 'martes' },
      { pattern: /\b(miércoles|miercoles|wednesday|mie|mier)\b/i, transform: () => 'miércoles' },
      { pattern: /\b(jueves|thursday|jue)\b/i, transform: () => 'jueves' },
      { pattern: /\b(viernes|friday|vie)\b/i, transform: () => 'viernes' },
      { pattern: /\b(sábado|sabado|saturday|sab)\b/i, transform: () => 'sábado' },
      { pattern: /\b(domingo|sunday|dom)\b/i, transform: () => 'domingo' },
      
      // Fechas con meses en español
      { pattern: /\b(\d{1,2})\s?(?:de|del)?\s?(enero|ene)\b/i, transform: (match) => `${match[1]} de enero` },
      { pattern: /\b(\d{1,2})\s?(?:de|del)?\s?(febrero|feb)\b/i, transform: (match) => `${match[1]} de febrero` },
      { pattern: /\b(\d{1,2})\s?(?:de|del)?\s?(marzo|mar)\b/i, transform: (match) => `${match[1]} de marzo` },
      { pattern: /\b(\d{1,2})\s?(?:de|del)?\s?(abril|abr)\b/i, transform: (match) => `${match[1]} de abril` },
      { pattern: /\b(\d{1,2})\s?(?:de|del)?\s?(mayo|may)\b/i, transform: (match) => `${match[1]} de mayo` },
      { pattern: /\b(\d{1,2})\s?(?:de|del)?\s?(junio|jun)\b/i, transform: (match) => `${match[1]} de junio` },
      { pattern: /\b(\d{1,2})\s?(?:de|del)?\s?(julio|jul)\b/i, transform: (match) => `${match[1]} de julio` },
      { pattern: /\b(\d{1,2})\s?(?:de|del)?\s?(agosto|ago)\b/i, transform: (match) => `${match[1]} de agosto` },
      { pattern: /\b(\d{1,2})\s?(?:de|del)?\s?(septiembre|sep)\b/i, transform: (match) => `${match[1]} de septiembre` },
      { pattern: /\b(\d{1,2})\s?(?:de|del)?\s?(octubre|oct)\b/i, transform: (match) => `${match[1]} de octubre` },
      { pattern: /\b(\d{1,2})\s?(?:de|del)?\s?(noviembre|nov)\b/i, transform: (match) => `${match[1]} de noviembre` },
      { pattern: /\b(\d{1,2})\s?(?:de|del)?\s?(diciembre|dic)\b/i, transform: (match) => `${match[1]} de diciembre` },
      
      // Formatos numéricos
      { pattern: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/, transform: (match) => match[0] },
      { pattern: /\b(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?\b/, transform: (match) => match[0] }
    ],

    // Patrones de hora mejorados
    timePatterns: [
      // Formato 12 horas con AM/PM
      /\b(\d{1,2}):(\d{2})\s?(am|pm|a\.m\.|p\.m\.)\b/gi,
      /\b(\d{1,2})\s?(am|pm|a\.m\.|p\.m\.)\b/gi,
      
      // Formato 24 horas
      /\b(\d{1,2}):(\d{2})\s?(?:hrs?|horas?)?\b/g,
      /\b(\d{1,2})\s?(?:hrs?|horas?|h)\b/gi,
      
      // Formatos coloquiales
      /\b(mediodía|mediodia|noon)\b/gi,
      /\b(medianoche|midnight)\b/gi,
      /\b(madrugada|dawn)\b/gi,
      /\b(mañana|morning)\b/gi,
      /\b(tarde|afternoon)\b/gi,
      /\b(noche|evening|night)\b/gi
    ],

    // Patrones de teléfono específicos para México
    phonePatterns: [
      // Formato completo con código de país
      /\b(?:\+?52\s?)?(?:1\s?)?(\d{3})[\s\-\(\)]?(\d{3})[\s\-\(\)]?(\d{4})\b/g,
      
      // Formato celular México (10 dígitos)
      /\b(?:\+?52\s?)?(\d{2})[\s\-]?(\d{4})[\s\-]?(\d{4})\b/g,
      
      // Formato US/Internacional
      /\b(\d{3})[\s\-\(\)]?(\d{3})[\s\-\(\)]?(\d{4})\b/g,
      
      // Números largos genéricos
      /\b(\d{10,15})\b/g,
      
      // Números con separadores
      /\b(\d{2,4})[\s\-\.](\d{3,4})[\s\-\.](\d{3,4})\b/g
    ]
  },

  // Configuración de calidad de leads
  leadScoring: {
    // Factores que aumentan el score
    positiveFactors: {
      hasPhone: 20,
      hasSpecificTreatment: 15,
      hasDate: 10,
      hasTime: 5,
      isUrgent: 25,
      mentionsPrice: 10,
      mentionsAppointment: 20
    },

    // Factores que disminuyen el score
    negativeFactor: {
      isCancellation: -50,
      isVague: -10,
      noContactInfo: -15
    },

    // Rangos de calidad
    qualityRanges: {
      high: { min: 50, label: 'Alta Calidad' },
      medium: { min: 25, label: 'Calidad Media' },
      low: { min: 0, label: 'Baja Calidad' }
    }
  },

  // Configuración de respuestas automáticas
  autoResponses: {
    // Respuestas basadas en intención
    byIntent: {
      agendar_cita: {
        message: "¡Perfecto! Te ayudo a agendar tu cita. Nuestros horarios disponibles son de lunes a viernes de 9:00 AM a 6:00 PM.",
        followUp: "¿Qué día y hora te conviene más?"
      },
      pedir_informacion: {
        message: "Con gusto te proporciono toda la información que necesites sobre nuestros tratamientos.",
        followUp: "¿Hay algún tratamiento específico que te interese?"
      },
      realizar_pago: {
        message: "Te ayudo con el proceso de pago. Aceptamos efectivo, tarjetas y planes de financiamiento.",
        followUp: "¿Cuál método de pago prefieres?"
      },
      emergencia: {
        message: "Entiendo que es urgente. Te voy a conectar inmediatamente con nuestro equipo médico.",
        followUp: "Por favor describe brevemente qué está pasando."
      }
    },

    // Respuestas basadas en tratamiento
    byTreatment: {
      botox: {
        info: "El Botox es ideal para reducir arrugas de expresión. Resultados visibles en 3-7 días, duración 4-6 meses.",
        price: "El costo varía según las unidades necesarias, desde $3,000 pesos."
      },
      rellenos: {
        info: "Los rellenos de ácido hialurónico dan volumen y definen facciones. Resultados inmediatos.",
        price: "El costo depende de la zona y cantidad, desde $4,000 pesos."
      }
    }
  },

  // Configuración de seguimiento
  followUp: {
    // Intervalos de seguimiento por tipo de lead
    intervals: {
      hot_lead: 1, // 1 hora
      warm_lead: 24, // 24 horas  
      cold_lead: 72, // 72 horas
      consultation_scheduled: 24, // 24 horas antes
      post_consultation: 48 // 48 horas después
    },

    // Mensajes de seguimiento
    messages: {
      appointment_reminder: "Recordatorio: Tienes tu consulta mañana a las {time}. ¿Necesitas cambiar algo?",
      follow_up_consultation: "¿Cómo te fue en tu consulta? ¿Tienes alguna pregunta sobre el tratamiento propuesto?",
      payment_reminder: "Hola, ¿ya decidiste sobre el tratamiento que vimos? Estoy aquí para ayudarte."
    }
  }
};

// Funciones auxiliares para la configuración
export function getTreatmentByVariation(text) {
  const normalizedText = text.toLowerCase().trim();
  
  for (const [treatmentKey, treatment] of Object.entries(medicineConfig.parsing.treatments)) {
    for (const variation of treatment.variations) {
      if (normalizedText.includes(variation.toLowerCase())) {
        return {
          key: treatmentKey,
          ...treatment
        };
      }
    }
  }
  
  return null;
}

export function calculateLeadScore(extractedData) {
  let score = 0;
  const factors = medicineConfig.leadScoring.positiveFactors;
  
  if (extractedData.telefono) score += factors.hasPhone;
  if (extractedData.producto) score += factors.hasSpecificTreatment;
  if (extractedData.fecha) score += factors.hasDate;
  if (extractedData.hora) score += factors.hasTime;
  if (extractedData.intencion === 'emergencia') score += factors.isUrgent;
  if (extractedData.intencion === 'agendar_cita') score += factors.mentionsAppointment;
  
  // Factores negativos
  if (extractedData.intencion === 'cancelar') {
    score += medicineConfig.leadScoring.negativeFactor.isCancellation;
  }
  
  return Math.max(0, score); // No permitir scores negativos
}

export function getLeadQuality(score) {
  const ranges = medicineConfig.leadScoring.qualityRanges;
  
  if (score >= ranges.high.min) return 'high';
  if (score >= ranges.medium.min) return 'medium';
  return 'low';
}