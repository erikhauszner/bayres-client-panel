"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCircle, Clock, AlertCircle, File, User, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { notificationService } from "@/lib/services/notificationService"
import type { Notification as AppNotification } from "@/lib/types/notification"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Cargar notificaciones
  useEffect(() => {
    // Variable para guardar el último ID de notificación procesado
    let lastProcessedId = '';
    
    async function loadNotifications() {
      try {
        setLoading(true)
        const notifs = await notificationService.getNotifications(5)
        // Asegurarse de que notifications sea siempre un array
        const notificationsArray = Array.isArray(notifs) ? notifs : [];
        
        // Verificar si hay notificaciones nuevas
        if (notificationsArray.length > 0) {
          const latestNotification = notificationsArray[0];
          
          // Si hay una nueva notificación y no es la misma que ya procesamos
          if (latestNotification._id && latestNotification._id !== lastProcessedId) {
            lastProcessedId = latestNotification._id;
            
            // Si es una notificación no leída, mostrarla como toast
            if (latestNotification.status === 'unread') {
              notificationService.showToast(latestNotification);
            }
          }
        }
        
        setNotifications(notificationsArray)
        const count = await notificationService.getUnreadCount()
        setUnreadCount(count)
      } catch (error) {
        console.error("Error cargando notificaciones:", error)
        setNotifications([]) // Inicializar como array vacío en caso de error
      } finally {
        setLoading(false)
      }
    }

    // Cargar inmediatamente al montar el componente
    loadNotifications()
    
    // Recargar notificaciones cada 10 segundos en lugar de cada minuto
    const interval = setInterval(loadNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  // Marcar como leída una notificación
  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      await notificationService.markAsRead(notificationId)
      
      // Actualizar localmente
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, status: 'read' as const } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marcando notificación como leída:", error)
    }
  }

  // Marcar todas como leídas
  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      await notificationService.markAllAsRead()
      
      // Actualizar localmente
      setNotifications(notifications.map(n => ({ ...n, status: 'read' as const })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marcando todas las notificaciones como leídas:", error)
    }
  }

  // Eliminar notificación
  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      // Marcar como leída antes de eliminar si es necesario
      const notification = notifications.find(n => n._id === notificationId)
      if (notification && notification.status === 'unread') {
        await notificationService.markAsRead(notificationId)
      }
      
      // Eliminar la notificación
      await notificationService.deleteNotification(notificationId)
      
      // Actualizar localmente
      const updatedNotifications = notifications.filter(n => n._id !== notificationId)
      setNotifications(updatedNotifications)
      
      // Actualizar contador si era no leída
      const wasUnread = notifications.find(n => n._id === notificationId)?.status === 'unread'
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error eliminando notificación:", error)
    }
  }

  // Navegar a la página relacionada con la notificación
  const handleNavigate = (notification: AppNotification) => {
    // Marcar como leída al navegar
    if (notification._id && notification.status === 'unread') {
      notificationService.markAsRead(notification._id)
        .then(() => {
          setUnreadCount(prev => Math.max(0, prev - 1))
        })
        .catch(error => {
          console.error("Error marcando notificación como leída:", error)
        })
    }
    
    // Navegar según el tipo y datos
    if (notification.data?.projectId && notification.data?.taskId) {
      router.push(`/proyectos/${notification.data.projectId}?taskId=${notification.data.taskId}`)
    } else if (notification.data?.projectId) {
      router.push(`/proyectos/${notification.data.projectId}`)
    } else if (notification.data?.documentId) {
      router.push(`/documentos/${notification.data.documentId}`)
    }
  }

  // Obtener icono según tipo de notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
      case 'task_updated':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'task_completed':
      case 'project_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'task_due_soon':
      case 'task_overdue':
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case 'document_uploaded':
      case 'document_updated':
        return <File className="h-4 w-4 text-purple-500" />
      case 'comment_added':
        return <User className="h-4 w-4 text-indigo-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Formatear fecha relativa
  const formatRelativeTime = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -right-1 -top-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center" 
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px]">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-medium">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <Check className="mr-1 h-3 w-3" />
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <Bell className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`
                  flex cursor-pointer items-start justify-between p-3 hover:bg-muted/50
                  ${notification.status === 'unread' ? 'bg-muted/20' : ''}
                `}
                onClick={() => handleNavigate(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="space-y-1">
                    <p className={`text-sm ${notification.status === 'unread' ? 'font-medium' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {notification.status === 'unread' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleMarkAsRead(notification._id!, e)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => handleDeleteNotification(notification._id!, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer justify-center"
          onClick={() => router.push('/notificaciones')}
        >
          Ver todas las notificaciones
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 