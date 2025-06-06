"use client"

import { useState, useEffect } from "react"
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
  }, [page, limit, statusFilter, priorityFilter, searchTerm])

  // Navegar al detalle de un proyecto
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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">Gestiona los proyectos y sus asignaciones</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={() => router.push('/docs?section=projects')}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Documentación</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="h-9"
            onClick={() => router.push('/proyectos/nuevo')}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Nuevo Proyecto</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="netflix-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Proyectos</p>
                <h3 className="mt-1 text-2xl font-bold">{totalProjects}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="netflix-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Progreso</p>
                <h3 className="mt-1 text-2xl font-bold">{activeProjects}</h3>
              </div>
              <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="netflix-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completados</p>
                <h3 className="mt-1 text-2xl font-bold">{completedProjects}</h3>
              </div>
              <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="netflix-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retrasados</p>
                <h3 className="mt-1 text-2xl font-bold">{delayedProjects}</h3>
              </div>
              <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card className="netflix-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar proyectos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select 
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[120px] h-9">
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
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-none rounded-l-md"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-none rounded-r-md"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de proyectos */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects?.length === 0 ? (
        <Card className="netflix-card">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No hay proyectos</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No se encontraron proyectos con los filtros actuales.
              </p>
              <Button 
                className="mt-4" 
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects?.map((project) => (
            <Card 
              key={project._id} 
              className="netflix-card h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] bg-gradient-to-br from-card to-card/60"
              onClick={() => handleProjectClick(project._id || '')}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="line-clamp-1 text-base flex items-center">
                      {project.name}
                      {project.priority === "high" && (
                        <span className="ml-2 flex h-2 w-2 rounded-full bg-red-500" title="Alta prioridad"></span>
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 pt-1">
                      {project.description || "Sin descripción"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/proyectos/${project._id}/edit`);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-500 focus:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmation(project._id || '');
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusText(project.status)}
                    </Badge>
                    <Badge className={getPriorityColor(project.priority || '')}>
                      {project.priority === "high" 
                        ? "Alta" 
                        : project.priority === "medium" 
                          ? "Media" 
                          : "Baja"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress 
                      value={project.progress || 0} 
                      className="h-1.5" 
                      indicatorClassName={
                        (project.progress || 0) === 100 
                          ? "bg-green-500" 
                          : (project.progress || 0) > 60 
                            ? "bg-blue-500" 
                            : "bg-amber-500"
                      }
                    />
                  </div>
                  
                  {/* Días restantes */}
                  {project.status !== 'completed' && project.status !== 'canceled' && (
                    <div className="mt-2 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{calculateRemainingDays(project.endDate)} días restantes</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Fecha inicio</p>
                      <p className="font-medium">{formatDate(project.startDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Fecha fin</p>
                      <p className="font-medium">{formatDate(project.endDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Cliente</p>
                      <p className="font-medium line-clamp-1">
                        {typeof project.client === 'string' 
                          ? project.client 
                          : project.client?.name || "Sin cliente"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Responsable</p>
                      <p className="font-medium line-clamp-1">
                        {typeof project.manager === 'string' 
                          ? project.manager 
                          : project.manager?.firstName + ' ' + project.manager?.lastName || "Sin asignar"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Presupuesto */}
                  <div className="grid grid-cols-2 gap-2 pt-0 text-xs">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Presupuesto</p>
                      <p className="font-medium">${project.budget || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Gastado</p>
                      <p className="font-medium">${project.spent || 0}</p>
                    </div>
                  </div>

                  {/* Miembros del equipo */}
                  {Array.isArray(project.assignedTo) && project.assignedTo.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1.5">Equipo</p>
                      <div className="flex -space-x-2 overflow-hidden">
                        {project.assignedTo.slice(0, 3).map((member: any, index: number) => (
                          <div 
                            key={index} 
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary ring-2 ring-background"
                            title={typeof member === 'string' 
                              ? member
                              : `${member.firstName} ${member.lastName}`}
                          >
                            {typeof member === 'string' 
                              ? member.substring(0, 2).toUpperCase()
                              : `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`}
                          </div>
                        ))}
                        {project.assignedTo.length > 3 && (
                          <div 
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary ring-2 ring-background"
                            title="Más miembros del equipo"
                          >
                            +{project.assignedTo.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project._id || '');
                    }}
                  >
                    Ver detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Vista de lista
        <Card className="netflix-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead className="hidden md:table-cell">Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Fechas</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects?.map((project) => (
                  <TableRow 
                    key={project._id} 
                    className="cursor-pointer"
                    onClick={() => handleProjectClick(project._id || '')}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {project.description || "Sin descripción"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusText(project.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress || 0} className="h-2 w-20" />
                        <span className="text-xs">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="line-clamp-1">
                        {typeof project.client === 'string' 
                          ? project.client 
                          : project.client?.name || "Sin cliente"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col text-xs">
                        <span>Inicio: {formatDate(project.startDate)}</span>
                        <span>Fin: {formatDate(project.endDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/proyectos/${project._id}/edit`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProjectClick(project._id || '');
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmation(project._id || '');
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination className="mx-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i} className={i + 1 === page ? "font-bold" : ""}>
                <PaginationLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                  isActive={i + 1 === page}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Diálogo de confirmación para eliminar */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 max-w-md netflix-card">
            <CardHeader>
              <CardTitle>Confirmar eliminación</CardTitle>
              <CardDescription>
                ¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.
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
                onClick={() => handleDeleteProject(deleteConfirmation)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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