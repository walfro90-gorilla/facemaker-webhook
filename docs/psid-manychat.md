# Configuración del PSID en ManyChat

## 📋 Pasos para configurar el webhook con PSID:

### 1. En ManyChat, ve a tu Flow
- Automation → Visual Flow Builder

### 2. Agrega una acción "External Request"
- **Method**: POST
- **URL**: `https://tu-dominio.vercel.app/api/webhook`
- **Headers**: 
  ```
  Content-Type: application/json
  ```

### 3. En el Body, configura:
```json
{
  "mensaje": "{{last_input_text}}",
  "psid": "{{user_id}}",
  "nombre": "{{first_name}} {{last_name}}"
}
```

### 4. Variables disponibles en ManyChat:
- `{{user_id}}` - PSID del usuario
- `{{first_name}}` - Nombre
- `{{last_name}}` - Apellido
- `{{phone}}` - Teléfono (si ya lo tienes)
- `{{email}}` - Email (si ya lo tienes)
- `{{last_input_text}}` - Último mensaje del usuario

## 🔍 Ejemplo de PSID real:
Un PSID típico se ve así: `1234567890123456`

## ⚠️ Importante:
- El PSID es único por página de Facebook
- No contiene información personal
- Se mantiene constante para el mismo usuario
- Es la forma más confiable de identificar usuarios únicos

## 📊 Flujo completo:
1. Usuario envía mensaje → ManyChat captura
2. ManyChat envía al webhook: mensaje + PSID + nombre
3. Webhook procesa y crea/actualiza en HubSpot
4. HubSpot usa email: `{PSID}@facemaker.chat`
