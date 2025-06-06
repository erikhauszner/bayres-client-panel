"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Briefcase, AlertCircle, Bell, Activity } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useState, useEffect } from "react"
import { financeService } from "@/lib/services/financeService"
import Link from "next/link"

export default function FinanceDashboard() {
  const [isLoading, setIsLoading] = useState(true)
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
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Cargar resumen de ingresos
        const summary = await financeService.getIncomesSummary()
        setSummaryData(summary)
        
        try {
          // Cargar transacciones recientes en un try/catch separado
          const txs = await financeService.getAllTransactions()
          setTransactions(txs.slice(0, 5)) // Mostrar solo las 5 más recientes
        } catch (txError) {
          console.warn("No se pudieron cargar las transacciones, usando datos de ejemplo:", txError)
          // Usar datos de ejemplo si falla la carga de transacciones
          setTransactions([
            { id: "TRX-2023-0042", description: "Pago de cliente: ABC Solutions", amount: "+$4,800.00", date: "15/06/2023", type: "income" },
            { id: "TRX-2023-0041", description: "Pago de nómina: Equipo de desarrollo", amount: "-$7,200.00", date: "14/06/2023", type: "expense" },
            { id: "TRX-2023-0040", description: "Pago de cliente: Innovatech", amount: "+$3,500.00", date: "10/06/2023", type: "income" },
            { id: "TRX-2023-0039", description: "Suscripción software: Adobe CC", amount: "-$599.00", date: "08/06/2023", type: "expense" },
            { id: "TRX-2023-0038", description: "Pago de cliente: Grupo Servicios", amount: "+$12,400.00", date: "05/06/2023", type: "income" }
          ])
        }
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  return (
    <div className="space-y-8">
      {/* Métricas Clave */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeService.formatCurrency(summaryData.totalPending)}</div>
            <div className="text-xs text-muted-foreground pt-1">
              {summaryData.pendingCount} {summaryData.pendingCount === 1 ? 'factura pendiente' : 'facturas pendientes'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cobros Vencidos</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeService.formatCurrency(summaryData.overdue)}</div>
            <div className="text-xs text-muted-foreground pt-1">
              {summaryData.overdueCount} {summaryData.overdueCount === 1 ? 'factura vencida' : 'facturas vencidas'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Recurrentes</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeService.formatCurrency(summaryData.recurringTotal)}</div>
            <div className="text-xs text-muted-foreground pt-1">
              {summaryData.recurringCount} {summaryData.recurringCount === 1 ? 'plan activo' : 'planes activos'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximos Ingresos</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeService.formatCurrency(summaryData.upcomingTotal)}</div>
            <div className="text-xs text-muted-foreground pt-1">
              {summaryData.upcomingCount} {summaryData.upcomingCount === 1 ? 'factura en 7 días' : 'facturas en 7 días'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alertas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Alertas Financieras</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50">
            <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300 font-medium">Facturas por Cobrar</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              Tienes 6 facturas pendientes de cobro por un total de $23,450.00, de las cuales 2 vencen esta semana.
            </AlertDescription>
            <Button size="sm" variant="outline" className="mt-2 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300">
              Ver Facturas
            </Button>
          </Alert>
          
          <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700">
            <Bell className="h-4 w-4 text-red-500 dark:text-red-400" />
            <AlertTitle className="text-red-800 dark:text-red-300 font-medium">Pagos a Empleados</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-400">
              Tienes 3 pagos de nómina pendientes con vencimiento para mañana por un total de $8,750.00.
            </AlertDescription>
            <Button size="sm" variant="outline" className="mt-2 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300">
              Programar Pagos
            </Button>
          </Alert>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Ingresos vs. Egresos</CardTitle>
            <CardDescription>Comparativa de los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Este sería reemplazado por un gráfico real */}
            <div className="h-[300px] flex flex-col justify-center border rounded-lg p-4">
              <div className="space-y-8 w-full">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                      <span className="text-sm">Ingresos</span>
                    </div>
                    <span className="text-sm font-medium">Promedio: $32,450.00</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-destructive"></div>
                      <span className="text-sm">Egresos</span>
                    </div>
                    <span className="text-sm font-medium">Promedio: $17,820.00</span>
                  </div>
                  <Progress value={45} className="h-2 bg-muted" />
                </div>
                
                <div className="pt-4 grid grid-cols-6 gap-2">
                  {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"].map((month) => (
                    <div key={month} className="text-center text-xs text-muted-foreground">
                      {month}
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-center text-muted-foreground italic">
                  Esta visualización es un mockup y será reemplazada por un gráfico interactivo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Gastos</CardTitle>
            <CardDescription>Por categoría (mes actual)</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Este sería reemplazado por un gráfico de torta real */}
            <div className="h-[300px] flex flex-col justify-between border rounded-lg p-4">
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Nómina</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">$10,240.00</span>
                    <Badge variant="outline" className="ml-1 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200">56%</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm">Operativos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">$4,320.00</span>
                    <Badge variant="outline" className="ml-1 bg-amber-50 dark:bg-amber-900 text-amber-800 dark:text-amber-200">23%</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Marketing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">$2,180.00</span>
                    <Badge variant="outline" className="ml-1 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200">12%</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Software</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">$1,600.00</span>
                    <Badge variant="outline" className="ml-1 bg-purple-50 dark:bg-purple-900 text-purple-800 dark:text-purple-200">9%</Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-center text-muted-foreground italic">
                Esta visualización es un mockup y será reemplazada por un gráfico de torta interactivo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Transacciones Recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transacciones Recientes</CardTitle>
            <CardDescription>Últimas operaciones financieras</CardDescription>
          </div>
          <Button variant="outline" size="sm">Ver todas</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">#{transaction.id} • {transaction.date}</p>
                  </div>
                  <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No hay transacciones recientes
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 