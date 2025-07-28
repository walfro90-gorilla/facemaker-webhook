# =====================================================
# 🐳 DOCKERFILE PARA WEBHOOK OPTIMIZADO
# =====================================================

# Usar Node.js 18 Alpine para menor tamaño
FROM node:18-alpine

# Información del mantenedor
LABEL maintainer="Walfre Gorilla-Labs <soporte@gorilla-labs.com>"
LABEL description="Webhook Inteligente Optimizado para ManyChat con HubSpot"
LABEL version="2.0.0"

# Instalar dependencias del sistema
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S webhook -u 1001

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código fuente
COPY --chown=webhook:nodejs . .

# Cambiar a usuario no-root
USER webhook

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando por defecto
CMD ["node", "api/webhook.js"]