# Etapa de construcción
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package.json package-lock.json* ./

# Instalar dependencias con legacy-peer-deps para compatibilidad
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Configurar variables de entorno para la construcción
#ENV NEXT_PUBLIC_API_URL=https://api.bayreshub.com/api
#ENV NEXT_PUBLIC_CLIENT_URL=https://panel.bayreshub.com
#ENV NEXT_PUBLIC_WEBHOOK_URL=https://api.bayreshub.com/external/
#ENV NEXT_PUBLIC_NOTIFICATIONS_URL=https://api.bayreshub.com/notifications
#ENV NEXT_PUBLIC_HEALTH_CHECK_URL=https://api.bayreshub.com/health
#ENV NEXT_PUBLIC_UPLOADS_URL=https://api.bayreshub.com/uploads
# Production URLs - URLs de producción para Docker
ENV NEXT_PUBLIC_API_URL=https://api.bayreshub.com/api
ENV NEXT_PUBLIC_CLIENT_URL=https://panel.bayreshub.com
ENV NEXT_PUBLIC_WEBHOOK_URL=https://api.bayreshub.com/external/
ENV NEXT_PUBLIC_NOTIFICATIONS_URL=https://api.bayreshub.com/notifications
ENV NEXT_PUBLIC_HEALTH_CHECK_URL=https://api.bayreshub.com/health
ENV NEXT_PUBLIC_UPLOADS_URL=https://api.bayreshub.com/uploads

# Development URLs - Comentadas para localhost (descomentar para desarrollo local)
# ENV NEXT_PUBLIC_API_URL=http://localhost:3000/api
# ENV NEXT_PUBLIC_CLIENT_URL=http://localhost:3001
# ENV NEXT_PUBLIC_WEBHOOK_URL=http://localhost:3000/external/
# ENV NEXT_PUBLIC_NOTIFICATIONS_URL=http://localhost:3000/notifications
# ENV NEXT_PUBLIC_HEALTH_CHECK_URL=http://localhost:3000/health
# ENV NEXT_PUBLIC_UPLOADS_URL=http://localhost:3000/uploads

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Configurar el puerto para Next.js
ENV PORT=3001

# Configurar variables de entorno para producción
ENV NEXT_PUBLIC_API_URL=https://api.bayreshub.com/api
ENV NEXT_PUBLIC_CLIENT_URL=https://panel.bayreshub.com
ENV NEXT_PUBLIC_WEBHOOK_URL=https://api.bayreshub.com/external/
ENV NEXT_PUBLIC_NOTIFICATIONS_URL=https://api.bayreshub.com/notifications
ENV NEXT_PUBLIC_HEALTH_CHECK_URL=https://api.bayreshub.com/health
ENV NEXT_PUBLIC_UPLOADS_URL=https://api.bayreshub.com/uploads
#ENV NEXT_PUBLIC_API_URL=http://localhost:3000/api
#ENV NEXT_PUBLIC_CLIENT_URL=http://localhost:3001
#ENV NEXT_PUBLIC_WEBHOOK_URL=http://localhost:3000/external/
#ENV NEXT_PUBLIC_NOTIFICATIONS_URL=http://localhost:3000/notifications
#ENV NEXT_PUBLIC_HEALTH_CHECK_URL=http://localhost:3000/health
#ENV NEXT_PUBLIC_UPLOADS_URL=http://localhost:3000/uploads

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