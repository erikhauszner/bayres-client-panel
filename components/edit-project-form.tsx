"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { format, addDays, addWeeks, addMonths } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ArrowLeft, Briefcase, ListTodo, Users, BarChart4, Clock, Check, Plus, User, Trash2, AlertTriangle, Bell, Loader2, Save } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Importar servicios
import { projectService } from "@/lib/services/projectService"
import { clientService } from "@/lib/services/clientService"
import EmployeeService from "@/lib/services/employeeService"
import { Client } from "@/lib/types/client"
import { Employee } from "@/lib/types/employee"
import { Project, ProjectUpdateData } from "@/lib/types/project"

// Definir el esquema de validación
const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres.",
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  client: z.string({
    required_error: "Debes seleccionar un cliente"
  }),
  status: z.string(),
  priority: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  budget: z.string().refine(
    (val) => {
      const num = parseFloat(val)
      return !isNaN(num)
    },
    {
      message: "El presupuesto debe ser un número válido.",
    }
  ),
  totalHours: z.string().refine(
    (val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0
    },
    {
      message: "Las horas totales deben ser un número positivo.",
    }
  ),
  progress: z.string().refine(
    (val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0 && num <= 100
    },
    {
      message: "El progreso debe ser un número entre 0 y 100.",
    }
  ),
  manager: z.string().optional(),
  assignedTo: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

const estadosProyecto = [
  { id: "pending", nombre: "Pendiente" },
  { id: "planning", nombre: "Planificación" },
  { id: "active", nombre: "Activo" },
  { id: "in_progress", nombre: "En Progreso" },
  { id: "paused", nombre: "Pausado" },
  { id: "completed", nombre: "Completado" },
  { id: "canceled", nombre: "Cancelado" },
];

const prioridades = [
  { id: "low", nombre: "Baja" },
  { id: "medium", nombre: "Media" },
  { id: "high", nombre: "Alta" },
];

interface EditProjectFormProps {
  projectId: string
}

export default function EditProjectForm({ projectId }: EditProjectFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  
  // Estados para cargar datos
  const [clientes, setClientes] = useState<Client[]>([])
  const [empleados, setEmpleados] = useState<Employee[]>([])
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [loadingEmpleados, setLoadingEmpleados] = useState(false)

  // Estados para el equipo del proyecto
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<string[]>([])

  // Cargar el proyecto actual
  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true)
        const projectData = await projectService.getProjectById(projectId)
        setProject(projectData)
        
        // Configurar los valores iniciales del formulario
        form.reset({
          name: projectData.name || "",
          description: projectData.description || "",
          client: typeof projectData.client === 'string' ? projectData.client : projectData.client?._id || "",
          status: projectData.status || "planning",
          priority: projectData.priority || "medium",
          startDate: new Date(projectData.startDate),
          endDate: new Date(projectData.endDate),
          budget: projectData.budget?.toString() || "",
          totalHours: projectData.totalHours?.toString() || "",
          progress: projectData.progress?.toString() || "0",
          manager: typeof projectData.manager === 'string' ? projectData.manager : projectData.manager?._id || "",
          assignedTo: Array.isArray(projectData.assignedTo) 
            ? projectData.assignedTo.map(member => 
                typeof member === 'string' ? member : member._id || ""
              ).filter(Boolean)
            : [],
        })
        
        // Configurar equipo seleccionado
        if (Array.isArray(projectData.assignedTo)) {
          const teamIds = projectData.assignedTo.map(member => 
            typeof member === 'string' ? member : member._id || ""
          ).filter(Boolean)
          setEquipoSeleccionado(teamIds)
        }
      } catch (error) {
        console.error("Error al cargar el proyecto:", error)
        toast.error("Error al cargar el proyecto")
      } finally {
        setIsLoading(false)
      }
    }

    if (projectId) {
      loadProject()
    }
  }, [projectId])

  // Cargar clientes y empleados
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoadingClientes(true);
        const response = await clientService.getClients();
        setClientes(response.data);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        toast.error("No se pudieron cargar los clientes");
      } finally {
        setLoadingClientes(false);
      }
    };

    const fetchEmpleados = async () => {
      try {
        setLoadingEmpleados(true);
        const response = await EmployeeService.getEmployees({ page: 1, limit: 100 });
        setEmpleados(response.data);
      } catch (error) {
        console.error("Error al cargar empleados:", error);
        toast.error("No se pudieron cargar los empleados");
      } finally {
        setLoadingEmpleados(false);
      }
    };

    fetchClientes();
    fetchEmpleados();
  }, []);

  // Inicializar el formulario
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      client: "",
      status: "planning",
      priority: "medium",
      startDate: new Date(),
      endDate: new Date(),
      budget: "",
      totalHours: "",
      progress: "0",
      manager: "",
      assignedTo: [],
    },
  });

  // Funciones para manejar el equipo del proyecto
  const handleAddTeamMember = (memberId: string) => {
    const currentEquipo = form.getValues("assignedTo");
    if (!currentEquipo.includes(memberId)) {
      const newEquipo = [...currentEquipo, memberId];
      form.setValue("assignedTo", newEquipo);
      setEquipoSeleccionado(newEquipo);
    }
  };

  const handleRemoveTeamMember = (memberId: string) => {
    const currentEquipo = form.getValues("assignedTo");
    const newEquipo = currentEquipo.filter(id => id !== memberId);
    form.setValue("assignedTo", newEquipo);
    setEquipoSeleccionado(newEquipo);
  };

  // Manejar el envío del formulario
  const onSubmit = async (values: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Preparar y convertir datos al formato correcto
      const updateData: ProjectUpdateData = {
        name: values.name,
        description: values.description,
        client: values.client,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        status: values.status,
        budget: parseFloat(values.budget),
        priority: values.priority,
        progress: parseFloat(values.progress),
        manager: values.manager || undefined,
        assignedTo: values.assignedTo.length > 0 ? values.assignedTo : undefined,
      };
      
      // Actualizar el proyecto
      const response = await projectService.updateProject(projectId, updateData);
      
      if (response) {
        toast.success("Proyecto actualizado con éxito");
        router.push(`/proyectos/${projectId}`);
      } else {
        throw new Error("No se pudo actualizar el proyecto");
      }
    } catch (error) {
      console.error("Error al actualizar proyecto:", error);
      toast.error("Ocurrió un error al actualizar el proyecto");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Button 
          variant="link" 
          className="mb-2 pl-0"
          onClick={() => router.push(`/proyectos/${projectId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Proyecto
        </Button>
        
        <Card>
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

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Button 
          variant="link" 
          className="mb-2 pl-0"
          onClick={() => router.push("/proyectos")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Proyectos
        </Button>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
              <h2 className="mb-2 text-xl font-bold">Proyecto no encontrado</h2>
              <p className="text-muted-foreground">
                El proyecto que intentas editar no existe o no tienes permisos para acceder a él.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button 
        variant="link" 
        className="mb-2 pl-0"
        onClick={() => router.push(`/proyectos/${projectId}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Proyecto
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Editar Proyecto</CardTitle>
          <CardDescription>
            Modifica la información del proyecto "{project.name}".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
                  <TabsTrigger value="general">
                    <Briefcase className="mr-2 h-4 w-4" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="equipo">
                    <Users className="mr-2 h-4 w-4" />
                    Equipo
                  </TabsTrigger>
                  <TabsTrigger value="financiero">
                    <BarChart4 className="mr-2 h-4 w-4" />
                    Financiero
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Nombre del proyecto */}
                    <div className="sm:col-span-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Proyecto</FormLabel>
                            <FormControl>
                              <Input placeholder="Ingresa el nombre del proyecto" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Descripción */}
                    <div className="sm:col-span-2">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe el proyecto y sus objetivos" 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Cliente */}
                    <div>
                      <FormField
                        control={form.control}
                        name="client"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cliente</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              disabled={loadingClientes}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar cliente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {clientes.map((cliente) => (
                                  <SelectItem key={cliente._id} value={cliente._id || ''}>
                                    {cliente.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Selecciona el cliente asociado al proyecto
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Responsable */}
                    <div>
                      <FormField
                        control={form.control}
                        name="manager"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsable</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              disabled={loadingEmpleados}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar responsable" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Sin responsable</SelectItem>
                                {empleados.map((empleado) => (
                                  <SelectItem key={empleado._id} value={empleado._id || ''}>
                                    {empleado.firstName} {empleado.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Asigna un responsable para el proyecto
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Estado */}
                    <div>
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {estadosProyecto.map((estado) => (
                                  <SelectItem key={estado.id} value={estado.id}>
                                    {estado.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Prioridad */}
                    <div>
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioridad</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar prioridad" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {prioridades.map((prioridad) => (
                                  <SelectItem key={prioridad.id} value={prioridad.id}>
                                    {prioridad.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Progreso */}
                    <div>
                      <FormField
                        control={form.control}
                        name="progress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Progreso (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                max="100"
                                step="1"
                                placeholder="Progreso del proyecto" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Porcentaje de completitud del proyecto (0-100)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Fechas */}
                    <div>
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Fecha de Inicio</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: es })
                                    ) : (
                                      <span>Seleccionar fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Fecha de Finalización</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: es })
                                    ) : (
                                      <span>Seleccionar fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => {
                                    const startDate = form.getValues("startDate");
                                    return startDate && date < startDate;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="equipo" className="space-y-4 pt-4">
                  <Card className="border border-border/40">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Gestión del Equipo</CardTitle>
                      <CardDescription>
                        Asigna miembros del equipo a este proyecto
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Miembros disponibles */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Empleados Disponibles</h4>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {empleados
                            .filter(emp => !equipoSeleccionado.includes(emp._id || ''))
                            .map((empleado) => (
                            <div 
                              key={empleado._id} 
                              className="flex items-center justify-between p-2 border border-border/40 rounded-md"
                            >
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {empleado.firstName.charAt(0)}{empleado.lastName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {empleado.firstName} {empleado.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {empleado.position || 'Sin posición'}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddTeamMember(empleado._id || '')}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        {/* Miembros del equipo actual */}
                        <h4 className="text-sm font-medium">Equipo del Proyecto</h4>
                        {equipoSeleccionado.length > 0 ? (
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {equipoSeleccionado.map((memberId) => {
                              const empleado = empleados.find(emp => emp._id === memberId);
                              if (!empleado) return null;
                              
                              return (
                                <div 
                                  key={memberId} 
                                  className="flex items-center justify-between p-2 bg-primary/5 border border-primary/20 rounded-md"
                                >
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>
                                        {empleado.firstName.charAt(0)}{empleado.lastName.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {empleado.firstName} {empleado.lastName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {empleado.position || 'Sin posición'}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRemoveTeamMember(memberId)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No hay miembros asignados al equipo</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="financiero" className="space-y-4 pt-4">
                  <Card className="border border-border/40">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Información Financiera</CardTitle>
                      <CardDescription>
                        Configura el presupuesto y recursos financieros del proyecto
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Presupuesto Total ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="100" 
                                  placeholder="Ingresa el presupuesto total" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Presupuesto total asignado al proyecto
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="totalHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Horas Estimadas</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0"
                                  placeholder="Horas totales estimadas" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Total de horas de trabajo estimadas
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/proyectos/${projectId}`)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 