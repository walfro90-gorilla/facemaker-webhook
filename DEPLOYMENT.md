# 🚀 Guía de Deployment a Producción

## ✅ Estado Actual
- ✅ Código actualizado con funcionalidad de deals
- ✅ Configuración de Vercel (`vercel.json`) añadida
- ✅ Cambios subidos a GitHub
- ✅ Webhook completamente funcional localmente

## 📋 Pasos para Completar el Deployment

### 1. **Conectar a Vercel** (Opción Recomendada)

Ve a [vercel.com](https://vercel.com) y:

1. **Inicia sesión** con tu cuenta
2. **Importa el proyecto** desde GitHub:
   - Repositorio: `walfro90-gorilla/facemaker-webhook`
3. **Configura las variables de entorno**:
   - `HUBSPOT_TOKEN` = tu token de HubSpot
4. **Deploy automático** se activará

### 2. **O usar CLI de Vercel**

```bash
# En la terminal
cd "c:\Users\Usuario\Desktop\webhook-inteligente"

# Login a Vercel (abrirá el navegador)
vercel login

# Deploy a producción
vercel --prod
```

## 🔧 Variables de Entorno Requeridas

En Vercel, configura:
- **`HUBSPOT_TOKEN`**: Tu token de API de HubSpot

## 📡 Endpoint de Producción

Una vez deployado, tu webhook estará disponible en:
```
https://tu-proyecto.vercel.app/api/webhook
```

## 🧪 Test de Producción

Para probar en producción, envía un POST a tu endpoint:

```json
{
  "mensaje": "Hola, quiero agendar una cita para botox mañana a las 3pm, mi número es 5512345678",
  "psid": "test_prod_123",
  "nombre": "Cliente Prueba"
}
```

## ✅ Funcionalidades Implementadas

- ✅ **Creación de contactos** en HubSpot
- ✅ **Creación de deals** asociados a contactos
- ✅ **Manejo de contactos existentes**
- ✅ **Mapeo de productos a deals**
- ✅ **Actualización de etapas según intención**
- ✅ **Parsing inteligente de mensajes**

## 🎯 Próximos Pasos

1. **Completar deployment** siguiendo los pasos arriba
2. **Configurar ManyChat** para usar el nuevo endpoint
3. **Monitorear logs** en Vercel dashboard
4. **Probar con tráfico real**

## 📞 Soporte

Si necesitas ayuda con el deployment, revisa:
- [Documentación de Vercel](https://vercel.com/docs)
- Los logs del proyecto en el dashboard de Vercel
