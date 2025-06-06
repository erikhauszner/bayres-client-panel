"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, ChevronRight, FileText, AlertCircle, Calendar, Clock, Check } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Datos de ejemplo para pagos pendientes
const PENDING_PAYMENTS = [
  {
    id: "PAY-2023-0030",
    employee: {
      id: "EMP001",
      name: "Carlos Rodríguez",
      position: "Director de Diseño",
      avatar: "/avatars/EMP001.jpg"
    },
    amount: "$4,800.00",
    concept: "Salario Julio",
    type: "salary",
    date: "15/07/2023",
    details: {
      period: "Mensual",
      accountNumber: "****4582",
      method: "Transferencia Bancaria",
      account: "Cuenta Principal"
    }
  },
  {
    id: "PAY-2023-0031",
    employee: {
      id: "EMP002",
      name: "Ana González",
      position: "Desarrollador Senior",
      avatar: "/avatars/EMP002.jpg"
    },
    amount: "$4,200.00",
    concept: "Salario Julio",
    type: "salary",
    date: "15/07/2023",
    details: {
      period: "Mensual",
      accountNumber: "****6721",
      method: "Transferencia Bancaria",
      account: "Cuenta Principal"
    }
  },
  {
    id: "PAY-2023-0032",
    employee: {
      id: "EMP003",
      name: "Manuel Torres",
      position: "Marketing Manager",
      avatar: "/avatars/EMP003.jpg"
    },
    amount: "$1,200.00",
    concept: "Comisión por venta",
    type: "commission_sale",
    date: "20/07/2023",
    details: {
      client: "Empresa ABC",
      products: ["Diseño Web", "Plan SEO"],
      percentage: "10%",
      subtotal: "$12,000.00",
      accountNumber: "****9145",
      method: "Transferencia Bancaria",
      account: "Cuenta Operativa"
    }
  },
  {
    id: "PAY-2023-0033",
    employee: {
      id: "EMP004",
      name: "Laura Méndez",
      position: "Diseñador UI/UX",
      avatar: "/avatars/EMP004.jpg"
    },
    amount: "$750.00",
    concept: "Bono por proyecto",
    type: "bonus",
    date: "22/07/2023",
    details: {
      reason: "Finalización anticipada del proyecto",
      title: "Bono por Productividad",
      accountNumber: "****1457",
      method: "Transferencia Bancaria",
      account: "Cuenta Principal"
    }
  },
  {
    id: "PAY-2023-0034",
    employee: {
      id: "EMP005",
      name: "Javier Sánchez",
      position: "Desarrollador Junior",
      avatar: "/avatars/EMP005.jpg"
    },
    amount: "$600.00",
    concept: "Tarea finalizada",
    type: "task_completed",
    date: "18/07/2023",
    details: {
      project: "App Móvil E-commerce",
      task: "Desarrollo Frontend",
      accountNumber: "****7820",
      method: "Transferencia Bancaria",
      account: "Cuenta Principal"
    }
  },
  {
    id: "PAY-2023-0035",
    employee: {
      id: "EMP002",
      name: "Ana González",
      position: "Desarrollador Senior",
      avatar: "/avatars/EMP002.jpg"
    },
    amount: "$850.00",
    concept: "Comisión por upsell",
    type: "commission_upsell",
    date: "21/07/2023",
    details: {
      client: "Digital Solutions",
      products: ["Hosting Premium", "Mantenimiento Anual"],
      percentage: "10%",
      subtotal: "$8,500.00",
      accountNumber: "****6721",
      method: "Transferencia Bancaria",
      account: "Cuenta Operativa"
    }
  }
];

// Datos de ejemplo de cuentas bancarias
const ACCOUNTS = [
  { id: "ACC001", name: "Cuenta Operativa Principal" },
  { id: "ACC002", name: "Cuenta Reservas" },
  { id: "ACC003", name: "Cuenta Impuestos" },
  { id: "ACC004", name: "Cuenta Nómina" }
]

export default function NominaConfirmarPagoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [accountOrigin, setAccountOrigin] = useState("")
  
  // Verificar si se está cargando un pago específico
  useEffect(() => {
    const paymentId = searchParams.get('paymentId')
    if (paymentId) {
      const payment = PENDING_PAYMENTS.find(p => p.id === paymentId)
      if (payment) {
        setSelectedPayment(payment)
        setShowDetailView(true)
      }
    }
  }, [searchParams])
  
  // Seleccionar/deseleccionar un pago
  const togglePaymentSelection = (paymentId: string) => {
    setSelectedPayments(prev => {
      if (prev.includes(paymentId)) {
        return prev.filter(id => id !== paymentId)
      } else {
        return [...prev, paymentId]
      }
    })
  }
  
  // Seleccionar todos los pagos
  const selectAllPayments = () => {
    if (selectedPayments.length === PENDING_PAYMENTS.length) {
      setSelectedPayments([])
    } else {
      setSelectedPayments(PENDING_PAYMENTS.map(p => p.id))
    }
  }
  
  // Ver detalles de un pago
  const viewPaymentDetails = (payment: any) => {
    setSelectedPayment(payment)
    setShowDetailView(true)
  }
  
  // Volver a la lista de pagos
  const backToList = () => {
    setSelectedPayment(null)
    setShowDetailView(false)
  }
  
  // Obtener el tipo de pago en texto
  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case "salary": return "Sueldo";
      case "commission_sale": return "Comisión por Venta";
      case "commission_upsell": return "Comisión por Upsell";
      case "task_completed": return "Tarea Finalizada";
      case "bonus": return "Bono";
      default: return type;
    }
  }
  
  // Renderizar la lista de pagos pendientes
  const renderPaymentsList = () => {
    return (
      <>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Pagos Pendientes de Confirmación</h2>
            <p className="text-sm text-muted-foreground">
              Selecciona los pagos que deseas confirmar
            </p>
          </div>
          
          {selectedPayments.length > 0 && (
            <Button>
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Confirmar Seleccionados ({selectedPayments.length})</span>
            </Button>
          )}
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={selectedPayments.length === PENDING_PAYMENTS.length && PENDING_PAYMENTS.length > 0} 
                  onCheckedChange={selectAllPayments}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Empleado</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PENDING_PAYMENTS.map(payment => (
              <TableRow key={payment.id} className={selectedPayments.includes(payment.id) ? "bg-primary/5" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={selectedPayments.includes(payment.id)} 
                    onCheckedChange={() => togglePaymentSelection(payment.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{payment.id}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={payment.employee.avatar} alt={payment.employee.name} />
                      <AvatarFallback>{payment.employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{payment.employee.name}</div>
                      <div className="text-xs text-muted-foreground">{payment.employee.position}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{payment.concept}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getPaymentTypeText(payment.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                    <span>{payment.date}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{payment.amount}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => viewPaymentDetails(payment)}>
                    <span>Detalles</span>
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            
            {PENDING_PAYMENTS.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-8 w-8 mb-2" />
                    <p>No hay pagos pendientes de confirmación</p>
                    <Button variant="link" className="mt-2" onClick={() => router.push('/finanzas/nomina-registrar-pago')}>
                      Registrar un nuevo pago
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </>
    )
  }
  
  // Renderizar la vista de detalle de un pago
  const renderPaymentDetail = () => {
    if (!selectedPayment) return null
    
    return (
      <>
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={backToList} className="mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span>Volver a la lista</span>
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Detalles del Pago</h2>
              <p className="text-sm text-muted-foreground">
                Confirma los detalles antes de procesar el pago
              </p>
            </div>
            
            <Badge className="bg-amber-100 text-amber-800">
              <Clock className="mr-1 h-3 w-3" />
              Pendiente
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Información del Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID del Pago</p>
                  <p className="font-medium">{selectedPayment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Programada</p>
                  <p className="font-medium">{selectedPayment.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Concepto</p>
                  <p className="font-medium">{selectedPayment.concept}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Pago</p>
                  <p className="font-medium">{getPaymentTypeText(selectedPayment.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto</p>
                  <p className="font-medium text-lg text-primary">{selectedPayment.amount}</p>
                  {selectedPayment.type === "commission_sale" && (
                    <p className="text-xs text-muted-foreground">
                      Comisión del {selectedPayment.details.percentage} sobre {selectedPayment.details.subtotal}
                    </p>
                  )}
                  {selectedPayment.type === "commission_upsell" && (
                    <p className="text-xs text-muted-foreground">
                      Comisión del {selectedPayment.details.percentage} sobre {selectedPayment.details.subtotal}
                    </p>
                  )}
                </div>
              </div>
              
              {selectedPayment.type === "salary" && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Detalles del Sueldo</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Período</p>
                      <p className="font-medium">{selectedPayment.details.period}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cuenta</p>
                      <p className="font-medium">{selectedPayment.details.account}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedPayment.type === "commission_sale" && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Detalles de la Comisión por Venta</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-medium">{selectedPayment.details.client}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Porcentaje</p>
                      <p className="font-medium">{selectedPayment.details.percentage}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="font-medium">{selectedPayment.details.subtotal}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cuenta</p>
                      <p className="font-medium">{selectedPayment.details.account}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Productos</p>
                      <div className="mt-1">
                        {selectedPayment.details.products.map((product: string, index: number) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedPayment.type === "commission_upsell" && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Detalles de la Comisión por Upsell</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-medium">{selectedPayment.details.client}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Porcentaje</p>
                      <p className="font-medium">{selectedPayment.details.percentage}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="font-medium">{selectedPayment.details.subtotal}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cuenta</p>
                      <p className="font-medium">{selectedPayment.details.account}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Productos</p>
                      <div className="mt-1">
                        {selectedPayment.details.products.map((product: string, index: number) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedPayment.type === "task_completed" && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Detalles de la Tarea Finalizada</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Proyecto</p>
                      <p className="font-medium">{selectedPayment.details.project}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tarea</p>
                      <p className="font-medium">{selectedPayment.details.task}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cuenta</p>
                      <p className="font-medium">{selectedPayment.details.account}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedPayment.type === "bonus" && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Detalles del Bono</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Título</p>
                      <p className="font-medium">{selectedPayment.details.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cuenta</p>
                      <p className="font-medium">{selectedPayment.details.account}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Motivo</p>
                      <p className="font-medium">{selectedPayment.details.reason}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {(selectedPayment.type === "commission_sale" || selectedPayment.type === "commission_upsell") && (
                <div className="border-t border-b py-4 my-4">
                  <h3 className="text-sm font-medium mb-2">Cálculo de Comisión</h3>
                  <div className="bg-muted/30 rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm">Subtotal de productos:</p>
                        <p className="text-sm mt-2">Porcentaje de comisión:</p>
                        <p className="font-medium mt-2">Total de comisión:</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{selectedPayment.details.subtotal}</p>
                        <p className="text-sm mt-2">{selectedPayment.details.percentage}</p>
                        <p className="font-medium mt-2 text-primary">{selectedPayment.amount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="account-origin">Cuenta de Origen</Label>
                  <Select
                    value={accountOrigin}
                    onValueChange={setAccountOrigin}
                  >
                    <SelectTrigger id="account-origin">
                      <SelectValue placeholder="Selecciona la cuenta de donde saldrá el dinero" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNTS.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Selecciona la cuenta desde donde se realizará el pago</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reference">Referencia de Pago</Label>
                  <Input 
                    id="reference" 
                    placeholder="Número de transferencia, cheque, etc." 
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Notas adicionales sobre este pago" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              
              <Alert variant="default" className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/40">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Al confirmar este pago, se registrará como completado y se enviará una notificación al empleado.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="border-t flex justify-between">
              <Button variant="outline" onClick={backToList}>
                Cancelar
              </Button>
              <Button>
                <Check className="mr-2 h-4 w-4" />
                <span>Confirmar Pago</span>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Información del Empleado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-2 pb-4 border-b">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedPayment.employee.avatar} alt={selectedPayment.employee.name} />
                  <AvatarFallback>{selectedPayment.employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{selectedPayment.employee.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPayment.employee.position}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Información Bancaria</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Cuenta</p>
                    <p className="font-medium">{selectedPayment.details.accountNumber || "****1234"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Método de Pago</p>
                    <p className="font-medium">{selectedPayment.details.method || "Transferencia Bancaria"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cuenta de Origen</p>
                    <p className="font-medium">{selectedPayment.details.account || "Cuenta Principal"}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Historial de Pagos</h3>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Junio 2023</span>
                    <span className="font-medium">$4,800.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Mayo 2023</span>
                    <span className="font-medium">$4,800.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Abril 2023</span>
                    <span className="font-medium">$4,800.00</span>
                  </div>
                </div>
                <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                  Ver historial completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col space-y-6 p-8">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.push('/finanzas')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Confirmar Pagos de Nómina</h1>
            </div>
            
            <Card className="w-full">
              <CardContent className="p-6">
                {showDetailView ? renderPaymentDetail() : renderPaymentsList()}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 