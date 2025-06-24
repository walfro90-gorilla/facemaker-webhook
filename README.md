# Webhook Inteligente para ManyChat

## 📋 Descripción

Este webhook está diseñado para analizar mensajes de clientes en ManyChat y extraer automáticamente:

- **Intenciones del usuario** (agendar cita, pedir información, realizar pago, etc.)
- **Datos de contacto** (teléfono, email, nombre)
- **Información temporal** (fechas, horas)
- **Servicios de interés** (tratamientos, cirugías, etc.)

## 🚀 Características Principales

### ✨ Detección de Intenciones Avanzada
- Sistema de puntuación para mayor precisión
- Manejo de sinónimos y variaciones de escritura
- Múltiples intenciones detectadas con nivel de confianza

### 📞 Extracción de Datos Mejorada
- **Teléfonos**: Formatos mexicanos, estadounidenses y generales
- **Fechas**: Relativas (mañana, lunes) y absolutas (15/12/2025)
- **Horas**: Formatos 12h/24h con AM/PM
- **Emails**: Validación completa de direcciones
- **Nombres**: Extracción cuando el usuario se presenta

### 🏥 Servicios Médicos Categorizados
- Cirugía estética
- Tratamientos faciales
- Láser y depilación
- Medicina estética

## 📤 Formato de Respuesta

```json
{
  "datos_extraidos": {
    "telefono": "5512345678",
    "email": "cliente@email.com",
    "nombre": "Ana García",
    "fecha": "mañana",
    "hora": "3:30 pm"
  },
  "intencion": {
    "principal": "agendar_cita",
    "confianza": 4.5,
    "alternativas": [
      {
        "intencion": "agendar_cita",
        "confianza": 4.5
      },
      {
        "intencion": "pedir_informacion",
        "confianza": 1.0
      }
    ]
  },
  "servicios": [
    {
      "servicio": "botox",
      "categoria": "tratamientos_faciales"
    }
  ],
  "metadata": {
    "mensaje_original": "Hola, quiero agendar cita para botox mañana a las 3:30pm",
    "longitud_mensaje": 58,
    "timestamp": "2025-06-19T10:30:00.000Z",
    "version": "2.0"
  }
}
```

## 🎯 Intenciones Detectadas

### 📅 agendar_cita
**Palabras clave**: cita, agendar, apartar, reservar, programar, consulta, disponibilidad

**Ejemplo**: "Quiero agendar una cita para botox mañana"

### ℹ️ pedir_informacion
**Palabras clave**: precio, costo, cuánto, información, detalles, presupuesto

**Ejemplo**: "¿Cuánto cuesta el aumento mamario?"

### 💳 realizar_pago
**Palabras clave**: pagar, depósito, apartar con, transferencia, anticipo

**Ejemplo**: "Quiero apartar mi cita con un depósito"

### ❌ cancelar
**Palabras clave**: cancelar, anular, cambiar fecha, reprogramar

**Ejemplo**: "Necesito cancelar mi cita del viernes"

### 🚨 emergencia
**Palabras clave**: urgente, emergencia, dolor, problema, ayuda

**Ejemplo**: "Tengo dolor después de mi cirugía, es urgente"

### ✅ satisfaccion
**Palabras clave**: gracias, perfecto, excelente, de acuerdo

**Ejemplo**: "Perfecto, muchas gracias por la información"

### 📍 ubicacion
**Palabras clave**: dirección, dónde están, ubicación, cómo llegar

**Ejemplo**: "¿Dónde están ubicados? ¿Cómo llego?"

## 🏥 Servicios Categorizados

### 🔪 Cirugía Estética
- Aumento mamario / implantes
- Rinoplastia
- Liposucción
- Abdominoplastia
- Brazilian Butt Lift (BBL)

### 💆‍♀️ Tratamientos Faciales
- Botox / Toxina botulínica
- Rellenos / Ácido hialurónico
- Rejuvenecimiento
- Peeling
- Microdermoabrasión

### 🔬 Láser
- Depilación láser
- IPL
- Fotodepilación

### 💉 Medicina Estética
- Sueros / Vitaminas
- Emerald
- Mesoterapia
- Plasma Rico en Plaquetas (PRP)

## 🛠️ Uso en ManyChat

### 1. Configurar Webhook
```
URL: https://tu-dominio.vercel.app/api/webhook
Método: POST
```

### 2. Enviar Datos
```json
{
  "mensaje": "{{last_input_text}}"
}
```

### 3. Usar Variables Recibidas
- `{{intencion.principal}}` - Intención principal detectada
- `{{datos_extraidos.telefono}}` - Teléfono extraído
- `{{datos_extraidos.nombre}}` - Nombre del cliente
- `{{servicios.0.servicio}}` - Primer servicio detectado

## 📊 Ejemplos de Mensajes

### Caso 1: Cliente quiere agendar
**Input**: "Hola, me llamo María, quiero agendar cita para botox, mi teléfono es 55-1234-5678"

**Output**:
- Intención: `agendar_cita` (confianza: 4.0)
- Nombre: `María`
- Teléfono: `5512345678`
- Servicio: `botox` (tratamientos_faciales)

### Caso 2: Consulta de precios
**Input**: "¿Cuánto cuesta el aumento mamario? ¿Qué incluye el precio?"

**Output**:
- Intención: `pedir_informacion` (confianza: 3.0)
- Servicio: `aumento mamario` (cirugia_estetica)

### Caso 3: Emergencia médica
**Input**: "Urgente! Tengo dolor después de mi cirugía, mi número es 5512345678"

**Output**:
- Intención: `emergencia` (confianza: 4.0)
- Teléfono: `5512345678`

## 🔧 Instalación y Desarrollo

### Instalar dependencias
```bash
npm install
```

### Ejecutar en desarrollo
```bash
npm run dev
```

### Ejecutar pruebas
```bash
npm test
```

### Desplegar en Vercel
```bash
vercel --prod
```

## 🎯 Próximas Mejoras

- [ ] Integración con APIs de procesamiento de lenguaje natural
- [ ] Detección de sentimientos (positivo/negativo)
- [ ] Manejo de múltiples idiomas
- [ ] Clasificación de urgencia médica
- [ ] Extracción de síntomas específicos
- [ ] Validación de datos extraídos
- [ ] Sistema de aprendizaje automático

## 🤝 Contribuir

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Realiza tus cambios
4. Agrega pruebas si es necesario
5. Envía un Pull Request

## 📝 Licencia

ISC License
