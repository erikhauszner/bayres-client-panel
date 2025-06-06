"use client"

import { useState, useEffect } from "react"
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
  Calendar as CalendarIcon,
  Receipt,
  CreditCard,
  Briefcase,
  Building,
  ReceiptText,
  Tags, 
  DollarSign,
  Filter,
  Trash,
  MoreVertical,
  Plus,
  RefreshCw
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
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { financeService } from "@/lib/services/financeService"
import { Expense } from "@/lib/types/finance"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
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

// Datos de ejemplo de cuentas bancarias (posteriormente se obtendrán de la API)
const ACCOUNTS = [
  { id: "ACC001", name: "Cuenta Operativa Principal" },
  { id: "ACC002", name: "Cuenta Reservas" },
  { id: "ACC003", name: "Cuenta Impuestos" }
]

export default function EgresosConfirmarPagoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([])
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [accountOrigin, setAccountOrigin] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [pendingExpenses, setPendingExpenses] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<any>(null)
  
  // Cargar datos de egresos pendientes
  useEffect(() => {
    loadPendingExpenses()
  }, [])
  
  // Cargar egresos pendientes
  const loadPendingExpenses = async () => {
    setIsLoading(true)
    try {
      // Obtener todos los gastos
      const expenses = await financeService.getAllExpenses()
      
      // Filtrar gastos pendientes
      const pending = expenses
        .filter((expense: Expense) => expense.status === 'pending')
        .map((expense: Expense) => formatExpenseForUI(expense))
      
      setPendingExpenses(pending)
    } catch (error) {
      console.error('Error al cargar egresos pendientes:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los egresos pendientes",
        variant: "destructive"
      })
      // Usar datos de ejemplo en caso de error
      setPendingExpenses(getMockPendingExpenses())
    } finally {
      setIsLoading(false)
    }
    
    // Verificar si se está cargando un egreso específico desde la URL
    const expenseId = searchParams.get('expenseId')
    if (expenseId) {
      setTimeout(() => {
        const expense = pendingExpenses.find(p => p.id === expenseId) || getMockPendingExpenses().find(p => p.id === expenseId)
        if (expense) {
          setSelectedExpense(expense)
          setShowDetailView(true)
        }
      }, 300) // Pequeño timeout para asegurar que los datos estén cargados
    }
  }
  
  // Formatear gasto para UI
  const formatExpenseForUI = (expense: Expense) => {
    // Determinar el tipo de gasto basado en categoría (simplificado)
    let expenseType = "operational"
    if (expense.category) {
      const categoryLower = expense.category.name.toLowerCase()
      if (categoryLower.includes('impuesto')) expenseType = "tax"
      else if (categoryLower.includes('admin')) expenseType = "administrative"
      else if (categoryLower.includes('capital')) expenseType = "capital"
      else if (categoryLower.includes('financ')) expenseType = "financial"
    }
    
    return {
      id: expense._id,
      provider: {
        id: `PRV-${expense._id?.substring(0, 5)}`,
        name: expense.vendor || 'Proveedor desconocido',
        type: expense.category?.name || 'Sin categoría',
        avatar: `/avatars/generic.jpg`
      },
      amount: financeService.formatCurrency(expense.amount),
      concept: expense.description,
      type: expenseType,
      date: financeService.formatDate(expense.date),
      dueDate: financeService.formatDate(new Date(new Date(expense.date).getTime() + 15 * 24 * 60 * 60 * 1000)),
      details: {
        category: expense.category?.name || 'Sin categoría',
        method: 'Transferencia Bancaria',
        account: 'Cuenta Principal',
        project: expense.projectId
      },
      // Guardamos el gasto original para procesarlo después
      originalExpense: expense
    }
  }
  
  // Verificar si se está cargando un egreso específico
  useEffect(() => {
    const expenseId = searchParams.get('expenseId')
    if (expenseId && pendingExpenses.length > 0) {
      const expense = pendingExpenses.find(p => p.id === expenseId)
      if (expense) {
        setSelectedExpense(expense)
        setShowDetailView(true)
      }
    }
  }, [searchParams, pendingExpenses])
  
  // Seleccionar/deseleccionar un egreso
  const toggleExpenseSelection = (expenseId: string) => {
    setSelectedExpenses(prev => {
      if (prev.includes(expenseId)) {
        return prev.filter(id => id !== expenseId)
      } else {
        return [...prev, expenseId]
      }
    })
  }
  
  // Seleccionar todos los egresos
  const selectAllExpenses = () => {
    if (selectedExpenses.length === filteredExpenses.length) {
      setSelectedExpenses([])
    } else {
      setSelectedExpenses(filteredExpenses.map(p => p.id))
    }
  }
  
  // Ver detalles de un egreso
  const viewExpenseDetails = (expense: any) => {
    setSelectedExpense(expense)
    setShowDetailView(true)
  }
  
  // Volver a la lista de egresos
  const backToList = () => {
    setSelectedExpense(null)
    setShowDetailView(false)
    setReference("")
    setNotes("")
    setAccountOrigin("")
  }
  
  // Confirmar un egreso
  const confirmExpense = async () => {
    if (!selectedExpense) return
    
    if (!accountOrigin) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona una cuenta de origen para el pago",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      // Si tenemos el gasto original, lo actualizamos
      if (selectedExpense.originalExpense) {
        const expenseId = selectedExpense.originalExpense._id
        
        if (expenseId) {
          // Aprobar el gasto
          await financeService.approveExpense(expenseId)
          
          toast({
            title: "¡Éxito!",
            description: "El egreso ha sido confirmado correctamente"
          })
          
          // Recargar datos y volver a la lista
          await loadPendingExpenses()
          backToList()
        }
      } else {
        // En caso de que estemos trabajando con datos simulados
        toast({
          title: "¡Éxito!",
          description: "El egreso ha sido confirmado correctamente (simulado)"
        })
        
        // Eliminar el egreso de la lista local
        setPendingExpenses(prev => prev.filter(p => p.id !== selectedExpense.id))
        backToList()
      }
    } catch (error) {
      console.error('Error al confirmar egreso:', error)
      toast({
        title: "Error",
        description: "No se pudo confirmar el egreso. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Confirmar múltiples egresos
  const confirmSelectedExpenses = async () => {
    if (selectedExpenses.length === 0) return
    
    try {
      setIsLoading(true)
      let successCount = 0
      
      // Confirmar cada egreso seleccionado
      for (const expenseId of selectedExpenses) {
        const expense = pendingExpenses.find(p => p.id === expenseId)
        
        if (expense?.originalExpense?._id) {
          // Aprobar el gasto
          await financeService.approveExpense(expense.originalExpense._id)
          successCount++
        }
      }
      
      toast({
        title: "¡Éxito!",
        description: `Se han confirmado ${successCount} egresos correctamente`
      })
      
      // Recargar datos
      await loadPendingExpenses()
      setSelectedExpenses([])
    } catch (error) {
      console.error('Error al confirmar egresos:', error)
      toast({
        title: "Error",
        description: "No se pudieron confirmar algunos egresos",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Obtener el tipo de egreso en texto
  const getExpenseTypeText = (type: string) => {
    switch (type) {
      case "operational": return "Gasto Operativo";
      case "administrative": return "Gasto Administrativo";
      case "capital": return "Gasto de Capital";
      case "financial": return "Gasto Financiero";
      case "tax": return "Impuestos";
      default: return type;
    }
  }
  
  // Obtener el ícono según tipo de egreso
  const getExpenseTypeIcon = (type: string) => {
    switch (type) {
      case "operational": 
        return <Briefcase className="h-5 w-5 mr-2" />;
      case "administrative": 
        return <Building className="h-5 w-5 mr-2" />;
      case "capital": 
        return <DollarSign className="h-5 w-5 mr-2" />;
      case "financial": 
        return <ReceiptText className="h-5 w-5 mr-2" />;
      case "tax": 
        return <Tags className="h-5 w-5 mr-2" />;
      default: 
        return <DollarSign className="h-5 w-5 mr-2" />;
    }
  }
  
  // Filtrar egresos según término de búsqueda
  const filteredExpenses = pendingExpenses.filter(expense => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      expense.id?.toLowerCase().includes(searchLower) ||
      expense.provider.name.toLowerCase().includes(searchLower) ||
      expense.concept.toLowerCase().includes(searchLower)
    )
  })
  
  // Obtener datos de ejemplo para modo offline/desarrollo
  const getMockPendingExpenses = () => {
    return [
      {
        id: "EXP-2023-0030",
        provider: {
          id: "PRV001",
          name: "Adobe Inc.",
          type: "Software",
          avatar: "/avatars/adobe.jpg"
        },
        amount: "$1,200.00",
        concept: "Licencias Software",
        type: "operational",
        date: "10/07/2023",
        dueDate: "25/07/2023",
        details: {
          category: "Software",
          accountNumber: "****4582",
          method: "Transferencia Bancaria",
          account: "Cuenta Principal"
        }
      },
      {
        id: "EXP-2023-0031",
        provider: {
          id: "PRV002",
          name: "Servicios Cloud",
          type: "Hosting",
          avatar: "/avatars/cloud.jpg"
        },
        amount: "$850.00",
        concept: "Hosting Mensual",
        type: "operational",
        date: "12/07/2023",
        dueDate: "27/07/2023",
        details: {
          category: "Servicios",
          accountNumber: "****6721",
          method: "Transferencia Bancaria",
          account: "Cuenta Operativa"
        }
      },
      {
        id: "EXP-2023-0032",
        provider: {
          id: "PRV003",
          name: "Oficina Central",
          type: "Instalaciones",
          avatar: "/avatars/office.jpg"
        },
        amount: "$2,500.00",
        concept: "Alquiler Mensual",
        type: "administrative",
        date: "01/07/2023",
        dueDate: "05/07/2023",
        details: {
          category: "Instalaciones",
          accountNumber: "****9145",
          method: "Transferencia Bancaria",
          account: "Cuenta Principal"
        }
      },
      {
        id: "EXP-2023-0033",
        provider: {
          id: "PRV004",
          name: "Suministros Express",
          type: "Materiales",
          avatar: "/avatars/supplies.jpg"
        },
        amount: "$350.00",
        concept: "Material de Oficina",
        type: "administrative",
        date: "15/07/2023",
        dueDate: "30/07/2023",
        details: {
          category: "Suministros",
          accountNumber: "****1457",
          method: "Tarjeta de Crédito",
          account: "Tarjeta Empresarial"
        }
      },
      {
        id: "EXP-2023-0034",
        provider: {
          id: "PRV005",
          name: "Marketing Digital",
          type: "Publicidad",
          avatar: "/avatars/marketing.jpg"
        },
        amount: "$1,800.00",
        concept: "Campaña Publicitaria",
        type: "operational",
        date: "08/07/2023",
        dueDate: "22/07/2023",
        details: {
          category: "Marketing",
          accountNumber: "****7820",
          method: "Transferencia Bancaria",
          account: "Cuenta Operativa",
          project: "Lanzamiento Producto X"
        }
      },
      {
        id: "EXP-2023-0035",
        provider: {
          id: "PRV006",
          name: "Hacienda Pública",
          type: "Gobierno",
          avatar: "/avatars/tax.jpg"
        },
        amount: "$3,200.00",
        concept: "Impuestos Trimestrales",
        type: "tax",
        date: "20/07/2023",
        dueDate: "31/07/2023",
        details: {
          category: "Impuestos",
          accountNumber: "****5294",
          method: "Transferencia Bancaria",
          account: "Cuenta Principal"
        }
      }
    ];
  }
  
  // Renderizar la lista de egresos pendientes
  const renderExpensesList = () => {
    return (
      <>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Egresos Pendientes de Confirmación</h2>
            <p className="text-sm text-muted-foreground">
              Selecciona los egresos que deseas confirmar
            </p>
          </div>
          
          {selectedExpenses.length > 0 && (
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={confirmSelectedExpenses}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Procesando...</span>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>Confirmar Seleccionados ({selectedExpenses.length})</span>
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
              placeholder="Buscar por proveedor, concepto o ID..."
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
                  checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0} 
                  onCheckedChange={selectAllExpenses}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Proveedor</TableHead>
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
                    <p>Cargando egresos pendientes...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredExpenses.map(expense => (
              <TableRow key={expense.id} className={selectedExpenses.includes(expense.id) ? "bg-primary/5" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={selectedExpenses.includes(expense.id)} 
                    onCheckedChange={() => toggleExpenseSelection(expense.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{expense.id}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={expense.provider.avatar} alt={expense.provider.name} />
                      <AvatarFallback>{expense.provider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{expense.provider.name}</div>
                      <div className="text-xs text-muted-foreground">{expense.provider.type}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{expense.concept}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getExpenseTypeText(expense.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                    <span>{expense.dueDate}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{expense.amount}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => viewExpenseDetails(expense)}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Detalles</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(expense)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Eliminar egreso</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            
            {!isLoading && filteredExpenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-8 w-8 mb-2" />
                    <p>No hay egresos pendientes de confirmación</p>
                    <Button variant="link" className="mt-2" onClick={() => router.push('/finanzas/egresos-registrar-pago')}>
                      Registrar un nuevo egreso
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
              <AlertDialogTitle>¿Eliminar este egreso?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El egreso será eliminado permanentemente
                de nuestros servidores.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={deleteExpense} 
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Eliminando..." : "Eliminar egreso"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }
  
  // Renderizar la vista de detalle de un egreso
  const renderExpenseDetail = () => {
    if (!selectedExpense) return null
    
    return (
      <>
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={backToList} className="mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span>Volver a la lista</span>
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Detalles del Egreso</h2>
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center">
              {getExpenseTypeIcon(selectedExpense.type)}
              <CardTitle>{getExpenseTypeText(selectedExpense.type)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID del Egreso</p>
                  <p className="font-medium">{selectedExpense.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha del Gasto</p>
                  <p className="font-medium">{selectedExpense.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Concepto</p>
                  <p className="font-medium">{selectedExpense.concept}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-medium">{selectedExpense.details.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                  <p className="font-medium">{selectedExpense.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto</p>
                  <p className="font-medium text-lg text-primary">{selectedExpense.amount}</p>
                </div>
              </div>
              
              {selectedExpense.details.project && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Detalles del Proyecto</h3>
                  <div>
                    <p className="text-sm text-muted-foreground">Proyecto asignado</p>
                    <p className="font-medium">{selectedExpense.details.project}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="account-origin" className="font-medium flex items-center">
                    <CreditCard className="h-4 w-4 mr-1.5" />
                    Cuenta de Pago <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={accountOrigin}
                    onValueChange={setAccountOrigin}
                  >
                    <SelectTrigger id="account-origin" className={cn(
                      !accountOrigin ? "border-red-300 ring-red-200" : "",
                      accountOrigin ? "bg-primary/5 border-primary/20" : ""
                    )}>
                      <SelectValue placeholder="Selecciona la cuenta para realizar el pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNTS.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selecciona la cuenta desde donde se realizará el pago. Este campo es obligatorio.
                  </p>
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
                  Al confirmar este pago, se registrará como completado y se actualizará el estado financiero.
                  {accountOrigin && (
                    <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-800/40">
                      <span className="font-medium">Cuenta seleccionada: </span>
                      {ACCOUNTS.find(acc => acc.id === accountOrigin)?.name}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="border-t flex justify-between">
              <Button variant="outline" onClick={backToList} disabled={isLoading}>
                Cancelar
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={confirmExpense}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Procesando...</span>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    <span>Confirmar Pago</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Información del Proveedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-2 pb-4 border-b">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedExpense.provider.avatar} alt={selectedExpense.provider.name} />
                  <AvatarFallback>{selectedExpense.provider.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{selectedExpense.provider.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedExpense.provider.type}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Información de Pago</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Método de Pago</p>
                    <p className="font-medium">{selectedExpense.details.method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cuenta de Origen</p>
                    <p className="font-medium">
                      {accountOrigin 
                        ? ACCOUNTS.find(acc => acc.id === accountOrigin)?.name 
                        : <span className="text-amber-500 italic">Pendiente de seleccionar</span>}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Historial de Pagos Recientes</h3>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Junio 2023</span>
                    <span className="font-medium">$1,200.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Mayo 2023</span>
                    <span className="font-medium">$1,200.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Abril 2023</span>
                    <span className="font-medium">$1,200.00</span>
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
  
  // Abrir diálogo de eliminación
  const openDeleteDialog = (expense: any) => {
    setExpenseToDelete(expense)
    setDeleteDialogOpen(true)
  }
  
  // Eliminar un egreso
  const deleteExpense = async () => {
    if (!expenseToDelete) return;
    
    try {
      setIsLoading(true);
      
      if (expenseToDelete.originalExpense?._id) {
        // Eliminar el egreso usando el servicio
        await financeService.deleteExpense(expenseToDelete.originalExpense._id);
        
        toast({
          title: "Éxito",
          description: "El egreso ha sido eliminado correctamente"
        });
        
        // Recargar la lista
        await loadPendingExpenses();
      } else {
        // Simular eliminación para datos de ejemplo
        setPendingExpenses(prev => prev.filter(e => e.id !== expenseToDelete.id));
        
        toast({
          title: "Éxito",
          description: "El egreso ha sido eliminado correctamente (simulado)"
        });
      }
      
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error al eliminar egreso:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el egreso",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
              <Button variant="ghost" size="icon" onClick={() => router.push('/finanzas')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Confirmar Egresos</h1>
            </div>
            
            <Card className="w-full">
              <CardContent className="p-6">
                {showDetailView ? renderExpenseDetail() : renderExpensesList()}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 