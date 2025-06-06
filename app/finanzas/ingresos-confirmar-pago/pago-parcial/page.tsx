"use client"

import { useState, useEffect, Suspense } from "react"
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
  CreditCard,
  FileText,
  DollarSign
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

// Contexto para useSearchParams
import { createContext, useContext } from "react";
const SearchParamsContext = createContext<ReturnType<typeof useSearchParams> | null>(null);

// Componente para usar useSearchParams con Suspense
function SearchParamsProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  return (
    <SearchParamsContext.Provider value={searchParams}>
      {children}
    </SearchParamsContext.Provider>
  );
}

// Hook personalizado para usar searchParams
function useSearchParamsContext() {
  const context = useContext(SearchParamsContext);
  if (context === null) {
    throw new Error("useSearchParamsContext debe ser usado dentro de SearchParamsProvider");
  }
  return context;
}

// Datos de ejemplo de cuentas bancarias (posteriormente se obtendrán de la API)
const ACCOUNTS = [
  { id: "ACC001", name: "Cuenta Operativa Principal" },
  { id: "ACC002", name: "Cuenta Reservas" },
  { id: "ACC003", name: "Cuenta Impuestos" }
]

// Interfaz para las props del componente
interface PartialPaymentContentProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  invoice: any;
  setInvoice: React.Dispatch<React.SetStateAction<any>>;
  reference: string;
  setReference: React.Dispatch<React.SetStateAction<string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  accountDestination: string;
  setAccountDestination: React.Dispatch<React.SetStateAction<string>>;
  partialAmount: string;
  setPartialAmount: React.Dispatch<React.SetStateAction<string>>;
  router: ReturnType<typeof useRouter>;
  toast: any;
}

export default function PagoParcialPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [invoice, setInvoice] = useState<any>(null)
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [accountDestination, setAccountDestination] = useState("")
  const [partialAmount, setPartialAmount] = useState("")

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Cargando detalles de la factura...</p>
        </div>
      }>
        <SearchParamsProvider>
          <PartialPaymentContent
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            invoice={invoice}
            setInvoice={setInvoice}
            reference={reference}
            setReference={setReference}
            notes={notes}
            setNotes={setNotes}
            accountDestination={accountDestination}
            setAccountDestination={setAccountDestination}
            partialAmount={partialAmount}
            setPartialAmount={setPartialAmount}
            router={router}
            toast={toast}
          />
        </SearchParamsProvider>
      </Suspense>
    </div>
  )
}

// Componente que usa searchParams
function PartialPaymentContent({
  isLoading,
  setIsLoading,
  invoice,
  setInvoice,
  reference,
  setReference,
  notes,
  setNotes,
  accountDestination,
  setAccountDestination,
  partialAmount,
  setPartialAmount,
  router,
  toast
}: PartialPaymentContentProps) {
  const searchParams = useSearchParamsContext();

  // Cargar la factura desde la URL
  useEffect(() => {
    const invoiceId = searchParams.get('invoiceId')
    if (invoiceId) {
      loadInvoice(invoiceId)
    } else {
      // Si no hay ID, volver a la lista
      toast.toast({
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
      toast.toast({
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

    // Validación de campos
    if (!accountDestination) {
      toast.toast({
        title: "Campos requeridos",
        description: "Por favor selecciona una cuenta de destino",
        variant: "destructive"
      })
      return
    }

    // Validar el monto parcial
    if (!partialAmount) {
      toast.toast({
        title: "Campos requeridos",
        description: "Por favor ingresa el monto parcial a pagar",
        variant: "destructive"
      })
      return
    }

    // Convertir y validar el monto parcial
    const amountValue = parseFloat(partialAmount.replace(/[^\d,]/g, '').replace(',', '.'))
    const totalValue = parseFloat(invoice.rawAmount || 0)
    
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.toast({
        title: "Monto inválido",
        description: "Por favor ingresa un monto válido para el pago parcial",
        variant: "destructive"
      })
      return
    }
    
    if (amountValue >= totalValue) {
      toast.toast({
        title: "Monto incorrecto",
        description: "El monto parcial debe ser menor al total de la factura",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const invoiceId = invoice.id

      // Crear objeto con los detalles adicionales para el pago
      const paymentDetails = {
        accountId: accountDestination,
        reference: reference || 'Confirmación manual',
        notes: notes || '',
        isPartialPayment: true,
        partialAmount: amountValue
      }

      // Confirmar la factura enviando todos los datos al backend
      const result = await financeService.confirmInvoicePayments([invoiceId], paymentDetails)
      
      if (result && result.success && result.success.includes(invoiceId)) {
        toast.toast({
          title: "Pago parcial confirmado",
          description: "El pago parcial ha sido registrado correctamente",
        })
        router.push('/finanzas/ingresos-confirmar-pago')
      } else {
        throw new Error("No se pudo confirmar el pago parcial")
      }
    } catch (error) {
      console.error("Error al confirmar el pago parcial:", error)
      toast.toast({
        title: "Error",
        description: "No se pudo procesar el pago parcial",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Formatear valor monetario al escribir
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Quitar todo lo que no sea dígito o coma
    const onlyDigits = value.replace(/[^\d,]/g, '')
    
    if (onlyDigits === '') {
      setPartialAmount('')
      return
    }
    
    // Convertir a formato de moneda
    const amount = parseFloat(onlyDigits.replace(',', '.'))
    if (!isNaN(amount)) {
      setPartialAmount(amount.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }))
    }
  }

  // Volver a la lista de facturas
  const goBack = () => {
    router.push('/finanzas/ingresos-confirmar-pago')
  }

  // Si está cargando o no hay factura, mostrar estado de carga
  if (isLoading || !invoice) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Cargando detalles de la factura...</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={goBack} className="mb-2">
          <ArrowLeft className="mr-1 h-4 w-4" />
          <span>Volver a la lista</span>
        </Button>
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Confirmar Pago Parcial</h2>
            <p className="text-sm text-muted-foreground">
              Registra un pago parcial para esta factura
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
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Detalles del Pago Parcial
            </CardTitle>
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
                <Label htmlFor="partial-amount" className="flex items-center font-medium">
                  <DollarSign className="mr-1 h-4 w-4" />
                  Monto del Pago Parcial
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input 
                    id="partial-amount" 
                    className="pl-7" 
                    placeholder="0,00" 
                    value={partialAmount}
                    onChange={handleAmountChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ingresa el monto parcial que se está pagando en esta operación. Debe ser menor que {invoice.amount}.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account-destination" className="flex items-center font-medium">
                  <CreditCard className="mr-1 h-4 w-4" />
                  Cuenta de Destino
                </Label>
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
                <Label htmlFor="reference">Referencia de Pago</Label>
                <Input 
                  id="reference" 
                  placeholder="Número de transferencia, referencia, etc." 
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
            
            <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Al confirmar este pago parcial, se generará una nueva factura con el monto restante
                y se marcará esta factura como pagada parcialmente.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="border-t flex justify-between">
            <Button variant="outline" onClick={goBack} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmPartialPayment}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
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
              <Avatar className="h-16 w-16">
                <AvatarImage src={invoice.client.avatar || ""} alt={invoice.client.name} />
                <AvatarFallback>{invoice.client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold">{invoice.client.name}</h3>
                <p className="text-sm text-muted-foreground">{invoice.client.type}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Detalles de la Factura</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Proyecto</p>
                  <p className="font-medium">{invoice.details.project}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método de Pago</p>
                  <p className="font-medium">{invoice.paymentMethod}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
} 