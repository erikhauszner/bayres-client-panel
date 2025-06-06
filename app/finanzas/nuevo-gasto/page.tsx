"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload } from "lucide-react"
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
import { CalendarIcon } from "lucide-react"
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

export default function NuevoGastoPage() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)) // 15 días después
  const [isPaid, setIsPaid] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  
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
              <h1 className="text-3xl font-bold tracking-tight">Nuevo Gasto</h1>
            </div>
            
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>Registrar Gasto</CardTitle>
                <CardDescription>
                  Registra un nuevo gasto o factura por pagar
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expense-concept">Concepto</Label>
                    <Input id="expense-concept" placeholder="Ej. Servicios hosting, nómina, etc." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="provider">Proveedor</Label>
                    <Select>
                      <SelectTrigger id="provider">
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Nuevo Proveedor</SelectItem>
                        <SelectItem value="provider1">Adobe Inc.</SelectItem>
                        <SelectItem value="provider2">Servicios Cloud</SelectItem>
                        <SelectItem value="provider3">Oficina Central</SelectItem>
                        <SelectItem value="provider4">Suministros Express</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expense-date">Fecha del Gasto</Label>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="expense-due-date">Fecha de Vencimiento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                      <Input id="amount" placeholder="0.00" className="pl-7" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="office">Instalaciones</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="payroll">Nómina</SelectItem>
                        <SelectItem value="services">Servicios Profesionales</SelectItem>
                        <SelectItem value="supplies">Suministros</SelectItem>
                        <SelectItem value="other">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select>
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Asociar a un cliente (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin cliente</SelectItem>
                        <SelectItem value="client1">ABC Solutions</SelectItem>
                        <SelectItem value="client2">Corporación XYZ</SelectItem>
                        <SelectItem value="client3">Servicios Integrados</SelectItem>
                        <SelectItem value="client4">Tech Avanzada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project">Proyecto (Opcional)</Label>
                    <Select>
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Asignar a un proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin proyecto</SelectItem>
                        <SelectItem value="project1">Desarrollo Web</SelectItem>
                        <SelectItem value="project2">Campaña de Marketing</SelectItem>
                        <SelectItem value="project3">Consultoría IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-account">Cuenta de Pago</Label>
                    <Select>
                      <SelectTrigger id="payment-account">
                        <SelectValue placeholder="Cuenta para realizar el pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Cuenta Principal</SelectItem>
                        <SelectItem value="operations">Cuenta Operativa</SelectItem>
                        <SelectItem value="credit">Tarjeta de Crédito Empresarial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Método de Pago</Label>
                    <Select>
                      <SelectTrigger id="payment-method">
                        <SelectValue placeholder="Método de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                        <SelectItem value="credit">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="is-paid" className="font-medium">Pagado</Label>
                    <span className="text-sm text-muted-foreground">El gasto ya ha sido pagado</span>
                  </div>
                  <Switch 
                    id="is-paid" 
                    checked={isPaid}
                    onCheckedChange={setIsPaid}
                  />
                </div>
                
                {isPaid && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment-date">Fecha de Pago</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal"
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
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="is-recurring" className="font-medium">Gasto Recurrente</Label>
                    <span className="text-sm text-muted-foreground">Se repetirá automáticamente</span>
                  </div>
                  <Switch 
                    id="is-recurring" 
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                </div>
                
                {isRecurring && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frecuencia</Label>
                      <Select>
                        <SelectTrigger id="frequency">
                          <SelectValue placeholder="Selecciona la frecuencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="end-date">Fecha de Fin (Opcional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>Selecciona una fecha</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea id="notes" placeholder="Notas adicionales sobre este gasto (opcional)" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="attachment">Comprobante/Factura</Label>
                  <div className="flex items-center gap-2">
                    <Input id="attachment" type="file" className="flex-1 cursor-pointer" />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Formatos aceptados: PDF, JPG, PNG. Máx 5MB</p>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isPaid ? "Registrar Gasto Pagado" : "Registrar Gasto"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 