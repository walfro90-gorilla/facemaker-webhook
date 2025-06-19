# Integración con ManyChat - Ejemplos Prácticos

## 🔗 Configuración del Webhook en ManyChat

### 1. URL del Webhook
```
https://tu-dominio.vercel.app/api/webhook
```

### 2. Configuración del Flow

#### Paso 1: Capturar mensaje del usuario
```
Trigger: User Input
Variable: {{last_input_text}}
```

#### Paso 2: Enviar al webhook
```
Action: External Request
Method: POST
URL: https://tu-dominio.vercel.app/api/webhook
Headers: Content-Type: application/json
Body: {"mensaje": "{{last_input_text}}"}
```

#### Paso 3: Guardar respuestas en variables
```
{{webhook_intencion}} = {{intencion.principal}}
{{webhook_telefono}} = {{datos_extraidos.telefono}}
{{webhook_nombre}} = {{datos_extraidos.nombre}}
{{webhook_email}} = {{datos_extraidos.email}}
{{webhook_fecha}} = {{datos_extraidos.fecha}}
{{webhook_hora}} = {{datos_extraidos.hora}}
{{webhook_urgencia}} = {{analisis_medico.urgencia.nivel}}
{{webhook_servicios}} = {{servicios.0.servicio}}
```

## 🎯 Flujos de Conversación Inteligentes

### Flujo 1: Detección de Urgencia Médica
```
Condition: {{webhook_urgencia}} = "alta"
Action: 
  - Send Message: "⚠️ Entiendo que es urgente. Te voy a conectar inmediatamente con nuestro equipo médico."
  - Assign to Human
  - Tag: "urgencia_medica"
```

### Flujo 2: Agendamiento de Citas
```
Condition: {{webhook_intencion}} = "agendar_cita"
Actions:
  - If {{webhook_telefono}} exists:
    - Send Message: "Perfecto {{webhook_nombre}}, veo que quieres agendar {{webhook_servicios}} para {{webhook_fecha}} a las {{webhook_hora}}. Te contactaré al {{webhook_telefono}}"
  - Else:
    - Send Message: "Para agendar tu cita de {{webhook_servicios}}, necesito tu número de teléfono"
    - User Input → Save to {{telefono_usuario}}
```

### Flujo 3: Información de Precios
```
Condition: {{webhook_intencion}} = "pedir_informacion"
Actions:
  - If {{webhook_servicios}} = "botox":
    - Send Message: "💉 El Botox tiene un costo desde $3,500 pesos. Incluye aplicación en entrecejo, frente y patas de gallo."
  - If {{webhook_servicios}} = "aumento mamario":
    - Send Message: "🔹 El aumento mamario tiene un costo desde $85,000 pesos. Incluye implantes, cirugía y seguimiento completo."
```

### Flujo 4: Manejo de Cancelaciones
```
Condition: {{webhook_intencion}} = "cancelar"
Actions:
  - Send Message: "Entiendo que necesitas cancelar tu cita. ¿Podrías proporcionarme tu nombre y fecha de la cita?"
  - User Input → Save to {{datos_cancelacion}}
  - Tag: "cancelacion_cita"
```

## 📋 Variables Útiles para ManyChat

### Variables de Datos Extraídos
- `{{webhook_telefono}}` - Teléfono del cliente
- `{{webhook_email}}` - Email del cliente  
- `{{webhook_nombre}}` - Nombre del cliente
- `{{webhook_fecha}}` - Fecha solicitada
- `{{webhook_hora}}` - Hora solicitada

### Variables de Análisis
- `{{webhook_intencion}}` - Intención principal detectada
- `{{webhook_confianza}}` - Nivel de confianza (0-100)
- `{{webhook_urgencia}}` - Nivel de urgencia (baja/media/alta)
- `{{webhook_tipo_consulta}}` - Tipo de consulta (preoperatorio/postoperatorio/etc.)
- `{{webhook_experiencia}}` - Experiencia previa del cliente

### Variables de Servicios
- `{{webhook_servicio_1}}` - Primer servicio detectado
- `{{webhook_categoria_1}}` - Categoría del primer servicio
- `{{webhook_total_servicios}}` - Cantidad de servicios detectados

## 🔄 Flujo Completo de Ejemplo

```
1. Usuario envía mensaje:
   "Hola, me llamo María, quiero agendar cita para botox mañana a las 3pm, mi teléfono es 55-1234-5678"

2. Webhook analiza y responde:
   {
     "datos_extraidos": {
       "telefono": "5512345678",
       "nombre": "María", 
       "fecha": "mañana",
       "hora": "3pm"
     },
     "intencion": {
       "principal": "agendar_cita",
       "confianza": 18.5
     },
     "servicios": [{
       "servicio": "botox",
       "categoria": "tratamientos_faciales"
     }]
   }

3. ManyChat responde:
   "¡Hola María! 👋 
   
   Perfecto, quieres agendar tu cita de Botox para mañana a las 3:00 PM.
   
   Te contactaré al 55-1234-5678 para confirmar disponibilidad.
   
   ¿Es tu primera vez con nosotros?"

4. Seguimiento automático:
   - Crear lead en CRM
   - Programar llamada de confirmación
   - Enviar información pre-cita por WhatsApp
```

## 📊 Métricas y Seguimiento

### Tags Automáticos por Intención
- `intent_agendar_cita`
- `intent_pedir_info`
- `intent_emergencia`
- `intent_cancelar`
- `intent_ubicacion`

### Tags por Servicio
- `servicio_botox`
- `servicio_aumento_mamario`
- `servicio_laser`
- `servicio_rinoplastia`

### Tags por Urgencia
- `urgencia_alta` (requiere atención inmediata)
- `urgencia_media` (seguimiento en 24h)
- `urgencia_baja` (seguimiento normal)

## 🚀 Automatizaciones Avanzadas

### 1. Calificación Automática de Leads
```javascript
// En Custom Field: lead_score
let score = 0;
if ({{webhook_telefono}}) score += 20;
if ({{webhook_email}}) score += 15;
if ({{webhook_fecha}}) score += 25;
if ({{webhook_intencion}} === "agendar_cita") score += 40;
return score;
```

### 2. Routing Inteligente
```
- Urgencia Alta → Equipo médico inmediato
- Agendar Cita → Coordinadora de citas
- Información → Asesor comercial  
- Cancelación → Atención al cliente
```

### 3. Seguimiento Personalizado
```
- Primera vez → Enviar video explicativo
- Con experiencia → Ofrecer descuentos
- Postoperatorio → Checklist de cuidados
```
