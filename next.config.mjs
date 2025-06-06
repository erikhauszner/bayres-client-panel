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
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/:path*` 
          : 'http://api.bayreshub.com/uploads/:path*',
      },
    ];
  },

  // Configuración de variables de entorno en tiempo de compilación
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://api.bayreshub.com',
    NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://panel.bayreshub.com',
    NEXT_PUBLIC_WEBHOOK_URL: process.env.NEXT_PUBLIC_WEBHOOK_URL || 'http://147.93.36.93:5678',
  },
}

export default nextConfig
