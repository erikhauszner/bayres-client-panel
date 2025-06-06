"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingDown, 
  Download, 
  Plus, 
  RefreshCw, 
  Search, 
  Filter, 
  ReceiptText,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  FileText,
  Package,
  DollarSign
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
import Link from "next/link"
import { financeService } from "@/lib/services/financeService"
import { Expense, ExpenseCategory } from "@/lib/types/finance"

export default function ExpensesManagement() {
  const [activeTab, setActiveTab] = useState("expenses")
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [totalPending, setTotalPending] = useState(0)
  const [totalOverdue, setTotalOverdue] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalRecurring, setTotalRecurring] = useState(0)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    setIsLoading(true)
    try {
      // Cargar categorías
      const categoriesData = await financeService.getExpenseCategories()
      setCategories(categoriesData)
      
      // Cargar todos los gastos usando el nuevo método
      const expensesData = await financeService.getAllExpenses()
      setExpenses(expensesData)
      
      // Calcular totales
      calculateTotals(expensesData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const calculateTotals = (expensesData: Expense[]) => {
    let pending = 0
    let overdue = 0
    let total = 0
    let recurring = 0
    
    const today = new Date()
    
    expensesData.forEach(expense => {
      const amount = typeof expense.amount === 'number' ? expense.amount : 0
      total += amount
      
      if (expense.status === 'pending') {
        pending += amount
        
        // Comprobar si está vencido (fecha de vencimiento pasada)
        const dueDate = expense.date ? new Date(expense.date) : null
        if (dueDate && dueDate < today) {
          overdue += amount
        }
      }
      
      // Asumir que gastos aprobados son recurrentes (esto podría necesitar ajustes según su modelo de datos real)
      if (expense.status === 'approved') {
        recurring += amount
      }
    })
    
    setTotalPending(pending)
    setTotalOverdue(overdue)
    setTotalExpenses(total)
    setTotalRecurring(recurring)
  }
  
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
  }
  
  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value)
  }
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  
  const filteredExpenses = expenses.filter(expense => {
    // Filtro por estado
    if (statusFilter !== "all" && expense.status !== statusFilter) {
      return false
    }
    
    // Filtro por categoría
    const expenseCategory = categories.find(cat => cat._id === expense.categoryId)
    if (categoryFilter !== "all" && expenseCategory?.name.toLowerCase() !== categoryFilter) {
      return false
    }
    
    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const description = expense.description.toLowerCase()
      const vendor = expense.vendor?.toLowerCase() || ""
      
      return description.includes(query) || vendor.includes(query)
    }
    
    return true
  })
  
  const viewExpenseDetails = (expense: Expense) => {
    setSelectedExpense(expense)
    setExpenseDialogOpen(true)
  }
  
  const handleRefresh = () => {
    loadData()
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'reimbursed':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
            <CheckCircle className="mr-1 h-3 w-3 inline" />
            {status === 'approved' ? 'Aprobado' : 'Reembolsado'}
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400">
            <Clock className="mr-1 h-3 w-3 inline" />
            Pendiente
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400">
            <AlertCircle className="mr-1 h-3 w-3 inline" />
            Rechazado
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
            {status}
          </Badge>
        )
    }
  }
  
  // Obtener el nombre de la categoría a partir del ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId)
    return category ? category.name : 'Sin categoría'
  }
  
  // Agrupar gastos por categoría para la pestaña de categorías
  const expensesByCategory = categories.map(category => {
    const categoryExpenses = expenses.filter(exp => exp.categoryId === category._id)
    const total = categoryExpenses.reduce((sum, exp) => sum + (typeof exp.amount === 'number' ? exp.amount : 0), 0)
    const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0
    
    return {
      ...category,
      total,
      percentage: Math.round(percentage)
    }
  }).sort((a, b) => b.total - a.total)
  
  // Agrupar gastos por proveedor para la pestaña de proveedores
  const expensesByProvider = expenses.reduce((acc: any[], expense) => {
    if (!expense.vendor) return acc
    
    const existingProvider = acc.find(p => p.name === expense.vendor)
    
    if (existingProvider) {
      existingProvider.total += typeof expense.amount === 'number' ? expense.amount : 0
      existingProvider.invoices++
    } else {
      acc.push({
        name: expense.vendor,
        total: typeof expense.amount === 'number' ? expense.amount : 0,
        invoices: 1
      })
    }
    
    return acc
  }, []).sort((a, b) => b.total - a.total)
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Egresos</h2>
          <p className="text-muted-foreground">
            Administra gastos, facturas de proveedores y presupuestos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar</span>
          </Button>
          <Button size="sm" className="h-9" asChild>
            <Link href="/finanzas/egresos-registrar-pago">
              <Plus className="mr-2 h-4 w-4" />
              <span>Registrar Egreso</span>
            </Link>
          </Button>
          <Button size="sm" className="h-9" variant="outline" asChild>
            <Link href="/finanzas/nuevo-egreso-recurrente">
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Egreso Recurrente</span>
            </Link>
          </Button>
          <Button size="sm" className="h-9" variant="secondary" asChild>
            <Link href="/finanzas/egresos-confirmar-pago">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Confirmar Egresos</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Egresos (Mes)</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeService.formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Presupuesto: $20,000.00 ({totalExpenses > 0 ? Math.round((totalExpenses / 20000) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeService.formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground pt-1">
              {expenses.filter(e => e.status === 'pending').length} facturas por pagar
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeService.formatCurrency(totalOverdue)}</div>
            <p className="text-xs text-muted-foreground pt-1">
              {expenses.filter(e => {
                const dueDate = e.date ? new Date(e.date) : null
                return e.status === 'pending' && dueDate && dueDate < new Date()
              }).length} factura{expenses.filter(e => {
                const dueDate = e.date ? new Date(e.date) : null
                return e.status === 'pending' && dueDate && dueDate < new Date()
              }).length !== 1 ? 's' : ''} vencida{expenses.filter(e => {
                const dueDate = e.date ? new Date(e.date) : null
                return e.status === 'pending' && dueDate && dueDate < new Date()
              }).length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gastos Recurrentes</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeService.formatCurrency(totalRecurring)}</div>
            <p className="text-xs text-muted-foreground pt-1">
              {expenses.filter(e => e.status === 'approved').length} gasto{expenses.filter(e => e.status === 'approved').length !== 1 ? 's' : ''} recurrente{expenses.filter(e => e.status === 'approved').length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">Gastos y Facturas</TabsTrigger>
          <TabsTrigger value="categories">Por Categoría</TabsTrigger>
          <TabsTrigger value="providers">Proveedores</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de Gastos y Facturas */}
        <TabsContent value="expenses" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar gasto o proveedor..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                
                <div>
                  <Select 
                    defaultValue="all"
                    value={statusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="approved">Aprobados</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="rejected">Rechazados</SelectItem>
                      <SelectItem value="reimbursed">Reembolsados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select 
                    defaultValue="all"
                    value={categoryFilter}
                    onValueChange={handleCategoryFilterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category.name.toLowerCase()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="icon" className="mr-2">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Actualizar</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabla de gastos */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <p>Cargando gastos...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Concepto / Proveedor</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No se encontraron gastos con los filtros seleccionados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExpenses.map(expense => (
                        <TableRow key={expense._id}>
                          <TableCell className="font-medium">{expense._id?.substring(0, 8)}</TableCell>
                          <TableCell>
                            <div className="font-medium">{expense.description}</div>
                            <div className="text-xs text-muted-foreground">{expense.vendor}</div>
                          </TableCell>
                          <TableCell>{getCategoryName(expense.categoryId)}</TableCell>
                          <TableCell>{financeService.formatDate(expense.date)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {financeService.formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(expense.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => viewExpenseDetails(expense)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Ver detalles</span>
                                </DropdownMenuItem>
                                {expense.status === 'pending' && (
                                  <DropdownMenuItem>
                                    <Link href={`/finanzas/aprobar-gasto/${expense._id}`} className="flex items-center w-full">
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      <span>Aprobar gasto</span>
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                {expense.status === 'approved' && !expense.receipt && (
                                  <DropdownMenuItem>
                                    <Link href={`/finanzas/subir-recibo/${expense._id}`} className="flex items-center w-full">
                                      <ReceiptText className="mr-2 h-4 w-4" />
                                      <span>Subir recibo</span>
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {expense.vendor && (
                                  <DropdownMenuItem>
                                    <Package className="mr-2 h-4 w-4" />
                                    <span>Ver proveedor</span>
                                  </DropdownMenuItem>
                                )}
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
            <CardFooter className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredExpenses.length} de {expenses.length} gastos
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={filteredExpenses.length < 10}>
                  Siguiente
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Categorías */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Gastos por Categoría</CardTitle>
              <CardDescription>
                Desglose de gastos del mes actual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gráfica de distribución */}
              <div className="rounded-md border p-4">
                <div className="h-[250px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Aquí se mostraría un gráfico de torta con la distribución de gastos
                  </p>
                </div>
              </div>
              
              {/* Listado de categorías */}
              <div className="space-y-4">
                {expensesByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full bg-${
                          index === 0 ? "blue" : 
                          index === 1 ? "green" : 
                          index === 2 ? "amber" :
                          index === 3 ? "purple" :
                          index === 4 ? "red" : "gray"
                        }-500 mr-2`}></div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        {category.percentage}% del total
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{financeService.formatCurrency(category.total)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Proveedores */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Proveedores</CardTitle>
                <CardDescription>
                  Gastos agrupados por proveedor
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                <span>Nuevo Proveedor</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="text-center">Facturas</TableHead>
                    <TableHead className="text-right">Total Gastado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expensesByProvider.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No hay proveedores registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    expensesByProvider.map((provider, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{provider.name}</TableCell>
                        <TableCell className="text-center">{provider.invoices}</TableCell>
                        <TableCell className="text-right font-medium">
                          {financeService.formatCurrency(provider.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo de detalles de gasto */}
      {selectedExpense && (
        <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles del Gasto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Concepto</p>
                  <p className="text-lg font-medium">{selectedExpense.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Importe</p>
                  <p className="text-lg font-medium">{financeService.formatCurrency(selectedExpense.amount)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Proveedor</p>
                  <p>{selectedExpense.vendor || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                  <p>{getCategoryName(selectedExpense.categoryId)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha del gasto</p>
                  <p>{financeService.formatDate(selectedExpense.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <div className="mt-1">{getStatusBadge(selectedExpense.status)}</div>
                </div>
              </div>
              
              {selectedExpense.receipt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recibo</p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedExpense.receipt} target="_blank" rel="noopener noreferrer">
                        <ReceiptText className="mr-2 h-4 w-4" />
                        <span>Ver recibo</span>
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedExpense.status === 'approved' && selectedExpense.approvedBy && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aprobado por</p>
                  <p>{typeof selectedExpense.approvedBy === 'string' ? selectedExpense.approvedBy : `${selectedExpense.approvedBy.firstName} ${selectedExpense.approvedBy.lastName}`}</p>
                  {selectedExpense.approvedAt && (
                    <p className="text-xs text-muted-foreground">
                      {financeService.formatDate(selectedExpense.approvedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              {selectedExpense.status === 'pending' && (
                <Button variant="outline" asChild>
                  <Link href={`/finanzas/aprobar-gasto/${selectedExpense._id}`}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>Aprobar gasto</span>
                  </Link>
                </Button>
              )}
              <Button onClick={() => setExpenseDialogOpen(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
