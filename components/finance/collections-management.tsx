"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Download, 
  Plus, 
  RefreshCw, 
  Search, 
  Filter, 
  Clock,
  CalendarRange,
  Calendar,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  FileText,
  UserCircle,
  DollarSign,
  Repeat,
  Wallet,
  ClipboardCheck,
  Send
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { financeService } from "@/lib/services/financeService"
import { Invoice, Transaction } from "@/lib/types/finance"
import { useToast } from "@/components/ui/use-toast"

export default function IncomeManagement() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("invoices")
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  
  // Estados para almacenar datos reales
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [recurringPlans, setRecurringPlans] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [pendingIncomes, setPendingIncomes] = useState<any[]>([])
  const [summaryData, setSummaryData] = useState({
    totalPending: 0,
    overdue: 0,
    recurringTotal: 0,
    upcomingTotal: 0,
    pendingCount: 0,
    overdueCount: 0,
    recurringCount: 0,
    upcomingCount: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIncomes, setSelectedIncomes] = useState<string[]>([])
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    setIsLoading(true)
    try {
      // Cargar facturas
      const invoicesData = await financeService.getAllInvoices()
      setInvoices(invoicesData)
      
      // Cargar planes recurrentes
      const recurringPlansData = await financeService.getRecurringPlans()
      setRecurringPlans(recurringPlansData)
      
      // Cargar clientes con facturas
      const clientsData = await financeService.getClientsWithInvoices()
      setClients(clientsData)
      
      // Cargar ingresos pendientes de confirmación
      const pendingIncomesData = await financeService.getPendingIncomes()
      setPendingIncomes(pendingIncomesData)
      
      // Cargar resumen de ingresos
      const summaryData = await financeService.getIncomesSummary()
      setSummaryData(summaryData)
      
    } catch (error) {
      console.error("Error al cargar datos de ingresos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de ingresos",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const viewInvoiceDetails = (invoice: any) => {
    setSelectedInvoice(invoice)
    setInvoiceDialogOpen(true)
  }
  
  const handleRegisterPayment = async (invoice: any) => {
    try {
      setIsLoading(true)
      
      const result = await financeService.registerInvoicePayment(invoice._id, {
        paidAmount: invoice.total,
        paidDate: new Date()
      })
      
      if (result) {
        toast({
          title: "Pago registrado",
          description: `Se ha registrado el pago de la factura ${invoice.number}`,
        })
        
        // Recargar datos
        await loadData()
        // Cerrar diálogo si está abierto
        setInvoiceDialogOpen(false)
      } else {
        throw new Error("No se pudo registrar el pago")
      }
    } catch (error) {
      console.error("Error al registrar pago:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el pago",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSendReminder = async (invoice: any) => {
    try {
      setIsLoading(true)
      
      const result = await financeService.sendInvoiceReminder(invoice._id)
      
      if (result) {
        toast({
          title: "Recordatorio enviado",
          description: `Se ha enviado un recordatorio para la factura ${invoice.number}`,
        })
      } else {
        throw new Error("No se pudo enviar el recordatorio")
      }
    } catch (error) {
      console.error("Error al enviar recordatorio:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el recordatorio",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleToggleIncomeSelection = (incomeId: string) => {
    setSelectedIncomes(prev => {
      if (prev.includes(incomeId)) {
        return prev.filter(id => id !== incomeId)
      } else {
        return [...prev, incomeId]
      }
    })
  }
  
  const handleConfirmSelectedIncomes = async () => {
    if (selectedIncomes.length === 0) {
      toast({
        title: "Advertencia",
        description: "No hay ingresos seleccionados para confirmar",
        variant: "default"
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      const result = await financeService.confirmPendingIncomes(selectedIncomes)
      
      if (result) {
        toast({
          title: "Ingresos confirmados",
          description: `Se han confirmado ${selectedIncomes.length} ingresos correctamente`,
        })
        
        // Recargar datos y cerrar diálogo
        await loadData()
        setConfirmDialogOpen(false)
        setSelectedIncomes([])
      } else {
        throw new Error("No se pudieron confirmar los ingresos")
      }
    } catch (error) {
      console.error("Error al confirmar ingresos:", error)
      toast({
        title: "Error",
        description: "No se pudieron confirmar los ingresos",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const openConfirmDialog = () => {
    setConfirmDialogOpen(true)
    // Resetear selecciones
    setSelectedIncomes([])
  }
  
  const handleRefreshData = () => {
    loadData()
  }
  
  const getStatusBadge = (status: string) => {
    if (status === "paid") {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="mr-1 h-3 w-3 inline" />
          Pagado
        </Badge>
      )
    } else if (status === "pending") {
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          <Clock className="mr-1 h-3 w-3 inline" />
          Pendiente
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <AlertCircle className="mr-1 h-3 w-3 inline" />
          Vencido
        </Badge>
      )
    }
  }
  
  const getRecurrenceBadge = (recurrence: string) => {
    switch (recurrence) {
      case "none":
        return null;
      case "monthly":
        return (
          <Badge variant="outline" className="ml-2">
            <Repeat className="mr-1 h-3 w-3 inline" />
            Mensual
          </Badge>
        );
      case "weekly":
        return (
          <Badge variant="outline" className="ml-2">
            <Repeat className="mr-1 h-3 w-3 inline" />
            Semanal
          </Badge>
        );
      case "quarterly":
        return (
          <Badge variant="outline" className="ml-2">
            <Repeat className="mr-1 h-3 w-3 inline" />
            Trimestral
          </Badge>
        );
      case "yearly":
        return (
          <Badge variant="outline" className="ml-2">
            <Repeat className="mr-1 h-3 w-3 inline" />
            Anual
          </Badge>
        );
      default:
        return null;
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Ingresos</h2>
          <p className="text-muted-foreground">
            Administra facturas, cobros y planes de facturación recurrentes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar</span>
          </Button>
          <Button size="sm" className="h-9" asChild>
            <Link href="/finanzas/nuevo-ingreso">
              <Plus className="mr-2 h-4 w-4" />
              <span>Nueva Factura</span>
            </Link>
          </Button>
          <Button size="sm" className="h-9" variant="secondary" asChild>
            <Link href="/finanzas/nuevo-ingreso-recurrente">
              <Repeat className="mr-2 h-4 w-4" />
              <span>Plan Recurrente</span>
            </Link>
          </Button>
          <Button 
            size="sm" 
            className="h-9 bg-green-600 hover:bg-green-700"
            asChild
          >
            <Link href="/finanzas/ingresos-confirmar-pago">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Confirmar Ingresos</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeService.formatCurrency(summaryData.totalPending)}</div>
            <p className="text-xs text-muted-foreground pt-1">
              {summaryData.pendingCount} facturas pendientes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cobros Vencidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeService.formatCurrency(summaryData.overdue)}</div>
            <p className="text-xs text-muted-foreground pt-1">
              {summaryData.overdueCount} factura{summaryData.overdueCount !== 1 ? 's' : ''} vencida{summaryData.overdueCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Recurrentes</CardTitle>
            <Repeat className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeService.formatCurrency(summaryData.recurringTotal)}</div>
            <p className="text-xs text-muted-foreground pt-1">
              {summaryData.recurringCount} planes activos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximos Ingresos</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeService.formatCurrency(summaryData.upcomingTotal)}</div>
            <p className="text-xs text-muted-foreground pt-1">
              {summaryData.upcomingCount} facturas en 7 días
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Facturas y Cobros</TabsTrigger>
          <TabsTrigger value="recurring">Ingresos Recurrentes</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de Facturas y Cobros */}
        <TabsContent value="invoices" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar factura o cliente..."
                    className="pl-9"
                  />
                </div>
                
                <div>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="paid">Pagadas</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="overdue">Vencidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los clientes</SelectItem>
                      {clients
                        .filter(client => client.name && client.name.trim() !== '')
                        .map((client: any) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="icon" className="mr-2">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Actualizar</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabla de facturas */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Cargando facturas...
                      </TableCell>
                    </TableRow>
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No hay facturas disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice: any) => (
                      <TableRow key={invoice._id}>
                        <TableCell className="font-medium">{invoice.number}</TableCell>
                        <TableCell>
                          <div className="font-medium">{invoice.clientId?.name || 'Cliente'}</div>
                          <div className="text-xs text-muted-foreground">{invoice.clientId?.email || ''}</div>
                        </TableCell>
                        <TableCell>
                          <div>{invoice.items?.[0]?.description || 'Servicios'}</div>
                          {getRecurrenceBadge(invoice.recurrence || 'none')}
                        </TableCell>
                        <TableCell>{financeService.formatDate(invoice.dueDate)}</TableCell>
                        <TableCell className="text-right font-medium">{financeService.formatCurrency(invoice.total)}</TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => viewInvoiceDetails(invoice)}>
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Ver detalles</span>
                              </DropdownMenuItem>
                              {invoice.status !== "paid" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleRegisterPayment(invoice)}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    <span>Registrar pago</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSendReminder(invoice)}>
                                    <Send className="mr-2 h-4 w-4" />
                                    <span>Enviar recordatorio</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <UserCircle className="mr-2 h-4 w-4" />
                                <span>Ver cliente</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {invoices.length} de {invoices.length} facturas
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={invoices.length < 10}>
                  Siguiente
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Planes Recurrentes */}
        <TabsContent value="recurring" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Planes de Facturación Recurrente</CardTitle>
                <CardDescription>
                  Facturación automática y periódica a clientes
                </CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href="/finanzas/nuevo-ingreso-recurrente">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Nuevo Plan</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Frecuencia</TableHead>
                    <TableHead>Próxima Fecha</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Cargando planes recurrentes...
                      </TableCell>
                    </TableRow>
                  ) : recurringPlans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No hay planes recurrentes disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    recurringPlans.map((plan: any) => (
                      <TableRow key={plan._id}>
                        <TableCell className="font-medium">{plan._id.substring(0, 8)}</TableCell>
                        <TableCell>{plan.clientName}</TableCell>
                        <TableCell>{plan.concept}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <Repeat className="mr-1 h-3 w-3 inline" />
                            {plan.frequency === "monthly" ? "Mensual" : 
                             plan.frequency === "quarterly" ? "Trimestral" : 
                             plan.frequency === "weekly" ? "Semanal" : "Anual"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                            <span>{financeService.formatDate(plan.nextDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{financeService.formatCurrency(plan.amount)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Ver detalles</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CalendarRange className="mr-2 h-4 w-4" />
                                <span>Ver historial</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Clock className="mr-2 h-4 w-4" />
                                <span>Generar factura ahora</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Próximas Facturas Automáticas</CardTitle>
              <CardDescription>
                Calendario de facturación de los próximos 30 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  Cargando próximas facturas...
                </div>
              ) : recurringPlans.length === 0 ? (
                <div className="text-center py-4">
                  No hay próximas facturas programadas
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    {/* Agrupar los planes por fecha */}
                    {Array.from(new Set(recurringPlans.map(plan => 
                      financeService.formatDate(plan.nextDate)
                    ))).sort().map(date => (
                      <div className="mb-4" key={date}>
                        <h4 className="text-sm font-semibold">{date}</h4>
                        <div className="mt-2 space-y-2">
                          {recurringPlans
                            .filter(plan => financeService.formatDate(plan.nextDate) === date)
                            .map(plan => (
                              <div className="flex justify-between items-center text-sm" key={plan._id}>
                                <div className="flex items-center">
                                  <Repeat className="mr-2 h-4 w-4 text-blue-500" />
                                  <div>
                                    <span className="font-medium">{plan.clientName}</span>
                                    <span className="text-muted-foreground ml-2">- {plan.concept}</span>
                                  </div>
                                </div>
                                <span className="font-medium">{financeService.formatCurrency(plan.amount)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Clientes */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Clientes con Facturas</CardTitle>
                <CardDescription>
                  Estado de cuentas por cliente
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={handleRefreshData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Actualizar</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Facturas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total Facturado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Cargando clientes...
                      </TableCell>
                    </TableRow>
                  ) : clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No hay clientes con facturas
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client: any) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{client.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{client.invoices}</TableCell>
                        <TableCell>
                          <Badge className={
                            client.status === "good" ? 
                              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : 
                              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }>
                            {client.status === "good" ? 
                              <CheckCircle className="mr-1 h-3 w-3 inline" /> : 
                              <AlertCircle className="mr-1 h-3 w-3 inline" />
                            }
                            {client.status === "good" ? "Al día" : "Con retraso"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{financeService.formatCurrency(client.total)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Wallet className="mr-2 h-4 w-4" />
                            <span>Estado de cuenta</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Facturación</CardTitle>
              <CardDescription>
                Eficiencia y tiempos de cobro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Días promedio para cobro</h4>
                  <span className="text-sm font-medium">18 días</span>
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-xs text-muted-foreground">Meta: 15 días</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Facturas cobradas a tiempo</h4>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
                <p className="text-xs text-muted-foreground">Meta: 90%</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Facturas vencidas</h4>
                  <span className="text-sm font-medium">8%</span>
                </div>
                <Progress value={8} className="h-2" />
                <p className="text-xs text-muted-foreground">Meta: &lt;5%</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog de detalle de factura */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Factura {selectedInvoice?.number}</DialogTitle>
            <DialogDescription>
              Detalles de la factura y estado de cobro
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Cliente</h4>
                  <p className="text-sm">{selectedInvoice.clientId?.name || 'Cliente'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Email</h4>
                  <p className="text-sm">{selectedInvoice.clientId?.email || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Concepto</h4>
                  <p className="text-sm">{selectedInvoice.items?.[0]?.description || 'Servicios'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Estado</h4>
                  {getStatusBadge(selectedInvoice.status)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Fecha de emisión</h4>
                  <p className="text-sm">{financeService.formatDate(selectedInvoice.issueDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Fecha de vencimiento</h4>
                  <p className="text-sm">{financeService.formatDate(selectedInvoice.dueDate)}</p>
                </div>
                {selectedInvoice.status === "paid" && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Fecha de pago</h4>
                      <p className="text-sm">{financeService.formatDate(selectedInvoice.paidDate || new Date())}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Método de pago</h4>
                      <p className="text-sm">Transferencia</p>
                    </div>
                  </>
                )}
                <div>
                  <h4 className="text-sm font-semibold mb-1">Importe</h4>
                  <p className="text-sm font-bold">{financeService.formatCurrency(selectedInvoice.total)}</p>
                </div>
              </div>
              
              <div className="flex justify-between border-t pt-4">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-xl">{financeService.formatCurrency(selectedInvoice.total)}</span>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
              Cerrar
            </Button>
            <div className="flex gap-2">
              {selectedInvoice?.status !== "paid" && (
                <>
                  <Button variant="outline" onClick={() => handleSendReminder(selectedInvoice)}>
                    <Send className="mr-2 h-4 w-4" />
                    <span>Enviar Recordatorio</span>
                  </Button>
                  <Button onClick={() => handleRegisterPayment(selectedInvoice)}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Registrar Pago</span>
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar ingresos pendientes */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Confirmar Ingresos Pendientes</DialogTitle>
            <DialogDescription>
              Revisa y confirma los ingresos registrados pendientes de confirmación
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">
                Cargando ingresos pendientes...
              </div>
            ) : pendingIncomes.length === 0 ? (
              <div className="text-center py-4">
                No hay ingresos pendientes de confirmación
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingIncomes.map((item: any) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Checkbox 
                          id={`check-${item._id}`} 
                          checked={selectedIncomes.includes(item._id)}
                          onCheckedChange={() => handleToggleIncomeSelection(item._id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                      <TableCell>{item.clientName}</TableCell>
                      <TableCell>{item.concept}</TableCell>
                      <TableCell>{financeService.formatDate(item.date)}</TableCell>
                      <TableCell className="text-right font-semibold">{financeService.formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="flex justify-between border-t pt-4">
              <span className="font-semibold">Total seleccionado:</span>
              <span className="font-bold text-xl">
                {financeService.formatCurrency(
                  pendingIncomes
                    .filter((item: any) => selectedIncomes.includes(item._id))
                    .reduce((sum: number, item: any) => sum + item.amount, 0)
                )}
              </span>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <div className="flex gap-2">
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                disabled={selectedIncomes.length === 0 || isLoading}
                onClick={handleConfirmSelectedIncomes}
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                <span>Confirmar Seleccionados</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 