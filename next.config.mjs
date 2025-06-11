/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // Configuración para exportación independiente (Docker)
  output: 'standalone',
  
  // Configurar proxy para archivos estáticos
  async rewrites() {
    // Asegurar que siempre hay un valor válido para UPLOADS_URL
    //const uploadsUrl = process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://api.bayreshub.com/uploads';
    const uploadsUrl = process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://localhost:3000/uploads';
 
    return [
      {
        source: '/uploads/:path*',
        destination: `${uploadsUrl}/:path*`,
      },
    ];
  },

  // Propagar las variables de entorno al cliente
  // Ahora con valores predeterminados para permitir la construcción sin .env.local
 // env: {
//    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.bayreshub.com/api',
//    NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || 'https://panel.bayreshub.com',
//    NEXT_PUBLIC_WEBHOOK_URL: process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://api.bayreshub.com/external/leads/webhook',
//    NEXT_PUBLIC_NOTIFICATIONS_URL: process.env.NEXT_PUBLIC_NOTIFICATIONS_URL || 'https://api.bayreshub.com/notifications',
//    NEXT_PUBLIC_HEALTH_CHECK_URL: process.env.NEXT_PUBLIC_HEALTH_CHECK_URL || 'https://api.bayreshub.com/health',
//    NEXT_PUBLIC_UPLOADS_URL: process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://api.bayreshub.com/uploads',
//  },
//}

// Configuración para PRODUCCIÓN - URLs por defecto
env: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.bayreshub.com/api',
  NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || 'https://panel.bayreshub.com',
  NEXT_PUBLIC_WEBHOOK_URL: process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://api.bayreshub.com/external',
  NEXT_PUBLIC_NOTIFICATIONS_URL: process.env.NEXT_PUBLIC_NOTIFICATIONS_URL || 'https://api.bayreshub.com/notifications',
  NEXT_PUBLIC_HEALTH_CHECK_URL: process.env.NEXT_PUBLIC_HEALTH_CHECK_URL || 'https://api.bayreshub.com/health',
  NEXT_PUBLIC_UPLOADS_URL: process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://api.bayreshub.com/uploads',
},

// Para desarrollo local, usar estos valores:
// env: {
//   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
//   NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3001',
//   NEXT_PUBLIC_WEBHOOK_URL: process.env.NEXT_PUBLIC_WEBHOOK_URL || 'http://localhost:3000/external',
//   NEXT_PUBLIC_NOTIFICATIONS_URL: process.env.NEXT_PUBLIC_NOTIFICATIONS_URL || 'http://localhost:3000/notifications',
//   NEXT_PUBLIC_HEALTH_CHECK_URL: process.env.NEXT_PUBLIC_HEALTH_CHECK_URL || 'http://localhost:3000/health',
//   NEXT_PUBLIC_UPLOADS_URL: process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:3000/uploads',
// },
}

export default nextConfig
