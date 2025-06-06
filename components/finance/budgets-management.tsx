"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Calculator, 
  Download, 
  Plus, 
  RefreshCw, 
  Search, 
  Filter, 
  FileSpreadsheet,
  AlertTriangle,
  Building,
  CheckCircle,
  MoreHorizontal,
  FileText,
  LineChart,
  ExternalLink,
  BarChart
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
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

// Datos de ejemplo
const BUDGETS = [
  {
    id: "PRE-2023-0012",
    name: "Desarrollo Web ABC Solutions",
    client: "ABC Solutions",
    totalBudget: "$24,800.00",
    executedBudget: "$18,600.00",
    executionPercentage: 75,
    startDate: "10/04/2023",
    endDate: "30/08/2023",
    status: "active",
    categories: [
      { name: "Desarrollo", amount: "$14,800.00", executed: "$11,500.00", percentage: 78 },
      { name: "Diseño", amount: "$6,000.00", executed: "$5,100.00", percentage: 85 },
      { name: "Testing", amount: "$2,500.00", executed: "$1,000.00", percentage: 40 },
      { name: "DevOps", amount: "$1,500.00", executed: "$1,000.00", percentage: 67 }
    ]
  },
  {
    id: "PRE-2023-0011",
    name: "Campaña Marketing Digital XYZ Corp",
    client: "XYZ Corporation",
    totalBudget: "$18,500.00",
    executedBudget: "$10,200.00",
    executionPercentage: 55,
    startDate: "01/05/2023",
    endDate: "31/10/2023",
    status: "active",
    categories: [
      { name: "Publicidad", amount: "$8,500.00", executed: "$4,800.00", percentage: 56 },
      { name: "Diseño Gráfico", amount: "$4,000.00", executed: "$2,900.00", percentage: 73 },
      { name: "Contenidos", amount: "$4,500.00", executed: "$1,800.00", percentage: 40 },
      { name: "Analytics", amount: "$1,500.00", executed: "$700.00", percentage: 47 }
    ]
  },
  {
    id: "PRE-2023-0010",
    name: "Rediseño Plataforma LMN Group",
    client: "LMN Group",
    totalBudget: "$32,600.00",
    executedBudget: "$15,300.00",
    executionPercentage: 47,
    startDate: "15/05/2023",
    endDate: "15/11/2023",
    status: "active",
    categories: [
      { name: "UX/UI", amount: "$15,200.00", executed: "$8,300.00", percentage: 55 },
      { name: "Frontend", amount: "$10,800.00", executed: "$5,100.00", percentage: 47 },
      { name: "Backend", amount: "$5,600.00", executed: "$1,900.00", percentage: 34 },
      { name: "QA", amount: "$1,000.00", executed: "$0.00", percentage: 0 }
    ]
  },
  {
    id: "PRE-2023-0009",
    name: "E-commerce Tienda Online",
    client: "Retail Solutions",
    totalBudget: "$48,500.00",
    executedBudget: "$48,500.00",
    executionPercentage: 100,
    startDate: "02/02/2023",
    endDate: "20/06/2023",
    status: "completed",
    categories: [
      { name: "Desarrollo", amount: "$28,000.00", executed: "$28,000.00", percentage: 100 },
      { name: "Diseño", amount: "$12,500.00", executed: "$12,500.00", percentage: 100 },
      { name: "Integración", amount: "$6,000.00", executed: "$6,000.00", percentage: 100 },
      { name: "Testing", amount: "$2,000.00", executed: "$2,000.00", percentage: 100 }
    ]
  },
  {
    id: "PRE-2023-0008",
    name: "CRM Personalizado",
    client: "Tech Industries",
    totalBudget: "$36,800.00",
    executedBudget: "$42,500.00",
    executionPercentage: 115,
    startDate: "15/01/2023",
    endDate: "30/04/2023",
    status: "overbudget",
    categories: [
      { name: "Desarrollo", amount: "$22,000.00", executed: "$25,400.00", percentage: 115 },
      { name: "Diseño", amount: "$8,500.00", executed: "$9,300.00", percentage: 109 },
      { name: "Consultoría", amount: "$4,300.00", executed: "$5,800.00", percentage: 135 },
      { name: "Testing", amount: "$2,000.00", executed: "$2,000.00", percentage: 100 }
    ]
  }
];

const CLIENTS = [
  { name: "ABC Solutions", totalBudget: "$24,800.00", activeBudgets: 1, completedBudgets: 2 },
  { name: "XYZ Corporation", totalBudget: "$18,500.00", activeBudgets: 1, completedBudgets: 1 },
  { name: "LMN Group", totalBudget: "$32,600.00", activeBudgets: 1, completedBudgets: 0 },
  { name: "Retail Solutions", totalBudget: "$48,500.00", activeBudgets: 0, completedBudgets: 1 },
  { name: "Tech Industries", totalBudget: "$36,800.00", activeBudgets: 0, completedBudgets: 2 }
];

const SUMMARY_STATS = {
  totalActiveBudgets: "$75,900.00",
  totalCompletedBudgets: "$85,300.00",
  avgAccuracy: "92%",
  overBudgetProjects: 1
};

export default function BudgetsManagement() {
  const [activeTab, setActiveTab] = useState("active")
  const [selectedBudget, setSelectedBudget] = useState<any>(null)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  
  const viewBudgetDetails = (budget: any) => {
    setSelectedBudget(budget)
    setBudgetDialogOpen(true)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Presupuestos por Cliente</h2>
          <p className="text-muted-foreground">
            Gestiona y analiza presupuestos de proyectos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar</span>
          </Button>
          <Button size="sm" className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            <span>Nuevo Presupuesto</span>
          </Button>
        </div>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Presupuestos Activos</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{SUMMARY_STATS.totalActiveBudgets}</div>
            <p className="text-xs text-muted-foreground pt-1">
              En 3 proyectos activos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Presupuestos Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{SUMMARY_STATS.totalCompletedBudgets}</div>
            <p className="text-xs text-muted-foreground pt-1">
              En 6 proyectos completados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Precisión Presupuestaria</CardTitle>
            <Calculator className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{SUMMARY_STATS.avgAccuracy}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Promedio de ejecución vs presupuesto
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Proyectos con Sobrecostos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{SUMMARY_STATS.overBudgetProjects}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Proyectos que excedieron el presupuesto
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Presupuestos Activos</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="clients">Por Cliente</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de Presupuestos Activos */}
        <TabsContent value="active" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar presupuesto o cliente..."
                    className="pl-9"
                  />
                </div>
                
                <div>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los clientes</SelectItem>
                      {CLIENTS.map((client, idx) => (
                        <SelectItem key={idx} value={client.name.toLowerCase().replace(/\s/g, '-')}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Estado de ejecución" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="low">Baja ejecución (&lt;30%)</SelectItem>
                      <SelectItem value="medium">Media ejecución (30-70%)</SelectItem>
                      <SelectItem value="high">Alta ejecución (&gt;70%)</SelectItem>
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
          
          {/* Tabla de presupuestos activos */}
          <div className="grid gap-4">
            {BUDGETS
              .filter(budget => budget.status === "active" || budget.status === "overbudget")
              .map(budget => (
                <Card key={budget.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold">{budget.name}</CardTitle>
                        <CardDescription className="flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {budget.client} • #{budget.id}
                        </CardDescription>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <Badge className={
                          budget.status === "overbudget" 
                            ? "bg-amber-100 text-amber-800 mr-2"
                            : "bg-blue-100 text-blue-800 mr-2"
                        }>
                          {budget.status === "overbudget" ? "Sobrecosto" : "Activo"}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => viewBudgetDetails(budget)}>
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Presupuesto</div>
                        <div className="font-medium text-base">{budget.totalBudget}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Ejecutado</div>
                        <div className="font-medium text-base">{budget.executedBudget}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Período</div>
                        <div className="text-sm">{budget.startDate} - {budget.endDate}</div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Ejecución presupuestaria</span>
                        <span className={`text-sm font-medium ${
                          budget.executionPercentage > 100 ? "text-amber-600" : 
                          budget.executionPercentage > 90 ? "text-green-600" : ""
                        }`}>{budget.executionPercentage}%</span>
                      </div>
                      <Progress 
                        value={budget.executionPercentage} 
                        className="h-2" 
                        indicatorClassName={budget.executionPercentage > 100 ? "bg-amber-500" : ""} 
                      />
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Pestaña de Presupuestos Completados */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">ID</TableHead>
                    <TableHead>Proyecto / Cliente</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead className="text-right">Presupuestado</TableHead>
                    <TableHead className="text-right">Ejecutado</TableHead>
                    <TableHead className="text-center">Precisión</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {BUDGETS
                    .filter(budget => budget.status === "completed")
                    .map(budget => (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{budget.name}</div>
                          <div className="text-xs text-muted-foreground">{budget.client}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{budget.startDate}</div>
                          <div className="text-xs text-muted-foreground">{budget.endDate}</div>
                        </TableCell>
                        <TableCell className="text-right">{budget.totalBudget}</TableCell>
                        <TableCell className="text-right">{budget.executedBudget}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={
                            budget.executionPercentage > 105 ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" :
                            budget.executionPercentage < 95 ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }>
                            {budget.executionPercentage}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => viewBudgetDetails(budget)}>
                            Ver detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Clientes */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-center">Presupuestos Activos</TableHead>
                    <TableHead className="text-center">Presupuestos Completados</TableHead>
                    <TableHead className="text-right">Total Presupuestos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CLIENTS.map((client, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="text-center">{client.activeBudgets}</TableCell>
                      <TableCell className="text-center">{client.completedBudgets}</TableCell>
                      <TableCell className="text-right font-medium">{client.totalBudget}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Building className="mr-2 h-4 w-4" />
                              <span>Ver perfil cliente</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Ver presupuestos</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <LineChart className="mr-2 h-4 w-4" />
                              <span>Análisis de rentabilidad</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Análisis */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Precisión Presupuestaria</CardTitle>
                <CardDescription>
                  Precisión de los últimos 10 proyectos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] border rounded-lg p-4 flex items-center justify-center">
                  <div className="space-y-8 w-full">
                    <p className="text-sm text-center text-muted-foreground">
                      Aquí se mostraría un gráfico de barras con la precisión presupuestaria de los últimos proyectos
                    </p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">E-commerce Tienda Online</span>
                          <span className="text-sm font-medium text-green-600">100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">CRM Personalizado</span>
                          <span className="text-sm font-medium text-amber-600">115%</span>
                        </div>
                        <Progress value={115} className="h-2" indicatorClassName="bg-amber-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Desarrollo Web ABC Solutions</span>
                          <span className="text-sm font-medium">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Presupuesto por Categoría</CardTitle>
                <CardDescription>
                  Distribución en proyectos activos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] border rounded-lg p-4 flex flex-col justify-between">
                  <div className="text-center text-sm text-muted-foreground mb-4">
                    Aquí se mostraría un gráfico de torta con la distribución de presupuestos por categoría
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: "Desarrollo", amount: "$47,600.00", percentage: "35%" },
                      { name: "Diseño", amount: "$28,700.00", percentage: "21%" },
                      { name: "Marketing", amount: "$18,500.00", percentage: "14%" },
                      { name: "Consultoría", amount: "$12,300.00", percentage: "9%" },
                      { name: "Testing", amount: "$5,500.00", percentage: "4%" }
                    ].map((category, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${
                            idx === 0 ? "bg-blue-500" : 
                            idx === 1 ? "bg-green-500" :
                            idx === 2 ? "bg-amber-500" :
                            idx === 3 ? "bg-purple-500" :
                            "bg-red-500"
                          }`}></div>
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <div className="space-x-2">
                          <span className="text-sm font-medium">{category.amount}</span>
                          <span className="text-xs text-muted-foreground">({category.percentage})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tendencias Presupuestarias</CardTitle>
                <CardDescription>
                  Evolución del presupuesto vs ejecución real
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <BarChart className="mr-2 h-4 w-4" />
                <span>Ver informe completo</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] border rounded-lg p-4 flex items-center justify-center">
                <div className="text-center text-muted-foreground space-y-3">
                  <BarChart className="h-10 w-10 mx-auto text-muted-foreground/70" />
                  <p>Aquí se mostraría un gráfico con la tendencia de precisión presupuestaria a lo largo del tiempo</p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <span>Abrir en herramienta de análisis</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog de detalle de presupuesto */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Detalle de Presupuesto</DialogTitle>
            <DialogDescription>
              {selectedBudget?.id} - {selectedBudget?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBudget && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Cliente</h4>
                  <p className="text-sm">{selectedBudget.client}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Estado</h4>
                  <Badge className={
                    selectedBudget.status === "completed" ? "bg-green-100 text-green-800" : 
                    selectedBudget.status === "overbudget" ? "bg-amber-100 text-amber-800" :
                    "bg-blue-100 text-blue-800"
                  }>
                    {selectedBudget.status === "completed" ? "Completado" : 
                     selectedBudget.status === "overbudget" ? "Sobrecosto" : "Activo"}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Fecha inicio</h4>
                  <p className="text-sm">{selectedBudget.startDate}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Fecha fin</h4>
                  <p className="text-sm">{selectedBudget.endDate}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Resumen Financiero</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Presupuesto total</div>
                    <div className="text-base font-medium">{selectedBudget.totalBudget}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Ejecutado</div>
                    <div className="text-base font-medium">{selectedBudget.executedBudget}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Porcentaje de ejecución</div>
                    <div className={`text-base font-medium ${
                      selectedBudget.executionPercentage > 100 ? "text-amber-600" : 
                      selectedBudget.executionPercentage > 90 ? "text-green-600" : ""
                    }`}>{selectedBudget.executionPercentage}%</div>
                  </div>
                </div>
                
                <div className="mt-2 space-y-1">
                  <div className="text-sm">Avance del presupuesto</div>
                  <Progress 
                    value={selectedBudget.executionPercentage} 
                    className="h-2" 
                    indicatorClassName={selectedBudget.executionPercentage > 100 ? "bg-amber-500" : undefined} 
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Detalle por Categoría</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Presupuestado</TableHead>
                      <TableHead className="text-right">Ejecutado</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBudget.categories.map((category: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="py-2">{category.name}</TableCell>
                        <TableCell className="text-right py-2">{category.amount}</TableCell>
                        <TableCell className="text-right py-2">{category.executed}</TableCell>
                        <TableCell className="text-right py-2">
                          <Badge className={
                            category.percentage > 100 ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" : 
                            category.percentage > 90 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                            category.percentage < 30 ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                            "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                          }>
                            {category.percentage}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-right font-semibold">{selectedBudget.totalBudget}</TableCell>
                      <TableCell className="text-right font-semibold">{selectedBudget.executedBudget}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={
                          selectedBudget.executionPercentage > 100 ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" : 
                          selectedBudget.executionPercentage > 90 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        }>
                          {selectedBudget.executionPercentage}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setBudgetDialogOpen(false)}>
              Cerrar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                <span>Ver proyecto</span>
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                <span>Exportar</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 