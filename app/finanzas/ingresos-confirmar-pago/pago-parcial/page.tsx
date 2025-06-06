"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { financeService } from "@/lib/services/financeService"

// Datos de ejemplo de cuentas bancarias (posteriormente se obtendrán de la API)
const ACCOUNTS = [
  { id: "ACC001", name: "Cuenta Operativa Principal" },
  { id: "ACC002", name: "Cuenta Reservas" },
  { id: "ACC003", name: "Cuenta Impuestos" }
]

export default function PagoParcialPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [invoice, setInvoice] = useState<any>(null)
  const [partialAmount, setPartialAmount] = useState("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [accountDestination, setAccountDestination] = useState("")

  // Cargar la factura desde la URL
  useEffect(() => {
    const invoiceId = searchParams.get('invoiceId')
    if (invoiceId) {
      loadInvoice(invoiceId)
    } else {
      // Si no hay ID, volver a la lista
      toast({
        title: "Error",
        description: "No se encontró la factura especificada",
        variant: "destructive"
      })
      router.push('/finanzas/ingresos-confirmar-pago')
    }
  }, [searchParams])

  // Cargar los detalles de la factura
  const loadInvoice = async (invoiceId: string) => {
    setIsLoading(true)
    try {
      // Primero intentamos obtener la factura específica
      const invoiceData = await financeService.getInvoiceById(invoiceId)
      
      if (!invoiceData) {
        throw new Error("No se pudo cargar la factura")
      }
      
      // Formatear la factura para la UI
      setInvoice({
        id: invoiceData._id,
        clientName: invoiceData.clientName || 'Cliente',
        clientId: invoiceData.clientId,
        amount: financeService.formatCurrency(invoiceData.total),
        rawAmount: invoiceData.total,
        concept: invoiceData.items && invoiceData.items.length > 0 
          ? invoiceData.items[0].description 
          : 'Servicios profesionales',
        issueDate: financeService.formatDate(invoiceData.issueDate),
        dueDate: financeService.formatDate(invoiceData.dueDate),
        status: invoiceData.status,
        recurrence: "none",
        paymentMethod: 'Transferencia',
        email: "",
        type: "service",
        details: {
          category: 'Venta de servicios',
          project: invoiceData.projectName || 'General',
          account: 'Cuenta Principal'
        },
        client: {
          name: invoiceData.clientName || 'Cliente',
          avatar: "",
          type: "Cliente"
        },
        // Guardamos la factura original para procesarla después
        originalInvoice: invoiceData
      })
    } catch (error) {
      console.error("Error al cargar la factura:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la factura",
        variant: "destructive"
      })
      router.push('/finanzas/ingresos-confirmar-pago')
    } finally {
      setIsLoading(false)
    }
  }

  // Confirmar el pago parcial
  const confirmPartialPayment = async () => {
    if (!invoice) return

    if (!accountDestination) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona una cuenta de destino",
        variant: "destructive"
      })
      return
    }

    // Validar el monto parcial
    const amountValue = parseFloat(partialAmount.replace(/[^\d,]/g, '').replace(',', '.'))
    const totalValue = invoice.rawAmount || parseFloat(invoice.amount?.replace(/[^\d,]/g, '').replace(',', '.') || "0")
    
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Monto inválido",
        description: "Por favor ingresa un monto válido para el pago parcial",
        variant: "destructive"
      })
      return
    }
    
    if (amountValue >= totalValue) {
      toast({
        title: "Monto incorrecto",
        description: "El monto parcial debe ser menor al total de la factura",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const invoiceId = invoice.id
      const remainingAmount = totalValue - amountValue

      // Crear objeto con los detalles adicionales para el pago
      const paymentDetails = {
        accountId: accountDestination,
        reference: reference || 'Confirmación manual',
        notes: notes || '',
        isPartialPayment: true,
        partialAmount: amountValue,
        remainingAmount: remainingAmount,
        originalInvoiceId: invoiceId
      }

      // Confirmar la factura enviando todos los datos al backend
      const result = await financeService.confirmInvoicePayments([invoiceId], paymentDetails)
      
      if (result && result.success && result.success.includes(invoiceId)) {
        toast({
          title: "Pago parcial confirmado",
          description: "El pago parcial ha sido registrado correctamente",
        })
        router.push('/finanzas/ingresos-confirmar-pago')
      } else {
        throw new Error("No se pudo confirmar el pago")
      }
    } catch (error) {
      console.error("Error al confirmar el pago parcial:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar el pago parcial",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Volver a la lista de facturas
  const goBack = () => {
    router.push('/finanzas/ingresos-confirmar-pago')
  }

  // Si está cargando o no hay factura, mostrar estado de carga
  if (isLoading || !invoice) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Cargando detalles de la factura...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={goBack} className="mb-2">
          <ArrowLeft className="mr-1 h-4 w-4" />
          <span>Volver a la lista</span>
        </Button>
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Registrar Pago Parcial</h2>
            <p className="text-sm text-muted-foreground">
              Ingresa el monto parcial a cobrar para esta factura
            </p>
          </div>
          
          <Badge className="bg-amber-100 text-amber-800">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalles del Pago Parcial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ID de la Factura</p>
                <p className="font-medium">{invoice.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Emisión</p>
                <p className="font-medium">{invoice.issueDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concepto</p>
                <p className="font-medium">{invoice.concept}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{invoice.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                <p className="font-medium">{invoice.dueDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monto Total</p>
                <p className="font-medium text-lg text-green-600">{invoice.amount}</p>
              </div>
            </div>
            
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="account-destination">Cuenta de Destino</Label>
                <Select
                  value={accountDestination}
                  onValueChange={setAccountDestination}
                >
                  <SelectTrigger id="account-destination">
                    <SelectValue placeholder="Selecciona la cuenta donde ingresó el dinero" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNTS.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="partial-amount">Monto Parcial a Pagar</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                  <Input 
                    id="partial-amount" 
                    className="pl-7"
                    placeholder="Ingresa el monto parcial a pagar" 
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">El monto debe ser menor al total de la factura: {invoice.amount}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reference">Referencia de Pago</Label>
                <Input 
                  id="reference" 
                  placeholder="Número de transferencia, recibo, etc." 
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Notas adicionales sobre este pago parcial" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            
            <Alert variant="default" className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/40">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Al confirmar este pago parcial, se registrará el monto pagado en la factura original y se creará automáticamente una nueva factura por el monto restante.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={goBack} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmPartialPayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Procesando...</span>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  <span>Confirmar Pago Parcial</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-2 pb-4 border-b">
              <Avatar className="h-20 w-20">
                <AvatarImage src={invoice.client?.avatar} alt={invoice.clientName} />
                <AvatarFallback>{invoice.clientName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{invoice.clientName}</h3>
                <p className="text-sm text-muted-foreground">{invoice.client?.type || "Cliente"}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Información de Cobro</h3>
              <div className="space-y-2">
                {invoice.details?.project && (
                  <div>
                    <p className="text-sm text-muted-foreground">Proyecto</p>
                    <p className="font-medium">{invoice.details.project}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 