"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react'

export default function SessionStatus() {
  const { isTokenExpired } = useAuth()
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [status, setStatus] = useState<'active' | 'warning' | 'expired'>('active')

  useEffect(() => {
    const updateStatus = () => {
      if (typeof window === 'undefined') return

      const tokenExpiry = localStorage.getItem('tokenExpiry')
      
      if (!tokenExpiry) {
        setStatus('expired')
        setTimeLeft('')
        return
      }

      const expiryTime = parseInt(tokenExpiry)
      const currentTime = new Date().getTime()
      const timeDiff = expiryTime - currentTime

      if (timeDiff <= 0) {
        setStatus('expired')
        setTimeLeft('Expirado')
        return
      }

      // Calcular tiempo restante
      const hours = Math.floor(timeDiff / (1000 * 60 * 60))
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours < 1) {
        setStatus('warning')
        setTimeLeft(`${minutes}m`)
      } else {
        setStatus('active')
        setTimeLeft(`${hours}h ${minutes}m`)
      }
    }

    // Actualizar inmediatamente
    updateStatus()

    // Actualizar cada minuto
    const interval = setInterval(updateStatus, 60000)

    return () => clearInterval(interval)
  }, [])

  // No mostrar en rutas públicas
  if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
    return null
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: `Sesión activa (${timeLeft})`,
          className: 'bg-green-500/10 text-green-500 border-green-500/20'
        }
      case 'warning':
        return {
          variant: 'secondary' as const,
          icon: AlertTriangle,
          text: `Expira en ${timeLeft}`,
          className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        }
      case 'expired':
        return {
          variant: 'destructive' as const,
          icon: Clock,
          text: 'Sesión expirada',
          className: 'bg-red-500/10 text-red-500 border-red-500/20'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={`${config.className} flex items-center gap-1 text-xs`}>
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  )
} 