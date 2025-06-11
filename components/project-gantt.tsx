"use client"

import { useState, useRef, useEffect } from "react"
import {
  Calendar,
  Download,
  FileText,
  Filter,
  Maximize2,
  Printer,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  Edit,
  Save,
  X,
  Plus,
  Users,
  Clock,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { projectService } from "@/lib/services/projectService"
import { addDays, addWeeks, addMonths, format, isAfter, isBefore, differenceInDays } from "date-fns"
import { es } from 'date-fns/locale'

interface Task {
  id: number
  nombre: string
  estado: string
  progreso: number
  fechaInicio: string
  fechaFin: string
  responsable: {
    id: number
    nombre: string
    iniciales: string
  } | null
  presupuesto: number
  presupuestoGastado: number
  dependencias?: number[]
}

interface Project {
  id: number
  nombre: string
  fechaInicio: string
  fechaFin: string
  tareas: Task[]
}

interface ProjectGanttProps {
  project: Project
}

// Función para obtener el color de la barra basado en el estado
const getBarColor = (estado: string, isOverdue: boolean = false) => {
  if (isOverdue) return "bg-red-500"
  if (estado === "completed" || estado === "completado") return "bg-green-500"
  if (estado === "in_progress" || estado === "en_progreso") return "bg-blue-500"
  if (estado === "pending" || estado === "pendiente") return "bg-amber-500"
  if (estado === "cancelled" || estado === "cancelado") return "bg-gray-500"
  return "bg-slate-500"
}

// Función para calcular si una tarea está retrasada
const isTaskOverdue = (task: Task): boolean => {
  const today = new Date()
  const taskEnd = new Date(task.fechaFin)
  return isAfter(today, taskEnd) && task.estado !== "completed" && task.estado !== "completado"
}

// Función para calcular la posición y ancho de la barra en el cronograma
const calculateBarPosition = (
  taskStart: Date,
  taskEnd: Date,
  projectStart: Date,
  projectEnd: Date,
  containerWidth: number = 100
) => {
  const projectDuration = differenceInDays(projectEnd, projectStart)
  const taskStartOffset = differenceInDays(taskStart, projectStart)
  const taskDuration = differenceInDays(taskEnd, taskStart)
  
  if (projectDuration <= 0) return { left: 0, width: 100 }
  
  const startPercent = Math.max(0, (taskStartOffset / projectDuration) * 100)
  const widthPercent = Math.min(100 - startPercent, (taskDuration / projectDuration) * 100)
  
  return {
    left: `${startPercent}%`,
    width: `${Math.max(1, widthPercent)}%`,
  }
}

// Función para generar las fechas de las columnas del timeline
const generateTimelineDates = (startDate: Date, endDate: Date, scale: string) => {
  const dates = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    dates.push(new Date(current))
    
    if (scale === "days") {
      current.setDate(current.getDate() + 1)
    } else if (scale === "weeks") {
      current.setDate(current.getDate() + 7)
    } else if (scale === "months") {
      current.setMonth(current.getMonth() + 1)
    }
  }
  
  return dates
}

// Función para formatear la fecha según la escala
const formatTimelineDate = (date: Date, scale: string) => {
  if (scale === "days") {
    return format(date, 'dd/MM', { locale: es })
  } else if (scale === "weeks") {
    const weekNumber = Math.ceil(date.getDate() / 7)
    return `S${weekNumber}`
  } else if (scale === "months") {
    return format(date, 'MMM', { locale: es })
  }
  return ""
}

export default function ProjectGantt({ project }: ProjectGanttProps) {
  const [timelineScale, setTimelineScale] = useState<"days" | "weeks" | "months">("weeks")
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [savingChanges, setSavingChanges] = useState(false)
  const [filteredStatus, setFilteredStatus] = useState<string>("all")
  const [filteredAssignee, setFilteredAssignee] = useState<string>("all")
  
  // Calcular fechas del proyecto
  const projectStartDate = new Date(project.fechaInicio)
  const projectEndDate = new Date(project.fechaFin)
  
  // Filtrar tareas según criterios
  const filteredTasks = project.tareas.filter(task => {
    const statusMatch = filteredStatus === "all" || task.estado === filteredStatus
    const assigneeMatch = filteredAssignee === "all" || task.responsable?.id.toString() === filteredAssignee
    return statusMatch && assigneeMatch
  })
  
  // Ordenar tareas por fecha de inicio
  const sortedTasks = [...filteredTasks].sort((a, b) => 
    new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
  )
  
  // Generar timeline
  const timelineDates = generateTimelineDates(projectStartDate, projectEndDate, timelineScale)
  
  // Calcular estadísticas del proyecto
  const projectStats = {
    totalTasks: project.tareas.length,
    completedTasks: project.tareas.filter(t => t.estado === "completed" || t.estado === "completado").length,
    inProgressTasks: project.tareas.filter(t => t.estado === "in_progress" || t.estado === "en_progreso").length,
    overdueTasks: project.tareas.filter(isTaskOverdue).length,
    totalBudget: project.tareas.reduce((sum, t) => sum + t.presupuesto, 0),
    spentBudget: project.tareas.reduce((sum, t) => sum + t.presupuestoGastado, 0)
  }
  
  const completionPercentage = projectStats.totalTasks > 0 
    ? Math.round((projectStats.completedTasks / projectStats.totalTasks) * 100) 
    : 0

  // Abrir modal de edición
  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setStartDate(task.fechaInicio.split('T')[0])
    setEndDate(task.fechaFin.split('T')[0])
    setEditModalOpen(true)
  }

  // Guardar cambios en las fechas de la tarea
  const handleSaveModalChanges = async () => {
    if (!editingTask || !startDate || !endDate) return
    
    try {
      setSavingChanges(true)
      
      // Llamar al servicio para actualizar las fechas de la tarea
      await projectService.updateProjectTaskDates(
        project.id.toString(),
        editingTask.id.toString(),
        startDate,
        endDate
      )
      
      // Actualizar el estado local
      const updatedProject = {
        ...project,
        tareas: project.tareas.map(task => 
          task.id === editingTask.id 
            ? { ...task, fechaInicio: startDate, fechaFin: endDate }
            : task
        )
      }
      
      toast.success("Fechas de tarea actualizadas correctamente")
      setEditModalOpen(false)
      setEditingTask(null)
      
      // Recargar la página para reflejar los cambios
      window.location.reload()
    } catch (error) {
      console.error("Error al actualizar fechas:", error)
      toast.error("Error al actualizar las fechas de la tarea")
    } finally {
      setSavingChanges(false)
    }
  }

  // Exportar cronograma
  const exportGantt = () => {
    toast.info("Funcionalidad de exportación en desarrollo")
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas del proyecto */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{project.nombre}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {format(projectStartDate, 'dd MMM yyyy', { locale: es })} - {format(projectEndDate, 'dd MMM yyyy', { locale: es })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completionPercentage}%</div>
                <div className="text-xs text-muted-foreground">Completado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{projectStats.totalTasks}</div>
                <div className="text-xs text-muted-foreground">Tareas</div>
              </div>
              {projectStats.overdueTasks > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{projectStats.overdueTasks}</div>
                  <div className="text-xs text-muted-foreground">Retrasadas</div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controles y filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label>Escala:</Label>
              <Select value={timelineScale} onValueChange={(value: "days" | "weeks" | "months") => setTimelineScale(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Días</SelectItem>
                  <SelectItem value="weeks">Semanas</SelectItem>
                  <SelectItem value="months">Meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label>Estado:</Label>
              <Select value={filteredStatus} onValueChange={setFilteredStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />
            
            <Button variant="outline" size="sm" onClick={exportGantt}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cronograma principal */}
      <Card>
        <CardContent className="p-0">
          <div className="min-h-[600px]">
            {/* Header del cronograma */}
            <div className="grid grid-cols-12 border-b">
              <div className="col-span-4 p-4 bg-muted/20 border-r">
                <h3 className="font-medium">Tareas</h3>
              </div>
              <div className="col-span-8 p-2 bg-muted/20">
                <div className="grid grid-flow-col auto-cols-fr gap-1 text-xs text-center">
                  {timelineDates.map((date, index) => (
                    <div key={index} className="p-1 border-r border-border/40">
                      {formatTimelineDate(date, timelineScale)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contenido del cronograma */}
            <div className="max-h-[500px] overflow-y-auto">
              {sortedTasks.length > 0 ? (
                sortedTasks.map((task) => {
                  const taskStart = new Date(task.fechaInicio)
                  const taskEnd = new Date(task.fechaFin)
                  const isOverdue = isTaskOverdue(task)
                  const barPosition = calculateBarPosition(taskStart, taskEnd, projectStartDate, projectEndDate)
                  
                  return (
                    <div key={task.id} className="grid grid-cols-12 border-b hover:bg-muted/10">
                      {/* Información de la tarea */}
                      <div className="col-span-4 p-4 border-r">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{task.nombre}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(task)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge 
                              className={`${getBarColor(task.estado, isOverdue)} text-white text-xs`}
                            >
                              {task.estado === "completed" || task.estado === "completado" ? "Completado" :
                               task.estado === "in_progress" || task.estado === "en_progreso" ? "En Progreso" :
                               task.estado === "pending" || task.estado === "pendiente" ? "Pendiente" : "Cancelado"}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Retrasada
                              </Badge>
                            )}
                          </div>
                          
                          {task.responsable && (
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{task.responsable.nombre}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(taskStart, 'dd/MM', { locale: es })} - {format(taskEnd, 'dd/MM', { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Barra del cronograma */}
                      <div className="col-span-8 p-4 relative">
                        <div className="relative h-8 bg-gray-100 rounded">
                          <div 
                            className={`absolute top-0 h-full rounded ${getBarColor(task.estado, isOverdue)} transition-all duration-200`}
                            style={{
                              left: barPosition.left,
                              width: barPosition.width,
                            }}
                          >
                            <div className="h-full flex items-center justify-center text-white text-xs font-medium">
                              {task.progreso}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No hay tareas para mostrar con los filtros seleccionados</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de edición de fechas */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Fechas de Tarea</DialogTitle>
          </DialogHeader>
          
          {editingTask && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{editingTask.nombre}</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Modifica las fechas de inicio y fin de esta tarea
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Fecha de Inicio</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end-date">Fecha de Fin</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveModalChanges} disabled={savingChanges}>
              {savingChanges ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 