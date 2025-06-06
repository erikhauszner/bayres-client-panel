import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Obtener token de la cookie
  const token = request.cookies.get('token')?.value

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/register', '/recuperar-password', '/cambiar-password']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))
  
  // Rutas que siempre permiten acceso (assets, etc.)
  const bypassPaths = ['/assets', '/images', '/favicon.ico']
  const isBypassPath = bypassPaths.some(path => request.nextUrl.pathname.startsWith(path))
  
  // Si es una ruta de bypass, permitir acceso siempre
  if (isBypassPath) {
    return NextResponse.next()
  }

  // Si no hay token y la ruta no es pública, redirigir al login
  if (!token && !isPublicPath) {
    const url = new URL('/login', request.url)
    // Guardar la URL original para redirigir después del login
    url.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  // IMPORTANTE: Permitir siempre el acceso a /login incluso con token
  // Esto permite que el proceso de logout funcione correctamente
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 