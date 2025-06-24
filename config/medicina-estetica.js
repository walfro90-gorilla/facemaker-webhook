// Configuración extendida para el sector médico estético
// Este archivo contiene patrones específicos para clínicas de estética

const CONFIGURACION_MEDICA = {
  // Síntomas y complicaciones que requieren atención inmediata
  sintomas_urgentes: [
    'dolor intenso', 'sangrado', 'infección', 'fiebre', 'hinchazón excesiva',
    'enrojecimiento', 'pus', 'mareos', 'náuseas', 'dificultad para respirar',
    'reacción alérgica', 'entumecimiento', 'pérdida de sensibilidad'
  ],
  
  // Preguntas frecuentes categorizadas
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
  
  // Procedimientos por área corporal
  areas_corporales: {
    rostro: ['botox', 'rellenos', 'rinoplastia', 'lifting facial', 'bichectomía'],
    busto: ['aumento mamario', 'reducción mamaria', 'levantamiento de senos'],
    cuerpo: ['liposucción', 'abdominoplastia', 'bbl', 'coolsculpting'],
    intimas: ['labioplastia', 'vaginoplastia', 'blanqueamiento íntimo']
  },
  
  // Rangos de edad típicos para orientar recomendaciones
  rangos_edad: {
    joven: ['18-25', 'universidad', 'estudiante', 'primera vez'],
    adulto: ['26-40', 'trabajo', 'profesional', 'familia'],
    maduro: ['41-60', 'menopausia', 'cambios corporales', 'rejuvenecimiento']
  },
  
  // Patrones para detectar experiencia previa
  experiencia_previa: [
    'ya me hice', 'segunda vez', 'retoque', 'otra clínica', 'antes',
    'primera vez', 'nunca me he hecho', 'sin experiencia', 'nuevo en esto'
  ]
};

// Función para detectar urgencia médica
function evaluarUrgencia(mensaje) {
  const textoNormalizado = mensaje.toLowerCase();
  let puntuacionUrgencia = 0;
  const indicadores = [];
  
  // Verificar síntomas urgentes
  for (const sintoma of CONFIGURACION_MEDICA.sintomas_urgentes) {
    if (textoNormalizado.includes(sintoma)) {
      puntuacionUrgencia += 3;
      indicadores.push(sintoma);
    }
  }
  
  // Palabras que indican urgencia temporal
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
  
  // Verificar si es preoperatorio
  for (const keyword of CONFIGURACION_MEDICA.preguntas_frecuentes.preoperatorio) {
    if (textoNormalizado.includes(keyword)) {
      return 'preoperatorio';
    }
  }
  
  // Verificar si es postoperatorio
  for (const keyword of CONFIGURACION_MEDICA.preguntas_frecuentes.postoperatorio) {
    if (textoNormalizado.includes(keyword)) {
      return 'postoperatorio';
    }
  }
  
  // Verificar si es sobre financiamiento
  for (const keyword of CONFIGURACION_MEDICA.preguntas_frecuentes.financiamiento) {
    if (textoNormalizado.includes(keyword)) {
      return 'financiamiento';
    }
  }
  
  // Si hay servicios detectados, es consulta de procedimiento
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

module.exports = {
  CONFIGURACION_MEDICA,
  evaluarUrgencia,
  categorizarConsulta,
  detectarExperiencia
};
