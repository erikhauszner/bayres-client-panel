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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

import { formatDate } from "./projects-dashboard"
import { projectService } from "@/lib/services/projectService"
import { ProjectTask } from "@/lib/types/project"

// Interfaces de proyecto actualizadas
interface Task {
  _id?: string
  name: string
  description?: string
  status: string
  progress: number
  budget?: number
  spent?: number
  startDate?: string | Date
  endDate?: string | Date
  assignedTo?: any
}

interface Project {
  id: number
  nombre: string
  presupuestoTotal: number
  presupuestoGastado: number
  tareas: Task[]
}

interface ProjectFinancesProps {
  project: Project
}

// Función para calcular el porcentaje gastado
const calculatePercentSpent = (spent: number, budget: number) => {
  if (!budget || budget === 0) return 0;
  return Math.round((spent / budget) * 100)
}

// Función para obtener el color de progreso basado en el porcentaje gastado vs progreso
const getProgressColor = (percentSpent: number, percentComplete: number) => {
  if (percentSpent > percentComplete + 10) {
    return "bg-red-500"
  } else if (percentSpent < percentComplete - 10) {
    return "bg-green-500"
  } else {
    return "bg-blue-500"
  }
}

// Datos de ejemplo para facturas
const invoicesData = [
  {
    id: "FAC-001",
    fecha: "2023-05-01",
    monto: 1500,
    estado: "pagada",
    descripcion: "Anticipo del proyecto",
  },
  {
    id: "FAC-002",
    fecha: "2023-06-01",
    monto: 2000,
    estado: "pendiente",
    descripcion: "Entrega de diseños",
  },
  {
    id: "FAC-003",
    fecha: "2023-07-01",
    monto: 1500,
    estado: "programada",
    descripcion: "Entrega desarrollo frontend",
  },
]

// Datos de ejemplo para gastos adicionales
const initialExpensesData = [
  {
    id: 1,
    descripcion: "Licencias de software",
    monto: 250,
    fecha: "2023-05-10",
    categoria: "software",
  },
  {
    id: 2,
    descripcion: "Contratación servicios externos de diseño",
    monto: 500,
    fecha: "2023-05-15",
    categoria: "servicios",
  },
  {
    id: 3,
    descripcion: "Recursos adicionales para desarrollo",
    monto: 800,
    fecha: "2023-06-05",
    categoria: "personal",
  },
]

export default function ProjectFinances({ project }: ProjectFinancesProps) {
  const [filterType, setFilterType] = useState("todos")
  const [expensesData, setExpensesData] = useState(initialExpensesData)
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [newExpense, setNewExpense] = useState({
    descripcion: "",
    monto: "",
    fecha: new Date().toISOString().split('T')[0],
    categoria: "otros"
  })
  const [savingExpense, setSavingExpense] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Cargar tareas del proyecto para el presupuesto
  useEffect(() => {
    async function loadProjectTasks() {
      if (!project || !project.id) {
        console.warn("No se pueden cargar tareas: falta ID del proyecto");
        return;
      }
      
      try {
        setLoading(true);
        console.log(`Cargando tareas para presupuesto del proyecto ${project.id}`);
        
        // Llamar al servicio para obtener las tareas del proyecto
        const taskData = await projectService.getProjectTasks(project.id.toString());
        console.log("Tareas recibidas para presupuesto:", taskData);
        
        if (Array.isArray(taskData)) {
          // Mapear los datos recibidos al formato esperado
          const formattedTasks = taskData.map(task => ({
            _id: task._id,
            name: task.name,
            description: task.description,
            status: task.status,
            progress: task.progress || 0,
            budget: task.budget || 0,
            spent: task.spent || 0,
            startDate: task.startDate,
            endDate: task.endDate,
            assignedTo: task.assignedTo
          }));
          
          setTasks(formattedTasks);
        } else {
          console.warn("El formato de tareas recibido no es válido:", taskData);
          setTasks([]);
        }
      } catch (err) {
        console.error("Error cargando tareas para presupuesto:", err);
        setError("No se pudieron cargar las tareas para el presupuesto");
        toast.error("Error al cargar datos de presupuesto por tareas");
        // Usar las tareas del proyecto si están disponibles como fallback
        if (project.tareas && Array.isArray(project.tareas)) {
          setTasks(project.tareas);
        } else {
          setTasks([]);
        }
      } finally {
        setLoading(false);
      }
    }
    
    loadProjectTasks();
  }, [project]);
  
  // Calcular los montos totales
  const totalFacturado = invoicesData.reduce((sum, invoice) => sum + invoice.monto, 0)
  const totalPagado = invoicesData
    .filter((invoice) => invoice.estado === "pagada")
    .reduce((sum, invoice) => sum + invoice.monto, 0)
  const totalGastosAdicionales = expensesData.reduce((sum, expense) => sum + expense.monto, 0)
  
  // Calcular la rentabilidad proyectada
  const rentabilidadProyectada = project.presupuestoTotal - project.presupuestoGastado - totalGastosAdicionales
  const porcentajeRentabilidad = Math.round((rentabilidadProyectada / project.presupuestoTotal) * 100)
  
  // Filtrar tareas
  const filteredTasks = tasks.filter((task) => {
    if (filterType === "todos") return true
    if (filterType === "completadas") return task.status === "completed"
    if (filterType === "en_progreso") return task.status === "in-progress" || task.status === "in_progress"
    if (filterType === "pendientes") return task.status === "pending"
    return true
  })
  
  // Calcular presupuesto total y gasto total de las tareas
  const totalTaskBudget = tasks.reduce((sum, task) => sum + (task.budget || 0), 0)
  const totalTaskSpent = tasks.reduce((sum, task) => sum + (task.spent || 0), 0)
  
  // Calcular porcentaje gastado vs porcentaje completado
  const percentBudgetSpent = calculatePercentSpent(project.presupuestoGastado, project.presupuestoTotal)
  const percentProjectComplete = tasks.length > 0 
    ? Math.round(tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / tasks.length)
    : 0
  
  // Determinar si el proyecto está dentro o fuera de presupuesto
  const budgetStatus = percentBudgetSpent <= percentProjectComplete ? "positivo" : "negativo"
  
  // Función para agregar un nuevo gasto
  const handleAddExpense = () => {
    // Validar los campos
    if (!newExpense.descripcion.trim()) {
      toast.error("La descripción es requerida");
      return;
    }
    
    if (!newExpense.monto || isNaN(parseFloat(newExpense.monto)) || parseFloat(newExpense.monto) <= 0) {
      toast.error("El monto debe ser un número positivo");
      return;
    }
    
    try {
      setSavingExpense(true);
      
      // Crear el nuevo gasto
      const newExpenseItem = {
        id: Date.now(), // Simulamos un ID único con timestamp
        descripcion: newExpense.descripcion,
        monto: parseFloat(newExpense.monto),
        fecha: newExpense.fecha,
        categoria: newExpense.categoria
      };
      
      // Aquí podríamos hacer una llamada a la API para guardar el gasto
      // Pero por ahora solo lo añadimos al estado local
      
      // Actualizar el estado
      setExpensesData([...expensesData, newExpenseItem]);
      
      // Resetear el formulario
      setNewExpense({
        descripcion: "",
        monto: "",
        fecha: new Date().toISOString().split('T')[0],
        categoria: "otros"
      });
      
      // Cerrar el modal
      setShowAddExpenseModal(false);
      
      // Mostrar notificación de éxito
      toast.success("Gasto agregado correctamente");
    } catch (error) {
      console.error("Error al agregar gasto:", error);
      toast.error("Error al agregar el gasto");
    } finally {
      setSavingExpense(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Finanzas del Proyecto</h2>
          <p className="text-muted-foreground">Análisis financiero y control de presupuesto</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Informe</span>
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="netflix-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Presupuesto Total</p>
                <h3 className="mt-1 text-2xl font-bold">${project.presupuestoTotal}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="netflix-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Costo Actual</p>
                <h3 className="mt-1 text-2xl font-bold">${project.presupuestoGastado}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{percentBudgetSpent}% del presupuesto</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="netflix-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Facturado</p>
                <h3 className="mt-1 text-2xl font-bold">${totalFacturado}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {Math.round((totalFacturado / project.presupuestoTotal) * 100)}% del total
                </p>
              </div>
              <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="netflix-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rentabilidad</p>
                <h3 className="mt-1 text-2xl font-bold">${rentabilidadProyectada}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{porcentajeRentabilidad}% proyectado</p>
              </div>
              <div
                className={`rounded-full ${
                  porcentajeRentabilidad > 20
                    ? "bg-green-500/10 text-green-500"
                    : porcentajeRentabilidad > 0
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-red-500/10 text-red-500"
                } p-2`}
              >
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico comparativo */}
      <Card className="netflix-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Análisis Presupuestario</CardTitle>
            <Badge
              className={
                budgetStatus === "positivo"
                  ? "bg-green-950/30 text-green-400 border border-green-800/30"
                  : "bg-red-950/30 text-red-400 border border-red-800/30"
              }
            >
              {budgetStatus === "positivo" ? "Dentro del presupuesto" : "Excedido"}
            </Badge>
          </div>
          <CardDescription>Comparativa entre progreso y gasto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span>Progreso del proyecto: {percentProjectComplete}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <span>Presupuesto consumido: {percentBudgetSpent}%</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">Desviación:</div>
              <div
                className={
                  percentBudgetSpent > percentProjectComplete
                    ? "text-red-400"
                    : "text-green-400"
                }
              >
                {percentBudgetSpent > percentProjectComplete
                  ? `+${percentBudgetSpent - percentProjectComplete}%`
                  : `-${percentProjectComplete - percentBudgetSpent}%`}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progreso</span>
              <span>{percentProjectComplete}%</span>
            </div>
            <Progress value={percentProjectComplete} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Presupuesto</span>
              <span>{percentBudgetSpent}%</span>
            </div>
            <Progress
              value={percentBudgetSpent}
              className="h-2"
              indicatorClassName={getProgressColor(percentBudgetSpent, percentProjectComplete)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Presupuesto por tareas */}
      <Card className="netflix-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Presupuesto por Tareas</CardTitle>
            <Select 
              value={filterType} 
              onValueChange={setFilterType}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las tareas</SelectItem>
                <SelectItem value="pendientes">Pendientes</SelectItem>
                <SelectItem value="en_progreso">En progreso</SelectItem>
                <SelectItem value="completadas">Completadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Cargando datos de tareas...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-amber-500" />
              <p className="mt-2 text-muted-foreground">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-2 text-muted-foreground">No hay tareas disponibles con los filtros seleccionados</p>
              {filterType !== "todos" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setFilterType("todos")}
                >
                  Ver todas las tareas
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const percentSpent = calculatePercentSpent(task.spent || 0, task.budget || 0)
                
                return (
                  <div key={task._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>${task.spent || 0}</span>
                          <span>/</span>
                          <span>${task.budget || 0}</span>
                          <span>
                            ({percentSpent}%)
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={
                          task.status === "completed"
                            ? "bg-green-950/30 text-green-400 border border-green-800/30"
                            : task.status === "in-progress" || task.status === "in_progress"
                              ? "bg-blue-950/30 text-blue-400 border border-blue-800/30"
                              : "bg-amber-950/30 text-amber-400 border border-amber-800/30"
                        }
                      >
                        {task.progress || 0}% completado
                      </Badge>
                    </div>
                    <Progress
                      value={percentSpent}
                      className="h-2"
                      indicatorClassName={getProgressColor(percentSpent, task.progress || 0)}
                    />
                  </div>
                )
              })}
              
              {/* Total de presupuesto de tareas */}
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between font-medium">
                  <span>Total Presupuesto de Tareas</span>
                  <span>
                    ${totalTaskSpent} / ${totalTaskBudget} ({calculatePercentSpent(totalTaskSpent, totalTaskBudget)}%)
                  </span>
                </div>
                <Progress
                  value={calculatePercentSpent(totalTaskSpent, totalTaskBudget)}
                  className="mt-2 h-2"
                  indicatorClassName={
                    calculatePercentSpent(totalTaskSpent, totalTaskBudget) > 90
                      ? "bg-red-500"
                      : calculatePercentSpent(totalTaskSpent, totalTaskBudget) > 70
                        ? "bg-amber-500"
                        : "bg-green-500"
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gastos adicionales y facturas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Gastos adicionales */}
        <Card className="netflix-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Gastos Adicionales</CardTitle>
              <Button 
                size="sm"
                onClick={() => setShowAddExpenseModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir
              </Button>
            </div>
            <CardDescription>
              Total: ${totalGastosAdicionales} ({Math.round((totalGastosAdicionales / project.presupuestoTotal) * 100)}% del presupuesto)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/10 hover:bg-transparent">
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesData.map((expense) => (
                  <TableRow key={expense.id} className="border-b border-border/10 hover:bg-muted/5">
                    <TableCell>
                      <div className="font-medium">{expense.descripcion}</div>
                      <div className="text-xs text-muted-foreground">
                        Categoría: {expense.categoria}
                      </div>
                    </TableCell>
                    <TableCell>${expense.monto}</TableCell>
                    <TableCell>{formatDate(expense.fecha)}</TableCell>
                  </TableRow>
                ))}
                {expensesData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      No hay gastos adicionales registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Este espacio está reservado para futura implementación de gestión de facturas */}
      </div>
      
      {/* Modal para añadir nuevo gasto */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 max-w-md netflix-card">
            <CardHeader>
              <CardTitle>Añadir nuevo gasto</CardTitle>
              <CardDescription>
                Ingresa los detalles del nuevo gasto para el proyecto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Input 
                  placeholder="Describe el gasto" 
                  value={newExpense.descripcion}
                  onChange={(e) => setNewExpense({...newExpense, descripcion: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto</label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={newExpense.monto}
                  onChange={(e) => setNewExpense({...newExpense, monto: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <Input 
                  type="date" 
                  value={newExpense.fecha}
                  onChange={(e) => setNewExpense({...newExpense, fecha: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoría</label>
                <Select
                  value={newExpense.categoria}
                  onValueChange={(value) => setNewExpense({...newExpense, categoria: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="servicios">Servicios externos</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="viajes">Viajes</SelectItem>
                    <SelectItem value="oficina">Oficina</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddExpenseModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddExpense}
                disabled={savingExpense}
              >
                {savingExpense ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar gasto"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
} 