"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  PieChart, 
  Download, 
  FileDown, 
  Calendar, 
  Share2, 
  Printer, 
  BarChart4,
  LineChart,
  ArrowUpDown,
  ChevronDown,
  Eye,
  FileText,
  BarChartHorizontal
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
import { Progress } from "@/components/ui/progress"

// Datos de ejemplo
const REPORTS = [
  {
    id: "REP-FIN-2023-Q2",
    name: "Reporte Financiero Q2 2023",
    type: "quarterly",
    date: "30/06/2023",
    status: "completed"
  },
  {
    id: "REP-FIN-2023-Q1",
    name: "Reporte Financiero Q1 2023",
    type: "quarterly",
    date: "31/03/2023",
    status: "completed"
  },
  {
    id: "REP-FIN-2022-ANUAL",
    name: "Reporte Financiero Anual 2022",
    type: "yearly",
    date: "31/12/2022",
    status: "completed"
  },
  {
    id: "REP-PROY-2023-ABC",
    name: "Rentabilidad Proyecto ABC Solutions",
    type: "project",
    date: "15/05/2023",
    status: "completed"
  },
  {
    id: "REP-FIN-2023-Q3",
    name: "Reporte Financiero Q3 2023 (Preliminar)",
    type: "quarterly",
    date: "15/09/2023",
    status: "draft"
  }
];

const FINANCIAL_DATA = {
  revenue: {
    q1: "$120,500.00",
    q2: "$156,200.00",
    q3: "$142,800.00",
    q4: "$178,400.00",
    total: "$597,900.00",
    growth: "+24%"
  },
  expenses: {
    q1: "$86,300.00",
    q2: "$102,400.00",
    q3: "$89,700.00",
    q4: "$106,800.00",
    total: "$385,200.00",
    growth: "+18%"
  },
  profit: {
    q1: "$34,200.00",
    q2: "$53,800.00",
    q3: "$53,100.00",
    q4: "$71,600.00",
    total: "$212,700.00",
    growth: "+38%"
  },
  margin: {
    q1: "28.4%",
    q2: "34.4%",
    q3: "37.2%",
    q4: "40.1%",
    average: "35.6%",
    growth: "+5.2%"
  }
};

const TOP_CLIENTS = [
  { name: "ABC Solutions", revenue: "$85,400.00", projects: 3, margin: "42.3%" },
  { name: "XYZ Corporation", revenue: "$64,800.00", projects: 2, margin: "38.7%" },
  { name: "Retail Solutions", revenue: "$48,500.00", projects: 1, margin: "35.2%" },
  { name: "LMN Group", revenue: "$46,200.00", projects: 2, margin: "28.6%" },
  { name: "Tech Industries", revenue: "$36,800.00", projects: 2, margin: "31.4%" }
];

export default function FinancialReports() {
  const [activeTab, setActiveTab] = useState("dashboard")
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Informes Financieros</h2>
          <p className="text-muted-foreground">
            Reportes, análisis y KPIs financieros
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Cambiar Período</span>
          </Button>
          <Button size="sm" className="h-9">
            <FileDown className="mr-2 h-4 w-4" />
            <span>Descargar Informes</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard Financiero</TabsTrigger>
          <TabsTrigger value="income">Estado de Resultados</TabsTrigger>
          <TabsTrigger value="balance">Balance General</TabsTrigger>
          <TabsTrigger value="reports">Informes Guardados</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de Dashboard Financiero */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <BarChart4 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{FINANCIAL_DATA.revenue.total}</div>
                <div className="flex items-center pt-1">
                  <span className="text-xs text-green-500 font-medium">{FINANCIAL_DATA.revenue.growth}</span>
                  <span className="text-xs text-muted-foreground ml-1">vs. año anterior</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
                <ArrowUpDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{FINANCIAL_DATA.expenses.total}</div>
                <div className="flex items-center pt-1">
                  <span className="text-xs text-amber-500 font-medium">{FINANCIAL_DATA.expenses.growth}</span>
                  <span className="text-xs text-muted-foreground ml-1">vs. año anterior</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
                <LineChart className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{FINANCIAL_DATA.profit.total}</div>
                <div className="flex items-center pt-1">
                  <span className="text-xs text-green-500 font-medium">{FINANCIAL_DATA.profit.growth}</span>
                  <span className="text-xs text-muted-foreground ml-1">vs. año anterior</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
                <PieChart className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{FINANCIAL_DATA.margin.average}</div>
                <div className="flex items-center pt-1">
                  <span className="text-xs text-green-500 font-medium">{FINANCIAL_DATA.margin.growth}</span>
                  <span className="text-xs text-muted-foreground ml-1">vs. año anterior</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Ingresos vs Egresos</CardTitle>
                <CardDescription>
                  Análisis trimestral comparativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] border rounded-lg p-4">
                  <div className="text-center text-sm text-muted-foreground mb-4">
                    Aquí se mostraría un gráfico de líneas con la evolución de ingresos y egresos
                  </div>
                  <div className="space-y-8 w-full">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-primary mr-2"></div>
                          <span>Ingresos</span>
                        </div>
                        <div className="text-green-600">+24% anual</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <div className="text-xs text-center text-muted-foreground mb-1">Q1</div>
                          <div className="text-center text-sm">{FINANCIAL_DATA.revenue.q1}</div>
                        </div>
                        <div>
                          <div className="text-xs text-center text-muted-foreground mb-1">Q2</div>
                          <div className="text-center text-sm">{FINANCIAL_DATA.revenue.q2}</div>
                        </div>
                        <div>
                          <div className="text-xs text-center text-muted-foreground mb-1">Q3</div>
                          <div className="text-center text-sm">{FINANCIAL_DATA.revenue.q3}</div>
                        </div>
                        <div>
                          <div className="text-xs text-center text-muted-foreground mb-1">Q4</div>
                          <div className="text-center text-sm">{FINANCIAL_DATA.revenue.q4}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-destructive mr-2"></div>
                          <span>Egresos</span>
                        </div>
                        <div className="text-amber-600">+18% anual</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <div className="text-xs text-center text-muted-foreground mb-1">Q1</div>
                          <div className="text-center text-sm">{FINANCIAL_DATA.expenses.q1}</div>
                        </div>
                        <div>
                          <div className="text-xs text-center text-muted-foreground mb-1">Q2</div>
                          <div className="text-center text-sm">{FINANCIAL_DATA.expenses.q2}</div>
                        </div>
                        <div>
                          <div className="text-xs text-center text-muted-foreground mb-1">Q3</div>
                          <div className="text-center text-sm">{FINANCIAL_DATA.expenses.q3}</div>
                        </div>
                        <div>
                          <div className="text-xs text-center text-muted-foreground mb-1">Q4</div>
                          <div className="text-center text-sm">{FINANCIAL_DATA.expenses.q4}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver análisis completo
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Top 5 Clientes por Ingresos</CardTitle>
                  <CardDescription>Mejores clientes por facturación</CardDescription>
                </div>
                <Select defaultValue="revenue">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Por Ingresos</SelectItem>
                    <SelectItem value="margin">Por Margen</SelectItem>
                    <SelectItem value="projects">Por Proyectos</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Ingresos</TableHead>
                      <TableHead className="text-center">Proyectos</TableHead>
                      <TableHead className="text-right">Margen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TOP_CLIENTS.map((client, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell className="text-right">{client.revenue}</TableCell>
                        <TableCell className="text-center">{client.projects}</TableCell>
                        <TableCell className="text-right">{client.margin}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando top 5 de 32 clientes
                </div>
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribución del Margen por Trimestre</CardTitle>
              <CardDescription>Evolución de márgenes a lo largo del año</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid grid-cols-4 gap-4">
                  {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, idx) => {
                    const value = parseFloat(FINANCIAL_DATA.margin[quarter.toLowerCase() as keyof typeof FINANCIAL_DATA.margin].replace('%', ''));
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{quarter}</span>
                          <span className="text-sm font-medium">{FINANCIAL_DATA.margin[quarter.toLowerCase() as keyof typeof FINANCIAL_DATA.margin]}</span>
                        </div>
                        <Progress value={value} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Ingresos: {FINANCIAL_DATA.revenue[quarter.toLowerCase() as keyof typeof FINANCIAL_DATA.revenue]}</span>
                          <span>Beneficio: {FINANCIAL_DATA.profit[quarter.toLowerCase() as keyof typeof FINANCIAL_DATA.profit]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <BarChartHorizontal className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-sm font-medium">Margen Promedio Anual</span>
                    </div>
                    <span className="text-lg font-bold">{FINANCIAL_DATA.margin.average}</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={parseFloat(FINANCIAL_DATA.margin.average.replace('%', ''))} className="h-3" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t">
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                <span>Ver reporte detallado</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Estado de Resultados */}
        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Estado de Resultados</CardTitle>
                <CardDescription>
                  Período: Enero - Diciembre 2022
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="2022">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileDown className="mr-2 h-4 w-4" />
                      <span>Exportar</span>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <FileDown className="mr-2 h-4 w-4" />
                      <span>PDF</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileDown className="mr-2 h-4 w-4" />
                      <span>Excel</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Printer className="mr-2 h-4 w-4" />
                      <span>Imprimir</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      <span>Compartir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border px-6 py-4">
                <div className="py-4">
                  <h3 className="text-lg font-semibold mb-4">Ingresos</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 py-1">
                      <span className="text-sm">Ingresos por servicios</span>
                      <span className="text-sm text-right">$548,600.00</span>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <span className="text-sm">Ingresos por productos</span>
                      <span className="text-sm text-right">$49,300.00</span>
                    </div>
                    <div className="grid grid-cols-2 py-1 border-t border-dashed">
                      <span className="font-medium">Total ingresos</span>
                      <span className="font-medium text-right">{FINANCIAL_DATA.revenue.total}</span>
                    </div>
                  </div>
                </div>
                
                <div className="py-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">Costos y Gastos</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 py-1">
                      <span className="text-sm">Nómina y personal</span>
                      <span className="text-sm text-right">$256,400.00</span>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <span className="text-sm">Marketing y publicidad</span>
                      <span className="text-sm text-right">$48,200.00</span>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <span className="text-sm">Software y tecnología</span>
                      <span className="text-sm text-right">$36,700.00</span>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <span className="text-sm">Instalaciones</span>
                      <span className="text-sm text-right">$25,800.00</span>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <span className="text-sm">Servicios profesionales</span>
                      <span className="text-sm text-right">$18,100.00</span>
                    </div>
                    <div className="grid grid-cols-2 py-1 border-t border-dashed">
                      <span className="font-medium">Total gastos</span>
                      <span className="font-medium text-right">{FINANCIAL_DATA.expenses.total}</span>
                    </div>
                  </div>
                </div>
                
                <div className="py-4 border-t">
                  <div className="grid grid-cols-2 py-2">
                    <span className="font-semibold">Beneficio antes de impuestos</span>
                    <span className="font-semibold text-right">$212,700.00</span>
                  </div>
                  <div className="grid grid-cols-2 py-2">
                    <span className="text-sm">Impuestos (25%)</span>
                    <span className="text-sm text-right">$53,175.00</span>
                  </div>
                  <div className="grid grid-cols-2 py-2 border-t">
                    <span className="text-lg font-bold">Beneficio neto</span>
                    <span className="text-lg font-bold text-right">$159,525.00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Balance General */}
        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Balance General</CardTitle>
                <CardDescription>
                  Al 31 de diciembre de 2022
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  <span>Exportar</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold mb-4">Activos</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Activos Corrientes</h4>
                      <div className="space-y-1 pl-3">
                        <div className="grid grid-cols-2">
                          <span className="text-sm">Efectivo y equivalentes</span>
                          <span className="text-sm text-right">$142,500.00</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm">Cuentas por cobrar</span>
                          <span className="text-sm text-right">$75,200.00</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm">Inversiones a corto plazo</span>
                          <span className="text-sm text-right">$50,000.00</span>
                        </div>
                        <div className="grid grid-cols-2 border-t border-dashed mt-1 pt-1">
                          <span className="text-sm font-medium">Total activos corrientes</span>
                          <span className="text-sm font-medium text-right">$267,700.00</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Activos Fijos</h4>
                      <div className="space-y-1 pl-3">
                        <div className="grid grid-cols-2">
                          <span className="text-sm">Equipos y tecnología</span>
                          <span className="text-sm text-right">$48,300.00</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm">Mobiliario y accesorios</span>
                          <span className="text-sm text-right">$12,500.00</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm">Software y licencias</span>
                          <span className="text-sm text-right">$36,400.00</span>
                        </div>
                        <div className="grid grid-cols-2 border-t border-dashed mt-1 pt-1">
                          <span className="text-sm font-medium">Total activos fijos</span>
                          <span className="text-sm font-medium text-right">$97,200.00</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 pt-2 border-t">
                      <span className="text-base font-bold">TOTAL ACTIVOS</span>
                      <span className="text-base font-bold text-right">$364,900.00</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-semibold mb-4">Pasivos</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Pasivos Corrientes</h4>
                        <div className="space-y-1 pl-3">
                          <div className="grid grid-cols-2">
                            <span className="text-sm">Cuentas por pagar</span>
                            <span className="text-sm text-right">$28,400.00</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-sm">Impuestos por pagar</span>
                            <span className="text-sm text-right">$15,600.00</span>
                          </div>
                          <div className="grid grid-cols-2 border-t border-dashed mt-1 pt-1">
                            <span className="text-sm font-medium">Total pasivos corrientes</span>
                            <span className="text-sm font-medium text-right">$44,000.00</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Pasivos a Largo Plazo</h4>
                        <div className="space-y-1 pl-3">
                          <div className="grid grid-cols-2">
                            <span className="text-sm">Préstamos bancarios</span>
                            <span className="text-sm text-right">$35,000.00</span>
                          </div>
                          <div className="grid grid-cols-2 border-t border-dashed mt-1 pt-1">
                            <span className="text-sm font-medium">Total pasivos a largo plazo</span>
                            <span className="text-sm font-medium text-right">$35,000.00</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2">
                        <span className="font-bold">TOTAL PASIVOS</span>
                        <span className="font-bold text-right">$79,000.00</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-semibold mb-4">Patrimonio</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2">
                        <span className="text-sm">Capital social</span>
                        <span className="text-sm text-right">$120,000.00</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-sm">Utilidades retenidas</span>
                        <span className="text-sm text-right">$165,900.00</span>
                      </div>
                      <div className="grid grid-cols-2 border-t mt-2 pt-2">
                        <span className="font-bold">TOTAL PATRIMONIO</span>
                        <span className="font-bold text-right">$285,900.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t mt-8 pt-4">
                <div className="grid grid-cols-2">
                  <span className="text-lg font-bold">TOTAL PASIVOS Y PATRIMONIO</span>
                  <span className="text-lg font-bold text-right">$364,900.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Informes Guardados */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Input type="search" placeholder="Buscar informes..." className="w-full md:w-[300px]" />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo de informe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="quarterly">Trimestrales</SelectItem>
                  <SelectItem value="yearly">Anuales</SelectItem>
                  <SelectItem value="project">Proyectos</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="2023">
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="text-center">Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {REPORTS.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>{report.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={
                          report.type === "quarterly" ? "bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                          report.type === "yearly" ? "bg-purple-50 text-purple-800 dark:bg-purple-900 dark:text-purple-200" :
                          "bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                        }>
                          {report.type === "quarterly" ? "Trimestral" :
                          report.type === "yearly" ? "Anual" : "Proyecto"}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <Badge className={report.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"}>
                          {report.status === "completed" ? "Completado" : "Borrador"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando 5 de 28 informes
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm">
                  Siguiente
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 