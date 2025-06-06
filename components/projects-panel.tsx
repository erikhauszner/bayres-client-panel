"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Bell,
  FileText,
  Edit,
  Trash2,
  Filter,
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowUpRight,
  LayoutGrid,
  LayoutList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import NewProjectForm from "@/components/new-project-form"
import { useRouter } from "next/navigation"

// Datos de ejemplo
const projectsData = [
  {
    id: 1,
    nombre: "Rediseño Web Corporativa",
    descripcion: "Rediseño completo del sitio web corporativo con nuevo branding",
    estado: "en_progreso",
    progreso: 65,
    fechaInicio: "2023-04-15",
    fechaFin: "2023-06-30",
    prioridad: "alta",
    cliente: {
      id: 2,
      nombre: "Tech Solutions",
      avatar: "/placeholder.svg?height=40&width=40",
      iniciales: "TS",
    },
    responsable: {
      id: 3,
      nombre: "Carlos Rodríguez",
      avatar: "/placeholder.svg?height=40&width=40",
      iniciales: "CR",
    },
    equipo: [
      {
        id: 3,
        nombre: "Carlos Rodríguez",
        avatar: "/placeholder.svg?height=40&width=40",
        iniciales: "CR",
      },
      {
        id: 4,
        nombre: "Laura Martínez",
        avatar: "/placeholder.svg?height=40&width=40",
        iniciales: "LM",
      },
    ],
  },
  {
    id: 2,
    nombre: "Campaña Marketing Digital",
    descripcion: "Campaña de marketing digital para lanzamiento de producto",
    estado: "pendiente",
    progreso: 0,
    fechaInicio: "2023-06-01",
    fechaFin: "2023-08-15",
    prioridad: "media",
    cliente: {
      id: 4,
      nombre: "Digital Marketing",
      avatar: "/placeholder.svg?height=40&width=40",
      iniciales: "DM",
    },
    responsable: null,
    equipo: [],
  },
  {
    id: 3,
    nombre: "Desarrollo App Móvil",
    descripcion: "Desarrollo de aplicación móvil para iOS y Android",
    estado: "completado",
    progreso: 100,
    fechaInicio: "2023-01-10",
    fechaFin: "2023-04-30",
    prioridad: "alta",
    cliente: {
      id: 5,
      nombre: "Global Services",
      avatar: "/placeholder.svg?height=40&width=40",
      iniciales: "GS",
    },
    responsable: {
      id: 2,
      nombre: "María González",
      avatar: "/placeholder.svg?height=40&width=40",
      iniciales: "MG",
    },
    equipo: [
      {
        id: 2,
        nombre: "María González",
        avatar: "/placeholder.svg?height=40&width=40",
        iniciales: "MG",
      },
      {
        id: 5,
        nombre: "Javier López",
        avatar: "/placeholder.svg?height=40&width=40",
        iniciales: "JL",
      },
    ],
  },
  {
    id: 4,
    nombre: "Implementación CRM",
    descripcion: "Implementación y configuración de sistema CRM",
    estado: "en_progreso",
    progreso: 35,
    fechaInicio: "2023-05-01",
    fechaFin: "2023-07-15",
    prioridad: "alta",
    cliente: {
      id: 1,
      nombre: "BayresGrowth",
      avatar: "/placeholder.svg?height=40&width=40",
      iniciales: "BG",
    },
    responsable: {
      id: 1,
      nombre: "Admin Bayres",
      avatar: "/placeholder.svg?height=40&width=40",
      iniciales: "AB",
    },
    equipo: [
      {
        id: 1,
        nombre: "Admin Bayres",
        avatar: "/placeholder.svg?height=40&width=40",
        iniciales: "AB",
      },
      {
        id: 3,
        nombre: "Carlos Rodríguez",
        avatar: "/placeholder.svg?height=40&width=40",
        iniciales: "CR",
      },
    ],
  },
  {
    id: 5,
    nombre: "Soporte Técnico Anual",
    descripcion: "Contrato de soporte técnico y mantenimiento anual",
    estado: "en_progreso",
    progreso: 50,
    fechaInicio: "2023-01-01",
    fechaFin: "2023-12-31",
    prioridad: "baja",
    cliente: null,
    responsable: {
      id: 5,
      nombre: "Javier López",
      avatar: "/placeholder.svg?height=40&width=40",
      iniciales: "JL",
    },
    equipo: [
      {
        id: 5,
        nombre: "Javier López",
        avatar: "/placeholder.svg?height=40&width=40",
        iniciales: "JL",
      },
    ],
  },
]

export default function ProjectsPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const filteredProjects = projectsData.filter(
    (project) =>
      project.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
  )

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-amber-950/30 text-amber-400 border border-amber-800/30"
      case "en_progreso":
        return "bg-blue-950/30 text-blue-400 border border-blue-800/30"
      case "completado":
        return "bg-green-950/30 text-green-400 border border-green-800/30"
      case "cancelado":
        return "bg-red-950/30 text-red-400 border border-red-800/30"
      default:
        return "bg-slate-950/30 text-slate-400 border border-slate-800/30"
    }
  }

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-950/30 text-red-400 border border-red-800/30"
      case "media":
        return "bg-amber-950/30 text-amber-400 border border-amber-800/30"
      case "baja":
        return "bg-emerald-950/30 text-emerald-400 border border-emerald-800/30"
      default:
        return "bg-slate-950/30 text-slate-400 border border-slate-800/30"
    }
  }

  const getStatusText = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente"
      case "en_progreso":
        return "En Progreso"
      case "completado":
        return "Completado"
      case "cancelado":
        return "Cancelado"
      default:
        return estado
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

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
          <NewProjectForm />
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="netflix-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Proyectos</p>
                <h3 className="mt-1 text-2xl font-bold">{projectsData.length}</h3>
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
                <h3 className="mt-1 text-2xl font-bold">
                  {projectsData.filter((p) => p.estado === "en_progreso").length}
                </h3>
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
                <h3 className="mt-1 text-2xl font-bold">
                  {projectsData.filter((p) => p.estado === "completado").length}
                </h3>
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
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <h3 className="mt-1 text-2xl font-bold">
                  {projectsData.filter((p) => p.estado === "pendiente").length}
                </h3>
              </div>
              <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="netflix-card overflow-visible">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar proyectos..."
                className="w-full bg-background pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                <span>Filtros</span>
              </Button>
              <div className="flex rounded-md border border-border/30 bg-card/50">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-none rounded-l-md"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="sr-only">Vista de cuadrícula</span>
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-none rounded-r-md"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                  <span className="sr-only">Vista de lista</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de proyectos */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="netflix-card overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(project.estado)}>{getStatusText(project.estado)}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="line-clamp-1 text-lg">{project.nombre}</CardTitle>
                <CardDescription className="line-clamp-2">{project.descripcion}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{project.progreso}%</span>
                  </div>
                  <Progress
                    value={project.progreso}
                    className="h-2"
                    indicatorClassName={
                      project.progreso === 100
                        ? "bg-green-500"
                        : project.progreso > 50
                          ? "bg-blue-500"
                          : "bg-amber-500"
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Fecha inicio</p>
                    <p className="font-medium">{formatDate(project.fechaInicio)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fecha fin</p>
                    <p className="font-medium">{formatDate(project.fechaFin)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Prioridad</p>
                    <Badge className={getPriorityColor(project.prioridad)}>
                      {project.prioridad.charAt(0).toUpperCase() + project.prioridad.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    {project.cliente ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{project.cliente.iniciales}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{project.cliente.nombre}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No asignado</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Responsable</p>
                    {project.responsable ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{project.responsable.iniciales}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{project.responsable.nombre}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No asignado</span>
                    )}
                  </div>
                </div>

                {project.equipo.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Equipo</p>
                    <div className="flex -space-x-2">
                      {project.equipo.map((member, index) => (
                        <Avatar key={index} className="h-8 w-8 border-2 border-background">
                          <AvatarFallback>{member.iniciales}</AvatarFallback>
                        </Avatar>
                      ))}
                      {project.equipo.length > 3 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                          +{project.equipo.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Ver detalles
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="netflix-card">
          <div className="netflix-scrollbar overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/20 hover:bg-muted/5">
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead className="hidden md:table-cell">Fechas</TableHead>
                  <TableHead className="hidden lg:table-cell">Cliente</TableHead>
                  <TableHead className="hidden lg:table-cell">Responsable</TableHead>
                  <TableHead className="hidden md:table-cell">Equipo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="border-b border-border/10 hover:bg-muted/5">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{project.nombre}</div>
                        <div className="hidden text-xs text-muted-foreground sm:block">{project.descripcion}</div>
                        <Badge className={getPriorityColor(project.prioridad)}>
                          {project.prioridad.charAt(0).toUpperCase() + project.prioridad.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.estado)}>{getStatusText(project.estado)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex w-24 items-center gap-2">
                        <Progress
                          value={project.progreso}
                          className="h-2"
                          indicatorClassName={
                            project.progreso === 100
                              ? "bg-green-500"
                              : project.progreso > 50
                                ? "bg-blue-500"
                                : "bg-amber-500"
                          }
                        />
                        <span className="text-xs font-medium">{project.progreso}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>Inicio: {formatDate(project.fechaInicio)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>Fin: {formatDate(project.fechaFin)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {project.cliente ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{project.cliente.iniciales}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{project.cliente.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No asignado</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {project.responsable ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{project.responsable.iniciales}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{project.responsable.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No asignado</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {project.equipo.length > 0 ? (
                        <div className="flex -space-x-2">
                          {project.equipo.slice(0, 3).map((member, index) => (
                            <Avatar key={index} className="h-6 w-6 border-2 border-background">
                              <AvatarFallback>{member.iniciales}</AvatarFallback>
                            </Avatar>
                          ))}
                          {project.equipo.length > 3 && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                              +{project.equipo.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin equipo</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="cursor-pointer">
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
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
    </div>
  )
}
