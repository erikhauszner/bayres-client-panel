"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
}

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname()
  const { checkTokenValidity } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Si estamos en una ruta pública, no verificar autenticación
      if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        setIsAuthenticated(true)
        setIsChecking(false)
        return
      }

      // Verificar autenticación para rutas protegidas
      try {
        const isValid = await checkTokenValidity()
        setIsAuthenticated(isValid)
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        setIsAuthenticated(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [pathname, checkTokenValidity])

  // Mostrar loading mientras se verifica la autenticación
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado y no está en una ruta pública, el hook useAuth se encargará de redirigir
  if (!isAuthenticated && !PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 