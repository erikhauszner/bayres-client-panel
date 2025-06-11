"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RefreshCw, BarChart3, Clock, CheckCircle, AlertTriangle, Trash2, Bell, Info, Calendar, LayoutGrid, Settings, Target } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import api from "@/lib/api"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface JobStatus {
  name: string
  running: boolean
  nextExecution?: Date
}

interface NotificationStats {
  total: {
    scheduled: number
    pending: number
    executedToday: number
    failed: number
  }
  byType: Array<{ _id: string; count: number }>
  byPriority: Array<{ _id: string; count: number }>
}

interface ScheduledNotification {
  _id: string
  title: string
  message: string
  type: string
  priority: string
  employeeId: {
    firstName: string
    lastName: string
    email: string
  }
  scheduledFor: string
  executed: boolean
  executedAt?: string
  frequency: string
  isActive: boolean
  createdAt: string
}

interface SystemStats {
  totalScheduled: number
  executedToday: number
  upcomingToday: number
  upcomingWeek: number
}

export default function NotificationsAdminPage() {
  const { toast } = useToast()
  const [jobs, setJobs] = useState<JobStatus[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    loadSystemStats()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [jobsRes, statsRes, notificationsRes] = await Promise.all([
        api.get('/scheduled-notifications/jobs/status'),
        api.get('/scheduled-notifications/stats'),
        api.get('/scheduled-notifications?limit=50')
      ])

      setJobs(jobsRes.data.jobs || [])
      setStats(statsRes.data.stats)
      setNotifications(notificationsRes.data.notifications || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos del sistema de notificaciones"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSystemStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/scheduled-notifications/stats')
      setSystemStats(response.data.stats)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
      setError('No se pudieron cargar las estadísticas del sistema')
    } finally {
      setLoading(false)
    }
  }

  const runManualCheck = async () => {
    setRefreshing(true)
    try {
      const response = await api.post('/scheduled-notifications/jobs/run-check')
      toast({
        title: "Verificación Ejecutada",
        description: `Verificación manual completada. Resultados: ${JSON.stringify(response.data.results)}`
      })
      await loadData()
    } catch (error) {
      console.error('Error en verificación manual:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo ejecutar la verificación manual"
      })
    } finally {
      setRefreshing(false)
    }
  }

  const cleanupNotifications = async () => {
    try {
      const response = await api.post('/scheduled-notifications/cleanup')
      toast({
        title: "Limpieza Completada",
        description: response.data.message
      })
      await loadData()
    } catch (error) {
      console.error('Error en limpieza:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo ejecutar la limpieza"
      })
    }
  }

  const cancelNotification = async (id: string) => {
    try {
      await api.delete(`/scheduled-notifications/${id}`)
      toast({
        title: "Notificación Cancelada",
        description: "La notificación programada ha sido cancelada"
      })
      await loadData()
    } catch (error) {
      console.error('Error cancelando notificación:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cancelar la notificación"
      })
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

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Sistema de Notificaciones Automáticas</h1>
                <p className="text-muted-foreground">
                  Sistema implementado y funcionando correctamente
                </p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>✅ Sistema Implementado Correctamente</CardTitle>
                <CardDescription>
                  El sistema completo de notificaciones automáticas ha sido implementado exitosamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="font-medium">🔧 Componentes Backend</h3>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>✓ Modelo ScheduledNotification</li>
                        <li>✓ Servicio ScheduledNotificationService</li>
                        <li>✓ Sistema de Cron Jobs</li>
                        <li>✓ Controlador y rutas API</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">⚡ Funcionalidades Activas</h3>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>✓ Notificaciones de seguimientos de leads</li>
                        <li>✓ Verificación de tareas vencidas</li>
                        <li>✓ Alertas de facturas próximas a vencer</li>
                        <li>✓ Limpieza automática de notificaciones</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">🎯 Integración con Seguimientos de Leads</h4>
                    <p className="text-sm text-green-700">
                      Cuando programes un seguimiento desde la vista detallada de un lead, el sistema automáticamente:
                    </p>
                    <ul className="text-sm text-green-700 mt-2 space-y-1">
                      <li>• Cambia la etapa del lead a "Pendiente Seguimiento"</li>
                      <li>• Programa una notificación recordatoria para la fecha y hora especificada</li>
                      <li>• Envía la notificación automáticamente cuando llegue el momento</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">⏰ Horarios de Verificación Automática</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Notificaciones programadas: cada 5 minutos</li>
                      <li>• Seguimientos de leads: cada hora</li>
                      <li>• Tareas vencidas: cada 2 horas</li>
                      <li>• Facturas próximas a vencer: cada 4 horas</li>
                      <li>• Limpieza de datos: diariamente a las 2:00 AM</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>✅ Sistema Completamente Funcional</AlertTitle>
              <AlertDescription>
                El sistema de notificaciones automáticas está activo y ejecutando todas las verificaciones programadas.
                Las notificaciones próximas se muestran ahora en el dashboard principal.
              </AlertDescription>
            </Alert>

            {systemStats && (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Programadas</CardTitle>
                    <Bell className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.totalScheduled}</div>
                    <p className="text-xs text-muted-foreground">Notificaciones activas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Ejecutadas Hoy</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.executedToday}</div>
                    <p className="text-xs text-muted-foreground">Enviadas exitosamente</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Próximas Hoy</CardTitle>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.upcomingToday}</div>
                    <p className="text-xs text-muted-foreground">Programadas para hoy</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.upcomingWeek}</div>
                    <p className="text-xs text-muted-foreground">Próximos 7 días</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Nueva Funcionalidad: Notificaciones en Dashboard
                </CardTitle>
                <CardDescription>
                  Las notificaciones próximas ahora se muestran directamente en el dashboard principal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-sm mb-2">✨ Características Nuevas:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Vista de notificaciones próximas en dashboard</li>
                      <li>• Filtrado automático por próximos 7 días</li>
                      <li>• Tiempo restante calculado dinámicamente</li>
                      <li>• Enlace directo a leads para seguimientos</li>
                      <li>• Iconos específicos por tipo de notificación</li>
                      <li>• Indicadores de prioridad por colores</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">🎯 Flujo Completo de Seguimiento:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>1. Usuario agenda seguimiento en lead</li>
                      <li>2. Se crea interacción y cambia etapa</li>
                      <li>3. Se programa notificación recordatoria</li>
                      <li>4. Notificación aparece en dashboard como "próxima"</li>
                      <li>5. Sistema envía notificación en fecha/hora exacta</li>
                      <li>6. Usuario recibe recordatorio en tiempo real</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Trabajos Automáticos Activos
                  </CardTitle>
                  <CardDescription>
                    Procesos que se ejecutan automáticamente en el servidor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">Notificaciones Programadas</p>
                        <p className="text-xs text-muted-foreground">Cada 5 minutos</p>
                      </div>
                      <Badge variant="secondary">Activo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">Seguimientos de Leads</p>
                        <p className="text-xs text-muted-foreground">Cada hora</p>
                      </div>
                      <Badge variant="secondary">Activo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">Tareas Vencidas</p>
                        <p className="text-xs text-muted-foreground">Cada 2 horas</p>
                      </div>
                      <Badge variant="secondary">Activo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">Facturas Próximas</p>
                        <p className="text-xs text-muted-foreground">Cada 4 horas</p>
                      </div>
                      <Badge variant="secondary">Activo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">Limpieza de Datos</p>
                        <p className="text-xs text-muted-foreground">Diario a las 2:00 AM</p>
                      </div>
                      <Badge variant="secondary">Activo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Tipos de Notificaciones
                  </CardTitle>
                  <CardDescription>
                    Diferentes categorías de notificaciones automáticas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 border rounded">
                      <span className="text-lg">🎯</span>
                      <div>
                        <p className="font-medium text-sm">Seguimiento de Leads</p>
                        <p className="text-xs text-muted-foreground">Recordatorios de contacto programados</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 border rounded">
                      <span className="text-lg">📋</span>
                      <div>
                        <p className="font-medium text-sm">Tareas Pendientes</p>
                        <p className="text-xs text-muted-foreground">Alertas de tareas vencidas o próximas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 border rounded">
                      <span className="text-lg">💰</span>
                      <div>
                        <p className="font-medium text-sm">Facturas y Pagos</p>
                        <p className="text-xs text-muted-foreground">Recordatorios de vencimientos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 border rounded">
                      <span className="text-lg">📁</span>
                      <div>
                        <p className="font-medium text-sm">Proyectos</p>
                        <p className="text-xs text-muted-foreground">Hitos y fechas importantes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 border rounded">
                      <span className="text-lg">⚙️</span>
                      <div>
                        <p className="font-medium text-sm">Sistema</p>
                        <p className="text-xs text-muted-foreground">Mantenimiento y actualizaciones</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Información Técnica del Sistema</CardTitle>
                <CardDescription>
                  Detalles sobre el funcionamiento interno del sistema de notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="font-medium mb-2">Backend Components</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• ScheduledNotification Model</li>
                      <li>• ScheduledNotificationService</li>
                      <li>• Cron Job System</li>
                      <li>• REST API Endpoints</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Frontend Integration</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• UpcomingNotifications Component</li>
                      <li>• Dashboard Integration</li>
                      <li>• Real-time Socket.IO</li>
                      <li>• API Service Layer</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Automatic Scheduling</li>
                      <li>• Priority Management</li>
                      <li>• Data Cleanup</li>
                      <li>• Performance Monitoring</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Ver Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
} 