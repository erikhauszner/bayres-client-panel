"use client"

import { useState, useEffect } from "react"
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Bell,
  Check,
  X,
  MoreVertical,
  Filter,
  Search,
  Archive,
  Trash2,
  Plus,
  Send,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  DollarSign,
  Target,
  Clock,
  MessageSquare,
  Settings,
  BellRing,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Interfaces
interface Notification {
  _id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'project_update' | 'deadline' | 'budget_alert'
  priority: 'low' | 'medium' | 'high'
  isRead: boolean
  createdAt: Date
  sender?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  relatedTo?: string
  relatedModel?: string
  actionRequired?: boolean
}

interface NotificationFilter {
  type?: string
  priority?: string
  isRead?: boolean
  search?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  projectUpdates: boolean
  deadlineReminders: boolean
  budgetAlerts: boolean
  taskAssignments: boolean
  commentNotifications: boolean
}

const notificationTypes = [
  { value: "info", label: "Información", icon: Info, color: "bg-blue-500" },
  { value: "success", label: "Éxito", icon: CheckCircle2, color: "bg-green-500" },
  { value: "warning", label: "Advertencia", icon: AlertTriangle, color: "bg-amber-500" },
  { value: "error", label: "Error", icon: AlertCircle, color: "bg-red-500" },
  { value: "project_update", label: "Actualización de Proyecto", icon: Target, color: "bg-purple-500" },
  { value: "deadline", label: "Fecha Límite", icon: Calendar, color: "bg-orange-500" },
  { value: "budget_alert", label: "Alerta de Presupuesto", icon: DollarSign, color: "bg-red-500" }
]

const priorityTypes = [
  { value: "low", label: "Baja", color: "bg-green-500" },
  { value: "medium", label: "Media", color: "bg-amber-500" },
  { value: "high", label: "Alta", color: "bg-red-500" }
]

interface AdvancedNotificationsProps {
  projectId?: string
}

export default function AdvancedNotifications({ projectId }: AdvancedNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  
  // Estados de filtros
  const [filters, setFilters] = useState<NotificationFilter>({})
  
  // Estados del formulario
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    recipients: [] as string[],
    scheduledFor: "",
    relatedTo: projectId || "",
    relatedModel: projectId ? "Project" : ""
  })
  
  // Estados de configuración
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    deadlineReminders: true,
    budgetAlerts: true,
    taskAssignments: true,
    commentNotifications: true
  })

  // Cargar notificaciones
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true)
        
        // Simular carga de notificaciones - reemplazar con llamada a API real
        const mockNotifications: Notification[] = [
          {
            _id: "1",
            title: "Nuevo comentario en tarea",
            message: "Juan Pérez ha comentado en la tarea 'Diseño de interfaz'",
            type: "info",
            priority: "medium",
            isRead: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
            sender: {
              _id: "user1",
              firstName: "Juan",
              lastName: "Pérez",
              email: "juan@example.com"
            },
            relatedTo: projectId,
            relatedModel: "Project"
          },
          {
            _id: "2",
            title: "Alerta de presupuesto",
            message: "El proyecto ha excedido el 80% de su presupuesto asignado",
            type: "budget_alert",
            priority: "high",
            isRead: false,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
            relatedTo: projectId,
            relatedModel: "Project",
            actionRequired: true
          },
          {
            _id: "3",
            title: "Fecha límite próxima",
            message: "La tarea 'Desarrollo backend' vence en 2 días",
            type: "deadline",
            priority: "high",
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
            relatedTo: projectId,
            relatedModel: "Project"
          }
        ]
        
        setNotifications(mockNotifications)
        setFilteredNotifications(mockNotifications)
      } catch (error) {
        console.error("Error loading notifications:", error)
        toast.error("Error al cargar las notificaciones")
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [projectId])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...notifications]

    // Filtro por pestaña activa
    if (activeTab === "unread") {
      filtered = filtered.filter(n => !n.isRead)
    } else if (activeTab === "read") {
      filtered = filtered.filter(n => n.isRead)
    } else if (activeTab === "high_priority") {
      filtered = filtered.filter(n => n.priority === "high")
    }

    // Filtros adicionales
    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter(n => n.type === filters.type)
    }

    if (filters.priority && filters.priority !== "all") {
      filtered = filtered.filter(n => n.priority === filters.priority)
    }

    if (filters.isRead !== undefined) {
      filtered = filtered.filter(n => n.isRead === filters.isRead)
    }

    if (filters.search) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        n.message.toLowerCase().includes(filters.search!.toLowerCase())
      )
    }

    setFilteredNotifications(filtered)
  }, [notifications, filters, activeTab])

  // Marcar como leída
  const markAsRead = async (notificationId: string) => {
    try {
      // Llamada a API para marcar como leída
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      )
      toast.success("Notificación marcada como leída")
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast.error("Error al marcar la notificación como leída")
    }
  }

  // Marcar múltiples como leídas
  const markMultipleAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(n => selectedNotifications.includes(n._id) ? { ...n, isRead: true } : n)
      )
      setSelectedNotifications([])
      toast.success(`${selectedNotifications.length} notificaciones marcadas como leídas`)
    } catch (error) {
      console.error("Error marking notifications as read:", error)
      toast.error("Error al marcar las notificaciones como leídas")
    }
  }

  // Eliminar notificación
  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
      toast.success("Notificación eliminada")
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Error al eliminar la notificación")
    }
  }

  // Eliminar múltiples
  const deleteMultiple = async () => {
    try {
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n._id)))
      setSelectedNotifications([])
      toast.success(`${selectedNotifications.length} notificaciones eliminadas`)
    } catch (error) {
      console.error("Error deleting notifications:", error)
      toast.error("Error al eliminar las notificaciones")
    }
  }

  // Crear nueva notificación
  const createNotification = async () => {
    try {
      // Llamada a API para crear notificación
      toast.success("Notificación creada correctamente")
      setShowCreateModal(false)
      setNotificationForm({
        title: "",
        message: "",
        type: "info",
        priority: "medium",
        recipients: [],
        scheduledFor: "",
        relatedTo: projectId || "",
        relatedModel: projectId ? "Project" : ""
      })
    } catch (error) {
      console.error("Error creating notification:", error)
      toast.error("Error al crear la notificación")
    }
  }

  // Obtener ícono del tipo de notificación
  const getNotificationIcon = (type: string) => {
    const typeInfo = notificationTypes.find(t => t.value === type)
    if (typeInfo) {
      const Icon = typeInfo.icon
      return <Icon className="h-4 w-4" />
    }
    return <Bell className="h-4 w-4" />
  }

  // Obtener color del tipo
  const getNotificationColor = (type: string) => {
    const typeInfo = notificationTypes.find(t => t.value === type)
    return typeInfo?.color || "bg-gray-500"
  }

  // Estadísticas
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    highPriority: notifications.filter(n => n.priority === "high").length,
    actionRequired: notifications.filter(n => n.actionRequired).length
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            {projectId ? "Notificaciones del Proyecto" : "Centro de Notificaciones"}
          </h2>
          <p className="text-muted-foreground">
            Gestiona y revisa todas las notificaciones del sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettingsModal(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Button>
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Notificación
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold">{stats.total}</h3>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-600">{stats.unread}</h3>
              <p className="text-sm text-muted-foreground">Sin Leer</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-red-600">{stats.highPriority}</h3>
              <p className="text-sm text-muted-foreground">Alta Prioridad</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-orange-600">{stats.actionRequired}</h3>
              <p className="text-sm text-muted-foreground">Requieren Acción</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y controles */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            {/* Pestañas */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="unread">Sin Leer ({stats.unread})</TabsTrigger>
                <TabsTrigger value="read">Leídas</TabsTrigger>
                <TabsTrigger value="high_priority">Alta Prioridad</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Controles */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Buscar notificaciones..."
                  className="pl-8"
                  value={filters.search || ""}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>

              {/* Filtros */}
              <div className="flex space-x-2">
                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) => setFilters({...filters, type: value === "all" ? undefined : value})}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {notificationTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.priority || "all"}
                  onValueChange={(value) => setFilters({...filters, priority: value === "all" ? undefined : value})}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {priorityTypes.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Acciones masivas */}
              {selectedNotifications.length > 0 && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={markMultipleAsRead}>
                    <Check className="mr-2 h-4 w-4" />
                    Marcar como leídas ({selectedNotifications.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={deleteMultiple}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar ({selectedNotifications.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de notificaciones */}
      <Card>
        <CardContent className="p-0">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "flex items-start space-x-4 p-4 transition-colors hover:bg-muted/50",
                    !notification.isRead && "bg-blue-50 border-l-4 border-l-blue-500"
                  )}
                >
                  {/* Checkbox de selección */}
                  <Checkbox
                    checked={selectedNotifications.includes(notification._id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedNotifications([...selectedNotifications, notification._id])
                      } else {
                        setSelectedNotifications(selectedNotifications.filter(id => id !== notification._id))
                      }
                    }}
                  />

                  {/* Ícono del tipo */}
                  <div className={cn(
                    "rounded-full p-2 text-white",
                    getNotificationColor(notification.type)
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          {notification.sender && (
                            <span>Por {notification.sender.firstName} {notification.sender.lastName}</span>
                          )}
                          <span>•</span>
                          <span>{formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: es })}</span>
                        </div>
                      </div>

                      {/* Badges y acciones */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge className={priorityTypes.find(p => p.value === notification.priority)?.color}>
                          {priorityTypes.find(p => p.value === notification.priority)?.label}
                        </Badge>
                        
                        {notification.actionRequired && (
                          <Badge variant="destructive">Acción Requerida</Badge>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.isRead && (
                              <DropdownMenuItem onClick={() => markAsRead(notification._id)}>
                                <Check className="mr-2 h-4 w-4" />
                                Marcar como leída
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Archive className="mr-2 h-4 w-4" />
                              Archivar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => deleteNotification(notification._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
              <p className="text-muted-foreground">
                {notifications.length === 0 
                  ? "No tienes notificaciones en este momento"
                  : "No hay notificaciones que coincidan con los filtros aplicados"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear notificación */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Notificación</DialogTitle>
            <DialogDescription>
              Crea una nueva notificación para enviar a los usuarios
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                placeholder="Título de la notificación"
              />
            </div>

            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                placeholder="Contenido de la notificación"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select 
                  value={notificationForm.type} 
                  onValueChange={(value) => setNotificationForm({...notificationForm, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Prioridad</Label>
                <Select 
                  value={notificationForm.priority} 
                  onValueChange={(value) => setNotificationForm({...notificationForm, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityTypes.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="scheduledFor">Programar para (opcional)</Label>
              <Input
                id="scheduledFor"
                type="datetime-local"
                value={notificationForm.scheduledFor}
                onChange={(e) => setNotificationForm({...notificationForm, scheduledFor: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={createNotification}>
              <Send className="mr-2 h-4 w-4" />
              Enviar Notificación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de configuración */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración de Notificaciones</DialogTitle>
            <DialogDescription>
              Configura tus preferencias de notificaciones
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email">Notificaciones por Email</Label>
                <p className="text-sm text-muted-foreground">Recibir notificaciones en tu correo</p>
              </div>
              <Switch
                id="email"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push">Notificaciones Push</Label>
                <p className="text-sm text-muted-foreground">Notificaciones en tiempo real</p>
              </div>
              <Switch
                id="push"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="projects">Actualizaciones de Proyectos</Label>
                <p className="text-sm text-muted-foreground">Cambios en estado y progreso</p>
              </div>
              <Switch
                id="projects"
                checked={settings.projectUpdates}
                onCheckedChange={(checked) => setSettings({...settings, projectUpdates: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="deadlines">Recordatorios de Fecha Límite</Label>
                <p className="text-sm text-muted-foreground">Alertas antes de vencimientos</p>
              </div>
              <Switch
                id="deadlines"
                checked={settings.deadlineReminders}
                onCheckedChange={(checked) => setSettings({...settings, deadlineReminders: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="budget">Alertas de Presupuesto</Label>
                <p className="text-sm text-muted-foreground">Notificaciones de exceso de gastos</p>
              </div>
              <Switch
                id="budget"
                checked={settings.budgetAlerts}
                onCheckedChange={(checked) => setSettings({...settings, budgetAlerts: checked})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success("Configuración guardada")
              setShowSettingsModal(false)
            }}>
              Guardar Configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 