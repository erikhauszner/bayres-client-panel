# Etapa de construcción
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package.json package-lock.json* ./

# Instalar dependencias con legacy-peer-deps para compatibilidad
RUN npm ci --legacy-peer-deps

# Copiar código fuente y archivos de entorno
COPY . .

# Establecer variables de entorno para la construcción
ENV NEXT_PUBLIC_API_URL=https://api.bayreshub.com/api
ENV NEXT_PUBLIC_CLIENT_URL=https://panel.bayreshub.com
ENV NEXT_PUBLIC_WEBHOOK_URL=https://n8n.bayreshub.com
ENV NEXT_PUBLIC_NOTIFICATIONS_URL=https://api.bayreshub.com/notifications
ENV NEXT_PUBLIC_HEALTH_CHECK_URL=https://api.bayreshub.com/health
ENV NEXT_PUBLIC_UPLOADS_URL=https://api.bayreshub.com/uploads

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Configurar el puerto para Next.js
ENV PORT=3001

# Mantener las variables públicas en la imagen final
ENV NEXT_PUBLIC_API_URL=https://api.bayreshub.com/api
ENV NEXT_PUBLIC_CLIENT_URL=https://panel.bayreshub.com
ENV NEXT_PUBLIC_WEBHOOK_URL=https://n8n.bayreshub.com
ENV NEXT_PUBLIC_NOTIFICATIONS_URL=https://api.bayreshub.com/notifications
ENV NEXT_PUBLIC_HEALTH_CHECK_URL=https://api.bayreshub.com/health
ENV NEXT_PUBLIC_UPLOADS_URL=https://api.bayreshub.com/uploads

# Crear un usuario no-root para producción
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios de la etapa de construcción
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Establecer permisos correctos
RUN chown -R nextjs:nodejs /app

# Cambiar al usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3001

# Establecer host para que funcione correctamente en Docker
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar la aplicación
CMD ["node", "server.js"] 