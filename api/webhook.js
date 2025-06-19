// Configuración de patrones y diccionarios para detección de intenciones

// Configuración médica específica integrada
const CONFIGURACION_MEDICA = {
  sintomas_urgentes: [
    'dolor intenso', 'sangrado', 'infección', 'fiebre', 'hinchazón excesiva',
    'enrojecimiento', 'pus', 'mareos', 'náuseas', 'dificultad para respirar',
    'reacción alérgica', 'entumecimiento', 'pérdida de sensibilidad'
  ],
  preguntas_frecuentes: {
    preoperatorio: [
      'preparación', 'que no comer', 'medicamentos', 'estudios', 'análisis',
      'ayuno', 'restricciones', 'antes de la cirugía'
    ],
    postoperatorio: [
      'recuperación', 'cuidados', 'después de', 'cuanto tiempo', 'reposo',
      'ejercicio', 'cuando puedo', 'cicatrización', 'resultados'
    ],
    financiamiento: [
      'mensualidades', 'crédito', 'financiamiento', 'pagos', 'planes',
      'sin intereses', 'tarjeta de crédito', 'promociones'
    ]
  },
  experiencia_previa: [
    'ya me hice', 'segunda vez', 'retoque', 'otra clínica', 'antes',
    'primera vez', 'nunca me he hecho', 'sin experiencia', 'nuevo en esto'
  ]
};

// Función para evaluar urgencia médica
function evaluarUrgencia(mensaje) {
  const textoNormalizado = mensaje.toLowerCase();
  let puntuacionUrgencia = 0;
  const indicadores = [];
  
  for (const sintoma of CONFIGURACION_MEDICA.sintomas_urgentes) {
    if (textoNormalizado.includes(sintoma)) {
      puntuacionUrgencia += 3;
      indicadores.push(sintoma);
    }
  }
  
  const urgenciasTempo = ['urgente', 'ya', 'ahora', 'inmediato', 'hoy mismo'];
  for (const urgencia of urgenciasTempo) {
    if (textoNormalizado.includes(urgencia)) {
      puntuacionUrgencia += 2;
      indicadores.push(urgencia);
    }
  }
  
  return {
    nivel: puntuacionUrgencia >= 5 ? 'alta' : puntuacionUrgencia >= 3 ? 'media' : 'baja',
    puntuacion: puntuacionUrgencia,
    indicadores: indicadores
  };
}

// Función para categorizar tipo de consulta
function categorizarConsulta(mensaje, serviciosDetectados) {
  const textoNormalizado = mensaje.toLowerCase();
  
  for (const keyword of CONFIGURACION_MEDICA.preguntas_frecuentes.preoperatorio) {
    if (textoNormalizado.includes(keyword)) {
      return 'preoperatorio';
    }
  }
  
  for (const keyword of CONFIGURACION_MEDICA.preguntas_frecuentes.postoperatorio) {
    if (textoNormalizado.includes(keyword)) {
      return 'postoperatorio';
    }
  }
  
  for (const keyword of CONFIGURACION_MEDICA.preguntas_frecuentes.financiamiento) {
    if (textoNormalizado.includes(keyword)) {
      return 'financiamiento';
    }
  }
  
  if (serviciosDetectados && serviciosDetectados.length > 0) {
    return 'procedimiento';
  }
  
  return 'general';
}

// Función para detectar experiencia previa
function detectarExperiencia(mensaje) {
  const textoNormalizado = mensaje.toLowerCase();
  
  for (const exp of CONFIGURACION_MEDICA.experiencia_previa) {
    if (textoNormalizado.includes(exp)) {
      if (['primera vez', 'nunca me he hecho', 'sin experiencia', 'nuevo en esto'].includes(exp)) {
        return 'primera_vez';
      } else {
        return 'con_experiencia';
      }
    }
  }
  
  return 'no_especificado';
}

const PATRONES = {
  telefono: [
    /\b(?:\+?52\s?)?(?:\d{2}[\s\-]?)?\d{4}[\s\-]?\d{4}\b/g, // Mexicanos
    /\b(?:\+?1\s?)?\(?[2-9]\d{2}\)?\s?[\s\-]?\d{3}[\s\-]?\d{4}\b/g, // EE.UU.
    /\b\d{3}[\s\-]?\d{3}[\s\-]?\d{4}\b/g, // Formato general
    /\b\d{10,15}\b/g // Números largos
  ],
  fecha: {
    relativas: /\b(hoy|mañana|pasado mañana|el lunes|el martes|el miércoles|el jueves|el viernes|el sábado|el domingo|la próxima semana|este fin de semana)\b/gi,
    absolutas: /\b(\d{1,2})\s?(?:de|\/|\-)\s?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|\d{1,2})\s?(?:de|\/|\-)?\s?(\d{2,4})?\b/gi,
    simples: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g
  },
  hora: /\b(\d{1,2})(?::(\d{2}))?\s?(am|pm|a\.m\.|p\.m\.|de la mañana|de la tarde|de la noche|hrs?|horas?)?\b/gi,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  nombre: /(?:me llamo|mi nombre es|soy|mi nombre|llamarme)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/gi
};

const DICCIONARIOS = {
  intenciones: {
    agendar_cita: [
      'cita', 'agendar', 'apartar', 'reservar', 'programar', 'separar cita',
      'quiero una cita', 'necesito cita', 'agenda', 'appointment', 'consulta',
      'quiero agendar', 'puedo agendar', 'disponibilidad', 'horarios disponibles'
    ],
    pedir_informacion: [
      'precio', 'costo', 'cuánto', 'información', 'detalles', 'consultar',
      'me interesa', 'quisiera saber', 'podrían decirme', 'me gustaría conocer',
      'info', 'datos', 'presupuesto', 'cotización', 'cotizar', 'tarifas'
    ],
    realizar_pago: [
      'pagar', 'pago', 'depósito', 'apartar con', 'transferencia', 'tarjeta',
      'efectivo', 'abono', 'anticipo', 'enganche', 'seña', 'mensualidades'
    ],
    cancelar: [
      'cancelar', 'anular', 'no puedo ir', 'cambiar fecha', 'reprogramar',
      'postponer', 'mover cita', 'reagendar'
    ],
    emergencia: [
      'urgente', 'emergencia', 'dolor', 'problema', 'complicación',
      'ayuda', 'lo antes posible', 'ya', 'inmediato'
    ],
    satisfaccion: [
      'gracias', 'perfecto', 'excelente', 'muy bien', 'de acuerdo',
      'ok', 'está bien', 'conforme', 'satisfecho', 'contento'
    ],
    ubicacion: [
      'dirección', 'dónde están', 'ubicación', 'cómo llegar', 'domicilio',
      'donde se encuentran', 'address', 'maps', 'mapa'
    ]
  },
  servicios: {
    cirugia_estetica: [
      'aumento mamario', 'aumento de busto', 'implantes', 'senos',
      'rinoplastia', 'nariz', 'liposucción', 'lipo', 'abdominoplastia',
      'cirugía', 'operación', 'brazilian butt lift', 'bbl'
    ],
    tratamientos_faciales: [
      'botox', 'bótox', 'toxina botulínica', 'rellenos', 'ácido hialurónico',
      'rejuvenecimiento', 'arrugas', 'facial', 'peeling', 'microdermoabrasión'
    ],
    laser: [
      'láser', 'laser', 'depilación láser', 'depilación', 'fotodepilación',
      'ipl', 'eliminación de vello', 'vello'
    ],
    medicina_estetica: [
      'suero', 'vitaminas', 'emerald', 'mesoterapia', 'plasma rico',
      'prp', 'hidratación', 'nutrición facial'
    ]
  }
};

// Función para normalizar texto
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s]/g, ' ') // Remover puntuación
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
}

// Función para extraer teléfonos con mejor precisión
function extraerTelefono(texto) {
  const telefonos = [];
  
  for (const patron of PATRONES.telefono) {
    const matches = texto.matchAll(patron);
    for (const match of matches) {
      let telefono = match[0].replace(/[\s\-\(\)]/g, '');
      
      // Validar que sea un número válido
      if (telefono.length >= 10 && telefono.length <= 15) {
        // Limpiar códigos de país comunes
        if (telefono.startsWith('+52')) telefono = telefono.substring(3);
        if (telefono.startsWith('52') && telefono.length > 10) telefono = telefono.substring(2);
        if (telefono.startsWith('+1')) telefono = telefono.substring(2);
        
        telefonos.push(telefono);
      }
    }
  }
  
  return telefonos.length > 0 ? telefonos[0] : '';
}

// Función para extraer fechas mejorada
function extraerFecha(texto) {
  const fechas = [];
  
  // Fechas relativas
  const relativasMatch = texto.match(PATRONES.fecha.relativas);
  if (relativasMatch) {
    fechas.push(...relativasMatch);
  }
  
  // Fechas absolutas
  const absolutasMatch = texto.matchAll(PATRONES.fecha.absolutas);
  for (const match of absolutasMatch) {
    fechas.push(match[0]);
  }
  
  // Fechas simples (dd/mm/yyyy)
  const simplesMatch = texto.matchAll(PATRONES.fecha.simples);
  for (const match of simplesMatch) {
    fechas.push(match[0]);
  }
  
  return fechas.length > 0 ? fechas[0] : '';
}

// Función para extraer hora mejorada
function extraerHora(texto) {
  const matches = texto.matchAll(PATRONES.hora);
  const horas = [];
  
  for (const match of matches) {
    horas.push(match[0]);
  }
  
  return horas.length > 0 ? horas[0] : '';
}

// Función para extraer email
function extraerEmail(texto) {
  const matches = texto.match(PATRONES.email);
  return matches ? matches[0] : '';
}

// Función para extraer nombre
function extraerNombre(texto) {
  const matches = texto.matchAll(PATRONES.nombre);
  for (const match of matches) {
    return match[1].trim();
  }
  return '';
}

// Función para detectar intención con puntuación
function detectarIntencion(texto) {
  const textoNormalizado = normalizarTexto(texto);
  const intenciones = {};
  
  // Calcular puntuación para cada intención
  for (const [intencion, palabrasClave] of Object.entries(DICCIONARIOS.intenciones)) {
    let puntuacion = 0;
    
    for (const palabra of palabrasClave) {
      const palabraNormalizada = normalizarTexto(palabra);
      
      // Coincidencia exacta (mayor peso)
      if (textoNormalizado.includes(palabraNormalizada)) {
        puntuacion += palabraNormalizada.split(' ').length * 2;
      }
      
      // Coincidencia parcial de palabras
      const palabrasTexto = textoNormalizado.split(' ');
      const palabrasClave = palabraNormalizada.split(' ');
      
      for (const palabraClave of palabrasClave) {
        if (palabrasTexto.some(p => p.includes(palabraClave) || palabraClave.includes(p))) {
          puntuacion += 0.5;
        }
      }
    }
    
    if (puntuacion > 0) {
      intenciones[intencion] = puntuacion;
    }
  }
  
  // Retornar la intención con mayor puntuación
  const mejorIntencion = Object.entries(intenciones)
    .sort(([,a], [,b]) => b - a)[0];
  
  return mejorIntencion ? {
    intencion: mejorIntencion[0],
    confianza: mejorIntencion[1],
    todas: intenciones
  } : { intencion: 'desconocida', confianza: 0, todas: {} };
}

// Función para detectar servicios
function detectarServicios(texto) {
  const textoNormalizado = normalizarTexto(texto);
  const serviciosDetectados = [];
  
  for (const [categoria, servicios] of Object.entries(DICCIONARIOS.servicios)) {
    for (const servicio of servicios) {
      const servicioNormalizado = normalizarTexto(servicio);
      if (textoNormalizado.includes(servicioNormalizado)) {
        serviciosDetectados.push({
          servicio: servicio,
          categoria: categoria
        });
      }
    }
  }
  
  return serviciosDetectados;
}

// Función principal del webhook
export default function handler(req, res) {
  try {
    // Validar método HTTP
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Método no permitido',
        permitidos: ['POST']
      });
    }

    // Validar que existe el mensaje
    const mensaje = req.body?.mensaje || req.body?.text || '';
    
    if (!mensaje || typeof mensaje !== 'string') {
      return res.status(400).json({ 
        error: 'Mensaje requerido',
        formato: 'El campo "mensaje" debe ser una cadena de texto'
      });
    }    // Extraer toda la información del mensaje
    const telefono = extraerTelefono(mensaje);
    const fecha = extraerFecha(mensaje);
    const hora = extraerHora(mensaje);
    const email = extraerEmail(mensaje);
    const nombre = extraerNombre(mensaje);
    
    const resultadoIntencion = detectarIntencion(mensaje);
    const servicios = detectarServicios(mensaje);
    
    // Análisis médico específico
    const urgencia = evaluarUrgencia(mensaje);
    const tipoConsulta = categorizarConsulta(mensaje, servicios);
    const experiencia = detectarExperiencia(mensaje);
    
    // Preparar respuesta estructurada
    const respuesta = {
      // Información extraída
      datos_extraidos: {
        telefono: telefono || null,
        email: email || null,
        nombre: nombre || null,
        fecha: fecha || null,
        hora: hora || null
      },
      
      // Análisis de intención
      intencion: {
        principal: resultadoIntencion.intencion,
        confianza: Math.round(resultadoIntencion.confianza * 100) / 100,
        alternativas: Object.entries(resultadoIntencion.todas)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([int, conf]) => ({
            intencion: int,
            confianza: Math.round(conf * 100) / 100
          }))
      },
      
      // Servicios detectados
      servicios: servicios.length > 0 ? servicios : null,
      
      // Análisis médico específico
      analisis_medico: {
        urgencia: urgencia,
        tipo_consulta: tipoConsulta,
        experiencia_previa: experiencia,
        requiere_atencion_inmediata: urgencia.nivel === 'alta'
      },
      
      // Metadatos
      metadata: {
        mensaje_original: mensaje,
        longitud_mensaje: mensaje.length,
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    };

    return res.status(200).json(respuesta);
    
  } catch (error) {
    console.error('Error en webhook:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'Error al procesar el mensaje',
      timestamp: new Date().toISOString()
    });
  }
}
