"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  Briefcase,
  Clock,
  DollarSign,
  CalendarDays,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Users,
  BarChart4,
  ListTodo,

  Loader2,
  Save,
  Archive,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import ProjectTasks from "./project-tasks"

import ProjectFinances from "./project-finances"
import { projectService } from "@/lib/services/projectService"
import EmployeeService from "@/lib/services/employeeService"
import { Project } from "@/lib/types/project"
import ProjectDocuments from "./project-documents"

// Importamos las funciones auxiliares
import { getStatusText, getStatusColor, formatDate, getPriorityColor } from "./projects-dashboard"

interface ProjectDetailProps {
  projectId: string | number
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [archiveConfirmation, setArchiveConfirmation] = useState(false)
  const [showAssignTeamModal, setShowAssignTeamModal] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const router = useRouter()

  // Cargar datos del proyecto
  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true)
        setError(null)
        const projectData = await projectService.getProjectById(projectId.toString())
        setProject(projectData)
      } catch (err) {
        console.error("Error cargando proyecto:", err)
        setError("No se pudo cargar el proyecto. Verifica tu conexión o inténtalo de nuevo más tarde.")
        toast.error("Error al cargar el proyecto")
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId])

  // Manejar archivo de proyecto
  const handleArchiveProject = async () => {
    if (!project) return

    try {
      setLoading(true)
      // Actualizar el estado a 'canceled' (archivado)
      await projectService.updateProjectStatus(project._id!.toString(), 'canceled')
      toast.success("Proyecto archivado correctamente")
      router.push("/proyectos")
    } catch (err) {
      console.error("Error archivando proyecto:", err)
      toast.error("Error al archivar el proyecto")
    } finally {
      setLoading(false)
      setArchiveConfirmation(false)
    }
  }
  
  // Cargar usuarios disponibles para asignar al equipo
  const loadAvailableUsers = async () => {
    if (!project) return
    
    try {
      setLoadingUsers(true)
      
      // Llamar a la API para obtener la lista real de empleados
      const employeeResponse = await EmployeeService.getEmployees({
        page: 1,
        limit: 100
      });
      
      if (employeeResponse && employeeResponse.data) {
        setAvailableUsers(employeeResponse.data);
        
        // Preseleccionar los usuarios ya asignados al proyecto
        if (project.assignedTo && Array.isArray(project.assignedTo)) {
          const currentUserIds = project.assignedTo.map(member => 
            typeof member === 'string' ? member : member._id
          ).filter(id => id) as string[];
          
          setSelectedUsers(currentUserIds);
        }
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
      console.error("Error cargando usuarios:", err)
      toast.error("Error al cargar la lista de usuarios")
      
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
      setLoadingUsers(false)
    }
  }
  
  // Manejar la asignación del equipo
  const handleAssignTeam = async () => {
    if (!project || !project._id) return
    
    try {
      setLoading(true)
      
      // Llamada a la API para actualizar el equipo del proyecto
      await projectService.updateProject(project._id.toString(), {
        assignedTo: selectedUsers
      })
      
      // Actualizar el proyecto en el estado local
      setProject({
        ...project,
        assignedTo: selectedUsers.map(userId => {
          const user = availableUsers.find(u => u._id === userId);
          return user || userId;
        })
      })
      
      toast.success("Equipo actualizado correctamente")
      setShowAssignTeamModal(false)
    } catch (err) {
      console.error("Error asignando equipo:", err)
      toast.error("Error al actualizar el equipo del proyecto")
    } finally {
      setLoading(false)
    }
  }

  // Si está cargando, mostramos un indicador
  if (loading && !project) {
    return (
      <div className="mx-auto max-w-7xl">
        <Button 
          variant="link" 
          className="mb-6 pl-0"
          onClick={() => router.push("/proyectos")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Proyectos
        </Button>
        <Card className="netflix-card">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
              <h2 className="mb-2 text-xl font-bold">Cargando proyecto</h2>
              <p className="text-muted-foreground">
                Obteniendo la información del proyecto...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si hay un error, mostramos un mensaje
  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <Button 
          variant="link" 
          className="mb-6 pl-0"
          onClick={() => router.push("/proyectos")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Proyectos
        </Button>
        <Card className="netflix-card">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
              <h2 className="mb-2 text-xl font-bold">Error al cargar el proyecto</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button 
                className="mt-4" 
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  projectService.getProjectById(projectId.toString())
                    .then(data => {
                      setProject(data);
                      setLoading(false);
                    })
                    .catch(err => {
                      console.error("Error al reintentar:", err);
                      setError("No se pudo cargar el proyecto. Verifica tu conexión o inténtalo de nuevo más tarde.");
                      setLoading(false);
                    });
                }}
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si no existe el proyecto, mostramos un mensaje
  if (!project) {
    return (
      <div className="mx-auto max-w-7xl">
        <Button 
          variant="link" 
          className="mb-6 pl-0"
          onClick={() => router.push("/proyectos")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Proyectos
        </Button>
        <Card className="netflix-card">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
              <h2 className="mb-2 text-xl font-bold">Proyecto no encontrado</h2>
              <p className="text-muted-foreground">
                El proyecto que estás buscando no existe o no tienes permisos para acceder a él.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calcular porcentaje de presupuesto gastado
  const budgetPercentage = project.budget && project.budget > 0 
    ? Math.round(((project.spent || 0) / project.budget) * 100) 
    : 0

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Navegación y título */}
      <div>
        <Button 
          variant="link" 
          className="mb-2 pl-0"
          onClick={() => router.push("/proyectos")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Proyectos
        </Button>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{project.name}</h1>
              <Badge className={getStatusColor(project.status)}>{getStatusText(project.status)}</Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9"
              onClick={() => router.push(`/proyectos/${project._id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Más acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => {
                    // Aquí iría la lógica para exportar
                    toast.info("Función de exportación próximamente disponible")
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => {
                    // Aquí iría la lógica para compartir
                    toast.info("Función de compartir próximamente disponible")
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive"
                  onClick={() => setArchiveConfirmation(true)}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archivar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="netflix-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progreso</p>
                <h3 className="mt-1 text-xl sm:text-2xl font-bold">{project.progress || 0}%</h3>
                <div className="mt-2 w-full">
                  <Progress
                    value={project.progress || 0}
                    className="h-2"
                    indicatorClassName={
                      (project.progress || 0) === 100
                        ? "bg-green-500"
                        : (project.progress || 0) > 50
                          ? "bg-blue-500"
                          : "bg-amber-500"
                    }
                  />
                </div>
              </div>
              <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="netflix-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Presupuesto</p>
                <h3 className="mt-1 text-xl sm:text-2xl font-bold">${project.budget || 0}</h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Gastado: ${project.spent || 0} ({budgetPercentage}%)
                </p>
              </div>
              <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="netflix-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo</p>
                <h3 className="mt-1 text-xl sm:text-2xl font-bold">
                  {project.workedHours || 0}/{project.totalHours || 0}h
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-auto inline-flex min-w-max">
            <TabsTrigger value="general" className="text-xs sm:text-sm whitespace-nowrap">
              <Briefcase className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="tareas" className="text-xs sm:text-sm whitespace-nowrap">
              <ListTodo className="mr-2 h-4 w-4" />
              Tareas
            </TabsTrigger>

            <TabsTrigger value="finanzas" className="text-xs sm:text-sm whitespace-nowrap">
              <BarChart4 className="mr-2 h-4 w-4" />
              Finanzas
            </TabsTrigger>
            <TabsTrigger value="documentos" className="text-xs sm:text-sm whitespace-nowrap">
              <FileText className="mr-2 h-4 w-4" />
              Documentos
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="mt-6 space-y-4">
          {/* Contenido de la pestaña General */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Información general */}
            <Card className="netflix-card">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                    <p className="font-medium">
                      {typeof project.client === 'string' 
                        ? project.client 
                        : project.client?.name || "Sin asignar"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Responsable</p>
                    <p className="font-medium">
                      {typeof project.manager === 'string' 
                        ? project.manager 
                        : project.manager 
                          ? `${project.manager.firstName} ${project.manager.lastName}`
                          : "Sin asignar"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha inicio</p>
                    <p className="font-medium">{formatDate(project.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha fin</p>
                    <p className="font-medium">{formatDate(project.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Prioridad</p>
                    <Badge className={getPriorityColor(project.priority || 'medium')}>
                      {project.priority === 'high' 
                        ? 'Alta' 
                        : project.priority === 'low' 
                          ? 'Baja' 
                          : 'Media'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusText(project.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                  <p className="text-sm">{project.description || "Sin descripción"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Equipo */}
            <Card className="netflix-card">
              <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
                <CardTitle className="text-lg">Equipo</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Abre el modal para asignar miembros al equipo
                    loadAvailableUsers();
                    setShowAssignTeamModal(true);
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Asignar
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                {Array.isArray(project.assignedTo) && project.assignedTo.length > 0 ? (
                  <div className="space-y-4">
                    {project.assignedTo.map((member: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                            {typeof member === 'string' 
                              ? member.substring(0, 2).toUpperCase()
                              : `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`}
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">
                              {typeof member === 'string' 
                                ? member
                                : `${member.firstName} ${member.lastName}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {typeof member === 'string' 
                                ? 'Miembro del equipo'
                                : member.position || 'Miembro del equipo'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Users className="mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No hay miembros asignados al equipo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tareas" className="mt-6">
          <ProjectTasks project={project} />
        </TabsContent>



        <TabsContent value="finanzas" className="mt-6">
          <ProjectFinances project={{
            _id: project._id || '0',
            nombre: project.name,
            presupuestoTotal: project.budget || 0,
            presupuestoGastado: project.spent || 0,
            tareas: (project.tasks || []).map(task => ({
              _id: task._id,
              title: task.title,
              description: task.description,
              status: task.status || 'pending',
              budget: task.budget || 0,
              partialBudget: task.partialBudget || 0,
              spent: task.spent || 0,
              startDate: task.startDate,
              dueDate: task.dueDate,
              assignedTo: task.assignedTo
            }))
          }} />
        </TabsContent>

        <TabsContent value="documentos" className="mt-6">
          <ProjectDocuments projectId={project._id?.toString() || ''} />
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmación para archivar */}
      {archiveConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md netflix-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Confirmar archivo</CardTitle>
              <CardDescription className="text-sm">
                ¿Estás seguro de que deseas archivar este proyecto? El proyecto cambiará su estado a "Cancelado" y ya no estará visible en la lista principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2 p-4 sm:p-6">
              <Button 
                variant="outline" 
                onClick={() => setArchiveConfirmation(false)}
                size="sm"
                className="h-9"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={handleArchiveProject}
                disabled={loading}
                size="sm"
                className="h-9"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Archivando...
                  </>
                ) : (
                  <>
                    <Archive className="mr-2 h-4 w-4" />
                    Archivar proyecto
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Modal para asignar miembros al equipo */}
      {showAssignTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg netflix-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Asignar equipo al proyecto</CardTitle>
              <CardDescription className="text-sm">
                Selecciona los miembros que formarán parte del equipo del proyecto.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto px-4 sm:px-6">
              {loadingUsers ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Cargando usuarios disponibles...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableUsers.map(user => (
                    <div 
                      key={user._id} 
                      className="flex items-center justify-between rounded-lg border border-border/40 p-3 hover:bg-muted/20"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{user.position}</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedUsers.includes(user._id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user._id])
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user._id))
                          }
                        }}
                      />
                    </div>
                  ))}
                  
                  {availableUsers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Users className="mb-2 h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No hay usuarios disponibles</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t p-4 sm:p-6">
              <Button 
                variant="outline" 
                onClick={() => setShowAssignTeamModal(false)}
                size="sm"
                className="h-9"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAssignTeam}
                disabled={loading}
                size="sm"
                className="h-9"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
} 