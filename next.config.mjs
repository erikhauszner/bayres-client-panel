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
  devServer: {
    port: process.env.PORT || 3001,
  },
  
  // Configuración para exportación independiente (Docker)
  output: 'standalone',
  
  // Configurar proxy para archivos estáticos
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_UPLOADS_URL}/:path*`,
      },
    ];
  },

  // Propagar las variables de entorno al cliente
  // Sin valores predeterminados para forzar su definición en .env.local
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL,
    NEXT_PUBLIC_WEBHOOK_URL: process.env.NEXT_PUBLIC_WEBHOOK_URL,
    NEXT_PUBLIC_NOTIFICATIONS_URL: process.env.NEXT_PUBLIC_NOTIFICATIONS_URL,
    NEXT_PUBLIC_HEALTH_CHECK_URL: process.env.NEXT_PUBLIC_HEALTH_CHECK_URL,
    NEXT_PUBLIC_UPLOADS_URL: process.env.NEXT_PUBLIC_UPLOADS_URL,
  },
}

export default nextConfig
