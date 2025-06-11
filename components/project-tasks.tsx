"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, addDays, addWeeks, addMonths } from 'date-fns'
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
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
import { toast } from "sonner"
import { formatDate, getStatusColor } from "./projects-dashboard"
import { projectService } from "@/lib/services/projectService"
import { Project, ProjectTask } from "@/lib/types/project"
import TaskComments from "./task-comments"

const getTaskStatusIcon = (status: string, blocked?: boolean) => {
  if (blocked) {
    return <Lock className="h-4 w-4 text-amber-500" />
  }
  
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "in-progress":
      return <Clock className="h-4 w-4 text-blue-500" />
    case "pending":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    default:
      return null
  }
}

const getTaskStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "Completada"
    case "in-progress":
      return "En Progreso"
    case "pending":
      return "Pendiente"
    case "canceled":
      return "Cancelada"
    default:
      return status
  }
}

interface ProjectTasksProps {
  project: Project;
}

export default function ProjectTasks({ project }: ProjectTasksProps) {
  // Log para verificar que los datos del proyecto son correctos
  console.log("Datos del proyecto para gestión de tareas:", project);
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null)
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)
  const [showAddTask, setShowAddTask] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [useDuration, setUseDuration] = useState(false)
  const [durationType, setDurationType] = useState<'days' | 'weeks' | 'months'>('weeks')
  const [durationValue, setDurationValue] = useState(1)
  const [newTask, setNewTask] = useState<Partial<ProjectTask>>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo: "",
    dependencies: [],
    budget: 0,
    partialBudget: 0,
    spent: 0
  })

  // Cargar usuarios disponibles
  useEffect(() => {
    async function loadAvailableUsers() {
      try {
        setLoadingUsers(true);
        
        // Importar el servicio de empleados dinámicamente para evitar dependencias circulares
        const EmployeeService = (await import('@/lib/services/employeeService')).default;
        
        // Llamar a la API para obtener la lista real de empleados
        const employeeResponse = await EmployeeService.getEmployees({
          page: 1,
          limit: 100
        });
        
        if (employeeResponse && employeeResponse.data) {
          setAvailableUsers(employeeResponse.data);
        } else {
          // Fallback a datos de ejemplo si no hay respuesta
          console.warn("No se recibieron datos de empleados, usando datos de ejemplo");
          const mockUsers = [
            { _id: "user1", firstName: "Juan", lastName: "Pérez", position: "Desarrollador" },
            { _id: "user2", firstName: "Ana", lastName: "García", position: "Diseñadora" },
            { _id: "user3", firstName: "Carlos", lastName: "Rodríguez", position: "Project Manager" },
            { _id: "user4", firstName: "María", lastName: "López", position: "QA Tester" },
            { _id: "user5", firstName: "Luis", lastName: "Martínez", position: "Backend Developer" }
          ];
          
          setAvailableUsers(mockUsers);
        }
      } catch (err) {
        console.error("Error cargando usuarios:", err);
        
        // En caso de error, usar datos de ejemplo como fallback
        const mockUsers = [
          { _id: "user1", firstName: "Juan", lastName: "Pérez", position: "Desarrollador" },
          { _id: "user2", firstName: "Ana", lastName: "García", position: "Diseñadora" },
          { _id: "user3", firstName: "Carlos", lastName: "Rodríguez", position: "Project Manager" },
          { _id: "user4", firstName: "María", lastName: "López", position: "QA Tester" },
          { _id: "user5", firstName: "Luis", lastName: "Martínez", position: "Backend Developer" }
        ];
        
        setAvailableUsers(mockUsers);
      } finally {
        setLoadingUsers(false);
      }
    }
    
    loadAvailableUsers();
  }, []);

  // Cargar tareas del proyecto
  useEffect(() => {
    async function loadTasks() {
      if (!project || !project._id) {
        console.warn("No se pudo cargar tareas: falta ID del proyecto");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log(`Cargando tareas del proyecto con ID: ${project._id}`);
        
        // Llamar al servicio para obtener las tareas del proyecto
        const taskData = await projectService.getProjectTasks(project._id.toString());
        console.log(`Tareas cargadas:`, taskData);
        
        if (Array.isArray(taskData)) {
          setTasks(taskData);
        } else {
          console.warn("El formato de las tareas recibidas no es un array:", taskData);
          setTasks([]);
        }
      } catch (err) {
        console.error("Error cargando tareas:", err);
        setError("No se pudieron cargar las tareas del proyecto");
        toast.error("Error al cargar las tareas");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [project]);

  // Filtrar tareas por búsqueda y estado
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      (task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (typeof task.assignedTo === 'object' && task.assignedTo 
        ? `${task.assignedTo.firstName || ''} ${task.assignedTo.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
        : false);
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Función para calcular la fecha de fin basada en la fecha de inicio y duración
  const calculateEndDate = (startDate: string, durationType: string, durationValue: number): string => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    let end;
    
    switch (durationType) {
      case 'days':
        end = addDays(start, durationValue);
        break;
      case 'weeks':
        end = addWeeks(start, durationValue);
        break;
      case 'months':
        end = addMonths(start, durationValue);
        break;
      default:
        end = addWeeks(start, durationValue);
    }
    
    return end.toISOString().split('T')[0];
  };

  // Efecto para actualizar la fecha de fin cuando cambia la duración
  useEffect(() => {
    if (useDuration && newTask.startDate) {
      const endDate = calculateEndDate(
        typeof newTask.startDate === 'string' ? newTask.startDate : newTask.startDate.toString(),
        durationType,
        durationValue
      );
      setNewTask({...newTask, dueDate: endDate});
    }
  }, [useDuration, newTask.startDate, durationType, durationValue]);

  // Actualizar el botón de editar tarea para que abra el formulario de edición
  const handleEditTask = async (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    
    // Resetear los estados de duración
    setUseDuration(false);
    setDurationType('weeks');
    setDurationValue(1);
    
    // Asignar los valores de la tarea a editar
    setNewTask({
      _id: task._id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'medium',
      startDate: typeof task.startDate === 'string' ? task.startDate : task.startDate?.toString() || '',
      dueDate: typeof task.dueDate === 'string' ? task.dueDate : task.dueDate?.toString() || '',
      assignedTo: typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?._id || '',
      dependencies: task.dependencies || [],
      budget: task.budget || 0,
      partialBudget: task.partialBudget || 0,
      spent: task.spent || 0
    });
    
    // Abrir el formulario
    setShowAddTask(true);
  };
  
  // Modificar el handleCreateTask para manejar tanto creación como actualización
  const handleCreateTask = async () => {
    if (!project || !project._id) return;
    
    try {
      setLoading(true);
      
      // Verificar si estamos editando o creando
      if (newTask._id) {
        // Actualizar tarea existente
        const updatedTask = await projectService.updateProjectTask(
          project._id.toString(),
          newTask._id.toString(),
          newTask
        );
        
        // Actualizar el estado local
        setTasks(tasks.map(task => task._id === newTask._id ? updatedTask : task));
        toast.success("Tarea actualizada correctamente");
      } else {
        // Crear nueva tarea
        const createdTask = await projectService.createProjectTask(
          project._id.toString(),
          newTask as Omit<ProjectTask, '_id'>
        );
        
        setTasks([...tasks, createdTask]);
        toast.success("Tarea creada correctamente");
      }
      
      setShowAddTask(false);
      
      // Resetear formulario
      setNewTask({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignedTo: "",
        dependencies: [],
        budget: 0,
        partialBudget: 0,
        spent: 0
      });
      
      // Resetear estados de duración
      setUseDuration(false);
      setDurationType('weeks');
      setDurationValue(1);
      
    } catch (err) {
      console.error("Error en operación de tarea:", err);
      toast.error("Error al procesar la tarea");
    } finally {
      setLoading(false);
    }
  };

  // Manejar actualización de estado de tarea
  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!project || !project._id) return;
    
    try {
      setLoading(true);
      
      // Actualizar estado local primero para feedback inmediato
      setTasks(tasks.map(task => 
        task._id === taskId 
          ? { 
            ...task, 
            status: newStatus as "pending" | "in_progress" | "completed" | "cancelled"
          }
          : task
      ));
      
      // Llamar al API para actualizar en el servidor
      await projectService.updateProjectTask(
        project._id.toString(),
        taskId,
        { 
          status: newStatus as "pending" | "in_progress" | "completed" | "cancelled"
        }
      );
      
      toast.success("Estado de tarea actualizado");
    } catch (err) {
      console.error("Error actualizando estado de tarea:", err);
      
      // Revertir el cambio local si falla
      setTasks(tasks.map(task => task._id === taskId ? task : task));
      toast.error("Error al actualizar el estado");
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de tarea
  const handleDeleteTask = async (taskId: string) => {
    if (!project || !project._id) return
    
    try {
      setLoading(true)
      
      // Eliminar la tarea de la API
      await projectService.deleteProjectTask(project._id.toString(), taskId)
      
      // Actualizar estado local
      const updatedTasks = tasks.filter(task => task._id !== taskId)
      setTasks(updatedTasks)
      
      // Si la tarea eliminada estaba seleccionada, deseleccionarla
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(null)
      }
      
      toast.success("Tarea eliminada correctamente")
    } catch (err) {
      console.error("Error eliminando tarea:", err)
      toast.error("Error al eliminar la tarea")
    } finally {
      setLoading(false)
      setDeleteConfirmation(null)
    }
  }

  // Si está cargando y no hay tareas aún, mostrar indicador
  if (loading && tasks.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
          <h3 className="font-medium">Cargando tareas</h3>
          <p className="text-sm text-muted-foreground">Obteniendo las tareas del proyecto...</p>
        </div>
      </div>
    )
  }

  // Si hay un error, mostrar mensaje
  if (error) {
    return (
      <Card className="netflix-card">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
            <h3 className="text-lg font-medium">Error al cargar las tareas</h3>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Button 
              className="mt-4" 
              onClick={async () => {
                try {
                  setLoading(true)
                  setError(null)
                  if (project && project._id) {
                    const taskData = await projectService.getProjectTasks(project._id.toString())
                    setTasks(taskData)
                  }
                } catch (err) {
                  console.error("Error recargando tareas:", err)
                  setError("No se pudieron cargar las tareas del proyecto")
                } finally {
                  setLoading(false)
                }
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Encabezado de tareas */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Tareas del Proyecto</h2>
          <p className="text-muted-foreground">Gestiona las tareas, dependencias y asignaciones</p>
        </div>
        <div>
          <Button onClick={() => setShowAddTask(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card className="netflix-card overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar tareas..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select 
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tareas */}
      <Card className="netflix-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/10 hover:bg-transparent">
              <TableHead className="w-10">Estado</TableHead>
              <TableHead>Tarea</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="w-10">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow 
                key={task._id} 
                className={`border-b border-border/10 hover:bg-muted/5 ${selectedTask?._id === task._id ? 'bg-muted/10' : ''}`}
                onClick={() => setSelectedTask(task)}
              >
                <TableCell>
                  {getTaskStatusIcon(task.status)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{task.title}</div>

                    {task.dependencies && task.dependencies.length > 0 && (
                      <Badge variant="outline" className="border-blue-500 text-blue-500">
                        {task.dependencies.length} dependencias
                      </Badge>
                    )}
                    <Badge className={getStatusColor(task.status)}>
                      {getTaskStatusText(task.status)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div>Inicio: {formatDate(task.startDate || task.createdAt || '')}</div>
                    <div>Fin: {formatDate(task.dueDate || '')}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {task.assignedTo ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {typeof task.assignedTo === 'string' 
                          ? task.assignedTo.substring(0, 2).toUpperCase()
                          : `${task.assignedTo.firstName.charAt(0)}${task.assignedTo.lastName.charAt(0)}`}
                      </div>
                      <span className="text-sm">
                        {typeof task.assignedTo === 'string'
                          ? task.assignedTo
                          : `${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sin asignar</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditTask(task._id!)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {task.status !== "completed" && (
                        <DropdownMenuItem 
                          className="cursor-pointer text-green-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpdateTaskStatus(task._id!, "completed")
                          }}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Marcar completada
                        </DropdownMenuItem>
                      )}
                      
                      {task.status !== "in_progress" && task.status !== "completed" && (
                        <DropdownMenuItem 
                          className="cursor-pointer text-blue-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpdateTaskStatus(task._id!, "in_progress")
                          }}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Iniciar tarea
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirmation(task._id!)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <ListTodo className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-lg font-medium">No hay tareas</p>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm || statusFilter !== "all"
                        ? "No se encontraron tareas con esos criterios de búsqueda"
                        : "Este proyecto aún no tiene tareas asignadas"}
                    </p>
                    {(searchTerm || statusFilter !== "all") && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          setSearchTerm("")
                          setStatusFilter("all")
                        }}
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Detalles de la tarea seleccionada */}
      {selectedTask && (
        <>
          <Card className="netflix-card">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedTask.title}</CardTitle>
                  <CardDescription>{selectedTask.description || "Sin descripción"}</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setSelectedTask(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Información Básica</h3>
                  <div className="space-y-2 rounded-lg border border-border/40 bg-muted/20 p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Estado</p>
                        <Badge className={getStatusColor(selectedTask.status)}>
                          {getTaskStatusText(selectedTask.status)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha inicio</p>
                        <p className="text-sm font-medium">
                          {formatDate(selectedTask.startDate || selectedTask.createdAt || '')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha fin</p>
                        <p className="text-sm font-medium">
                          {formatDate(selectedTask.dueDate || '')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Responsable</p>
                      <p className="text-sm font-medium">
                        {selectedTask.assignedTo 
                          ? (typeof selectedTask.assignedTo === 'string'
                              ? selectedTask.assignedTo
                              : `${selectedTask.assignedTo.firstName} ${selectedTask.assignedTo.lastName}`)
                          : "Sin asignar"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium">Prioridad y Dependencias</h3>
                  <div className="space-y-2 rounded-lg border border-border/40 bg-muted/20 p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Prioridad</p>
                      <Badge 
                        className={
                          selectedTask.priority === "high" 
                            ? "bg-red-950/30 text-red-400 border border-red-800/30" 
                            : selectedTask.priority === "low" 
                              ? "bg-green-950/30 text-green-400 border border-green-800/30"
                              : "bg-amber-950/30 text-amber-400 border border-amber-800/30"
                        }
                      >
                        {selectedTask.priority === "high" 
                          ? "Alta" 
                          : selectedTask.priority === "low" 
                            ? "Baja" 
                            : "Media"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dependencias</p>
                      {selectedTask.dependencies && selectedTask.dependencies.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {selectedTask.dependencies.map((depId) => (
                            <Badge key={depId} variant="outline">
                              Tarea #{depId}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sin dependencias</p>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm"
                  onClick={() => handleEditTask(selectedTask._id!)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar tarea
                </Button>
                
                {selectedTask.status !== "completed" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-green-600"
                    onClick={() => handleUpdateTaskStatus(selectedTask._id!, "completed")}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Marcar como completada
                  </Button>
                )}
                
                {selectedTask.status === "pending" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-blue-600"
                    onClick={() => handleUpdateTaskStatus(selectedTask._id!, "in_progress")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Iniciar tarea
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Añadir sección de comentarios */}
          {selectedTask._id && (
            <div className="mt-4">
              <TaskComments 
                projectId={project._id?.toString() || ''} 
                taskId={selectedTask._id.toString()} 
              />
            </div>
          )}
        </>
      )}

      {/* Diálogo de confirmación para eliminar tarea */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 max-w-md netflix-card">
            <CardHeader>
              <CardTitle>Confirmar eliminación</CardTitle>
              <CardDescription>
                ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirmation(null)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleDeleteTask(deleteConfirmation)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar tarea"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Diálogo para agregar nueva tarea */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newTask._id ? "Editar tarea" : "Agregar nueva tarea"}</DialogTitle>
            <DialogDescription>
              {newTask._id 
                ? "Modifica los detalles de la tarea seleccionada."
                : "Crea una nueva tarea para este proyecto. Los campos marcados con * son obligatorios."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="task-title" className="text-sm font-medium">
                Nombre de la tarea *
              </label>
              <Input
                id="task-title"
                placeholder="Ej. Diseño de interfaz"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="task-description" className="text-sm font-medium">
                Descripción
              </label>
              <Input
                id="task-description"
                placeholder="Descripción de la tarea"
                value={newTask.description || ''}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="task-status" className="text-sm font-medium">
                  Estado *
                </label>
                <Select value={newTask.status} onValueChange={(value) => setNewTask({...newTask, status: value as "pending" | "in_progress" | "completed" | "cancelled"})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_progress">En progreso</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="task-priority" className="text-sm font-medium">
                  Prioridad *
                </label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({...newTask, priority: value as "low" | "medium" | "high"})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="task-start-date" className="text-sm font-medium">
                  Fecha inicio *
                </label>
                <Input
                  id="task-start-date"
                  type="date"
                  value={typeof newTask.startDate === 'string' ? newTask.startDate : ''}
                  onChange={(e) => {
                    const startDate = e.target.value;
                    const newTaskData = {...newTask, startDate};
                    
                    // Si estamos usando duración, actualizar la fecha de fin
                    if (useDuration) {
                      const endDate = calculateEndDate(startDate, durationType, durationValue);
                      newTaskData.dueDate = endDate;
                    }
                    
                    setNewTask(newTaskData);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="use-duration" className="text-sm font-medium">
                    Usar duración
                  </label>
                  <input 
                    type="checkbox" 
                    id="use-duration"
                    checked={useDuration}
                    onChange={(e) => setUseDuration(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
                
                {useDuration ? (
                  <div className="flex space-x-2">
                    <Input 
                      type="number" 
                      min="1"
                      value={durationValue}
                      onChange={(e) => setDurationValue(Number(e.target.value) || 1)}
                      className="w-20"
                    />
                    <Select
                      value={durationType}
                      onValueChange={(value) => setDurationType(value as 'days' | 'weeks' | 'months')}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Días</SelectItem>
                        <SelectItem value="weeks">Semanas</SelectItem>
                        <SelectItem value="months">Meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label htmlFor="task-end-date" className="text-sm font-medium">
                      Fecha fin *
                    </label>
                    <Input
                      id="task-end-date"
                      type="date"
                      value={typeof newTask.dueDate === 'string' ? newTask.dueDate : ''}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="task-assignee" className="text-sm font-medium">
                Responsable
              </label>
              <Select
                value={newTask.assignedTo?.toString() || 'none'}
                onValueChange={(value) => setNewTask({...newTask, assignedTo: value === 'none' ? '' : value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {availableUsers.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.position})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Campo de presupuesto */}
            <div className="space-y-2">
              <label htmlFor="task-partial-budget" className="text-sm font-medium">
                Presupuesto Parcial ($)
              </label>
              <Input
                id="task-partial-budget"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newTask.partialBudget || ''}
                onChange={(e) => setNewTask({...newTask, partialBudget: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            {/* Campo para seleccionar dependencias */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Dependencias
              </label>
              <div className="relative">
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !newTask.dependencies?.includes(value)) {
                      setNewTask({
                        ...newTask,
                        dependencies: [...(newTask.dependencies || []), value]
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar dependencias" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.length > 0 ? (
                      tasks
                        .filter(t => t._id && t._id !== newTask._id)
                        .map(task => (
                          <SelectItem key={task._id} value={task._id || ''}>
                            {task.title}
                          </SelectItem>
                        ))
                    ) : (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        {loading ? "Cargando tareas..." : "No hay tareas disponibles"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Mostrar dependencias seleccionadas */}
              {newTask.dependencies && newTask.dependencies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {newTask.dependencies.map(depId => {
                    const depTask = tasks.find(t => t._id === depId);
                    return (
                      <Badge key={depId} variant="outline" className="flex items-center gap-1">
                        {depTask ? depTask.title : `Tarea #${depId}`}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => {
                            setNewTask({
                              ...newTask,
                              dependencies: newTask.dependencies?.filter(id => id !== depId)
                            });
                          }}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTask(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateTask} 
              disabled={!newTask.title || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {newTask._id ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                newTask._id ? "Actualizar tarea" : "Crear tarea"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 