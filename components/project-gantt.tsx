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
import { addDays, addWeeks, addMonths } from "date-fns"

import { formatDate } from "./projects-dashboard"

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
  bloqueada?: boolean
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

// Función para obtener el color de la barra basado en el estado y progreso
const getBarColor = (estado: string, progreso: number) => {
  if (estado === "completado") return "bg-green-500/70"
  if (estado === "en_progreso") return "bg-blue-500/70"
  if (estado === "pendiente") return "bg-amber-500/70"
  return "bg-slate-500/70"
}

// Función para calcular la posición y ancho de la barra en el cronograma
const calculateBarPosition = (
  taskStart: Date,
  taskEnd: Date,
  projectStart: Date,
  projectEnd: Date,
  zoomLevel: number = 1
) => {
  const projectDuration = projectEnd.getTime() - projectStart.getTime()
  const taskStartOffset = taskStart.getTime() - projectStart.getTime()
  const taskDuration = taskEnd.getTime() - taskStart.getTime()
  
  // Aplicar el nivel de zoom al cálculo
  const startPercent = (taskStartOffset / projectDuration) * 100 * zoomLevel
  const widthPercent = (taskDuration / projectDuration) * 100 * zoomLevel
  
  return {
    left: `${startPercent}%`,
    width: `${widthPercent}%`,
  }
}

// Función para calcular la posición de la barra de progreso
const calculateProgressBar = (width: string, progreso: number) => {
  const numericWidth = parseFloat(width)
  return `${(numericWidth * progreso) / 100}%`
}

// Función para generar las fechas de las columnas
const generateTimelineDates = (startDate: Date, endDate: Date, interval: string) => {
  const dates = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    
    if (interval === "dias") {
      currentDate.setDate(currentDate.getDate() + 1)
    } else if (interval === "semanas") {
      currentDate.setDate(currentDate.getDate() + 7)
    } else if (interval === "meses") {
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
  }
  
  return dates
}

// Función para formatear la fecha según el intervalo
const formatTimelineDate = (date: Date, interval: string) => {
  if (interval === "dias") {
    return date.getDate().toString()
  } else if (interval === "semanas") {
    return `S${Math.ceil((date.getDate() + date.getDay()) / 7)}`
  } else if (interval === "meses") {
    return date.toLocaleDateString("es-ES", { month: "short" })
  }
  return ""
}

// Función para convertir una fecha de string a formato YYYY-MM-DD para inputs
const formatDateForInput = (dateString: string) => {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

export default function ProjectGantt({ project }: ProjectGanttProps) {
  // Log para verificar que los datos del proyecto son correctos
  console.log("Datos del proyecto para el diagrama Gantt:", project);
  const [timelineScale, setTimelineScale] = useState<"dias" | "semanas" | "meses">("semanas")
  // Estados para arrastre - deshabilitados pero mantenidos para compatibilidad
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<"move" | "start" | "end" | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null)
  const [initialPosition, setInitialPosition] = useState({ x: 0, clientX: 0 })
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const ganttContainerRef = useRef<HTMLDivElement>(null)
  const [projectData, setProjectData] = useState<Project>(project)
  const [savingChanges, setSavingChanges] = useState(false)
  // Agregar estado para el nivel de zoom
  const [zoomLevel, setZoomLevel] = useState(1)
  // Añadir estados para duración personalizada
  const [useDuration, setUseDuration] = useState(false)
  const [durationType, setDurationType] = useState<'days' | 'weeks' | 'months'>('weeks')
  const [durationValue, setDurationValue] = useState(1)
  
  // Ordenar tareas por fecha de inicio
  const sortedTasks = [...projectData.tareas].sort((a, b) => 
    new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
  )
  
  // Calcular el rango de fechas del proyecto
  const projectStartDate = new Date(projectData.fechaInicio)
  const projectEndDate = new Date(projectData.fechaFin)
  
  // Generar las fechas para las columnas
  const timelineDates = generateTimelineDates(projectStartDate, projectEndDate, timelineScale)
  
  // Encontrar tareas con desviación
  const tasksWithDelay = sortedTasks.filter(task => 
    task.estado === "en_progreso" && new Date(task.fechaFin) < new Date()
  )

  // Función para calcular la fecha de fin basada en la fecha de inicio y duración
  const calculateEndDate = (startDate: string, durationType: 'days' | 'weeks' | 'months', durationValue: number): string => {
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
    
    return formatDateForInput(end.toISOString());
  };

  // Efecto para actualizar la fecha de fin cuando cambia la duración
  useEffect(() => {
    if (useDuration && startDate) {
      const newEndDate = calculateEndDate(startDate, durationType, durationValue);
      setEndDate(newEndDate);
    }
  }, [useDuration, startDate, durationType, durationValue]);

  // NOTA: Las funciones de edición están deshabilitadas según la solicitud del usuario
  
  // Función para manejar el inicio del arrastre - DESHABILITADA
  const handleMouseDown = (
    e: React.MouseEvent, 
    taskId: number, 
    type: "move" | "start" | "end"
  ) => {
    // Función deshabilitada - solo prevenir el comportamiento predeterminado
    e.preventDefault();
    // No activamos el arrastre
  }
  
  // Función para manejar el movimiento durante el arrastre - DESHABILITADA
  const handleMouseMove = (e: MouseEvent) => {
    // Función deshabilitada - no hace nada
    return;
  }
  
  // Función para manejar el fin del arrastre - DESHABILITADA
  const handleMouseUp = async () => {
    // Función deshabilitada - no hace nada
    return;
  }
  
  // Función para guardar los cambios en la tarea - DESHABILITADA
  const saveTaskChanges = async (taskId: number) => {
    // Función deshabilitada - no hace nada
    return;
  }
  
  // Función para abrir el modal de edición - DESHABILITADA
  const openEditModal = (task: Task) => {
    // Función deshabilitada - no hace nada
    return;
  }
  
  // Función para guardar los cambios del modal - DESHABILITADA
  const handleSaveModalChanges = async () => {
    // Función deshabilitada - no hace nada
    return;
  }

  // Función para incrementar el zoom
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3)) // Limitar el zoom máximo a 3x
  }
  
  // Función para reducir el zoom
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5)) // Limitar el zoom mínimo a 0.5x
  }

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Cronograma del Proyecto</h2>
          <p className="text-muted-foreground">Visualización temporal de tareas y dependencias</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Printer className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Maximize2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Pantalla completa</span>
          </Button>
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Total de tareas</span>
              <span className="text-2xl font-bold">{sortedTasks.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Tareas completadas</span>
              <span className="text-2xl font-bold">
                {sortedTasks.filter(t => t.estado === "completado").length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">En progreso</span>
              <span className="text-2xl font-bold">
                {sortedTasks.filter(t => t.estado === "en_progreso").length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Pendientes</span>
              <span className="text-2xl font-bold">
                {sortedTasks.filter(t => t.estado === "pendiente").length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles del cronograma */}
      <Card className="netflix-card overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Select
                defaultValue={timelineScale}
                onValueChange={(value) => setTimelineScale(value as "dias" | "semanas" | "meses")}
              >
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Escala de tiempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dias">Días</SelectItem>
                  <SelectItem value="semanas">Semanas</SelectItem>
                  <SelectItem value="meses">Meses</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9"
                onClick={handleZoomIn}
                title={`Acercar (Nivel actual: x${zoomLevel.toFixed(2)})`}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9"
                onClick={handleZoomOut}
                title={`Alejar (Nivel actual: x${zoomLevel.toFixed(2)})`}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                Zoom: x{zoomLevel.toFixed(2)}
              </span>
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              <span>Filtros</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cronograma Gantt */}
      <Card className="netflix-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div 
              className="min-w-[800px]" 
              ref={ganttContainerRef}
              style={{ width: zoomLevel > 1 ? `${Math.ceil(zoomLevel * 100)}%` : 'auto' }}
            >
              {/* Cabecera del cronograma */}
              <div className="flex border-b border-border/10">
                <div className="w-1/4 min-w-[200px] border-r border-border/10 p-4">
                  <span className="font-medium">Tareas</span>
                </div>
                <div className="w-3/4 p-2">
                  <div className="flex">
                    {timelineDates.map((date, index) => (
                      <div key={index} className="flex-1 text-center">
                        <span className="text-xs font-medium">
                          {formatTimelineDate(date, timelineScale)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filas de tareas */}
              {sortedTasks.map((task) => {
                const taskStartDate = new Date(task.fechaInicio)
                const taskEndDate = new Date(task.fechaFin)
                
                // Calcular la posición de la barra basada en las fechas
                const { left, width } = calculateBarPosition(
                  taskStartDate,
                  taskEndDate,
                  projectStartDate,
                  projectEndDate,
                  zoomLevel
                )
                
                // Determinar el color de la barra basado en el estado y progreso
                const barColor = getBarColor(task.estado, task.progreso)
                
                // Calcular la barra de progreso
                const progressStyle = calculateProgressBar(width, task.progreso)
                
                return (
                  <div key={task.id} className="flex border-b border-border/10 hover:bg-muted/20">
                    {/* Información de la tarea */}
                    <div className="w-1/4 min-w-[200px] border-r border-border/10 p-4 flex items-center">
                      <div>
                        <h3 className="font-medium text-sm">
                          <span className="cursor-default">{task.nombre}</span>
                        </h3>
                        <div className="flex items-center mt-1 space-x-2">
                          <Badge 
                            variant={task.estado === "completado" ? "secondary" : task.estado === "en_progreso" ? "default" : "secondary"}
                          >
                            {task.estado === "completado" 
                              ? "Completada" 
                              : task.estado === "en_progreso" 
                                ? "En progreso" 
                                : "Pendiente"}
                          </Badge>
                          {task.responsable && (
                            <div 
                              className="flex -space-x-1 cursor-default"
                              title={task.responsable.nombre}
                            >
                              <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground ring-2 ring-background">
                                {task.responsable.iniciales}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de la tarea */}
                    <div className="w-3/4 p-4 relative">
                      <div
                        className="absolute h-8 rounded-md bg-primary/20 border border-primary cursor-default"
                        style={{
                          left: left,
                          width: width,
                          backgroundColor: `${barColor}30`, // Color con opacidad
                          borderColor: barColor
                        }}
                      >
                        {/* Barra de progreso */}
                        <div 
                          className="h-full rounded-md bg-primary"
                          style={{
                            width: progressStyle,
                            backgroundColor: barColor,
                          }}
                        ></div>
                        
                        {/* Información sobre la tarea */}
                        <div className="absolute top-0 left-0 h-full w-full flex items-center justify-between px-2 text-xs font-medium">
                          <div className="flex items-center space-x-1 whitespace-nowrap overflow-hidden">
                            <span className="overflow-hidden text-ellipsis">{task.nombre}</span>
                          </div>
                          <div className="whitespace-nowrap">
                            {task.progreso}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas para tareas con retraso */}
      {tasksWithDelay.length > 0 && (
        <Card className="bg-warning/10 border-warning">
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-warning mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Tareas con desviación</h3>
                <p className="text-sm text-muted-foreground">
                  {tasksWithDelay.length} {tasksWithDelay.length === 1 ? "tarea ha" : "tareas han"} superado su fecha estimada de finalización.
                </p>
                <div className="mt-2 space-y-1">
                  {tasksWithDelay.map(task => (
                    <div key={task.id} className="text-sm flex items-center">
                      <div className="w-2 h-2 rounded-full bg-warning mr-2"></div>
                      <span>{task.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 