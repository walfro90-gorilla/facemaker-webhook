# Pruebas automáticas para el webhook inteligente

Este script (`test-webhook-contact-deal.js`) prueba la creación de contactos y deals en el endpoint `/api/webhook`.

## Casos cubiertos
- Nombre completo (nombre y apellido), teléfono y producto
- Solo nombre y teléfono
- Nombre completo, sin teléfono, con intención de cita
- Solo teléfono, sin nombre ni producto
- Nombre completo, teléfono inválido (menos de 10 dígitos)

## Cómo ejecutar

1. Asegúrate de que tu servidor esté corriendo localmente en `http://localhost:3000` (ajusta el puerto si es necesario).
2. Instala la dependencia necesaria:

   ```bash
   npm install node-fetch@2
   ```

3. Ejecuta el script:

   ```bash
   node test/test-webhook-contact-deal.js
   ```

Revisa la consola para ver los resultados y asegúrate de que:
- El apellido se derive automáticamente si el nombre es completo.
- El teléfono solo se guarda si tiene al menos 10 dígitos.
- El deal se crea incluso si solo hay teléfono o intención relevante.
