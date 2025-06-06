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
        destination: process.env.UPLOADS_URL 
          ? `${process.env.UPLOADS_URL}/:path*` 
          : 'https://api.bayreshub.com/uploads/:path*',
      },
    ];
  },

  // Configuración de variables de entorno en tiempo de compilación
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.bayreshub.com/api',
    NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || 'https://panel.bayreshub.com',
    NEXT_PUBLIC_WEBHOOK_URL: process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://n8n.bayreshub.com',
  },
}

export default nextConfig
