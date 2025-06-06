"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  ChevronRight, 
  Check, 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  Search,
  Calendar,
  Receipt,
  CreditCard,
  TrendingUp,
  DollarSign,
  Filter,
  Trash,
  MoreVertical,
  Banknote
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Transaction } from "@/lib/types/finance"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

// Definimos la interfaz para las props del componente IncomesContent
interface IncomesContentProps {
  selectedIncomes: string[];
  setSelectedIncomes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIncome: any;
  setSelectedIncome: React.Dispatch<React.SetStateAction<any>>;
  showDetailView: boolean;
  setShowDetailView: React.Dispatch<React.SetStateAction<boolean>>;
  reference: string;
  setReference: React.Dispatch<React.SetStateAction<string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  accountDestination: string;
  setAccountDestination: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  pendingIncomes: any[];
  setPendingIncomes: React.Dispatch<React.SetStateAction<any[]>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  isPartialPayment: boolean;
  setIsPartialPayment: React.Dispatch<React.SetStateAction<boolean>>;
  partialAmount: string;
  setPartialAmount: React.Dispatch<React.SetStateAction<string>>;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  invoiceToDelete: any;
  setInvoiceToDelete: React.Dispatch<React.SetStateAction<any>>;
  router: ReturnType<typeof useRouter>;
  toast: any;
}

export default function IngresosConfirmarPagoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedIncomes, setSelectedIncomes] = useState<string[]>([])
  const [selectedIncome, setSelectedIncome] = useState<any>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [accountDestination, setAccountDestination] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [pendingIncomes, setPendingIncomes] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isPartialPayment, setIsPartialPayment] = useState(false)
  const [partialAmount, setPartialAmount] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null)
  
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
              <h1 className="text-3xl font-bold tracking-tight">Confirmar Ingresos</h1>
            </div>
            
            <Card className="w-full">
              <CardContent className="p-6">
                <Suspense fallback={<div>Cargando...</div>}>
                  <SearchParamsProvider>
                    <IncomesContent 
                      selectedIncomes={selectedIncomes}
                      setSelectedIncomes={setSelectedIncomes}
                      selectedIncome={selectedIncome}
                      setSelectedIncome={setSelectedIncome}
                      showDetailView={showDetailView}
                      setShowDetailView={setShowDetailView}
                      reference={reference}
                      setReference={setReference}
                      notes={notes}
                      setNotes={setNotes}
                      accountDestination={accountDestination}
                      setAccountDestination={setAccountDestination}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      pendingIncomes={pendingIncomes}
                      setPendingIncomes={setPendingIncomes}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      isPartialPayment={isPartialPayment}
                      setIsPartialPayment={setIsPartialPayment}
                      partialAmount={partialAmount}
                      setPartialAmount={setPartialAmount}
                      deleteDialogOpen={deleteDialogOpen}
                      setDeleteDialogOpen={setDeleteDialogOpen}
                      invoiceToDelete={invoiceToDelete}
                      setInvoiceToDelete={setInvoiceToDelete}
                      router={router}
                      toast={toast}
                    />
                  </SearchParamsProvider>
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

// Componente que usa searchParams
function IncomesContent({
  selectedIncomes,
  setSelectedIncomes,
  selectedIncome,
  setSelectedIncome,
  showDetailView,
  setShowDetailView,
  reference,
  setReference,
  notes,
  setNotes,
  accountDestination,
  setAccountDestination,
  isLoading,
  setIsLoading,
  pendingIncomes,
  setPendingIncomes,
  searchTerm,
  setSearchTerm,
  isPartialPayment,
  setIsPartialPayment,
  partialAmount,
  setPartialAmount,
  deleteDialogOpen,
  setDeleteDialogOpen,
  invoiceToDelete,
  setInvoiceToDelete,
  router,
  toast
}: IncomesContentProps) {
  const searchParams = useSearchParamsContext();
  
  // Cargar datos de ingresos pendientes
  useEffect(() => {
    loadPendingIncomes()
  }, [])
  
  // Cargar ingresos pendientes
  const loadPendingIncomes = async () => {
    setIsLoading(true)
    try {
      // Obtener facturas pendientes usando el nuevo endpoint
      const pendingInvoices = await financeService.getPendingInvoices();
      
      // Formatear facturas para la UI
      const formattedInvoices = pendingInvoices.map((invoice: any) => {
        return {
          id: invoice._id,
          clientName: invoice.clientName || 'Cliente',
          clientId: invoice.clientId,
          amount: financeService.formatCurrency(invoice.total),
          concept: invoice.items && invoice.items.length > 0 
            ? invoice.items[0].description 
            : 'Servicios profesionales',
          issueDate: financeService.formatDate(invoice.issueDate),
          dueDate: financeService.formatDate(invoice.dueDate),
          status: invoice.status,
          recurrence: "none",
          paymentMethod: 'Transferencia',
          email: "",
          type: "service",
          details: {
            category: 'Venta de servicios',
            project: invoice.projectName || 'General',
            account: 'Cuenta Principal'
          },
          client: {
            name: invoice.clientName || 'Cliente',
            avatar: "",
            type: "Cliente"
          },
          // Guardamos la factura original para procesarla después
          originalInvoice: invoice
        };
      });
      
      setPendingIncomes(formattedInvoices);
    } catch (error) {
      console.error('Error al cargar ingresos pendientes:', error);
      toast.toast({
        title: "Error",
        description: "No se pudieron cargar los ingresos pendientes",
        variant: "destructive"
      });
      // Usar datos de ejemplo en caso de error
      setPendingIncomes(getMockPendingIncomes());
    } finally {
      setIsLoading(false);
    }
    
    // Verificar si se está cargando un ingreso específico desde la URL
    const incomeId = searchParams.get('incomeId')
    if (incomeId) {
      setTimeout(() => {
        const income = pendingIncomes.find(p => p.id === incomeId) || getMockPendingIncomes().find(p => p.id === incomeId)
        if (income) {
          setSelectedIncome(income)
          setShowDetailView(true)
        }
      }, 300) // Pequeño timeout para asegurar que los datos estén cargados
    }
  }
  
  // Verificar si se está cargando un ingreso específico
  useEffect(() => {
    const incomeId = searchParams.get('incomeId')
    if (incomeId && pendingIncomes.length > 0) {
      const income = pendingIncomes.find(p => p.id === incomeId)
      if (income) {
        setSelectedIncome(income)
        setShowDetailView(true)
      }
    }
  }, [searchParams, pendingIncomes])
  
  // Seleccionar/deseleccionar un ingreso
  const toggleIncomeSelection = (incomeId: string) => {
    setSelectedIncomes(prev => {
      if (prev.includes(incomeId)) {
        return prev.filter(id => id !== incomeId)
      } else {
        return [...prev, incomeId]
      }
    })
  }
  
  // Seleccionar todos los ingresos
  const selectAllIncomes = () => {
    if (selectedIncomes.length === pendingIncomes.length) {
      setSelectedIncomes([])
    } else {
      setSelectedIncomes(pendingIncomes.map(p => p.id))
    }
  }
  
  // Ver detalles de un ingreso
  const viewIncomeDetails = (income: any) => {
    setSelectedIncome(income)
    setShowDetailView(true)
  }
  
  // Volver a la lista de ingresos
  const backToList = () => {
    setSelectedIncome(null)
    setShowDetailView(false)
    setReference("")
    setNotes("")
    setAccountDestination("")
  }
  
  // Confirmar un ingreso
  const confirmIncome = async () => {
    if (!selectedIncome) return;
    
    if (!accountDestination) {
      toast.toast({
        title: "Campos requeridos",
        description: "Por favor selecciona una cuenta de destino",
        variant: "destructive"
      });
      return;
    }
    
    // Validar el monto parcial si es un pago parcial
    if (isPartialPayment) {
      const amountValue = parseFloat(partialAmount.replace(/[^\d,]/g, '').replace(',', '.'));
      const totalValue = parseFloat(selectedIncome.originalInvoice?.total || 0);
      
      if (isNaN(amountValue) || amountValue <= 0) {
        toast.toast({
          title: "Monto inválido",
          description: "Por favor ingresa un monto válido para el pago parcial",
          variant: "destructive"
        });
        return;
      }
      
      if (amountValue >= totalValue) {
        toast.toast({
          title: "Monto incorrecto",
          description: "El monto parcial debe ser menor al total de la factura",
          variant: "destructive"
        });
        return;
      }
    }
    
    try {
      setIsLoading(true);
      
      // Si tenemos la factura original, la actualizamos
      if (selectedIncome.originalInvoice) {
        const invoiceId = selectedIncome.originalInvoice._id;
        const originalTotal = parseFloat(selectedIncome.originalInvoice.total || 0);
        
        if (invoiceId) {
          // Crear objeto con los detalles adicionales para el pago
          const paymentDetails = {
            accountId: accountDestination,
            reference: reference || 'Confirmación manual',
            notes: notes || '',
            isPartialPayment: isPartialPayment,
            partialAmount: isPartialPayment ? parseFloat(partialAmount.replace(/[^\d,]/g, '').replace(',', '.')) : undefined,
            remainingAmount: isPartialPayment ? 
              (originalTotal - parseFloat(partialAmount.replace(/[^\d,]/g, '').replace(',', '.'))) : undefined,
            originalInvoiceId: invoiceId
          };
          
          // Confirmar la factura enviando todos los datos al backend
          const result = await financeService.confirmInvoicePayments([invoiceId], paymentDetails);
          
          if (result && result.success && result.success.includes(invoiceId)) {
            // Verificar si se creó una nueva factura por el saldo restante
            const newInvoiceCreated = result.newInvoice && result.newInvoice._id;
            
            toast.toast({
              title: "¡Éxito!",
              description: isPartialPayment 
                ? newInvoiceCreated 
                  ? `El pago parcial ha sido registrado y se ha creado la factura #${result.newInvoice._id} por el saldo restante.`
                  : "El pago parcial ha sido registrado correctamente."
                : "El ingreso ha sido confirmado correctamente"
            });
            
            // Recargar datos y volver a la lista
            await loadPendingIncomes();
            backToList();
          } else {
            // Verificar si hay mensajes de error específicos
            const failedItem = result && result.failed && Array.isArray(result.failed) ? 
              result.failed.find((item: any) => item.id === invoiceId) : null;
            
            // Usar el mensaje de error específico o uno genérico
            const errorMessage = failedItem && typeof failedItem === 'object' && failedItem.reason ? 
              failedItem.reason : 'Error al confirmar el ingreso';
              
            throw new Error(errorMessage);
          }
        }
      } else {
        // En caso de que estemos trabajando con datos simulados
        toast.toast({
          title: "¡Éxito!",
          description: isPartialPayment ? 
            "El pago parcial ha sido registrado y se ha creado una factura por el monto restante (simulado)" : 
            "El ingreso ha sido confirmado correctamente (simulado)"
        });
        
        // Eliminar el ingreso de la lista local
        setPendingIncomes(prev => prev.filter(p => p.id !== selectedIncome.id));
        backToList();
      }
    } catch (error: any) {
      console.error('Error al confirmar ingreso:', error);
      toast.toast({
        title: "Error",
        description: error.message || "No se pudo confirmar el ingreso. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Confirmar múltiples ingresos
  const confirmSelectedIncomes = async () => {
    if (selectedIncomes.length === 0) return;
    
    if (!accountDestination) {
      toast.toast({
        title: "Campos requeridos",
        description: "Por favor selecciona una cuenta de destino",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Filtrar ingresos con facturas originales
      const invoiceIds = selectedIncomes
        .map(id => pendingIncomes.find(p => p.id === id))
        .filter(income => income && income.originalInvoice)
        .map(income => income!.originalInvoice._id);
      
      if (invoiceIds.length > 0) {
        // Confirmar las facturas
        const result = await financeService.confirmInvoicePayments(invoiceIds, {
          accountId: accountDestination,
          reference: reference || 'Confirmación masiva',
          notes: notes
        });
        
        const successCount = result.success.length;
        const failedCount = result.failed.length;
        
        if (successCount > 0) {
          toast.toast({
            title: "¡Éxito!",
            description: `${successCount} ${successCount === 1 ? 'ingreso confirmado' : 'ingresos confirmados'} correctamente${failedCount > 0 ? `, ${failedCount} fallidos` : ''}`
          });
          
          // Recargar datos y limpiar selecciones
          await loadPendingIncomes();
          setSelectedIncomes([]);
        } else {
          throw new Error('No se pudo confirmar ningún ingreso');
        }
      } else {
        // En caso de que estemos trabajando con datos simulados
        toast.toast({
          title: "¡Éxito!",
          description: `${selectedIncomes.length} ${selectedIncomes.length === 1 ? 'ingreso confirmado' : 'ingresos confirmados'} correctamente (simulado)`
        });
        
        // Eliminar los ingresos de la lista local
        setPendingIncomes(prev => prev.filter(p => !selectedIncomes.includes(p.id)));
        setSelectedIncomes([]);
      }
    } catch (error) {
      console.error('Error al confirmar ingresos:', error);
      toast.toast({
        title: "Error",
        description: "No se pudieron confirmar los ingresos. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Obtener el tipo de ingreso en texto
  const getIncomeTypeText = (type: string) => {
    switch (type) {
      case "service": return "Servicio";
      case "product": return "Producto";
      case "recurring": return "Recurrente";
      case "subscription": return "Suscripción";
      case "other": return "Otro";
      default: return type;
    }
  }
  
  // Obtener el ícono según tipo de ingreso
  const getIncomeTypeIcon = (type: string) => {
    switch (type) {
      case "service": 
        return <FileText className="h-5 w-5 mr-2" />;
      case "product": 
        return <CreditCard className="h-5 w-5 mr-2" />;
      case "recurring": 
        return <Receipt className="h-5 w-5 mr-2" />;
      case "subscription": 
        return <Calendar className="h-5 w-5 mr-2" />;
      default: 
        return <TrendingUp className="h-5 w-5 mr-2" />;
    }
  }
  
  // Filtrar ingresos por término de búsqueda
  const filteredIncomes = pendingIncomes.filter(income => {
    if (!searchTerm) return true;
    
    // Buscar en cliente, monto, concepto
    const searchLower = searchTerm.toLowerCase();
    return income.client.name.toLowerCase().includes(searchLower) ||
           income.amount.toLowerCase().includes(searchLower) ||
           income.concept.toLowerCase().includes(searchLower);
  })
  
  // Obtener datos de ejemplo para ingresos pendientes
  const getMockPendingIncomes = () => {
    return [
      {
        id: "mock-inv-001",
        clientName: "Empresa Demo SA",
        clientId: "mock-client-001",
        amount: "3.250,00 €",
        concept: "Desarrollo de sitio web",
        issueDate: "12/06/2023",
        dueDate: "27/06/2023",
        status: "draft",
        recurrence: "none",
        paymentMethod: "Transferencia",
        email: "contacto@empresademo.com",
        type: "service",
        details: {
          category: "Servicios Web",
          project: "Web Corporativa",
          account: "Cuenta Principal"
        },
        client: {
          name: "Empresa Demo SA",
          avatar: "",
          type: "Cliente"
        }
      },
      {
        id: "mock-inv-002",
        clientName: "Comercial XYZ",
        clientId: "mock-client-002",
        amount: "1.800,00 €",
        concept: "Mantenimiento mensual",
        issueDate: "05/06/2023",
        dueDate: "20/06/2023",
        status: "sent",
        recurrence: "none",
        paymentMethod: "Transferencia",
        email: "admin@comercialxyz.com",
        type: "service",
        details: {
          category: "Mantenimiento",
          project: "Soporte Técnico",
          account: "Cuenta Principal"
        },
        client: {
          name: "Comercial XYZ",
          avatar: "",
          type: "Cliente"
        }
      },
      {
        id: "mock-inv-003",
        clientName: "Consultores ABC",
        clientId: "mock-client-003",
        amount: "4.500,00 €",
        concept: "Implementación de CRM",
        issueDate: "01/06/2023",
        dueDate: "16/06/2023",
        status: "draft",
        recurrence: "none",
        paymentMethod: "Transferencia",
        email: "sistemas@consultoresabc.com",
        type: "service",
        details: {
          category: "Implementación",
          project: "CRM Personalizado",
          account: "Cuenta Principal"
        },
        client: {
          name: "Consultores ABC",
          avatar: "",
          type: "Cliente"
        }
      }
    ];
  };
  
  // Eliminar una factura
  const deleteInvoice = async () => {
    if (!invoiceToDelete) return

    setIsLoading(true)
    try {
      const result = await financeService.deleteInvoice(invoiceToDelete.id)
      
      if (result) {
        // Recargar la lista completa de facturas en lugar de solo eliminar una localmente
        await loadPendingIncomes()
        
        toast.toast({
          title: "Factura eliminada",
          description: "La factura ha sido eliminada correctamente",
        })
      } else {
        toast.toast({
          title: "Error",
          description: "No se pudo eliminar la factura",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error al eliminar la factura:", error)
      toast.toast({
        title: "Error",
        description: "No se pudo eliminar la factura",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setDeleteDialogOpen(false)
      setInvoiceToDelete(null)
    }
  }

  // Abrir diálogo de confirmación de eliminación
  const openDeleteDialog = (invoice: any) => {
    setInvoiceToDelete(invoice)
    setDeleteDialogOpen(true)
  }

  // Ir a la página de pago parcial
  const goToPartialPayment = (invoice: any) => {
    router.push(`/finanzas/ingresos-confirmar-pago/pago-parcial?invoiceId=${invoice.id}`)
  }

  // Ir a la página de pago completo
  const goToFullPayment = (invoice: any) => {
    router.push(`/finanzas/ingresos-confirmar-pago/pago-completo?invoiceId=${invoice.id}`)
  }
  
  // Renderizar la lista de ingresos pendientes
  const renderIncomesList = () => {
    return (
      <>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Ingresos Pendientes de Confirmación</h2>
            <p className="text-sm text-muted-foreground">
              Selecciona los ingresos que deseas confirmar
            </p>
          </div>
          
          {selectedIncomes.length > 0 && (
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmSelectedIncomes}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Procesando...</span>
              ) : (
                <>
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Confirmar Seleccionados ({selectedIncomes.length})</span>
                </>
              )}
            </Button>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por cliente, concepto o ID..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-10">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={selectedIncomes.length === filteredIncomes.length && filteredIncomes.length > 0} 
                  onCheckedChange={selectAllIncomes}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p>Cargando ingresos pendientes...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredIncomes.map(income => (
              <TableRow key={income.id} className={selectedIncomes.includes(income.id) ? "bg-primary/5" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIncomes.includes(income.id)} 
                    onCheckedChange={() => toggleIncomeSelection(income.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{income.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{income.clientName}</div>
                  <div className="text-xs text-muted-foreground">{income.email}</div>
                </TableCell>
                <TableCell>{income.concept}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {getIncomeTypeText(income.type)}
                  </Badge>
                </TableCell>
                <TableCell>{income.dueDate}</TableCell>
                <TableCell className="text-right font-medium">{income.amount}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => viewIncomeDetails(income)}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Detalles</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => goToPartialPayment(income)}>
                        <Banknote className="mr-2 h-4 w-4" />
                        <span>Pago parcial</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => goToFullPayment(income)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Pago completo</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(income)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Eliminar factura</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            
            {!isLoading && filteredIncomes.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-8 w-8 mb-2" />
                    <p>No hay ingresos pendientes de confirmación</p>
                    <Button variant="link" className="mt-2" onClick={() => router.push('/finanzas/nuevo-ingreso')}>
                      Registrar un nuevo ingreso
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar esta factura?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La factura será eliminada permanentemente
                de nuestros servidores.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={deleteInvoice} 
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Eliminando..." : "Eliminar factura"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }
  
  // Renderizar la vista de detalle de un ingreso
  const renderIncomeDetail = () => {
    if (!selectedIncome) return null
    
    return (
      <>
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={backToList} className="mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span>Volver a la lista</span>
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                {isPartialPayment 
                  ? "Registrar Pago Parcial" 
                  : "Detalles del Ingreso"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isPartialPayment 
                  ? "Ingresa el monto parcial a cobrar" 
                  : "Confirma los detalles antes de procesar el cobro"}
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
            <CardHeader className="flex flex-row items-center">
              {getIncomeTypeIcon(selectedIncome.type)}
              <CardTitle>{getIncomeTypeText(selectedIncome.type)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID del Ingreso</p>
                  <p className="font-medium">{selectedIncome.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Emisión</p>
                  <p className="font-medium">{selectedIncome.issueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Concepto</p>
                  <p className="font-medium">{selectedIncome.concept}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-medium">{selectedIncome.details.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                  <p className="font-medium">{selectedIncome.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto</p>
                  <p className="font-medium text-lg text-green-600">{selectedIncome.amount}</p>
                </div>
              </div>
              
              {selectedIncome.details.project && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Detalles del Proyecto</h3>
                  <div>
                    <p className="text-sm text-muted-foreground">Proyecto asignado</p>
                    <p className="font-medium">{selectedIncome.details.project}</p>
                  </div>
                </div>
              )}
              
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
                  <p className="text-xs text-muted-foreground">Selecciona la cuenta donde se registrará el ingreso</p>
                </div>
                
                {!isPartialPayment && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="partial-payment" 
                        checked={isPartialPayment}
                        onCheckedChange={(checked) => {
                          setIsPartialPayment(checked === true);
                          if (checked === false) {
                            setPartialAmount("");
                          }
                        }}
                      />
                      <Label htmlFor="partial-payment" className="font-medium cursor-pointer">
                        Pago Parcial
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">Marca esta opción si el cliente ha realizado un pago parcial</p>
                  </div>
                )}
                
                {isPartialPayment && (
                  <div className="space-y-2">
                    <Label htmlFor="partial-amount">Monto Pagado</Label>
                    <Input 
                      id="partial-amount" 
                      placeholder="Ej: 1.500,00 €" 
                      value={partialAmount}
                      onChange={(e) => setPartialAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ingresa el monto que el cliente ha pagado. Se creará automáticamente una factura por el resto.
                    </p>
                  </div>
                )}
                
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
                    placeholder="Notas adicionales sobre este cobro" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              
              <Alert variant="default" className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/40">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  {isPartialPayment 
                    ? "Al confirmar este pago parcial, se registrará el monto pagado en la factura original y se creará automáticamente una nueva factura por el monto restante."
                    : "Al confirmar este ingreso, se registrará como completado y se actualizará el estado financiero."}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={backToList} disabled={isLoading}>
                Cancelar
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={confirmIncome}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Procesando...</span>
                ) : (
                  <>
                <Check className="mr-2 h-4 w-4" />
                <span>Confirmar {isPartialPayment ? "Pago Parcial" : "Ingreso"}</span>
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
                  <AvatarImage src={selectedIncome.client.avatar} alt={selectedIncome.client.name} />
                  <AvatarFallback>{selectedIncome.client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{selectedIncome.client.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedIncome.client.type}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Información de Cobro</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Método de Pago</p>
                    <p className="font-medium">{selectedIncome.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cuenta Destino</p>
                    <p className="font-medium">{selectedIncome.details.account}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Historial de Ingresos Recientes</h3>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Junio 2023</span>
                    <span className="font-medium">$6,500.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Mayo 2023</span>
                    <span className="font-medium">$8,250.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Abril 2023</span>
                    <span className="font-medium">$5,800.00</span>
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
    <>
      {showDetailView ? renderIncomeDetail() : renderIncomesList()}
    </>
  )
} 