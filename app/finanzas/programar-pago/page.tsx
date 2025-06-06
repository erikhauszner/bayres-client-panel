"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CalendarIcon, CalendarClock, Users, CheckCircle, TrendingUp, Award, Briefcase, Tag, DollarSign, Plus, Trash2 } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ProgramarPagoPage() {
  const router = useRouter()
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [frequency, setFrequency] = useState("once")
  const [paymentType, setPaymentType] = useState("salary")
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [products, setProducts] = useState<Array<{id: string, name: string, description: string, price: string, quantity: number}>>([])
  
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
  
  // Datos de ejemplo para productos
  const productOptions = [
    { id: "PRD001", name: "Diseño Web", price: "$3,000.00" },
    { id: "PRD002", name: "Desarrollo App Móvil", price: "$5,500.00" },
    { id: "PRD003", name: "Plan SEO", price: "$1,200.00" },
    { id: "PRD004", name: "Hosting Anual", price: "$800.00" },
    { id: "PRD005", name: "Mantenimiento Mensual", price: "$600.00" }
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
      return products.reduce((sum, prod) => {
        const price = parseFloat(prod.price.replace(/[^\d.-]/g, ''))
        return sum + (price * prod.quantity)
      }, 0)
    }
    return 0
  }
  
  // Determinar si hay suficientes datos para calcular un total
  const canCalculateTotal = () => {
    if (paymentType === "salary" || paymentType === "bonus") {
      return !!selectedEmployee
    } else if (paymentType === "commission_sale" || paymentType === "commission_upsell") {
      return !!selectedEmployee && !!selectedClient && products.length > 0
    } else if (paymentType === "task_completed") {
      return !!selectedEmployee && !!selectedTask
    }
    return false
  }
  
  // Renderizar formulario según tipo de pago
  const renderPaymentTypeForm = () => {
    switch (paymentType) {
      case "commission_sale":
      case "commission_upsell":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Empleado Responsable</Label>
                <Select value={selectedEmployee || ""} onValueChange={setSelectedEmployee}>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Selecciona un empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select value={selectedClient || ""} onValueChange={setSelectedClient}>
                  <SelectTrigger id="client">
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
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission-percentage">Porcentaje de Comisión</Label>
                  <div className="relative">
                    <Input
                      id="commission-percentage"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Ej. 10"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium">{paymentType === "commission_sale" ? "Productos Vendidos" : "Productos Ampliados"}</Label>
                <Button variant="outline" size="sm" type="button" onClick={addProduct}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Producto
                </Button>
              </div>
              
              {products.length === 0 ? (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  <Tag className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay productos agregados</p>
                  <p className="text-sm">Haz clic en "Agregar Producto" para comenzar</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product, index) => {
                        const price = parseFloat(product.price.replace(/[^\d.-]/g, '')) || 0
                        const total = price * product.quantity
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Input 
                                value={product.name || ""} 
                                placeholder="Título del producto"
                                onChange={(e) => updateProduct(index, "name", e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                placeholder="Descripción del producto"
                                onChange={(e) => updateProduct(index, "description", e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={product.price} 
                                onChange={(e) => updateProduct(index, "price", e.target.value)}
                              />
                            </TableCell>
                            <TableCell className="w-[100px]">
                              <Input 
                                type="number" 
                                min="1"
                                value={product.quantity} 
                                onChange={(e) => updateProduct(index, "quantity", e.target.value)}
                              />
                            </TableCell>
                            <TableCell>${total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeProduct(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              

            </div>
          </div>
        )
      
      case "task_completed":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Empleado Responsable</Label>
                <Select value={selectedEmployee || ""} onValueChange={setSelectedEmployee}>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Selecciona un empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project">Proyecto</Label>
                <Select value={selectedProject || ""} onValueChange={setSelectedProject}>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Selecciona un proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task">Tarea Finalizada</Label>
              <Select value={selectedTask || ""} onValueChange={setSelectedTask}>
                <SelectTrigger id="task">
                  <SelectValue placeholder="Selecciona una tarea" />
                </SelectTrigger>
                <SelectContent>
                  {tasks
                    .filter(task => !selectedProject || task.project === selectedProject)
                    .map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.name} 
                        {task.status === "completed" && 
                          <Badge className="ml-2 bg-green-100 text-green-800">Finalizada</Badge>
                        }
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a Pagar</Label>
              <Input id="amount" type="text" placeholder="Ej. $500.00" />
            </div>
          </div>
        )
      
      case "salary":
        return (
          <div className="space-y-6">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary-period">Período</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger id="salary-period">
                    <SelectValue placeholder="Selecciona un período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="biweekly">Quincenal</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary-amount">Monto del Sueldo</Label>
                <div className="relative">
                  <Input 
                    id="salary-amount"
                    placeholder="Ej. $500.00"
                    defaultValue={selectedEmployee ? employees.find(emp => emp.id === selectedEmployee)?.salary.replace('$', '') : ''}
                  />
                </div>
              </div>
            </div>
            
            {selectedEmployee && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
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
      
      case "bonus":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Empleado</Label>
                <Select value={selectedEmployee || ""} onValueChange={setSelectedEmployee}>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Selecciona un empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bonus-title">Título del Bono</Label>
                <Input id="bonus-title" type="text" placeholder="Ej. Bono por Productividad" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonus-amount">Monto del Bono</Label>
                <div className="relative">
                  <Input id="bonus-amount" type="text" placeholder="Ej. $500.00" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bonus-description">Descripción del Bono</Label>
              <Textarea id="bonus-description" placeholder="Describe el motivo del bono..." />
            </div>
          </div>
        )
      
      default:
        return null
    }
  }
  
  // Determinar el título según tipo de pago
  const getPaymentTypeTitle = () => {
    switch (paymentType) {
      case "commission_sale": return "Comisión por Venta";
      case "commission_upsell": return "Comisión por Upsell";
      case "task_completed": return "Pago por Tarea Finalizada";
      case "salary": return "Pago de Sueldo";
      case "bonus": return "Pago de Bono";
      default: return "Registrar Pago";
    }
  }
  
  // Determinar el ícono según tipo de pago
  const getPaymentTypeIcon = () => {
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
              <h1 className="text-3xl font-bold tracking-tight">Registrar Pago</h1>
            </div>
            
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center">
                  {getPaymentTypeIcon()}
                  <div>
                    <CardTitle>{getPaymentTypeTitle()}</CardTitle>
                <CardDescription>
                      Registra un nuevo pago para un empleado
                </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Método de Pago</Label>
                    <Select defaultValue="transfer">
                      <SelectTrigger id="payment-method">
                        <SelectValue placeholder="Selecciona el método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="border-t border-b py-6">
                  <ScrollArea className="h-auto max-h-[400px]">
                    {renderPaymentTypeForm()}
                  </ScrollArea>
                </div>
                
                {paymentType === "commission_sale" || paymentType === "commission_upsell" ? (
                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total de comisión:</p>
                      <p className="font-medium text-xl">${calculateTotal().toFixed(2)}</p>
                    </div>
                  </div>
                ) : null}
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea id="notes" placeholder="Notas adicionales sobre este pago (opcional)" />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit">
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