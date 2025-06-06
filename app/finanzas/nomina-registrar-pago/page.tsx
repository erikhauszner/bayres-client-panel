"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CalendarIcon, CalendarClock, Users, CheckCircle, TrendingUp, Award, Briefcase, Tag, DollarSign, Plus, Trash2, UserCircle, Bell, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function NominaRegistrarPagoPage() {
  const router = useRouter()
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [frequency, setFrequency] = useState("once")
  const [paymentType, setPaymentType] = useState("salary")
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [products, setProducts] = useState<Array<{id: string, name: string, description: string, price: string, quantity: number}>>([])
  
  // Nuevos estados para asociar clientes e ingresos
  const [associateClient, setAssociateClient] = useState(false)
  const [associateIncome, setAssociateIncome] = useState(false)
  const [selectedAssociatedClient, setSelectedAssociatedClient] = useState<string | null>(null)
  const [selectedIncome, setSelectedIncome] = useState<string | null>(null)
  
  // Estado para notificaciones
  const [notificationType, setNotificationType] = useState("before-days")
  const [notificationConfig, setNotificationConfig] = useState({
    days: "3",
    isCustom: false
  })
  const [customNotificationDays, setCustomNotificationDays] = useState("")
  
  // Datos de ejemplo para empleados
  const employees = [
    { id: "EMP001", name: "Carlos Rodríguez", position: "Director de Diseño", salary: "$4,800.00" },
    { id: "EMP002", name: "Ana González", position: "Desarrollador Senior", salary: "$4,200.00" },
    { id: "EMP003", name: "Manuel Torres", position: "Marketing Manager", salary: "$3,800.00" },
    { id: "EMP004", name: "Laura Méndez", position: "Diseñador UI/UX", salary: "$3,500.00" },
    { id: "EMP005", name: "Javier Sánchez", position: "Desarrollador Junior", salary: "$2,800.00" }
  ]
  
  // Datos de ejemplo para clientes
  const clients = [
    { id: "CLI001", name: "Empresa ABC S.A.", email: "contacto@empresaabc.com" },
    { id: "CLI002", name: "Desarrollos XYZ", email: "info@desarrollosxyz.com" },
    { id: "CLI003", name: "Consultora Innovación", email: "contacto@consultorainnovacion.com" },
    { id: "CLI004", name: "Digital Solutions", email: "contact@digitalsolutions.com" },
    { id: "CLI005", name: "Tech Avanzada", email: "info@techavanzada.com" }
  ]
  
  // Datos de ejemplo para proyectos
  const projects = [
    { id: "PRJ001", name: "Rediseño Sitio Web", client: "CLI001" },
    { id: "PRJ002", name: "App Móvil E-commerce", client: "CLI002" },
    { id: "PRJ003", name: "Campaña Marketing Digital", client: "CLI003" },
    { id: "PRJ004", name: "Sistema de Gestión Interna", client: "CLI004" },
    { id: "PRJ005", name: "Plataforma de Analítica", client: "CLI005" }
  ]
  
  // Datos de ejemplo para tareas
  const tasks = [
    { id: "TSK001", name: "Diseño de Wireframes", project: "PRJ001", status: "completed" },
    { id: "TSK002", name: "Desarrollo Frontend", project: "PRJ002", status: "completed" },
    { id: "TSK003", name: "Configuración de Facebook Ads", project: "PRJ003", status: "completed" },
    { id: "TSK004", name: "Desarrollo de API REST", project: "PRJ004", status: "completed" },
    { id: "TSK005", name: "Implementación de Dashboards", project: "PRJ005", status: "completed" }
  ]
  
  // Datos de ejemplo para ingresos
  const incomes = [
    { id: "INC001", description: "Pago de proyecto web", amount: "$8,500.00", client: "CLI001", date: "15/05/2023" },
    { id: "INC002", description: "Desarrollo de aplicación", amount: "$12,000.00", client: "CLI002", date: "22/05/2023" },
    { id: "INC003", description: "Consultoría SEO", amount: "$3,200.00", client: "CLI003", date: "01/06/2023" },
    { id: "INC004", description: "Hosting y mantenimiento", amount: "$1,800.00", client: "CLI004", date: "10/06/2023" },
    { id: "INC005", description: "Diseño de marca", amount: "$4,500.00", client: "CLI005", date: "18/06/2023" }
  ]
  
  // Agregar un producto al listado
  const addProduct = () => {
    setProducts([...products, { 
      id: `temp-${Date.now()}`, 
      name: "", 
      description: "",
      price: "0.00",
      quantity: 1 
    }])
  }
  
  // Eliminar un producto del listado
  const removeProduct = (index: number) => {
    const newProducts = [...products]
    newProducts.splice(index, 1)
    setProducts(newProducts)
  }
  
  // Actualizar un producto del listado
  const updateProduct = (index: number, field: string, value: string) => {
    const newProducts = [...products]
    // @ts-ignore
    newProducts[index][field] = value
    setProducts(newProducts)
  }
  
  // Calcular el total
  const calculateTotal = () => {
    if (paymentType === "salary") {
      const employee = employees.find(emp => emp.id === selectedEmployee)
      return employee ? parseFloat(employee.salary.replace(/[^\d.-]/g, '')) : 0
    } else if (paymentType === "commission_sale" || paymentType === "commission_upsell") {
      const subtotal = products.reduce((sum, prod) => {
        const price = parseFloat(prod.price.replace(/[^\d.-]/g, '')) || 0
        return sum + (price * prod.quantity)
      }, 0)
      // Aplicar comisión del 10%
      return subtotal * 0.1
    } else if (paymentType === "task_completed" || paymentType === "bonus") {
      // Para estos tipos, el total debería ser ingresado directamente por el usuario
      // Podríamos implementar una lógica para leer el valor del campo de monto
      return 0
    }
    return 0
  }
  
  // Determinar si hay suficientes datos para calcular un total
  const canCalculateTotal = () => {
    // Verificación básica según tipo de pago
    let basicCheck = false;
    
    if (paymentType === "salary" || paymentType === "bonus") {
      basicCheck = !!selectedEmployee;
    } else if (paymentType === "commission_sale" || paymentType === "commission_upsell") {
      basicCheck = !!selectedEmployee && !!selectedClient && products.length > 0;
    } else if (paymentType === "task_completed") {
      basicCheck = !!selectedEmployee && !!selectedTask;
    }
    
    // Si las asociaciones están activas, verificar que estén seleccionadas
    if (associateClient && !selectedAssociatedClient) {
      return false;
    }
    
    if (associateIncome && !selectedIncome) {
      return false;
    }
    
    return basicCheck;
  }
  
  // Renderizar formulario según tipo de pago
  const renderPaymentTypeForm = () => {
    switch (paymentType) {
      case "commission_sale":
      case "commission_upsell":
      case "task_completed":
      case "bonus":
      case "salary":
      default:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="employee">Empleado</Label>
              <Select value={selectedEmployee || ""} onValueChange={setSelectedEmployee}>
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Selecciona un empleado" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary-amount">Monto</Label>
              <div className="relative">
                <Input 
                  id="salary-amount"
                  placeholder="Ej. $500.00"
                  defaultValue={selectedEmployee ? employees.find(emp => emp.id === selectedEmployee)?.salary.replace('$', '') : ''}
                />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <h3 className="text-base font-medium mb-2 flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Configuración de Notificaciones
              </h3>
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
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
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
            
            <div className="border-t my-4"></div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-base font-medium mb-4 flex items-center">
                  <UserCircle className="h-4 w-4 mr-2" />
                  Asociaciones
                </h3>
                
                <div className="flex flex-col gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="associate-client" 
                        checked={associateClient}
                        onCheckedChange={(checked) => {
                          setAssociateClient(checked === true);
                          if (checked !== true) {
                            setSelectedAssociatedClient(null);
                          }
                        }}
                      />
                      <Label 
                        htmlFor="associate-client" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Asociar a un cliente
                      </Label>
                    </div>
                    
                    {associateClient && (
                      <div className="space-y-2 pl-6 mb-6">
                        <Label htmlFor="associated-client">Cliente</Label>
                        <Select 
                          value={selectedAssociatedClient || ""} 
                          onValueChange={setSelectedAssociatedClient}
                        >
                          <SelectTrigger id="associated-client">
                            <SelectValue placeholder="Selecciona un cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients
                              .filter(client => client.name && client.name.trim() !== '')
                              .map((client: any) => (
                                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                              ))}
                            {clients.length > 0 && clients.filter(client => client.name && client.name.trim() !== '').length === 0 && (
                              <SelectItem value="no-clients" disabled>No hay clientes disponibles</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 md:mt-0">
                      <Checkbox 
                        id="associate-income" 
                        checked={associateIncome}
                        onCheckedChange={(checked) => {
                          setAssociateIncome(checked === true);
                          if (checked !== true) {
                            setSelectedIncome(null);
                          }
                        }}
                      />
                      <Label 
                        htmlFor="associate-income" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Asociar a un ingreso
                      </Label>
                    </div>
                    
                    {associateIncome && (
                      <div className="space-y-2 pl-6 mb-6">
                        <Label htmlFor="income">Ingreso</Label>
                        <Select 
                          value={selectedIncome || ""} 
                          onValueChange={setSelectedIncome}
                        >
                          <SelectTrigger id="income">
                            <SelectValue placeholder="Selecciona un ingreso" />
                          </SelectTrigger>
                          <SelectContent>
                            {incomes.map(income => (
                              <SelectItem key={income.id} value={income.id}>
                                {income.description} - {income.amount}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedIncome && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p>Cliente: {clients.find(client => client.id === incomes.find(inc => inc.id === selectedIncome)?.client)?.name}</p>
                            <p>Fecha: {incomes.find(inc => inc.id === selectedIncome)?.date}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {selectedEmployee && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-base font-medium mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Información del Empleado
                </h3>
                <div className="flex justify-between items-center bg-muted/20 p-3 rounded-md">
                  <div>
                    <p className="text-sm text-muted-foreground">Empleado seleccionado:</p>
                    <p className="font-medium">
                      {employees.find(emp => emp.id === selectedEmployee)?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Sueldo base de referencia:</p>
                    <p className="font-medium">
                      {employees.find(emp => emp.id === selectedEmployee)?.salary}/mes
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col space-y-6 p-8">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Registrar Pago de Nómina</h1>
            </div>
            
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center">
                  {(() => {
                    // Inline implementation of getPaymentTypeIcon
                    switch (paymentType) {
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
                      {(() => {
                        // Inline implementation of getPaymentTypeTitle
                        switch (paymentType) {
                          case "commission_sale": return "Comisión por Venta";
                          case "commission_upsell": return "Comisión por Upsell";
                          case "task_completed": return "Pago por Tarea Finalizada";
                          case "salary": return "Pago de Sueldo";
                          case "bonus": return "Pago de Bono";
                          default: return "Registrar Pago";
                        }
                      })()}
                    </CardTitle>
                    <CardDescription>
                      Registra un nuevo pago pendiente para empleados
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 px-6 py-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-type">Tipo de Pago</Label>
                    <Select value={paymentType} onValueChange={setPaymentType}>
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
                    <Label htmlFor="payment-date">Fecha de Pago</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-account">Cuenta de Pago</Label>
                    <Select>
                      <SelectTrigger id="payment-account">
                        <SelectValue placeholder="Selecciona la cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Cuenta Principal</SelectItem>
                        <SelectItem value="operations">Cuenta Operativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="border-t border-b py-8">
                  {renderPaymentTypeForm()}
                </div>
                
                {canCalculateTotal() && (
                  <div className="flex flex-col border-t pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <div className="text-muted-foreground">
                        <p>Total a pagar:</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-xl">${calculateTotal().toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {paymentType === "salary" && selectedEmployee && (
                        <p>
                          Salario de {employees.find(emp => emp.id === selectedEmployee)?.name}
                        </p>
                      )}
                    </div>
                    
                    {/* Mostrar cliente asociado si está seleccionado */}
                    {associateClient && selectedAssociatedClient && (
                      <div className="mt-4 p-3 bg-muted/20 rounded-md">
                        <div className="flex items-center space-x-2">
                          <UserCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Cliente asociado:</span>
                        </div>
                        <div className="pl-6 mt-1">
                          <p className="text-sm">
                            {clients.find(client => client.id === selectedAssociatedClient)?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {clients.find(client => client.id === selectedAssociatedClient)?.email}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Mostrar ingreso asociado si está seleccionado */}
                    {associateIncome && selectedIncome && (
                      <div className="mt-2 p-3 bg-muted/20 rounded-md">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Ingreso asociado:</span>
                        </div>
                        <div className="pl-6 mt-1">
                          <p className="text-sm">
                            {incomes.find(inc => inc.id === selectedIncome)?.description}
                          </p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Monto: {incomes.find(inc => inc.id === selectedIncome)?.amount}</span>
                            <span>Fecha: {incomes.find(inc => inc.id === selectedIncome)?.date}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {(paymentType === "commission_sale" || paymentType === "commission_upsell") && products.length > 0 && (
                  <div className="border-t border-b py-4">
                    <h3 className="text-sm font-medium mb-2">Cálculo de Comisión</h3>
                    <div className="bg-muted/30 rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm">Subtotal de productos:</p>
                          <p className="text-sm mt-2">Porcentaje de comisión:</p>
                          <p className="font-medium mt-2">Total de comisión:</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            ${products.reduce((sum, prod) => {
                              const price = parseFloat(prod.price.replace(/[^\d.-]/g, '')) || 0
                              return sum + (price * prod.quantity)
                            }, 0).toFixed(2)}
                          </p>
                          <p className="text-sm mt-2">10%</p>
                          <p className="font-medium mt-2 text-primary">${calculateTotal().toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea id="notes" placeholder="Notas adicionales sobre este pago (opcional)" />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit" variant="default">
                  Registrar Pago
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 