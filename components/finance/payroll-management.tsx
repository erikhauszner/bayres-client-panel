"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Download, 
  Plus, 
  RefreshCw, 
  Search, 
  Filter, 
  UserCircle,
  Wallet,
  CalendarClock,
  CheckCircle,
  Clock,
  MoreHorizontal,
  FileText,
  Calendar,
  DollarSign,
  Award,
  Check
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { financeService } from "@/lib/services/financeService"
import { toast } from "sonner"

// Interfaces para los datos
interface Employee {
  id: string;
  name: string;
  position: string;
  salary: string;
  email: string;
  startDate: string;
  paymentMethod: string;
  accountNumber: string;
  lastPayment: string;
  status: "active" | "inactive";
}

interface Payment {
  id: string;
  employee: string;
  employeeId: string;
  amount: string;
  concept: string;
  date: string;
  status: "completed" | "pending";
}

interface ScheduledPayment {
  id: string;
  name: string;
  frequency: string;
  employees: number;
  totalAmount: string;
  nextDate: string;
  status: string;
}

export default function PayrollManagement() {
  const [activeTab, setActiveTab] = useState("employees")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false)
  
  // Estados para almacenar los datos
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados para filtros
  const [employeeFilter, setEmployeeFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Cargar datos al iniciar el componente
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        // Cargar empleados
        const employeeData = await financeService.getEmployeePayroll()
        setEmployees(employeeData)
        
        // Cargar historial de pagos
        const paymentsData = await financeService.getPayrollHistory()
        setPayments(paymentsData)
        
        // Cargar pagos programados
        const scheduledData = await financeService.getScheduledPayments()
        setScheduledPayments(scheduledData)
      } catch (error) {
        console.error("Error al cargar datos de nómina:", error)
        toast.error("No se pudieron cargar los datos de nómina")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  const viewEmployeeDetails = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEmployeeDialogOpen(true)
  }
  
  // Filtrar empleados según los criterios
  const filteredEmployees = employees.filter(employee => {
    // Filtro por búsqueda
    const matchesSearch = searchTerm === "" || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtro por estado
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter
    
    return matchesSearch && matchesStatus
  })
  
  // Filtrar pagos según los criterios
  const filteredPayments = payments.filter(payment => {
    // Filtro por empleado
    const matchesEmployee = employeeFilter === "all" || payment.employeeId === employeeFilter
    
    // Filtro por estado
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    
    return matchesEmployee && matchesStatus
  })
  
  // Función para confirmar un pago
  const confirmPayment = async (paymentId: string) => {
    try {
      const result = await financeService.confirmPayrollPayment(paymentId)
      if (result) {
        // Actualizar la lista de pagos
        setPayments(prevPayments => 
          prevPayments.map(payment => 
            payment.id === paymentId 
              ? { ...payment, status: "completed" } 
              : payment
          )
        )
        toast.success("Pago confirmado con éxito")
      }
    } catch (error) {
      console.error("Error al confirmar pago:", error)
      toast.error("No se pudo confirmar el pago")
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Nómina</h2>
          <p className="text-muted-foreground">
            Administra empleados, pagos de salarios y bonificaciones
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar</span>
          </Button>
          <Button size="sm" className="h-9" asChild>
            <Link href="/finanzas/nomina-registrar-pago">
              <Plus className="mr-2 h-4 w-4" />
              <span>Registrar Pago</span>
            </Link>
          </Button>
          <Button size="sm" className="h-9" variant="outline" asChild>
            <Link href="/finanzas/nomina-recurrente">
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Nómina Recurrente</span>
            </Link>
          </Button>
          <Button size="sm" className="h-9" variant="secondary" asChild>
            <Link href="/finanzas/nomina-confirmar-pago">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Confirmar Pagos</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground pt-1">
              {isLoading ? 'Cargando...' : `${employees.filter(e => e.status === 'active').length} activos`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nómina Mensual</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading 
                ? 'Cargando...' 
                : `$${employees
                    .filter(e => e.status === 'active')
                    .reduce((sum, emp) => sum + parseFloat(emp.salary.replace(/[^0-9.-]+/g, '')), 0)
                    .toFixed(2)}`
              }
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Total salarios mensuales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <CalendarClock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading 
                ? 'Cargando...' 
                : `$${payments
                    .filter(p => p.status === 'pending')
                    .reduce((sum, payment) => sum + parseFloat(payment.amount.replace(/[^0-9.-]+/g, '')), 0)
                    .toFixed(2)}`
              }
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {payments.filter(p => p.status === 'pending').length} pagos programados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bonos y Comisiones</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading 
                ? 'Cargando...' 
                : `$${payments
                    .filter(p => p.concept.toLowerCase().includes('bono') || p.concept.toLowerCase().includes('comisión'))
                    .reduce((sum, payment) => sum + parseFloat(payment.amount.replace(/[^0-9.-]+/g, '')), 0)
                    .toFixed(2)}`
              }
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {scheduledPayments.length > 0 ? `Próximo: ${scheduledPayments[0].nextDate}` : 'Sin pagos programados'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="payments">Historial de Pagos</TabsTrigger>
          <TabsTrigger value="scheduled">Pagos Programados</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de Empleados */}
        <TabsContent value="employees" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar empleado..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los departamentos</SelectItem>
                      <SelectItem value="design">Diseño</SelectItem>
                      <SelectItem value="development">Desarrollo</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="mr-2"
                    onClick={() => {
                      setSearchTerm("")
                      setDepartmentFilter("all")
                      setStatusFilter("all")
                    }}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      setIsLoading(true)
                      try {
                        const employeeData = await financeService.getEmployeePayroll()
                        setEmployees(employeeData)
                        toast.success("Datos actualizados")
                      } catch (error) {
                        console.error("Error al actualizar datos:", error)
                        toast.error("No se pudieron actualizar los datos")
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Listado de empleados */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead className="text-right">Salario</TableHead>
                      <TableHead>Método de Pago</TableHead>
                      <TableHead>Último Pago</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No se encontraron empleados que coincidan con los filtros
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map(employee => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-xs text-muted-foreground">{employee.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell className="text-right font-medium">{employee.salary}</TableCell>
                          <TableCell>
                            <div>{employee.paymentMethod}</div>
                            <div className="text-xs text-muted-foreground">{employee.accountNumber}</div>
                          </TableCell>
                          <TableCell>{employee.lastPayment}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => viewEmployeeDetails(employee)}>
                                  <UserCircle className="mr-2 h-4 w-4" />
                                  <span>Ver detalles</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Historial de pagos</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/finanzas/nomina-registrar-pago?employeeId=${employee.id}`}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    <span>Nuevo pago</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/finanzas/nomina-registrar-pago?type=bonus&employeeId=${employee.id}`}>
                                    <Award className="mr-2 h-4 w-4" />
                                    <span>Agregar bono</span>
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Historial de Pagos */}
        <TabsContent value="payments" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar pago..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los empleados</SelectItem>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="completed">Completados</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      setIsLoading(true)
                      try {
                        const paymentsData = await financeService.getPayrollHistory()
                        setPayments(paymentsData)
                        toast.success("Datos actualizados")
                      } catch (error) {
                        console.error("Error al actualizar datos:", error)
                        toast.error("No se pudieron actualizar los datos")
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                    disabled={isLoading}
                    className="mr-2"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Exportar</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabla de pagos */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No se encontraron pagos que coincidan con los filtros
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.id.substring(0, 8)}</TableCell>
                          <TableCell>{payment.employee}</TableCell>
                          <TableCell>{payment.concept}</TableCell>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell className="text-right font-medium">{payment.amount}</TableCell>
                          <TableCell>
                            <Badge className={
                              payment.status === "completed" ? "bg-green-100 text-green-800" : 
                              "bg-amber-100 text-amber-800"
                            }>
                              {payment.status === "completed" ? (
                                <CheckCircle className="mr-1 h-3 w-3 inline" />
                              ) : (
                                <Clock className="mr-1 h-3 w-3 inline" />
                              )}
                              {payment.status === "completed" ? "Completado" : "Pendiente"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {payment.status === "pending" ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300"
                                onClick={() => confirmPayment(payment.id)}
                              >
                                <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                                <span>Confirmar</span>
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8"
                              >
                                <FileText className="mr-1 h-4 w-4" />
                                <span>Ver detalle</span>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredPayments.length} de {payments.length} pagos
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm">
                  Siguiente
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Pagos Programados */}
        <TabsContent value="scheduled" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pagos programados */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pagos Programados</CardTitle>
                  <CardDescription>
                    Pagos recurrentes configurados
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Nuevo Programa</span>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {scheduledPayments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No hay pagos programados
                      </div>
                    ) : (
                      scheduledPayments.map(schedule => (
                        <div key={schedule.id} className="border rounded-lg">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{schedule.name}</h4>
                              <Badge className="bg-green-100 text-green-800">
                                {schedule.status === "active" ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Frecuencia:</span>
                                <span className="ml-2">{schedule.frequency}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Empleados:</span>
                                <span className="ml-2">{schedule.employees}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Próximo pago:</span>
                                <span className="ml-2">{schedule.nextDate}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total:</span>
                                <span className="ml-2 font-medium">{schedule.totalAmount}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-end mt-4">
                              <Button variant="outline" size="sm">Ver detalles</Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Calendario de pagos */}
            <Card>
              <CardHeader>
                <CardTitle>Calendario de Pagos</CardTitle>
                <CardDescription>
                  Próximos pagos programados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border p-4 h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Calendar className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Aquí se mostrará un calendario con los próximos pagos programados
                    </p>
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Próximos pagos:</h4>
                      {isLoading ? (
                        <div className="flex justify-center items-center py-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        scheduledPayments.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No hay pagos programados</p>
                        ) : (
                          <ul className="space-y-2 text-sm">
                            {scheduledPayments.map(schedule => (
                              <li key={schedule.id} className="flex justify-between">
                                <span>{schedule.nextDate}</span>
                                <span className="font-medium">{schedule.name}</span>
                              </li>
                            ))}
                          </ul>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog de detalle de empleado */}
      <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Perfil de Empleado</DialogTitle>
            <DialogDescription>
              Información detallada del empleado
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{selectedEmployee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedEmployee.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.position}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">ID Empleado</h4>
                  <p className="text-sm">{selectedEmployee.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Email</h4>
                  <p className="text-sm">{selectedEmployee.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Fecha de inicio</h4>
                  <p className="text-sm">{selectedEmployee.startDate}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Salario</h4>
                  <p className="text-sm font-bold">{selectedEmployee.salary}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Método de pago</h4>
                  <p className="text-sm">{selectedEmployee.paymentMethod}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Cuenta</h4>
                  <p className="text-sm">{selectedEmployee.accountNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Último pago</h4>
                  <p className="text-sm">{selectedEmployee.lastPayment}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Estado</h4>
                  <Badge className="bg-green-100 text-green-800">
                    {selectedEmployee.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-2">Historial de Pagos Recientes</h4>
                <div className="space-y-2">
                  {payments.filter(payment => payment.employeeId === selectedEmployee.id)
                    .slice(0, 3)
                    .map(payment => (
                      <div key={payment.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{payment.concept}</span>
                          <span className="text-muted-foreground ml-2">({payment.date})</span>
                        </div>
                        <div className="font-medium">
                          {payment.amount}
                          {payment.status === "pending" && (
                            <Badge className="ml-2 bg-amber-100 text-amber-800">Pendiente</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  {payments.filter(payment => payment.employeeId === selectedEmployee.id).length === 0 && (
                    <p className="text-sm text-muted-foreground">No hay pagos registrados</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEmployeeDialogOpen(false)}>
                  Cerrar
                </Button>
                <Button asChild>
                  <Link href={`/finanzas/nomina-registrar-pago?employeeId=${selectedEmployee.id}`}>
                    Nuevo Pago
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 