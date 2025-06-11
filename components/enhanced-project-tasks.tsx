"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, addDays, addWeeks, addMonths, isAfter, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ListTodo,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  ExternalLink,
  Lock,
  Loader2,
  CalendarDays,
  Users,
  X,
  RefreshCw,
  DollarSign,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  FileText,
  Flag,
  GitBranch,
  Zap,
  Timer,
  Target,
  Save,
  Calendar,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { formatDate, getStatusColor } from "./projects-dashboard"
import { projectService } from "@/lib/services/projectService"
import { Project, ProjectTask } from "@/lib/types/project"
import { Employee } from "@/lib/types/employee"
import EmployeeService from "@/lib/services/employeeService"

// Tipos para la gestión avanzada de tareas
interface EnhancedProjectTask extends ProjectTask {
  dependencies?: string[]
  priority: 'low' | 'medium' | 'high'
  blocked?: boolean
  comments?: TaskComment[]
  tags?: string[]
  estimatedHours?: number
  actualHours?: number
  completedAt?: Date
  budget?: number
  spent?: number
  progress?: number
}

interface TaskComment {
  _id: string
  content: string
  author: Employee
  createdAt: Date
  updatedAt?: Date
}

interface TaskFilter {
  status?: string
  priority?: string
  assignee?: string
  search?: string
  showCompleted?: boolean
  showBlocked?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

const taskStatuses = [
  { value: "pending", label: "Pendiente", color: "bg-amber-500", icon: Clock },
  { value: "in_progress", label: "En Progreso", color: "bg-blue-500", icon: Zap },
  { value: "completed", label: "Completado", color: "bg-green-500", icon: CheckCircle2 },
  { value: "blocked", label: "Bloqueado", color: "bg-red-500", icon: Lock },
  { value: "cancelled", label: "Cancelado", color: "bg-gray-500", icon: X }
]

const taskPriorities = [
  { value: "low", label: "Baja", color: "bg-green-500", icon: ArrowDown },
  { value: "medium", label: "Media", color: "bg-amber-500", icon: ArrowUp },
  { value: "high", label: "Alta", color: "bg-red-500", icon: Flag }
]

interface EnhancedProjectTasksProps {
  project: Project
}

export default function EnhancedProjectTasks({ project }: EnhancedProjectTasksProps) {
  const [tasks, setTasks] = useState<EnhancedProjectTask[]>([])
  const [filteredTasks, setFilteredTasks] = useState<EnhancedProjectTask[]>([])
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedTask, setSelectedTask] = useState<EnhancedProjectTask | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "board" | "calendar">("list")
  
  // Estados de filtros
  const [filters, setFilters] = useState<TaskFilter>({
    showCompleted: true,
    showBlocked: true
  })
  
  // Estados del formulario de tarea
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    assignedTo: "",
    startDate: "",
    dueDate: "",
    estimatedHours: "",
    budget: "",
    dependencies: [] as string[],
    tags: [] as string[],
    blocked: false
  })

  // Estados para comentarios
  const [newComment, setNewComment] = useState("")
  const [loadingComments, setLoadingComments] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Cargar empleados
        const employeesResponse = await EmployeeService.getEmployees({ page: 1, limit: 100 })
        setEmployees(employeesResponse.data)
        
        // Cargar tareas del proyecto
        if (project.tasks && Array.isArray(project.tasks)) {
          const enhancedTasks = project.tasks.map(task => ({
            ...task,
            dependencies: [],
            priority: 'medium' as const,
            blocked: false,
            comments: [],
            tags: [],
            estimatedHours: 0,
            actualHours: 0
          }))
          setTasks(enhancedTasks)
          setFilteredTasks(enhancedTasks)
        }
      } catch (error) {
        console.error("Error loading task data:", error)
        toast.error("Error al cargar los datos de tareas")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [project])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...tasks]

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(task => task.status === filters.status)
    }

    if (filters.priority && filters.priority !== "all") {
      filtered = filtered.filter(task => task.priority === filters.priority)
    }

    if (filters.assignee && filters.assignee !== "all") {
      filtered = filtered.filter(task => {
        const assignee = typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?._id
        return assignee === filters.assignee
      })
    }

    if (filters.search) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        (task.description?.toLowerCase().includes(filters.search!.toLowerCase()))
      )
    }

    if (!filters.showCompleted) {
      filtered = filtered.filter(task => task.status !== "completed")
    }

    if (!filters.showBlocked) {
      filtered = filtered.filter(task => !task.blocked)
    }

    setFilteredTasks(filtered)
  }, [tasks, filters])

  // Manejar creación/edición de tarea
  const handleSaveTask = async () => {
    try {
      const taskData = {
        ...taskForm,
        startDate: taskForm.startDate ? new Date(taskForm.startDate) : undefined,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate) : undefined,
        estimatedHours: taskForm.estimatedHours ? parseInt(taskForm.estimatedHours) : 0,
        budget: taskForm.budget ? parseFloat(taskForm.budget) : 0,
        status: taskForm.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
        priority: taskForm.priority as 'low' | 'medium' | 'high'
      }

      if (selectedTask) {
        // Actualizar tarea existente
        const updatedTask = await projectService.updateProjectTask(
          project._id!.toString(),
          selectedTask._id!,
          taskData
        )
        
        setTasks(prev => prev.map(t => t._id === selectedTask._id ? { 
          ...t, 
          ...updatedTask, 
          ...taskData,
          priority: taskData.priority,
          status: taskData.status 
        } as EnhancedProjectTask : t))
        toast.success("Tarea actualizada correctamente")
      } else {
        // Crear nueva tarea
        const newTask = await projectService.createProjectTask(
          project._id!.toString(),
          taskData
        )
        
        setTasks(prev => [...prev, { 
          ...newTask, 
          ...taskData,
          priority: taskData.priority,
          status: taskData.status,
          dependencies: [],
          comments: [],
          tags: [],
          blocked: taskForm.blocked
        } as EnhancedProjectTask])
        toast.success("Tarea creada correctamente")
      }

      setShowTaskModal(false)
      resetTaskForm()
    } catch (error) {
      console.error("Error saving task:", error)
      toast.error("Error al guardar la tarea")
    }
  }

  // Resetear formulario
  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      assignedTo: "",
      startDate: "",
      dueDate: "",
      estimatedHours: "",
      budget: "",
      dependencies: [],
      tags: [],
      blocked: false
    })
    setSelectedTask(null)
  }

  // Abrir modal de edición
  const handleEditTask = (task: EnhancedProjectTask) => {
    setSelectedTask(task)
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status || "pending",
      priority: task.priority || "medium",
      assignedTo: typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?._id || "",
      startDate: task.startDate ? format(new Date(task.startDate), 'yyyy-MM-dd') : "",
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : "",
      estimatedHours: task.estimatedHours?.toString() || "",
      budget: task.budget?.toString() || "",
      dependencies: task.dependencies || [],
      tags: task.tags || [],
      blocked: task.blocked || false
    })
    setShowTaskModal(true)
  }

  // Eliminar tarea
  const handleDeleteTask = async (taskId: string) => {
    try {
      await projectService.deleteProjectTask(project._id!.toString(), taskId)
      setTasks(prev => prev.filter(t => t._id !== taskId))
      toast.success("Tarea eliminada correctamente")
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Error al eliminar la tarea")
    }
  }

  // Obtener ícono de estado
  const getStatusIcon = (status: string, blocked?: boolean) => {
    if (blocked) return <Lock className="h-4 w-4 text-red-500" />
    
    const statusInfo = taskStatuses.find(s => s.value === status)
    if (statusInfo) {
      const Icon = statusInfo.icon
      return <Icon className="h-4 w-4" />
    }
    return <Clock className="h-4 w-4" />
  }

  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    const priorityInfo = taskPriorities.find(p => p.value === priority)
    return priorityInfo?.color || "bg-gray-500"
  }

  // Calcular estadísticas
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    blocked: tasks.filter(t => t.blocked).length,
    overdue: tasks.filter(t => {
      if (!t.dueDate || t.status === "completed") return false
      return isAfter(new Date(), new Date(t.dueDate))
    }).length
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
      {/* Encabezado y estadísticas */}
      <div className="space-y-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">Gestión de Tareas</h2>
            <p className="text-muted-foreground">Administra las tareas del proyecto de forma avanzada</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={() => setShowTaskModal(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Tarea
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
                <h3 className="text-2xl font-bold text-amber-600">{stats.pending}</h3>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-blue-600">{stats.inProgress}</h3>
                <p className="text-sm text-muted-foreground">En Progreso</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
                <p className="text-sm text-muted-foreground">Completadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-red-600">{stats.blocked}</h3>
                <p className="text-sm text-muted-foreground">Bloqueadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-orange-600">{stats.overdue}</h3>
                <p className="text-sm text-muted-foreground">Vencidas</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtros y controles */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Buscar tareas..."
                className="pl-8"
                value={filters.search || ""}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>

            {/* Filtros */}
            <div className="flex space-x-2">
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => setFilters({...filters, status: value === "all" ? undefined : value})}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {taskStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
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
                  {taskPriorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.assignee || "all"}
                onValueChange={(value) => setFilters({...filters, assignee: value === "all" ? undefined : value})}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Asignado a" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {employees.map(employee => (
                    <SelectItem key={employee._id} value={employee._id || ""}>
                      {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Opciones de vista */}
            <div className="flex space-x-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.showCompleted}
                  onCheckedChange={(checked) => setFilters({...filters, showCompleted: checked === true})}
                />
                <Label className="text-sm">Completadas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.showBlocked}
                  onCheckedChange={(checked) => setFilters({...filters, showBlocked: checked === true})}
                />
                <Label className="text-sm">Bloqueadas</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tareas */}
      <Card>
        <CardContent className="p-0">
          {filteredTasks.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">Estado</TableHead>
                    <TableHead>Tarea</TableHead>
                    <TableHead>Asignado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead>Presupuesto</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const isOverdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate)) && task.status !== "completed"
                    
                    return (
                      <TableRow key={task._id} className={isOverdue ? "bg-red-50" : ""}>
                        <TableCell>
                          {getStatusIcon(task.status || "pending", task.blocked)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {task.description}
                              </div>
                            )}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex space-x-1">
                                {task.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {task.assignedTo ? (
                            <div className="flex items-center space-x-2">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                {typeof task.assignedTo === 'string' 
                                  ? task.assignedTo.substring(0, 2).toUpperCase()
                                  : `${task.assignedTo.firstName?.charAt(0)}${task.assignedTo.lastName?.charAt(0)}`}
                              </div>
                              <span className="text-sm">
                                {typeof task.assignedTo === 'string' 
                                  ? task.assignedTo
                                  : `${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin asignar</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getPriorityColor(task.priority || "medium")} text-white`}>
                            {taskPriorities.find(p => p.value === task.priority)?.label || "Media"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{task.progress || 0}%</span>
                              <Badge variant="outline">
                                {taskStatuses.find(s => s.value === task.status)?.label || "Pendiente"}
                              </Badge>
                            </div>
                            <Progress value={task.progress || 0} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {task.startDate && (
                              <div>Inicio: {format(new Date(task.startDate), 'dd/MM/yy')}</div>
                            )}
                            {task.dueDate && (
                              <div className={isOverdue ? "text-red-600 font-medium" : ""}>
                                Fin: {format(new Date(task.dueDate), 'dd/MM/yy')}
                                {isOverdue && <span className="ml-1">⚠️</span>}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div>Pres: ${task.budget || 0}</div>
                            <div>Gast: ${task.spent || 0}</div>
                            {task.estimatedHours && (
                              <div>{task.estimatedHours}h est.</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedTask(task)
                                setShowCommentsModal(true)
                              }}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Comentarios
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTask(task._id!)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ListTodo className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No hay tareas</h3>
              <p className="text-muted-foreground mb-4">
                {tasks.length === 0 
                  ? "No se han creado tareas para este proyecto" 
                  : "No hay tareas que coincidan con los filtros aplicados"}
              </p>
              <Button onClick={() => setShowTaskModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear primera tarea
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de tarea */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? "Editar Tarea" : "Nueva Tarea"}
            </DialogTitle>
            <DialogDescription>
              {selectedTask 
                ? "Modifica los detalles de la tarea"
                : "Crea una nueva tarea para el proyecto"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Nombre de la tarea</Label>
                <Input
                  id="title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  placeholder="Nombre de la tarea"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  placeholder="Descripción detallada de la tarea"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={taskForm.status} onValueChange={(value) => setTaskForm({...taskForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({...taskForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskPriorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignedTo">Asignado a</Label>
                <Select value={taskForm.assignedTo} onValueChange={(value) => setTaskForm({...taskForm, assignedTo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {employees.map(employee => (
                      <SelectItem key={employee._id} value={employee._id || ""}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimatedHours">Horas estimadas</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={taskForm.estimatedHours}
                  onChange={(e) => setTaskForm({...taskForm, estimatedHours: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="startDate">Fecha de inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={taskForm.startDate}
                  onChange={(e) => setTaskForm({...taskForm, startDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="dueDate">Fecha de fin</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="budget">Presupuesto ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={taskForm.budget}
                  onChange={(e) => setTaskForm({...taskForm, budget: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={taskForm.blocked}
                    onCheckedChange={(checked) => setTaskForm({...taskForm, blocked: checked === true})}
                  />
                  <Label>Tarea bloqueada</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowTaskModal(false)
              resetTaskForm()
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTask}>
              <Save className="mr-2 h-4 w-4" />
              {selectedTask ? "Actualizar" : "Crear"} Tarea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 