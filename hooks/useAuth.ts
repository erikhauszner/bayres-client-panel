"use client"

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { toast } from 'sonner'

export const useAuth = () => {
  const router = useRouter()

  // Función para limpiar la sesión
  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpiry')
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
      Cookies.remove('token')
    }
  }, [])

  // Función para verificar si el token está expirado
  const isTokenExpired = useCallback(() => {
    if (typeof window === 'undefined') return false

    const token = localStorage.getItem('token')
    const tokenExpiry = localStorage.getItem('tokenExpiry')

    if (!token) return true

    if (tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry)
      const currentTime = new Date().getTime()
      return currentTime > expiryTime
    }

    // Si no hay información de expiración, asumir que está expirado
    return true
  }, [])

  // Función para redirigir al login
  const redirectToLogin = useCallback((reason?: string) => {
    clearSession()
    
    if (typeof window !== 'undefined') {
      // Mostrar mensaje de sesión expirada
      if (reason) {
        toast.error(reason, {
          description: "Por favor, inicia sesión nuevamente"
        })
      }

      // Evitar redirección infinita si ya estamos en login
      if (!window.location.pathname.includes('/login')) {
        console.warn('Redirigiendo al login:', reason || 'Sesión inválida')
        
        // Usar router.push para una navegación más suave
        router.push('/login')
        
        // Como respaldo, usar window.location después de un pequeño delay
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }, 1000)
      }
    }
  }, [router, clearSession])

  // Función para verificar la validez del token
  const checkTokenValidity = useCallback(async () => {
    if (typeof window === 'undefined') return true

    // Verificar si el token existe
    const token = localStorage.getItem('token')
    if (!token) {
      redirectToLogin('No hay token de autenticación')
      return false
    }

    // Verificar si el token está expirado localmente
    if (isTokenExpired()) {
      redirectToLogin('El token ha expirado')
      return false
    }

    // Realizar una verificación activa de la validez del token si está habilitada
    // Solo realizar esta verificación ocasionalmente para evitar sobrecarga
    if (Math.random() < 0.2) { // 20% de probabilidad para evitar muchas llamadas
      try {
        // Hacer una petición simple para verificar si el token es válido
        const response = await fetch('/api/auth/validate', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          console.warn('Error al validar token en el servidor:', response.status)
          if (response.status === 401 || response.status === 403) {
            // Solo redirigir si es un error de autenticación claro
            redirectToLogin('Sesión inválida en el servidor')
            return false
          }
        }
      } catch (error) {
        // Solo registrar el error pero no redirigir por problemas de red
        console.error('Error al verificar validez del token:', error)
      }
    }

    return true
  }, [isTokenExpired, redirectToLogin])

  // Verificar la sesión al montar el componente
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return

    // No verificar en la página de login o registro
    if (window.location.pathname.includes('/login') || window.location.pathname.includes('/register')) return

    // Verificar inmediatamente
    checkTokenValidity()

    // Configurar verificación periódica cada 1 minuto
    const interval = setInterval(() => {
      // Volver a verificar que no estemos en páginas de autenticación
      if (window.location.pathname.includes('/login') || window.location.pathname.includes('/register')) return
      
      checkTokenValidity()
    }, 1 * 60 * 1000) // 1 minuto

    // Verificar cuando la ventana recupera el foco
    const handleFocus = () => {
      checkTokenValidity()
    }

    window.addEventListener('focus', handleFocus)

    // Cleanup
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [checkTokenValidity])

  return {
    clearSession,
    redirectToLogin,
    checkTokenValidity,
    isTokenExpired
  }
} 