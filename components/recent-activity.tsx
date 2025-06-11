"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import api from "@/lib/api"

interface AuditActivity {
  _id: string
  action: string
  description: string
  module: string
  targetType: string
  targetId?: string
  userId: string
  userName: string
  timestamp: string
  metadata?: {
    leadName?: string
    clientName?: string
    projectName?: string
    taskName?: string
    amount?: number
  }
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<AuditActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecentActivity()
  }, [])

  const loadRecentActivity = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get('/audit/recent-activity', {
        params: {
          limit: 10
        }
      })

      // El controlador devuelve { success: true, data: activities }
      setActivities(response.data.data || [])
    } catch (err) {
      console.error('Error cargando actividad reciente:', err)
      setError('No se pudo cargar la actividad reciente')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (module: string, action: string) => {
    if (module === 'leads') {
      if (action.includes('creación') || action.includes('creacion')) return '🎯'
      if (action.includes('conversión') || action.includes('conversion')) return '✅'
      if (action.includes('asignación') || action.includes('asignacion')) return '👤'
      return '📋'
    }
    
    if (module === 'finanzas' || module === 'finance') {
      if (action.includes('pago') || action.includes('payment')) return '💰'
      if (action.includes('factura') || action.includes('invoice')) return '📄'
      return '💳'
    }
    
    if (module === 'proyectos' || module === 'projects') {
      if (action.includes('finalizado') || action.includes('completed')) return '🏆'
      if (action.includes('creación') || action.includes('creacion')) return '📁'
      return '⚙️'
    }
    
    if (module === 'tareas' || module === 'tasks') {
      return '✔️'
    }
    
    if (module === 'empleados' || module === 'employees') {
      return '👥'
    }
    
    return '📝'
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffMs = now.getTime() - activityTime.getTime()
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 1) return 'Hace un momento'
    if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    
    return activityTime.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityLink = (activity: AuditActivity) => {
    if (activity.module === 'leads' && activity.targetId) {
      return `/leads/${activity.targetId}`
    }
    if (activity.module === 'clientes' && activity.targetId) {
      return `/clientes/${activity.targetId}`
    }
    if (activity.module === 'proyectos' && activity.targetId) {
      return `/proyectos/${activity.targetId}`
    }
    if (activity.module === 'finanzas' && activity.targetId) {
      return `/finanzas/transacciones/${activity.targetId}`
    }
    return null
  }

  const getUserInitials = (userName: string) => {
    if (!userName) return '??'
    const names = userName.split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
    }
    return `${userName.charAt(0)}`.toUpperCase()
  }

  const renderActivityDescription = (activity: AuditActivity) => {
    const link = getActivityLink(activity)
    const entityName = activity.metadata?.leadName || 
                     activity.metadata?.clientName || 
                     activity.metadata?.projectName || 
                     activity.metadata?.taskName ||
                     'Elemento'

    if (link && entityName !== 'Elemento') {
      return (
        <>
          {activity.description.split(entityName)[0]}
          <Link href={link} className="font-medium text-primary hover:underline">
            {entityName}
          </Link>
          {activity.description.split(entityName).slice(1).join(entityName)}
        </>
      )
    }

    return activity.description
  }

  if (loading) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-3">
          <CardTitle className="text-base sm:text-lg font-medium">Actividad Reciente</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Últimas actividades registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-3 sm:space-x-4">
                <div className="animate-pulse bg-muted rounded-full h-7 w-7 sm:h-9 sm:w-9"></div>
                <div className="space-y-1 flex-1">
                  <div className="animate-pulse bg-muted rounded h-3 w-3/4"></div>
                  <div className="animate-pulse bg-muted rounded h-2 w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-3">
          <CardTitle className="text-base sm:text-lg font-medium">Actividad Reciente</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Últimas actividades registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-3">
        <CardTitle className="text-base sm:text-lg font-medium">Actividad Reciente</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Últimas actividades registradas en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
        {activities.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            No hay actividad reciente disponible
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity._id} className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex items-center justify-center h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-primary/10">
                  <span className="text-sm">
                    {getActivityIcon(activity.module, activity.action)}
                  </span>
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm">
                    <span className="font-medium">
                      {activity.userName}
                    </span>{" "}
                    {renderActivityDescription(activity)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {activities.length > 5 && (
              <div className="text-center pt-2">
                <Link href="/admin/auditoria">
                  <button className="text-xs text-primary hover:underline">
                    Ver toda la actividad ({activities.length} total)
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 