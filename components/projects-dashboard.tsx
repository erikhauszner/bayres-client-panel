"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  LayoutGrid,
  LayoutList,
  Search,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  CalendarDays,
  Users,
  DollarSign,
  Loader2,
  ExternalLink,
  Building,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { toast } from "sonner"
import { projectService } from "@/lib/services/projectService"
import { Project, ProjectFilters } from "@/lib/types/project"

// Se mantienen los datos estáticos como fallback
import { projectsData as staticProjectsData } from "@/data/projects-data"

// Función para calcular los días restantes
export const calculateRemainingDays = (endDate: string | Date): number => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// Funciones auxiliares
export const formatDate = (dateString: string | Date) => {
  if (!dateString) return "N/A";
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" }
  return new Date(dateString).toLocaleDateString("es-ES", options)
}

export const getStatusText = (estado: string) => {
  switch (estado) {
    case "pending":
    case "pendiente":
      return "Pendiente"
    case "planning":
    case "planificacion":
      return "Planificación"
    case "active":
    case "in_progress":
    case "en_progreso":
      return "En Progreso"
    case "paused":
    case "pausado":
      return "Pausado"
    case "completed":
    case "completado":
      return "Completado"
    case "canceled":
    case "cancelado":
      return "Cancelado"
    default:
      return "Desconocido"
  }
}

export const getStatusColor = (estado: string) => {
  const statusKey = estado.toLowerCase()
  
  if (statusKey.includes("pend")) {
    return "bg-amber-950/30 text-amber-400 border border-amber-800/30"
  } else if (statusKey.includes("plan")) {
    return "bg-purple-950/30 text-purple-400 border border-purple-800/30"
  } else if (statusKey.includes("progress") || statusKey.includes("active")) {
    return "bg-blue-950/30 text-blue-400 border border-blue-800/30"
  } else if (statusKey.includes("paus")) {
    return "bg-slate-950/30 text-slate-400 border border-slate-800/30"
  } else if (statusKey.includes("complet")) {
    return "bg-green-950/30 text-green-400 border border-green-800/30"
  } else if (statusKey.includes("cancel")) {
    return "bg-red-950/30 text-red-400 border border-red-800/30"
  } else {
    return "bg-slate-950/30 text-slate-400 border border-slate-800/30"
  }
}

export const getPriorityColor = (prioridad: string) => {
  const priorityKey = prioridad.toLowerCase()
  
  if (priorityKey.includes("low") || priorityKey.includes("baja")) {
    return "bg-green-950/30 text-green-400 border border-green-800/30"
  } else if (priorityKey.includes("med")) {
    return "bg-amber-950/30 text-amber-400 border border-amber-800/30"
  } else if (priorityKey.includes("high") || priorityKey.includes("alta")) {
    return "bg-red-950/30 text-red-400 border border-red-800/30"
  } else {
    return "bg-slate-950/30 text-slate-400 border border-slate-800/30"
  }
}

export const isDelayed = (task: any) => {
  return (
    task.bloqueada || 
    (task.estado === "en_progreso" && new Date(task.fechaFin) < new Date())
  )
}

export default function ProjectsDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [totalProjects, setTotalProjects] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(8)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  const filters: ProjectFilters = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    search: searchTerm !== "" ? searchTerm : undefined,
    page,
    limit
  }

  // Cargar proyectos al iniciar o cambiar filtros
  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true)
        console.log("Cargando proyectos con filtros:", filters)
        
        const response = await projectService.getProjects(filters)
        console.log("Respuesta de la API:", response)
        
        // El servicio ahora maneja la transformación, así que siempre debería tener la estructura correcta
        if (response && response.data) {
          setProjects(response.data)
          setFilteredProjects(response.data)
          setTotalProjects(response.total || response.data.length)
          console.log("Proyectos cargados:", response.data.length)
        } else {
          console.warn("Respuesta vacía o no válida:", response)
          throw new Error("No se recibieron datos de proyectos")
        }
      } catch (error: any) {
        console.error("Error cargando proyectos:", error)
        toast.error("Error al cargar los proyectos")
        
        // Depurar el error de la API
        if (error.response) {
          console.error("Detalles del error:", {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          })
        }
        
        // Usar datos estáticos como fallback
        console.log("Usando datos estáticos como fallback")
        setProjects(staticProjectsData as unknown as Project[])
        setFilteredProjects(staticProjectsData as unknown as Project[])
        setTotalProjects(staticProjectsData.length)
      } finally {
        setLoading(false)
      }
    }
    
    loadProjects()
  }, [page, statusFilter, priorityFilter, searchTerm, limit])

  const handleProjectClick = (projectId: string | number) => {
    router.push(`/proyectos/${projectId}`)
  }

  // Eliminar un proyecto
  const handleDeleteProject = async (projectId: string) => {
    try {
      setLoading(true)
      await projectService.deleteProject(projectId)
      toast.success("Proyecto eliminado correctamente")
      
      // Actualizar la lista de proyectos
      const updatedProjects = projects.filter(p => p._id !== projectId)
      setProjects(updatedProjects)
      setFilteredProjects(updatedProjects)
      
      // Si era el último proyecto de la página, volver a la página anterior
      if (updatedProjects.length === 0 && page > 1) {
        setPage(page - 1)
      }
    } catch (error) {
      console.error("Error eliminando proyecto:", error)
      toast.error("Error al eliminar el proyecto")
    } finally {
      setLoading(false)
      setDeleteConfirmation(null)
    }
  }

  // Calcular el número de páginas total
  const totalPages = Math.ceil(totalProjects / limit)

  // Calcular proyectos por estado
  const activeProjects = projects?.filter(p => p.status === "active" || p.status === "in_progress")?.length || 0
  const completedProjects = projects?.filter(p => p.status === "completed")?.length || 0
  
  // Simplificada para mostrar solo proyectos con tareas retrasadas, sin verificar el detalle
  const delayedProjects = projects?.filter(p => {
    const endDate = new Date(p.endDate)
    return p.status === "active" && endDate < new Date()
  })?.length || 0

  return (
    <div className="w-full mx-auto max-w-full space-y-4 px-2 sm:px-4">
      {/* Encabezado */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-sm text-muted-foreground">Gestiona los proyectos y sus asignaciones</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-2 sm:px-3"
            onClick={() => router.push('/docs?section=projects')}
          >
            <FileText className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Documentación</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="h-9 px-2 sm:px-3"
            onClick={() => router.push('/proyectos/nuevo')}
          >
            <Briefcase className="h-4 w-4 sm:mr-2" />
            <span className="hidden xs:inline">Nuevo Proyecto</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
        <Card className="netflix-card">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Proyectos</p>
                <h3 className="mt-1 text-lg sm:text-2xl font-bold">{totalProjects}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-1 sm:p-2 text-primary">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="netflix-card">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">En Progreso</p>
                <h3 className="mt-1 text-lg sm:text-2xl font-bold">{activeProjects}</h3>
              </div>
              <div className="rounded-full bg-blue-500/10 p-1 sm:p-2 text-blue-500">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="netflix-card">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Completados</p>
                <h3 className="mt-1 text-lg sm:text-2xl font-bold">{completedProjects}</h3>
              </div>
              <div className="rounded-full bg-green-500/10 p-1 sm:p-2 text-green-500">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="netflix-card">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Retrasados</p>
                <h3 className="mt-1 text-lg sm:text-2xl font-bold">{delayedProjects}</h3>
              </div>
              <div className="rounded-full bg-amber-500/10 p-1 sm:p-2 text-amber-500">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card className="netflix-card overflow-hidden">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-auto sm:flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar proyectos..."
                className="pl-8 w-full h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                className="h-9 w-full sm:w-auto"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                <span>Filtros</span>
              </Button>
              
              <div className="flex rounded-md border h-9">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="h-full w-9 px-0 rounded-none rounded-l-md"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className="h-full w-9 px-0 rounded-none rounded-r-md"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <Select 
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="planning">Planificación</SelectItem>
                  <SelectItem value="active">En Progreso</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={priorityFilter}
                onValueChange={setPriorityFilter}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de proyectos */}
      {loading ? (
        <div className="flex h-40 sm:h-60 items-center justify-center">
          <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects?.length === 0 ? (
        <Card className="netflix-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">No hay proyectos</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                No se encontraron proyectos con los filtros actuales.
              </p>
              <Button 
                className="mt-3 sm:mt-4 text-xs sm:text-sm" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        // Vista de cuadrícula
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects?.map((project) => (
            <Card 
              key={project._id} 
              className="netflix-card h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] bg-gradient-to-br from-card to-card/60"
              onClick={() => handleProjectClick(project._id || '')}
            >
              <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1 text-sm sm:text-base flex items-center">
                      {project.name}
                      {project.priority === "high" && (
                        <span className="ml-2 flex h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-red-500" title="Alta prioridad"></span>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {project.description || "Sin descripción"}
                    </p>
                  </div>
                  <div className="flex">
                    <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="space-y-2 text-xs sm:text-sm">
                  {/* Fechas */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarDays className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                      <span className="text-xs sm:text-xs">Inicio: {formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarDays className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                      <span className="text-xs sm:text-xs">Fin: {formatDate(project.endDate)}</span>
                    </div>
                  </div>
                  
                  {/* Progreso */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Progreso</span>
                      <span className="text-xs font-medium">{project.progress || 0}%</span>
                    </div>
                    <Progress value={project.progress || 0} className="h-1.5" />
                  </div>
                  
                  {/* Cliente */}
                  {project.client && (
                    <div className="flex items-center text-xs">
                      <Building className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground line-clamp-1">
                        Cliente: {typeof project.client === 'string' ? project.client : project.client.name}
                      </span>
                    </div>
                  )}
                  
                  {/* Presupuesto si está disponible */}
                  {project.budget && (
                    <div className="flex items-center text-xs">
                      <DollarSign className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Presupuesto: ${project.budget.toLocaleString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Vista de lista
        <Card className="netflix-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Nombre del Proyecto</TableHead>
                  <TableHead className="hidden sm:table-cell">Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Progreso</TableHead>
                  <TableHead className="hidden lg:table-cell">Fechas</TableHead>
                  <TableHead className="hidden xl:table-cell">Cliente</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects?.map((project) => (
                  <TableRow key={project._id} className="h-[60px]">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          <Badge variant="outline" className={getPriorityColor(project.priority || '')}>
                            {project.priority === "low" ? "Baja" : 
                            project.priority === "medium" ? "Media" : "Alta"}
                          </Badge>
                        </div>
                        <div className="truncate">
                          <div className="font-medium text-sm truncate">{project.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {project.description && project.description.length > 30 ? 
                              `${project.description.substring(0, 30)}...` : 
                              project.description || "Sin descripción"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusText(project.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="w-full space-y-1">
                        <Progress value={project.progress || 0} className="h-1.5" />
                        <span className="text-xs text-right block">{project.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col space-y-0.5">
                        <div className="flex items-center">
                          <CalendarDays className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">Inicio: {formatDate(project.startDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarDays className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">Fin: {formatDate(project.endDate)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {project.client ? (
                        <div className="flex items-center">
                          <Building className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span className="text-xs truncate">
                            {typeof project.client === 'string' ? project.client : project.client.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No asignado</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProjectClick(project._id || '')
                            }}
                            className="text-xs sm:text-sm"
                          >
                            <ExternalLink className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Ver detalles</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/proyectos/${project._id}/editar`)
                            }}
                            className="text-xs sm:text-sm"
                          >
                            <Edit className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Editar proyecto</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteConfirmation(project._id || '')
                            }}
                            className="text-red-600 text-xs sm:text-sm"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Mostrando {projects?.length} de {totalProjects} proyectos
          </div>
          <Pagination>
            <PaginationContent className="flex space-x-1">
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  className={`h-7 sm:h-8 min-w-7 sm:min-w-8 p-0 sm:px-2.5 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                .map((p, idx, arr) => {
                  // Mostrar puntos suspensivos para páginas omitidas
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && p - prevPage > 1;
                  
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && (
                        <PaginationItem className="flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center">
                          <span className="text-xs sm:text-sm">...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                          isActive={p === page}
                          className="h-7 sm:h-8 w-7 sm:w-8 p-0"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  );
                })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  className={`h-7 sm:h-8 min-w-7 sm:min-w-8 p-0 sm:px-2.5 ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Diálogo de confirmación para eliminar */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <Card className="max-w-md w-full netflix-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Confirmar eliminación</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                ¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs sm:text-sm"
                onClick={() => setDeleteConfirmation(null)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                size="sm"
                className="text-xs sm:text-sm"
                onClick={() => handleDeleteProject(deleteConfirmation)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar proyecto"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 