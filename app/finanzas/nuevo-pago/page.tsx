"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { CalendarIcon, Check, Search, UserCircle, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function NuevoPagoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [paymentType, setPaymentType] = useState("payroll")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Datos de ejemplo para empleados (nómina)
  const employees = [
    { id: "EMP001", name: "Carlos Rodríguez", position: "Director de Diseño", salary: "$4,800.00", accountNumber: "****4582", selected: false },
    { id: "EMP002", name: "Ana González", position: "Desarrollador Senior", salary: "$4,200.00", accountNumber: "****6721", selected: false },
    { id: "EMP003", name: "Manuel Torres", position: "Marketing Manager", salary: "$3,800.00", accountNumber: "****9145", selected: false },
    { id: "EMP004", name: "Laura Méndez", position: "Diseñador UI/UX", salary: "$3,500.00", accountNumber: "****1457", selected: false },
    { id: "EMP005", name: "Javier Sánchez", position: "Desarrollador Junior", salary: "$2,800.00", accountNumber: "****7820", selected: false }
  ]
  
  // Procesar parámetros de la URL
  useEffect(() => {
    // Obtener tipo de pago de la URL
    const type = searchParams.get('type')
    if (type && (type === 'bonus' || type === 'commission')) {
      setPaymentType(type)
    }
    
    // Obtener ID de empleado de la URL
    const employeeId = searchParams.get('employeeId')
    if (employeeId) {
      // Marcar el empleado como seleccionado
      employees.forEach(emp => {
        if (emp.id === employeeId) {
          emp.selected = true
        }
      })
    }
  }, [searchParams])
  
  // Calcular el total seleccionado
  const calculateTotal = () => {
    return employees
      .filter(employee => employee.selected)
      .reduce((sum, employee) => sum + parseFloat(employee.salary.replace(/[^\d.-]/g, '')), 0)
      .toFixed(2)
  }
  
  // Manejar la selección de un empleado
  const toggleEmployeeSelection = (employeeId: string) => {
    employees.forEach(emp => {
      if (emp.id === employeeId) {
        emp.selected = !emp.selected
      }
    })
    // Forzar re-renderizado
    setSearchTerm(searchTerm)
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
              <h1 className="text-3xl font-bold tracking-tight">Nuevo Pago de Nómina</h1>
            </div>
            
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Registrar Nuevo Pago a Empleados</CardTitle>
                <CardDescription>
                  Registra un nuevo pago de nómina, bono o comisión a empleados
                </CardDescription>
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
                        <SelectItem value="payroll">Pago de Nómina</SelectItem>
                        <SelectItem value="bonus">Pago de Bono</SelectItem>
                        <SelectItem value="commission">Pago de Comisión</SelectItem>
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
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Buscar Empleado</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar empleado por nombre o ID..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30px]"></TableHead>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Cuenta</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Checkbox 
                              checked={employee.selected} 
                              onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-xs text-muted-foreground">{employee.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>{employee.accountNumber}</TableCell>
                          <TableCell className="text-right">{employee.salary}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-concept">Concepto</Label>
                  <Select defaultValue={paymentType === "payroll" ? "salary" : paymentType === "bonus" ? "bonus" : "commission"}>
                    <SelectTrigger id="payment-concept">
                      <SelectValue placeholder="Selecciona el concepto" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentType === "payroll" ? (
                        <>
                          <SelectItem value="salary">Salario Mensual</SelectItem>
                          <SelectItem value="overtime">Horas Extra</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </>
                      ) : paymentType === "bonus" ? (
                        <>
                          <SelectItem value="bonus">Bono</SelectItem>
                          <SelectItem value="performance">Bono de Desempeño</SelectItem>
                          <SelectItem value="annual">Bono Anual</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="commission">Comisión</SelectItem>
                          <SelectItem value="sales">Comisión por Ventas</SelectItem>
                          <SelectItem value="project">Comisión por Proyecto</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {paymentType !== "payroll" && (
                  <div className="space-y-2">
                    <Label htmlFor="payment-reason">Motivo del {paymentType === "bonus" ? "Bono" : "Comisión"}</Label>
                    <Select>
                      <SelectTrigger id="payment-reason">
                        <SelectValue placeholder="Selecciona el motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentType === "bonus" ? (
                          <>
                            <SelectItem value="performance">Desempeño</SelectItem>
                            <SelectItem value="project">Finalización de Proyecto</SelectItem>
                            <SelectItem value="annual">Bono Anual</SelectItem>
                            <SelectItem value="holiday">Bono Vacacional</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="sales">Ventas</SelectItem>
                            <SelectItem value="recruitment">Captación de Clientes</SelectItem>
                            <SelectItem value="project">Entrega de Proyecto</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Método de Pago</Label>
                    <Select>
                      <SelectTrigger id="payment-method">
                        <SelectValue placeholder="Selecciona el método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-account">Cuenta de Origen</Label>
                    <Select>
                      <SelectTrigger id="payment-account">
                        <SelectValue placeholder="Selecciona la cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Cuenta Principal</SelectItem>
                        <SelectItem value="savings">Cuenta de Ahorro</SelectItem>
                        <SelectItem value="operations">Cuenta Operativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reference">Referencia de Pago</Label>
                  <Input id="reference" placeholder="Número de transferencia, cheque, etc." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea id="notes" placeholder="Notas adicionales sobre este pago (opcional)" />
                </div>
                
                <div className="border-t pt-4 mt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total a pagar:</span>
                    <span className="text-primary">${calculateTotal()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Seleccionado: {employees.filter(e => e.selected).length} de {employees.length} empleados
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Confirmar Pago</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 