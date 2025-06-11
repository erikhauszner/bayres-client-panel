"use client"

import { useState, useEffect } from "react"
import { Clock, Bell, Calendar, User, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import api from "@/lib/api"

interface UpcomingNotification {
  _id: string
  title: string
  message: string
  type: string
  priority: 'low' | 'medium' | 'high'
  employeeId: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  scheduledFor: string
  executed: boolean
  metadata?: {
    leadId?: string
    leadName?: string
    company?: string
    followUpNote?: string
    isLeadFollowUp?: boolean
  }
}

export default function UpcomingNotifications() {
  const [notifications, setNotifications] = useState<UpcomingNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUpcomingNotifications()
  }, [])

  const loadUpcomingNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Usar el endpoint específico para notificaciones próximas
      const response = await api.get('/scheduled-notifications/upcoming', {
        params: {
          days: 7
        }
      })

      setNotifications(response.data.notifications || [])
    } catch (err) {
      console.error('Error cargando notificaciones próximas:', err)
      setError('No se pudieron cargar las notificaciones próximas')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lead': return '🎯'
      case 'task': return '📋'
      case 'invoice': return '💰'
      case 'project': return '📁'
      case 'system': return '⚙️'
      default: return '📧'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getTimeUntil = (scheduledFor: string) => {
    const now = new Date()
    const scheduled = new Date(scheduledFor)
    const diffMs = scheduled.getTime() - now.getTime()
    
    if (diffMs < 0) return 'Vencida'
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `En ${diffDays} día${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `En ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `En ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-3">
          <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Próximas Notificaciones
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Recordatorios y seguimientos programados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-3">
          <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Próximas Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-3">
        <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Próximas Notificaciones
          {notifications.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {notifications.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Recordatorios y seguimientos programados para los próximos 7 días
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            No hay notificaciones próximas
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification._id} className="flex items-start space-x-3 p-2 rounded-lg border bg-card/50">
                <div className="flex-shrink-0 mt-1">
                  <span className="text-lg">{getTypeIcon(notification.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                    <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                      {notification.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDateTime(notification.scheduledFor)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getTimeUntil(notification.scheduledFor)}
                      </Badge>
                      {notification.metadata?.isLeadFollowUp && notification.metadata?.leadId && (
                        <Link 
                          href={`/leads/${notification.metadata.leadId}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Ver Lead
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {notifications.length > 5 && (
              <div className="text-center pt-2">
                <Link href="/admin/notificaciones">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Ver todas las notificaciones programadas ({notifications.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 