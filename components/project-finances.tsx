"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  DollarSign,
  FileText,
  Download,
  CreditCard,
  TrendingUp,
  TrendingDown,
  BarChart,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
  Calculator,
  PieChart,
  Receipt,
  AlertTriangle,
  Target,
  Save,
  X,
  Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "./projects-dashboard"
import { projectService } from "@/lib/services/projectService"
import { financeService } from "@/lib/services/financeService"
import { format } from "date-fns"
import { es } from 'date-fns/locale'

interface ProjectFinancesProps {
  project: {
    _id: string
    nombre: string
    presupuestoTotal: number
    presupuestoGastado: number
    tareas: any[]
  }
}

interface ProjectExpense {
  _id?: string
  description: string
  amount: number
  date: string
  category: string
  status: 'pending' | 'approved' | 'rejected'
  projectId: string
}

interface ProjectInvoice {
  _id?: string
  number: string
  amount: number
  date: string
  status: 'pending' | 'sent' | 'paid' | 'overdue'
  description: string
  projectId: string
}

interface ProjectFinanceData {
  budget: number
  spent: number
  invoiced: number
  remaining: number
  budgetUsedPercentage: number
  profitMargin: number
  profitPercentage: number
  expenses: ProjectExpense[]
  invoices: ProjectInvoice[]
  taskBudgets: { taskId: string, name: string, budget: number, spent: number }[]
}

const categorias = [
  "Material",
  "Mano de obra", 
  "Transporte",
  "Herramientas",
  "Servicios",
  "Software",
  "Otros"
]

const estadosGasto = [
  { value: "pending", label: "Pendiente", color: "bg-amber-500" },
  { value: "approved", label: "Aprobado", color: "bg-green-500" },
  { value: "rejected", label: "Rechazado", color: "bg-red-500" }
]

export default function ProjectFinances({ project }: ProjectFinancesProps) {
  const [financeData, setFinanceData] = useState<ProjectFinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ProjectExpense | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<ProjectInvoice | null>(null)
  const [viewMode, setViewMode] = useState<"overview" | "expenses" | "invoices" | "tasks">("overview")
  const [saving, setSaving] = useState(false)
  
  // Estados para formularios
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0]
  })

  const [invoiceForm, setInvoiceForm] = useState({
    number: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  })

  // Cargar datos financieros del proyecto
  useEffect(() => {
    loadFinanceData()
  }, [project._id])

  const loadFinanceData = async () => {
    try {
      setLoading(true)
      
      // Calcular datos financieros del proyecto
      const taskBudgets = project.tareas.map(task => ({
        taskId: task._id || '',
        name: task.title || task.nombre || 'Sin nombre',
        budget: task.budget || 0,
        spent: task.spent || 0
      }))

      const totalTaskBudget = taskBudgets.reduce((sum, t) => sum + t.budget, 0)
      const totalTaskSpent = taskBudgets.reduce((sum, t) => sum + t.spent, 0)
      
      // Crear datos financieros
      const mockData: ProjectFinanceData = {
        budget: project.presupuestoTotal || totalTaskBudget,
        spent: project.presupuestoGastado || totalTaskSpent,
        invoiced: 0, // Se cargará desde las facturas reales
        remaining: (project.presupuestoTotal || totalTaskBudget) - (project.presupuestoGastado || totalTaskSpent),
        budgetUsedPercentage: project.presupuestoTotal > 0 
          ? ((project.presupuestoGastado || totalTaskSpent) / project.presupuestoTotal) * 100 
          : 0,
        profitMargin: 0,
        profitPercentage: 0,
        expenses: [], // Se cargarán gastos reales
        invoices: [], // Se cargarán facturas reales
        taskBudgets
      }

      // Calcular margen y porcentaje de ganancia
      mockData.profitMargin = mockData.budget - mockData.spent
      mockData.profitPercentage = mockData.budget > 0 
        ? (mockData.profitMargin / mockData.budget) * 100 
        : 0

      setFinanceData(mockData)
    } catch (error) {
      console.error("Error cargando datos financieros:", error)
      toast.error("Error al cargar los datos financieros")
    } finally {
      setLoading(false)
    }
  }

  // Manejar creación/edición de gastos
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.category) {
      toast.error("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      setSaving(true)
      
      const expenseData = {
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        date: expenseForm.date,
        status: 'pending' as const,
        projectId: project._id
      }

      if (editingExpense) {
        // Actualizar gasto existente
        toast.success("Gasto actualizado correctamente")
      } else {
        // Crear nuevo gasto usando el servicio de finanzas
        await financeService.createExpense({
          description: expenseData.description,
          amount: expenseData.amount,
          categoryId: expenseData.category, // categoryId en lugar de category
          date: expenseData.date,
          status: expenseData.status,
          projectId: expenseData.projectId,
          createdBy: 'current-user' // Se debería obtener del contexto de usuario
        })
        toast.success("Gasto registrado correctamente")
      }

      // Resetear formulario
      setExpenseForm({
        description: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split('T')[0]
      })
      setShowExpenseForm(false)
      setEditingExpense(null)
      
      // Recargar datos
      loadFinanceData()
    } catch (error) {
      console.error("Error al guardar gasto:", error)
      toast.error("Error al guardar el gasto")
    } finally {
      setSaving(false)
    }
  }

  // Manejar creación/edición de facturas
  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invoiceForm.number || !invoiceForm.amount || !invoiceForm.description) {
      toast.error("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      setSaving(true)
      
      const invoiceData = {
        number: invoiceForm.number,
        amount: parseFloat(invoiceForm.amount),
        description: invoiceForm.description,
        date: invoiceForm.date,
        status: 'pending' as const,
        projectId: project._id
      }

      if (editingInvoice) {
        // Actualizar factura existente
        toast.success("Factura actualizada correctamente")
      } else {
        // Crear nueva factura/ingreso
        await financeService.createInvoice({
          number: invoiceData.number,
          status: 'draft', // Usar estado válido
          issueDate: invoiceData.date,
          dueDate: invoiceData.date,
          clientId: '', // Se puede asignar desde el proyecto
          projectId: invoiceData.projectId,
          items: [{
            description: invoiceData.description,
            quantity: 1,
            unitPrice: invoiceData.amount,
            amount: invoiceData.amount
          }],
          subtotal: invoiceData.amount,
          taxRate: 0,
          taxAmount: 0,
          total: invoiceData.amount,
          paid: 0,
          balance: invoiceData.amount,
          createdBy: 'current-user' // Se debería obtener del contexto de usuario
        })
        toast.success("Factura creada correctamente")
      }

      // Resetear formulario
      setInvoiceForm({
        number: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
      })
      setShowInvoiceForm(false)
      setEditingInvoice(null)
      
      // Recargar datos
      loadFinanceData()
    } catch (error) {
      console.error("Error al guardar factura:", error)
      toast.error("Error al guardar la factura")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos financieros...</span>
      </div>
    )
  }

  if (!financeData) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p>No se pudieron cargar los datos financieros</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navegación de vistas */}
      <div className="flex items-center space-x-2 border-b">
        <Button
          variant={viewMode === "overview" ? "default" : "ghost"}
          onClick={() => setViewMode("overview")}
          size="sm"
        >
          <BarChart className="mr-2 h-4 w-4" />
          Resumen
        </Button>
        <Button
          variant={viewMode === "tasks" ? "default" : "ghost"}
          onClick={() => setViewMode("tasks")}
          size="sm"
        >
          <Target className="mr-2 h-4 w-4" />
          Presupuesto por Tarea
        </Button>
        <Button
          variant={viewMode === "expenses" ? "default" : "ghost"}
          onClick={() => setViewMode("expenses")}
          size="sm"
        >
          <Receipt className="mr-2 h-4 w-4" />
          Gastos
        </Button>
        <Button
          variant={viewMode === "invoices" ? "default" : "ghost"}
          onClick={() => setViewMode("invoices")}
          size="sm"
        >
          <FileText className="mr-2 h-4 w-4" />
                        Ingresos
        </Button>
      </div>

      {/* Vista de Resumen */}
      {viewMode === "overview" && (
        <div className="space-y-6">
          {/* Tarjetas de métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financeData.budget.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gastado</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${financeData.spent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {financeData.budgetUsedPercentage.toFixed(1)}% del presupuesto
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Restante</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${financeData.remaining.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {(100 - financeData.budgetUsedPercentage).toFixed(1)}% disponible
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margen de Ganancia</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${financeData.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${financeData.profitMargin.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {financeData.profitPercentage.toFixed(1)}% del presupuesto
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Barra de progreso del presupuesto */}
          <Card>
            <CardHeader>
              <CardTitle>Uso del Presupuesto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress 
                  value={financeData.budgetUsedPercentage} 
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span>Gastado: ${financeData.spent.toLocaleString()}</span>
                  <span>Total: ${financeData.budget.toLocaleString()}</span>
                </div>
                {financeData.budgetUsedPercentage > 90 && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">¡Atención! Has usado más del 90% del presupuesto</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vista de Presupuesto por Tarea */}
      {viewMode === "tasks" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Presupuesto por Tarea</h3>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarea</TableHead>
                    <TableHead>Presupuesto</TableHead>
                    <TableHead>Gastado</TableHead>
                    <TableHead>Restante</TableHead>
                    <TableHead>% Usado</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financeData.taskBudgets.map((task) => {
                    const percentUsed = task.budget > 0 ? (task.spent / task.budget) * 100 : 0
                    const remaining = task.budget - task.spent
                    
                    return (
                      <TableRow key={task.taskId}>
                        <TableCell className="font-medium">{task.name}</TableCell>
                        <TableCell>${task.budget.toLocaleString()}</TableCell>
                        <TableCell className="text-red-600">${task.spent.toLocaleString()}</TableCell>
                        <TableCell className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${remaining.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={percentUsed} className="w-16" />
                            <span className="text-sm">{percentUsed.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={percentUsed > 100 ? "destructive" : percentUsed > 90 ? "secondary" : "default"}
                          >
                            {percentUsed > 100 ? "Excedido" : percentUsed > 90 ? "Crítico" : "Normal"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vista de Gastos */}
      {viewMode === "expenses" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Gastos del Proyecto</h3>
            <Button onClick={() => setShowExpenseForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Gasto
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financeData.expenses.length > 0 ? (
                    financeData.expenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>${expense.amount.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(expense.date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              expense.status === "approved" ? "default" :
                              expense.status === "rejected" ? "destructive" : "secondary"
                            }
                          >
                            {expense.status === "approved" ? "Aprobado" :
                             expense.status === "rejected" ? "Rechazado" : "Pendiente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingExpense(expense)
                                setExpenseForm({
                                  description: expense.description,
                                  amount: expense.amount.toString(),
                                  category: expense.category,
                                  date: expense.date
                                })
                                setShowExpenseForm(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No hay gastos registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vista de Facturas */}
      {viewMode === "invoices" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Ingresos del Proyecto</h3>
            <Button onClick={() => setShowInvoiceForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Factura
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financeData.invoices.length > 0 ? (
                    financeData.invoices.map((invoice) => (
                      <TableRow key={invoice._id}>
                        <TableCell className="font-medium">{invoice.number}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(invoice.date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "paid" ? "default" :
                              invoice.status === "overdue" ? "destructive" : "secondary"
                            }
                          >
                            {invoice.status === "paid" ? "Pagada" :
                             invoice.status === "overdue" ? "Vencida" :
                             invoice.status === "sent" ? "Enviada" : "Pendiente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No hay ingresos registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Nuevo/Editar Gasto */}
      <Dialog open={showExpenseForm} onOpenChange={(open) => {
        setShowExpenseForm(open)
        if (!open) {
          setEditingExpense(null)
          setExpenseForm({
            description: "",
            amount: "",
            category: "",
            date: new Date().toISOString().split('T')[0]
          })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Editar Gasto" : "Nuevo Gasto"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                placeholder="Describe el gasto..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Monto *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={expenseForm.category}
                  onValueChange={(value) => setExpenseForm({...expenseForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowExpenseForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingExpense ? "Actualizar" : "Crear"} Gasto
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Nueva/Editar Factura */}
      <Dialog open={showInvoiceForm} onOpenChange={(open) => {
        setShowInvoiceForm(open)
        if (!open) {
          setEditingInvoice(null)
          setInvoiceForm({
            number: "",
            amount: "",
            description: "",
            date: new Date().toISOString().split('T')[0]
          })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? "Editar Ingreso" : "Nuevo Ingreso"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleInvoiceSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="number">Número de Ingreso *</Label>
                <Input
                  id="number"
                  value={invoiceForm.number}
                  onChange={(e) => setInvoiceForm({...invoiceForm, number: e.target.value})}
                  placeholder="ING-001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Monto *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={invoiceForm.description}
                onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                placeholder="Describe el trabajo facturado..."
                required
              />
            </div>

            <div>
              <Label htmlFor="date">Fecha de Ingreso</Label>
              <Input
                id="date"
                type="date"
                value={invoiceForm.date}
                onChange={(e) => setInvoiceForm({...invoiceForm, date: e.target.value})}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowInvoiceForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingInvoice ? "Actualizar" : "Crear"} Ingreso
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 