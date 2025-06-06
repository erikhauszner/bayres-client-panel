"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CalendarIcon, Repeat, AlertCircle, Info, UserCircle, Building2, Clock, Loader, Bell, Users, Briefcase, DollarSign, CheckCircle, TrendingUp, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Switch } from "@/components/ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { financeService } from "@/lib/services/financeService"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Datos de ejemplo para empleados (se usarán solo si falla la carga de datos reales)
const EMPLOYEES = [
  { id: "EMP001", name: "Carlos Rodríguez", position: "Director de Diseño", salary: "$4,800.00" },
  { id: "EMP002", name: "Ana González", position: "Desarrollador Senior", salary: "$4,200.00" },
  { id: "EMP003", name: "Manuel Torres", position: "Marketing Manager", salary: "$3,800.00" },
  { id: "EMP004", name: "Laura Méndez", position: "Diseñador UI/UX", salary: "$3,500.00" },
  { id: "EMP005", name: "Javier Sánchez", position: "Desarrollador Junior", salary: "$2,800.00" }
]

export default function NominaRecurrentePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("basic")
  const [showPreview, setShowPreview] = useState(false)

  // Estados para formulario
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    paymentType: "salary", // salary, bonus
    frequency: "monthly",
    customFrequency: {
      value: "1",
      unit: "months"
    },
    startDate: new Date() as Date | null,
    endDate: null as Date | null,
    hasEndDate: false,
    notificationType: "before-days",
    notificationConfig: {
      days: "3",
      isCustom: false
    },
    notes: "",
    customNotificationDays: "",
    paymentAccount: "main", // cuenta desde la que se pagará
    amount: ""
  })

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar empleados
        const employeeData = await financeService.getEmployeePayroll();
        
        if (employeeData && employeeData.length > 0) {
          setEmployees(employeeData);
        } else {
          // Si no hay datos, mostrar un mensaje y usar los datos de ejemplo
          toast.warning("No se pudieron cargar empleados reales. Usando datos de demostración.");
          setEmployees(EMPLOYEES);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        // En caso de error, mostrar mensaje y usar los datos de ejemplo
        toast.error("Error al cargar los datos. Usando datos de demostración.");
        setEmployees(EMPLOYEES);
      }
    };
    
    loadData();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      // Si estamos cambiando el tipo de notificación a "before-days-custom" y no hay valor para customNotificationDays
      if (field === 'notificationType' && value === 'before-days-custom' && !prev.customNotificationDays) {
        return {
          ...prev,
          [field]: value,
          customNotificationDays: "15" // Valor predeterminado
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  }

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  }

  const calculateTotalSalary = () => {
    // Ya no usamos el salario del empleado, simplemente contamos
    return selectedEmployees.length;
  }

  const getNextPaymentDates = () => {
    if (!formData.startDate) return [];
    
    const dates = [];
    let currentDate = new Date(formData.startDate);
    
    // Generar 5 fechas de pago próximas
    for (let i = 0; i < 5; i++) {
      // Clonar la fecha para no modificar la original
      const nextDate = new Date(currentDate);
      
      // Añadir la fecha a la lista
      dates.push(nextDate);
      
      // Calcular la siguiente fecha según la frecuencia
      if (formData.frequency === "weekly") {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (formData.frequency === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (formData.frequency === "quarterly") {
        currentDate.setMonth(currentDate.getMonth() + 3);
      } else if (formData.frequency === "yearly") {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      } else if (formData.frequency === "custom") {
        const value = parseInt(formData.customFrequency.value);
        if (formData.customFrequency.unit === "days") {
          currentDate.setDate(currentDate.getDate() + value);
        } else if (formData.customFrequency.unit === "weeks") {
          currentDate.setDate(currentDate.getDate() + (value * 7));
        } else { // months
          currentDate.setMonth(currentDate.getMonth() + value);
        }
      }
    }
    
    return dates;
  }

  // Formatear la frecuencia para mostrar
  const getFrequencyText = () => {
    switch(formData.frequency) {
      case "weekly": return "Semanal";
      case "monthly": return "Mensual";
      case "quarterly": return "Trimestral";
      case "yearly": return "Anual";
      case "custom": 
        const unit = formData.customFrequency.unit === "days" ? "días" : 
                    formData.customFrequency.unit === "weeks" ? "semanas" : "meses";
        return `Cada ${formData.customFrequency.value} ${unit}`;
      default: return "Mensual";
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    if (selectedEmployees.length === 0) {
      toast.error("Debes seleccionar al menos un empleado");
      return;
    }
    
    if (!formData.startDate) {
      toast.error("Debes seleccionar una fecha de inicio");
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error("Debes ingresar un título para la nómina recurrente");
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Debes ingresar un monto válido");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Aquí iría la lógica para enviar los datos al servidor
      // const result = await financeService.createRecurringPayroll({
      //   title: formData.title,
      //   description: formData.description,
      //   employeeIds: selectedEmployees,
      //   frequency: formData.frequency,
      //   customFrequency: formData.frequency === "custom" ? formData.customFrequency : null,
      //   startDate: formData.startDate,
      //   endDate: formData.hasEndDate ? formData.endDate : null,
      //   notificationType: formData.notificationType,
      //   notificationConfig: formData.notificationConfig,
      //   paymentType: formData.paymentType,
      //   paymentAccount: formData.paymentAccount,
      //   notes: formData.notes,
      //   amount: parseFloat(formData.amount)
      // });
      
      // Simulación de respuesta exitosa
      setTimeout(() => {
        toast.success("Nómina recurrente creada con éxito");
        router.push("/finanzas?tab=payroll");
      }, 1500);
    } catch (error) {
      console.error("Error al crear nómina recurrente:", error);
      toast.error("Error al crear la nómina recurrente");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Nuevo Plan de Nómina Recurrente</h1>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-7">
            <div className="md:col-span-5">
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    {(() => {
                      // Mostrar icono según el tipo de pago
                      switch (formData.paymentType) {
                        case "commission_sale": 
                        case "commission_upsell": 
                          return <TrendingUp className="h-5 w-5 mr-2" />;
                        case "task_completed": 
                          return <CheckCircle className="h-5 w-5 mr-2" />;
                        case "salary": 
                          return <Briefcase className="h-5 w-5 mr-2" />;
                        case "bonus": 
                          return <Award className="h-5 w-5 mr-2" />;
                        default: 
                          return <DollarSign className="h-5 w-5 mr-2" />;
                      }
                    })()}
                    <div>
                      <CardTitle>
                        Configurar Plan de {(() => {
                          switch (formData.paymentType) {
                            case "commission_sale": return "Comisión por Venta";
                            case "commission_upsell": return "Comisión por Upsell";
                            case "task_completed": return "Pago por Tarea Finalizada";
                            case "salary": return "Sueldo";
                            case "bonus": return "Bonos";
                            default: return "Nómina";
                          }
                        })()} Recurrente
                      </CardTitle>
                      <CardDescription>
                        Crea un plan para pagar periódicamente a tus empleados de forma automática
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="basic">Información Básica</TabsTrigger>
                      <TabsTrigger value="schedule">Programación</TabsTrigger>
                      <TabsTrigger value="details">Detalles y Notificaciones</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="payment-type">Tipo de Pago</Label>
                          <Select 
                            value={formData.paymentType} 
                            onValueChange={(value) => handleInputChange("paymentType", value)}
                          >
                            <SelectTrigger id="payment-type">
                              <SelectValue placeholder="Selecciona el tipo de pago" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="commission_sale">Comisión por Venta</SelectItem>
                              <SelectItem value="commission_upsell">Comisión por Upsell</SelectItem>
                              <SelectItem value="task_completed">Tarea Finalizada</SelectItem>
                              <SelectItem value="salary">Sueldo</SelectItem>
                              <SelectItem value="bonus">Bonos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="title">Título del Plan</Label>
                          <Input 
                            id="title" 
                            placeholder="Ej. Pago de salarios mensuales" 
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="payment-amount">Monto</Label>
                          <div className="relative">
                            <Input 
                              id="payment-amount"
                              placeholder="Ej. $500.00"
                              value={formData.amount || ""}
                              onChange={(e) => handleInputChange("amount", e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea 
                            id="description" 
                            placeholder="Describe este plan de pagos recurrentes..." 
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="payment-account">Cuenta de Pago</Label>
                          <Select 
                            value={formData.paymentAccount} 
                            onValueChange={(value) => handleInputChange("paymentAccount", value)}
                          >
                            <SelectTrigger id="payment-account">
                              <SelectValue placeholder="Selecciona la cuenta" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="main">Cuenta Principal</SelectItem>
                              <SelectItem value="operations">Cuenta Operativa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center mb-2">
                            <Label>Empleados</Label>
                            <span className="text-sm text-muted-foreground">
                              {selectedEmployees.length} seleccionados
                            </span>
                          </div>
                          
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-10"></TableHead>
                                  <TableHead>Empleado</TableHead>
                                  <TableHead>Cargo</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {employees.map(employee => (
                                  <TableRow 
                                    key={employee.id}
                                    className={cn(
                                      selectedEmployees.includes(employee.id) ? "bg-muted/50" : "",
                                      "cursor-pointer"
                                    )}
                                    onClick={() => toggleEmployeeSelection(employee.id)}
                                  >
                                    <TableCell>
                                      <div className="flex items-center justify-center">
                                        {selectedEmployees.includes(employee.id) ? (
                                          <CheckCircle className="h-4 w-4 text-primary" />
                                        ) : null}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="bg-primary/10 text-primary">
                                            {employee.name.split(' ').map((n: string) => n[0]).join('')}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium">{employee.name}</div>
                                      </div>
                                    </TableCell>
                                    <TableCell>{employee.position}</TableCell>
                                  </TableRow>
                                ))}
                                {employees.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                      No hay empleados disponibles
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                            
                            {selectedEmployees.length > 0 && (
                              <div className="mt-2 flex justify-end items-center p-2 bg-muted/30 rounded-md">
                                <div className="text-sm">{selectedEmployees.length} empleados seleccionados</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => setActiveTab("schedule")}
                          disabled={isLoading}
                        >
                          Continuar
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="schedule" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Frecuencia de pago</Label>
                          <RadioGroup 
                            value={formData.frequency} 
                            onValueChange={(value) => handleInputChange("frequency", value)}
                            className="space-y-2"
                          >
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                              <div className="flex items-center space-x-2 rounded-md border p-3">
                                <RadioGroupItem value="weekly" id="weekly" />
                                <Label htmlFor="weekly" className="flex items-center">
                                  <Repeat className="mr-2 h-4 w-4" />
                                  Semanal
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 rounded-md border p-3">
                                <RadioGroupItem value="monthly" id="monthly" />
                                <Label htmlFor="monthly" className="flex items-center">
                                  <Repeat className="mr-2 h-4 w-4" />
                                  Mensual
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 rounded-md border p-3">
                                <RadioGroupItem value="quarterly" id="quarterly" />
                                <Label htmlFor="quarterly" className="flex items-center">
                                  <Repeat className="mr-2 h-4 w-4" />
                                  Trimestral
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 rounded-md border p-3">
                                <RadioGroupItem value="yearly" id="yearly" />
                                <Label htmlFor="yearly" className="flex items-center">
                                  <Repeat className="mr-2 h-4 w-4" />
                                  Anual
                                </Label>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                              <RadioGroupItem value="custom" id="custom" />
                              <Label htmlFor="custom" className="flex items-center">
                                <Repeat className="mr-2 h-4 w-4" />
                                Personalizada:
                              </Label>
                              <div className="flex flex-1 items-center space-x-2 ml-2">
                                <span>Cada</span>
                                <Input 
                                  className="w-16" 
                                  value={formData.customFrequency.value}
                                  onChange={(e) => handleInputChange("customFrequency", {
                                    ...formData.customFrequency,
                                    value: e.target.value
                                  })}
                                  disabled={formData.frequency !== "custom"}
                                />
                                <Select 
                                  value={formData.customFrequency.unit}
                                  onValueChange={(value) => handleInputChange("customFrequency", {
                                    ...formData.customFrequency,
                                    unit: value
                                  })}
                                  disabled={formData.frequency !== "custom"}
                                >
                                  <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Unidad" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="days">Días</SelectItem>
                                    <SelectItem value="weeks">Semanas</SelectItem>
                                    <SelectItem value="months">Meses</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Fecha de inicio</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="startDate"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.startDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.startDate ? (
                                  format(formData.startDate, "PPP", { locale: es })
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={formData.startDate || undefined}
                                onSelect={(date) => handleInputChange("startDate", date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <p className="text-xs text-muted-foreground">
                            Fecha a partir de la cual comenzará a procesarse la nómina recurrente
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="has-end-date"
                              checked={formData.hasEndDate}
                              onCheckedChange={(checked) => handleInputChange("hasEndDate", checked)}
                            />
                            <Label htmlFor="has-end-date">Establecer fecha de finalización</Label>
                          </div>
                          
                          {formData.hasEndDate && (
                            <div className="mt-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !formData.endDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.endDate ? (
                                      format(formData.endDate, "PPP", { locale: es })
                                    ) : (
                                      <span>Selecciona una fecha</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={formData.endDate || undefined}
                                    onSelect={(date) => handleInputChange("endDate", date)}
                                    initialFocus
                                    disabled={(date) => formData.startDate ? date < formData.startDate : false}
                                  />
                                </PopoverContent>
                              </Popover>
                              <p className="text-xs text-muted-foreground mt-1">
                                Fecha en la que se dejará de generar la nómina recurrente
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {formData.startDate && (
                          <Alert className="bg-muted">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Próximos pagos</AlertTitle>
                            <AlertDescription>
                              <div className="grid grid-cols-1 gap-1 mt-2">
                                {getNextPaymentDates().map((date, idx) => (
                                  <div key={idx} className="text-sm">
                                    <Badge variant="outline" className="mr-2">{idx + 1}</Badge>
                                    {format(date, "PPP", { locale: es })}
                                  </div>
                                ))}
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab("basic")}
                          disabled={isLoading}
                        >
                          Atrás
                        </Button>
                        <Button 
                          onClick={() => setActiveTab("details")}
                          disabled={isLoading}
                        >
                          Continuar
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details" className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="notifications">Notificaciones</Label>
                          <RadioGroup 
                            value={formData.notificationType}
                            onValueChange={(value) => handleInputChange("notificationType", value)}
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
                            
                            {formData.notificationType === "before-days" && (
                              <div className="mt-4 rounded-md border p-4">
                                <div className="space-y-3">
                                  <Label>Selecciona cuándo enviar la notificación</Label>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <Button
                                      type="button"
                                      variant={formData.notificationConfig.days === "1" ? "default" : "outline"}
                                      className="w-full"
                                      onClick={() => handleInputChange("notificationConfig", {
                                        ...formData.notificationConfig,
                                        days: "1"
                                      })}
                                    >
                                      1 día antes
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={formData.notificationConfig.days === "3" ? "default" : "outline"}
                                      className="w-full"
                                      onClick={() => handleInputChange("notificationConfig", {
                                        ...formData.notificationConfig,
                                        days: "3"
                                      })}
                                    >
                                      3 días antes
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={formData.notificationConfig.days === "5" ? "default" : "outline"}
                                      className="w-full"
                                      onClick={() => handleInputChange("notificationConfig", {
                                        ...formData.notificationConfig,
                                        days: "5"
                                      })}
                                    >
                                      5 días antes
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={formData.notificationConfig.days === "7" ? "default" : "outline"}
                                      className="w-full"
                                      onClick={() => handleInputChange("notificationConfig", {
                                        ...formData.notificationConfig,
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
                          
                          {formData.notificationType === "before-days-custom" && (
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
                                  value={formData.customNotificationDays}
                                  onChange={(e) => handleInputChange("customNotificationDays", e.target.value)}
                                />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">días antes</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Especifica cuántos días antes del vencimiento se enviará la notificación</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2 pt-2">
                          <Label htmlFor="notes">Notas adicionales</Label>
                          <Textarea 
                            id="notes" 
                            placeholder="Añade cualquier información adicional relevante para este plan de nómina recurrente" 
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab("schedule")}
                          disabled={isLoading}
                        >
                          Atrás
                        </Button>
                        <Button 
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {isLoading ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              <Repeat className="mr-2 h-4 w-4" />
                              Crear Nómina Recurrente
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                  <CardDescription>Detalles del plan de nómina recurrente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Tipo de pago</p>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        switch (formData.paymentType) {
                          case "commission_sale": return "Comisión por Venta";
                          case "commission_upsell": return "Comisión por Upsell";
                          case "task_completed": return "Pago por Tarea Finalizada";
                          case "salary": return "Sueldo";
                          case "bonus": return "Bonos";
                          default: return "No especificado";
                        }
                      })()}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Empleados seleccionados</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedEmployees.length} empleados
                    </p>
                  </div>
                  
                  {formData.amount && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Monto</p>
                      <p className="text-sm text-muted-foreground">
                        ${parseFloat(formData.amount).toFixed(2)}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Frecuencia</p>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 bg-primary/10">
                        <Repeat className="mr-1 h-3 w-3" />
                        {getFrequencyText()}
                      </Badge>
                    </div>
                  </div>
                  
                  {formData.startDate && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Primera fecha de pago</p>
                      <p className="text-sm text-muted-foreground">
                        {format(formData.startDate, "PPP", { locale: es })}
                      </p>
                    </div>
                  )}
                  
                  {formData.notificationType !== "no-notification" && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Notificación</p>
                      <p className="text-sm text-muted-foreground">
                        {formData.notificationType === "before-days" 
                          ? `${formData.notificationConfig.days} días antes`
                          : `${formData.customNotificationDays} días antes (personalizado)`
                        }
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <Alert variant="default" className="bg-primary/5 border-primary/20">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      <AlertTitle>Información</AlertTitle>
                      <AlertDescription className="text-xs">
                        Los pagos recurrentes se programarán automáticamente y te avisaremos cuando sea el momento de confirmarlos.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 