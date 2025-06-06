"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { format, addDays, addWeeks, addMonths } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ArrowLeft, Briefcase, ListTodo, Users, BarChart4, Clock, Check, Plus, User, Trash2, AlertTriangle, Bell } from "lucide-react"
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
import { Project } from "@/lib/types/project"

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
  manager: z.string().optional(),
  assignedTo: z.array(z.string()),
  tasks: z.array(z.object({
    id: z.number().optional(),
    name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
    description: z.string().optional(),
    status: z.string(),
    progress: z.number().min(0).max(100),
    startDate: z.date(),
    endDate: z.date(),
    assignedTo: z.string().optional(),
    budget: z.number().min(0),
    spent: z.number().min(0),
    dependencies: z.array(z.string()).optional(),
    blocked: z.boolean().optional(),
  })).optional(),
});

// Estados posibles para tareas y proyectos
const estadosProyecto = [
  { id: "planning", nombre: "Planificación" },
  { id: "pending", nombre: "Pendiente" },
  { id: "active", nombre: "Activo" },
  { id: "in_progress", nombre: "En Progreso" },
  { id: "paused", nombre: "Pausado" },
  { id: "completed", nombre: "Completado" },
  { id: "canceled", nombre: "Cancelado" },
];

const estadosTarea = [
  { id: "pending", nombre: "Pendiente" },
  { id: "in-progress", nombre: "En Progreso" },
  { id: "completed", nombre: "Completado" },
];

const prioridades = [
  { id: "low", nombre: "Baja" },
  { id: "medium", nombre: "Media" },
  { id: "high", nombre: "Alta" },
];

export default function NewProjectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [empleados, setEmpleados] = useState<Employee[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);

  // Estados para la gestión de tareas y equipo
  const [showTareaForm, setShowTareaForm] = useState(false);
  const [currentTareaIndex, setCurrentTareaIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  // Añadir estados para la duración del proyecto
  const [useProjectDuration, setUseProjectDuration] = useState(false);
  const [projectDurationType, setProjectDurationType] = useState<'days' | 'weeks' | 'months'>('weeks');
  const [projectDurationValue, setProjectDurationValue] = useState(4);

  // Añadir estados para la duración de tareas
  const [useTaskDuration, setUseTaskDuration] = useState(false);
  const [taskDurationType, setTaskDurationType] = useState<'days' | 'weeks' | 'months'>('weeks');
  const [taskDurationValue, setTaskDurationValue] = useState(1);
  
  // Estado para notificaciones
  const [notificationType, setNotificationType] = useState("before-days")
  const [notificationConfig, setNotificationConfig] = useState({
    days: "3",
    isCustom: false
  })
  const [customNotificationDays, setCustomNotificationDays] = useState("")

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

  // Inicializar el formulario con valores predeterminados
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      client: "",
      status: "planning",
      priority: "medium",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      budget: "",
      totalHours: "",
      manager: "",
      assignedTo: [],
      tasks: [],
    },
  });

  // Funciones para manejar el equipo del proyecto
  const handleAddTeamMember = (memberId: string) => {
    const currentEquipo = form.getValues("assignedTo");
    if (!currentEquipo.includes(memberId)) {
      form.setValue("assignedTo", [...currentEquipo, memberId]);
    }
  };

  const handleRemoveTeamMember = (memberId: string) => {
    const currentEquipo = form.getValues("assignedTo");
    form.setValue("assignedTo", currentEquipo.filter(id => id !== memberId));
  };

  // Funciones para manejar las tareas
  const handleAddTarea = (tarea: any) => {
    const currentTareas = form.getValues("tasks") || [];
    
    if (currentTareaIndex !== null) {
      // Editar tarea existente
      const updatedTareas = [...currentTareas];
      updatedTareas[currentTareaIndex] = {
        ...updatedTareas[currentTareaIndex],
        ...tarea
      };
      form.setValue("tasks", updatedTareas);
    } else {
      // Añadir nueva tarea
      const newId = currentTareas.length > 0 
        ? Math.max(...currentTareas.map(t => Number(t.id) || 0)) + 1 
        : 1;
      
      form.setValue("tasks", [
        ...currentTareas, 
        { ...tarea, id: newId }
      ]);
    }
    
    setShowTareaForm(false);
    setCurrentTareaIndex(null);
  };

  const handleEditTarea = (index: number) => {
    setCurrentTareaIndex(index);
    setShowTareaForm(true);
  };

  const handleRemoveTarea = (index: number) => {
    const currentTareas = form.getValues("tasks") || [];
    form.setValue("tasks", currentTareas.filter((_, i) => i !== index));
  };

  // Función para calcular la fecha de fin basada en fecha de inicio y duración
  const calculateEndDate = (startDate: Date, durationType: 'days' | 'weeks' | 'months', durationValue: number): Date => {
    switch (durationType) {
      case 'days':
        return addDays(startDate, durationValue);
      case 'weeks':
        return addWeeks(startDate, durationValue);
      case 'months':
        return addMonths(startDate, durationValue);
      default:
        return addWeeks(startDate, durationValue);
    }
  };

  // Efecto para calcular la fecha de fin del proyecto cuando cambia la duración
  useEffect(() => {
    if (useProjectDuration) {
      const startDate = form.getValues('startDate');
      if (startDate) {
        const endDate = calculateEndDate(startDate, projectDurationType, projectDurationValue);
        form.setValue('endDate', endDate);
      }
    }
  }, [useProjectDuration, form.watch('startDate'), projectDurationType, projectDurationValue]);

  // Manejar el envío del formulario
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Preparar y convertir datos al formato correcto
      const projectData = {
        name: values.name,
        description: values.description,
        client: values.client,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        status: values.status,
        budget: parseFloat(values.budget),
        priority: values.priority,
        manager: values.manager || undefined,
        assignedTo: values.assignedTo.length > 0 ? values.assignedTo : undefined,
        totalHours: parseFloat(values.totalHours) || 0,
        notificationDays: notificationType === "no-notification" 
          ? 0 
          : notificationType === "before-days-custom" 
            ? parseInt(customNotificationDays || "0") 
            : parseInt(notificationConfig.days),
      };
      
      // Crear el proyecto
      const response = await projectService.createProject(projectData);
      
      if (response) {
        toast.success("Proyecto creado con éxito");
        router.push(`/proyectos/${response._id}`);
      } else {
        throw new Error("No se pudo crear el proyecto");
      }
    } catch (error) {
      console.error("Error al crear proyecto:", error);
      toast.error("Ocurrió un error al crear el proyecto");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <CardHeader>
          <CardTitle className="text-2xl">Crear Nuevo Proyecto</CardTitle>
          <CardDescription>
            Completa la información del proyecto y configura tareas, equipo y plazos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
                  <TabsTrigger value="general">
                    <Briefcase className="mr-2 h-4 w-4" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="fechas">
                    <Bell className="mr-2 h-4 w-4" />
                    Notificaciones
                  </TabsTrigger>
                  <TabsTrigger value="equipo">
                    <Users className="mr-2 h-4 w-4" />
                    Equipo
                  </TabsTrigger>
                  <TabsTrigger value="tareas">
                    <ListTodo className="mr-2 h-4 w-4" />
                    Tareas
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
                          defaultValue={field.value}
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
                          defaultValue={field.value}
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
              </div>
              </TabsContent>
              
              <TabsContent value="fechas" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Fecha de inicio */}
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
                                onSelect={(date) => {
                                  field.onChange(date);
                                  if (useProjectDuration) {
                                    // Si estamos usando duración, actualizar fecha fin
                                    const endDate = calculateEndDate(
                                      date || new Date(),
                                      projectDurationType,
                                      projectDurationValue
                                    );
                                    form.setValue("endDate", endDate);
                                  }
                                }}
                                disabled={(date) =>
                                  date < new Date(new Date().setDate(new Date().getDate() - 1))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Fecha de Finalización */}
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
                
                {/* Duración del Proyecto */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="useDuration"
                        checked={useProjectDuration}
                        onCheckedChange={(checked) => {
                          setUseProjectDuration(checked === true);
                          if (checked) {
                            const startDate = form.getValues("startDate");
                            const endDate = calculateEndDate(
                              startDate,
                              projectDurationType,
                              projectDurationValue
                            );
                            form.setValue("endDate", endDate);
                          }
                        }}
                      />
                      <Label htmlFor="useDuration">Usar duración en lugar de fecha de fin</Label>
                    </div>
                  </div>
                  
                  {useProjectDuration && (
                    <div className="flex items-center space-x-2">
                      <Label>Duración:</Label>
                      <Input 
                        type="number" 
                        min="1" 
                        value={projectDurationValue}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value > 0) {
                            setProjectDurationValue(value);
                            const startDate = form.getValues("startDate");
                            const endDate = calculateEndDate(
                              startDate,
                              projectDurationType,
                              value
                            );
                            form.setValue("endDate", endDate);
                          }
                        }}
                        className="w-20"
                      />
                      <Select
                        value={projectDurationType}
                        onValueChange={(value: 'days' | 'weeks' | 'months') => {
                          setProjectDurationType(value);
                          const startDate = form.getValues("startDate");
                          const endDate = calculateEndDate(
                            startDate,
                            value,
                            projectDurationValue
                          );
                          form.setValue("endDate", endDate);
                        }}
                      >
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
                  )}
                </div>
                
                {/* Notificaciones */}
                <div className="space-y-2">
                  <Label htmlFor="notifications">Notificaciones</Label>
                  <RadioGroup 
                    defaultValue="before-days" 
                    value={notificationType}
                    onValueChange={(value) => {
                      setNotificationType(value);
                      if (value === "before-days-custom" && !customNotificationDays) {
                        setCustomNotificationDays("15");
                      }
                    }}
                    className="space-y-2"
                  >
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="before-days" id="before-days" />
                        <Label htmlFor="before-days" className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Días antes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="before-days-custom" id="before-days-custom" />
                        <Label htmlFor="before-days-custom" className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Días personalizados
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="no-notification" id="no-notification" />
                        <Label htmlFor="no-notification" className="flex items-center">
                          <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
                          Sin notificación
                        </Label>
                      </div>
                    </div>
                    
                    {notificationType === "before-days" && (
                      <div className="mt-4 rounded-md border p-4">
                        <div className="space-y-3">
                          <Label>Selecciona cuándo enviar la notificación</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <Button
                              type="button"
                              variant={notificationConfig.days === "1" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => setNotificationConfig({
                                ...notificationConfig,
                                days: "1"
                              })}
                            >
                              1 día antes
                            </Button>
                            <Button
                              type="button"
                              variant={notificationConfig.days === "3" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => setNotificationConfig({
                                ...notificationConfig,
                                days: "3"
                              })}
                            >
                              3 días antes
                            </Button>
                            <Button
                              type="button"
                              variant={notificationConfig.days === "5" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => setNotificationConfig({
                                ...notificationConfig,
                                days: "5"
                              })}
                            >
                              5 días antes
                            </Button>
                            <Button
                              type="button"
                              variant={notificationConfig.days === "7" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => setNotificationConfig({
                                ...notificationConfig,
                                days: "7"
                              })}
                            >
                              7 días antes
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </RadioGroup>
                  
                  {notificationType === "before-days-custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-notification-days">Días personalizados</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="custom-notification-days"
                          type="number" 
                          min="1"
                          max="90"
                          placeholder="Número de días antes"
                          className="w-full"
                          value={customNotificationDays}
                          onChange={(e) => setCustomNotificationDays(e.target.value)}
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">días antes</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Especifica cuántos días antes del vencimiento se enviará la notificación</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="equipo" className="space-y-4 pt-4">
                <Card className="border border-border/40">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col space-y-1.5">
                      <h3 className="text-lg font-semibold leading-none">Equipo del Proyecto</h3>
                      <p className="text-sm text-muted-foreground">
                        Selecciona los miembros que trabajarán en este proyecto
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {form.watch("assignedTo").length > 0 ? (
                      <div className="grid gap-2">
                        {form.watch("assignedTo").map((miembroId) => {
                          const miembro = empleados.find((e) => e._id === miembroId);
                          if (!miembro) return null;
                          return (
                            <div key={miembroId} className="flex items-center justify-between rounded-md border border-border/30 bg-card/50 p-3">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {`${miembro.firstName.charAt(0)}${miembro.lastName.charAt(0)}`}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium leading-none">
                                    {miembro.firstName} {miembro.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {miembro.position || 'Sin posición'}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRemoveTeamMember(miembroId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex h-20 items-center justify-center rounded-md border border-dashed">
                        <p className="text-sm text-muted-foreground">
                          No hay miembros asignados al equipo
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <div className="p-4 bg-secondary/30 rounded-md">
                  <h3 className="font-medium">Miembros disponibles</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Haz clic en un empleado para añadirlo al equipo del proyecto
                  </p>
                  
                  {loadingEmpleados ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Cargando empleados...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {empleados
                        .filter(emp => !form.watch("assignedTo").includes(emp._id || ''))
                        .map(empleado => (
                          <div
                            key={empleado._id}
                            className="flex items-center gap-2 p-2 rounded-md bg-card hover:bg-accent/40 cursor-pointer"
                            onClick={() => handleAddTeamMember(empleado._id || '')}
                          >
                            <Avatar>
                              <AvatarFallback>
                                {`${empleado.firstName.charAt(0)}${empleado.lastName.charAt(0)}`}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{empleado.firstName} {empleado.lastName}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="tareas" className="space-y-4 pt-4">
                <Card className="border border-border/40">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Tareas del Proyecto</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowTareaForm(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir Tarea
                      </Button>
                    </div>
                    <CardDescription>
                      Define las tareas necesarias para completar el proyecto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {form.watch("tasks")?.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tarea</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fechas</TableHead>
                            <TableHead>Presupuesto</TableHead>
                            <TableHead className="w-[100px]">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {form.watch("tasks")?.map((tarea, index) => (
                            <TableRow key={tarea.id || index}>
                              <TableCell>
                                <div className="font-medium">{tarea.name}</div>
                                {tarea.description && (
                                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{tarea.description}</div>
                                )}
                                {tarea.blocked && (
                                  <Badge variant="outline" className="mt-1 border-amber-500 text-amber-500">
                                    Bloqueada
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  tarea.status === "completed"
                                    ? "bg-green-950/30 text-green-400 border border-green-800/30"
                                    : tarea.status === "in_progress"
                                    ? "bg-blue-950/30 text-blue-400 border border-blue-800/30"
                                    : "bg-amber-950/30 text-amber-400 border border-amber-800/30"
                                }>
                                  {estadosTarea.find(e => e.id === tarea.status)?.nombre || tarea.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>Inicio: {format(new Date(tarea.startDate), "dd/MM/yyyy")}</div>
                                  <div>Fin: {format(new Date(tarea.endDate), "dd/MM/yyyy")}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  ${tarea.budget}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditTarea(index)}
                                  >
                                    <User className="h-4 w-4" />
                                    <span className="sr-only">Editar</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => handleRemoveTarea(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex items-center justify-center py-6 text-center">
                        <div className="space-y-2">
                          <ListTodo className="mx-auto h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No hay tareas definidas</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowTareaForm(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Añadir tarea
                          </Button>
                        </div>
                      </div>
                    )}
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
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Resumen Financiero</h3>
                      <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Presupuesto Tareas</p>
                                                         <p className="text-lg font-medium">
                               ${form.watch("tasks") ? 
                                 form.watch("tasks")?.reduce((sum, tarea) => sum + (tarea.budget || 0), 0) || 0 : 0}
                             </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Presupuesto Total</p>
                            <p className="text-lg font-medium">
                              ${form.watch("budget") || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => router.push("/proyectos")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Crear Proyecto"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Diálogo para añadir/editar tareas */}
      <AlertDialog open={showTareaForm} onOpenChange={setShowTareaForm}>
        <AlertDialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {currentTareaIndex !== null ? "Editar Tarea" : "Añadir Nueva Tarea"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {currentTareaIndex !== null 
                ? "Modifica los detalles de la tarea existente" 
                : "Completa la información para crear una nueva tarea"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="tarea-name" className="text-sm font-medium">Nombre de la Tarea</label>
              <Input
                id="tarea-name"
                placeholder="Nombre de la tarea"
                defaultValue={currentTareaIndex !== null 
                  ? form.getValues(`tasks.${currentTareaIndex}.name`) 
                  : ""}
              />
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="tarea-description" className="text-sm font-medium">Descripción</label>
              <Textarea
                id="tarea-description"
                placeholder="Describe la tarea en detalle"
                className="min-h-[80px]"
                defaultValue={currentTareaIndex !== null 
                  ? form.getValues(`tasks.${currentTareaIndex}.description`) 
                  : ""}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tarea-status" className="text-sm font-medium">Estado</label>
              <Select
                defaultValue={currentTareaIndex !== null 
                  ? form.getValues(`tasks.${currentTareaIndex}.status`) 
                  : "pending"}
              >
                <SelectTrigger id="tarea-status">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosTarea.map(estado => (
                    <SelectItem key={estado.id} value={estado.id}>
                      {estado.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="tarea-progress" className="text-sm font-medium">Progreso (%)</label>
              <Input
                id="tarea-progress"
                type="number"
                min={0}
                max={100}
                placeholder="Progreso"
                defaultValue={currentTareaIndex !== null 
                  ? form.getValues(`tasks.${currentTareaIndex}.progress`) 
                  : 0}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tarea-start-date" className="text-sm font-medium">Fecha de Inicio</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    {currentTareaIndex !== null && form.getValues(`tasks.${currentTareaIndex}.startDate`)
                      ? format(new Date(form.getValues(`tasks.${currentTareaIndex}.startDate`)), "dd/MM/yyyy")
                      : <span>Seleccionar fecha</span>
                    }
                    <CalendarIcon className="ml-auto h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentTareaIndex !== null 
                      ? new Date(form.getValues(`tasks.${currentTareaIndex}.startDate`)) 
                      : new Date()}
                    onSelect={(date) => {
                      const element = document.getElementById("tarea-start-date-hidden") as HTMLInputElement;
                      if (element && date) {
                        element.value = date.toISOString();
                        
                        // Si está habilitada la duración, calcular fecha de fin
                        if (useTaskDuration) {
                          const endDate = calculateEndDate(date, taskDurationType, taskDurationValue);
                          const endElement = document.getElementById("tarea-end-date-hidden") as HTMLInputElement;
                          if (endElement) {
                            endElement.value = endDate.toISOString();
                            
                            // Actualizar la visualización del botón de fecha de fin
                            const endDateButton = document.querySelector("[data-end-date-display]");
                            if (endDateButton) {
                              endDateButton.textContent = format(endDate, "dd/MM/yyyy");
                            }
                          }
                        }
                      }
                    }}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <input 
                type="hidden" 
                id="tarea-start-date-hidden" 
                defaultValue={
                  currentTareaIndex !== null 
                    ? new Date(form.getValues(`tasks.${currentTareaIndex}.startDate`)).toISOString() 
                    : new Date().toISOString()
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="use-task-duration" className="text-sm font-medium">
                  Usar duración
                </label>
                <input 
                  type="checkbox" 
                  id="use-task-duration"
                  checked={useTaskDuration}
                  onChange={(e) => setUseTaskDuration(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
              
              {useTaskDuration ? (
                <div className="flex space-x-2">
                  <Input 
                    type="number" 
                    min="1"
                    value={taskDurationValue}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 1;
                      setTaskDurationValue(value);
                      
                      // Actualizar fecha de fin si tenemos fecha de inicio
                      const startElement = document.getElementById("tarea-start-date-hidden") as HTMLInputElement;
                      if (startElement && startElement.value) {
                        const startDate = new Date(startElement.value);
                        const endDate = calculateEndDate(startDate, taskDurationType, value);
                        
                        const endElement = document.getElementById("tarea-end-date-hidden") as HTMLInputElement;
                        if (endElement) {
                          endElement.value = endDate.toISOString();
                          
                          // Actualizar la visualización del botón de fecha de fin
                          const endDateButton = document.querySelector("[data-end-date-display]");
                          if (endDateButton) {
                            endDateButton.textContent = format(endDate, "dd/MM/yyyy");
                          }
                        }
                      }
                    }}
                    className="w-20"
                  />
                  <Select
                    value={taskDurationType}
                    onValueChange={(value: string) => {
                      const newType = value as 'days' | 'weeks' | 'months';
                      setTaskDurationType(newType);
                      
                      // Actualizar fecha de fin si tenemos fecha de inicio
                      const startElement = document.getElementById("tarea-start-date-hidden") as HTMLInputElement;
                      if (startElement && startElement.value) {
                        const startDate = new Date(startElement.value);
                        const endDate = calculateEndDate(startDate, newType, taskDurationValue);
                        
                        const endElement = document.getElementById("tarea-end-date-hidden") as HTMLInputElement;
                        if (endElement) {
                          endElement.value = endDate.toISOString();
                          
                          // Actualizar la visualización del botón de fecha de fin
                          const endDateButton = document.querySelector("[data-end-date-display]");
                          if (endDateButton) {
                            endDateButton.textContent = format(endDate, "dd/MM/yyyy");
                          }
                        }
                      }
                    }}
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
                <>
                  <label htmlFor="tarea-end-date" className="text-sm font-medium">Fecha de Finalización</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left" data-end-date-display>
                        {currentTareaIndex !== null && form.getValues(`tasks.${currentTareaIndex}.endDate`)
                          ? format(new Date(form.getValues(`tasks.${currentTareaIndex}.endDate`)), "dd/MM/yyyy")
                          : <span>Seleccionar fecha</span>
                        }
                        <CalendarIcon className="ml-auto h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={currentTareaIndex !== null 
                          ? new Date(form.getValues(`tasks.${currentTareaIndex}.endDate`)) 
                          : new Date(new Date().setMonth(new Date().getMonth() + 1))}
                        onSelect={(date) => {
                          const element = document.getElementById("tarea-end-date-hidden") as HTMLInputElement;
                          if (element && date) {
                            element.value = date.toISOString();
                          }
                        }}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </>
              )}
              <input 
                type="hidden" 
                id="tarea-end-date-hidden" 
                defaultValue={
                  currentTareaIndex !== null 
                    ? new Date(form.getValues(`tasks.${currentTareaIndex}.endDate`)).toISOString() 
                    : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tarea-assigned-to" className="text-sm font-medium">Responsable</label>
              <Select
                defaultValue={currentTareaIndex !== null 
                  ? form.getValues(`tasks.${currentTareaIndex}.assignedTo`) 
                  : undefined}
              >
                <SelectTrigger id="tarea-assigned-to">
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  {empleados.map(empleado => (
                    <SelectItem key={empleado._id} value={empleado._id || ''}>
                      {empleado.firstName} {empleado.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="tarea-budget" className="text-sm font-medium">Presupuesto ($)</label>
              <Input
                id="tarea-budget"
                type="number"
                min={0}
                step={100}
                placeholder="Presupuesto"
                defaultValue={currentTareaIndex !== null 
                  ? form.getValues(`tasks.${currentTareaIndex}.budget`) 
                  : 0}
              />
            </div>
            <div className="flex items-center space-x-2 sm:col-span-2">
              <input
                type="checkbox"
                id="tarea-blocked"
                className="h-4 w-4 rounded border-border text-primary"
                defaultChecked={currentTareaIndex !== null 
                  ? form.getValues(`tasks.${currentTareaIndex}.blocked`) 
                  : false}
              />
              <label htmlFor="tarea-blocked" className="text-sm">
                Tarea bloqueada (dependiente de otras tareas)
              </label>
            </div>
            
            {/* Campo para seleccionar dependencias */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Dependencias</label>
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    // Obtener el elemento hidden que almacena las dependencias seleccionadas
                    const dependenciesElement = document.getElementById("tarea-dependencies-hidden") as HTMLInputElement;
                    if (!dependenciesElement) return;
                    
                    // Obtener las dependencias actuales
                    let currentDeps: string[] = [];
                    try {
                      currentDeps = dependenciesElement.value ? JSON.parse(dependenciesElement.value) : [];
                    } catch (e) {
                      currentDeps = [];
                    }
                    
                    // Añadir la nueva dependencia si no existe ya
                    if (value && !currentDeps.includes(value)) {
                      const newDeps = [...currentDeps, value];
                      dependenciesElement.value = JSON.stringify(newDeps);
                      
                      // Actualizar la UI
                      const depsContainer = document.getElementById("selected-dependencies-container");
                      if (depsContainer) {
                        // Encontrar nombre de la tarea seleccionada
                        const tareas = form.getValues("tasks") || [];
                        const tarea = tareas.find(t => t.id === parseInt(value));
                        
                        const depBadge = document.createElement("div");
                        depBadge.className = "inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium m-1";
                        depBadge.dataset.depId = value;
                        depBadge.innerHTML = `
                          ${tarea ? tarea.name : `Tarea #${value}`}
                          <button type="button" class="ml-1 rounded-full p-0.5 hover:bg-accent">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
                            </svg>
                          </button>
                        `;
                        
                        // Añadir evento para eliminar la dependencia
                        depBadge.querySelector("button")?.addEventListener("click", () => {
                          // Eliminar del hidden input
                          let deps = JSON.parse(dependenciesElement.value);
                          deps = deps.filter((d: string) => d !== value);
                          dependenciesElement.value = JSON.stringify(deps);
                          
                          // Eliminar el badge
                          depBadge.remove();
                        });
                        
                        depsContainer.appendChild(depBadge);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar dependencias" />
                  </SelectTrigger>
                  <SelectContent>
                    {form.getValues("tasks")?.filter(t => {
                      // Excluir la tarea actual si estamos editando
                      if (currentTareaIndex !== null) {
                        return t.id !== form.getValues(`tasks.${currentTareaIndex}.id`);
                      }
                      return true;
                    }).map(tarea => (
                      <SelectItem key={tarea.id} value={tarea.id?.toString() || ''}>
                        {tarea.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div id="selected-dependencies-container" className="flex flex-wrap">
                  {/* Aquí se mostrarán las dependencias seleccionadas */}
                  {currentTareaIndex !== null && form.getValues(`tasks.${currentTareaIndex}.dependencies`) ? 
                    form.getValues(`tasks.${currentTareaIndex}.dependencies`)?.map((depId: string) => {
                      const tareas = form.getValues("tasks") || [];
                      const tarea = tareas.find(t => t.id === parseInt(depId));
                      return (
                        <div 
                          key={depId} 
                          className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium m-1"
                          data-dep-id={depId}
                        >
                          {tarea ? tarea.name : `Tarea #${depId}`}
                          <button 
                            type="button"
                            className="ml-1 rounded-full p-0.5 hover:bg-accent"
                            onClick={() => {
                              // Obtener el elemento hidden que almacena las dependencias
                              const dependenciesElement = document.getElementById("tarea-dependencies-hidden") as HTMLInputElement;
                              if (!dependenciesElement) return;
                              
                              // Actualizar el valor de las dependencias
                              let deps = JSON.parse(dependenciesElement.value);
                              deps = deps.filter((d: string) => d !== depId);
                              dependenciesElement.value = JSON.stringify(deps);
                              
                              // Eliminar el badge
                              document.querySelector(`[data-dep-id="${depId}"]`)?.remove();
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
                            </svg>
                          </button>
                        </div>
                      );
                    }) : null
                  }
                </div>
                
                {/* Input oculto para almacenar las dependencias */}
                <input 
                  type="hidden" 
                  id="tarea-dependencies-hidden" 
                  defaultValue={
                    currentTareaIndex !== null && form.getValues(`tasks.${currentTareaIndex}.dependencies`)
                      ? JSON.stringify(form.getValues(`tasks.${currentTareaIndex}.dependencies`))
                      : "[]"
                  }
                />
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTareaForm(false);
                setCurrentTareaIndex(null);
                // Resetear estados de duración
                setUseTaskDuration(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // Obtenemos los valores del formulario de tarea
                const nombreTarea = (document.getElementById("tarea-name") as HTMLInputElement).value;
                const descripcionTarea = (document.getElementById("tarea-description") as HTMLTextAreaElement).value;
                const estadoTarea = (document.getElementById("tarea-status") as HTMLSelectElement).value || "pending";
                const progresoTarea = parseInt((document.getElementById("tarea-progress") as HTMLInputElement).value || "0");
                const presupuestoTarea = parseInt((document.getElementById("tarea-budget") as HTMLInputElement).value || "0");
                const bloqueadaTarea = (document.getElementById("tarea-blocked") as HTMLInputElement).checked;
                const responsableTarea = (document.getElementById("tarea-assigned-to") as HTMLSelectElement)?.value;
                
                // Obtener fechas de los campos ocultos
                const fechaInicio = (document.getElementById("tarea-start-date-hidden") as HTMLInputElement)?.value 
                  ? new Date((document.getElementById("tarea-start-date-hidden") as HTMLInputElement).value)
                  : new Date();
                  
                const fechaFin = (document.getElementById("tarea-end-date-hidden") as HTMLInputElement)?.value
                  ? new Date((document.getElementById("tarea-end-date-hidden") as HTMLInputElement).value)
                  : new Date(new Date().setMonth(new Date().getMonth() + 1));
                
                // Obtener dependencias
                const dependenciesElement = document.getElementById("tarea-dependencies-hidden") as HTMLInputElement;
                let dependencies: string[] = [];
                try {
                  dependencies = dependenciesElement?.value ? JSON.parse(dependenciesElement.value) : [];
                } catch (e) {
                  dependencies = [];
                }
                
                console.log("Fechas de tarea:", { inicio: fechaInicio, fin: fechaFin });
                console.log("Dependencias de tarea:", dependencies);
                
                // Crear objeto de tarea y añadirlo
                handleAddTarea({
                  name: nombreTarea || "Nueva Tarea",
                  description: descripcionTarea || "",
                  status: estadoTarea,
                  progress: isNaN(progresoTarea) ? 0 : progresoTarea,
                  startDate: fechaInicio,
                  endDate: fechaFin,
                  assignedTo: responsableTarea || undefined,
                  budget: isNaN(presupuestoTarea) ? 0 : presupuestoTarea,
                  spent: 0,
                  blocked: bloqueadaTarea,
                  dependencies: dependencies
                });
                
                // Resetear estados de duración
                setUseTaskDuration(false);
              }}
            >
              {currentTareaIndex !== null ? "Actualizar Tarea" : "Añadir Tarea"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
