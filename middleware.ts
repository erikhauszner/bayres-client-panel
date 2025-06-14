import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que no requieren autenticación
const publicRoutes = ['/login', '/register', '/forgot-password']

// Rutas de API que no requieren autenticación
const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Permitir archivos estáticos y rutas de Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Verificar si es una ruta pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next()
  }

  // Obtener token de las cookies
  const token = request.cookies.get('token')?.value

  // Si no hay token, redirigir al login
  if (!token) {
    console.log(`🔒 Middleware: Sin token para ${pathname}, redirigiendo a login`)
    
    // Para rutas de API, devolver 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'No autorizado', message: 'Token requerido' },
        { status: 401 }
      )
    }
    
    // Para rutas normales, redirigir al login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar si el token está expirado (verificación básica)
  try {
    // Decodificar el JWT para verificar expiración
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    if (payload.exp && payload.exp < currentTime) {
      console.log(`🔒 Middleware: Token expirado para ${pathname}, redirigiendo a login`)
      
      // Token expirado
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Token expirado', message: 'El token ha expirado' },
          { status: 401 }
        )
      }
      
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      
      // Limpiar cookie del token expirado
      response.cookies.delete('token')
      
      return response
    }
  } catch (error) {
    console.error('Error verificando token en middleware:', error)
    
    // Token malformado
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Token inválido', message: 'El token no es válido' },
        { status: 401 }
      )
    }
    
    const loginUrl = new URL('/login', request.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('token')
    
    return response
  }

  // Token válido, continuar
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 