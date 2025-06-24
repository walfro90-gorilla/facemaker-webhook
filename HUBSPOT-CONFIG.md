# 🔧 Configuración de HubSpot - Guía Completa

## ✅ **Problemas Solucionados**

### ❌ **Error Anterior:** 
```
Property "leadstatus" does not exist
PROPERTY_DOESNT_EXIST
```

### ✅ **Solución Aplicada:**
Se reemplazaron las propiedades personalizadas por **propiedades estándar** de HubSpot:

| **❌ Antes (Problemático)** | **✅ Ahora (Corregido)** |
|------------------------------|--------------------------|
| `leadstatus` (custom)        | `hs_lead_status` (estándar) |
| `createdate` (read-only)     | ❌ Removido |
| `hs_analytics_source_data_1` (read-only) | `notes_last_contacted` |
| Valores custom ("espera cita") | Valores estándar ("NEW", "OPEN") |

## 📊 **Mapeo de Estados (Lead Status)**

El webhook ahora mapea las intenciones a valores **estándar** de HubSpot:

```javascript
const leadstatusMap = {
  agendar_cita: "NEW",           // 🆕 Nuevo lead que quiere cita
  pedir_informacion: "OPEN",     // 📖 Lead activo buscando info  
  realizar_pago: "CONNECTED",    // 💳 Lead listo para pagar
  cancelar: "UNQUALIFIED",       // ❌ Lead que cancela
  emergencia: "ATTEMPTED_TO_CONTACT" // 🚨 Requiere contacto urgente
};
```

## 🎯 **Propiedades que se Crean/Actualizan**

### **✅ Propiedades Estándar Utilizadas:**
- **`email`** → `psid@facemaker.chat` (identificador único)
- **`firstname`** → Nombre del usuario o "Usuario Messenger"
- **`phone`** → Teléfono extraído del mensaje (si válido)
- **`lifecyclestage`** → Siempre "lead"
- **`hs_lead_status`** → Estado mapeado según intención
- **`notes_last_contacted`** → Información del producto/interés

### **❌ Propiedades Removidas (Causaban Error):**
- `leadstatus` (no existe en este portal)
- `createdate` (read-only, se maneja automáticamente)  
- `hs_analytics_source_data_1` (read-only)
- `lastmodifieddate` (se actualiza automáticamente)

## 🔐 **Configuración Requerida en HubSpot**

### **1. Token de API:**
- Ir a **Settings → Integrations → Private Apps**
- Crear una nueva app privada
- Permisos requeridos:
  - ✅ `crm.objects.contacts.read`
  - ✅ `crm.objects.contacts.write`

### **2. Configurar en Vercel:**
```bash
# Variable de entorno en Vercel
HUBSPOT_TOKEN=pat-na2-tu-token-aqui
```

## 🧪 **Testing y Verificación**

### **Ejemplo de Request a la API:**
```json
{
  "mensaje": "Hola, quiero agendar cita para botox mañana, mi teléfono es 5512345678",
  "psid": "9795399437224381", 
  "nombre": "Luna"
}
```

### **Respuesta Esperada (Exitosa):**
```json
{
  "success": true,
  "datos_extraidos": {
    "telefono": "5512345678",
    "fecha": "mañana",
    "hora": null,
    "intencion": "agendar_cita", 
    "producto": "botox"
  },
  "hubspot": {
    "hubspotContactId": "12345678",
    "leadstatus": "NEW",
    "action": "created",
    "email": "9795399437224381@facemaker.chat"
  }
}
```

## 🚨 **Errores Comunes y Soluciones**

### **1. Token Inválido/Expirado:**
```json
{
  "error": "HTTP-Code: 401",
  "message": "Unauthorized"
}
```
**Solución:** Regenerar token en HubSpot y actualizar en Vercel.

### **2. Permisos Insuficientes:**
```json
{
  "error": "HTTP-Code: 403", 
  "message": "Forbidden"
}
```
**Solución:** Verificar permisos del token (contacts.read + contacts.write).

### **3. Rate Limiting:**
```json
{
  "error": "HTTP-Code: 429",
  "message": "Rate limit exceeded"
}
```
**Solución:** El webhook maneja automáticamente. Esperar unos segundos.

## 📈 **Monitoreo y Logs**

Para monitorear el funcionamiento:

1. **En Vercel:** Functions → Ver logs de webhook
2. **En HubSpot:** Contacts → Buscar por email `psid@facemaker.chat`
3. **Test directo:** Usar Postman/curl contra la URL del webhook

## 🎯 **Próximos Pasos Recomendados**

1. **✅ Configurar token** en Vercel (variable HUBSPOT_TOKEN)
2. **🧪 Hacer test** desde ManyChat o Postman
3. **📊 Verificar contactos** creados en HubSpot
4. **🔄 Ajustar mapeo** de estados según necesidades del negocio
5. **📝 Configurar notas** adicionales si se requieren

---

**🚀 El webhook ya está optimizado y listo para funcionar con HubSpot!**
