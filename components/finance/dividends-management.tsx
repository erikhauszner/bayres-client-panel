"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  BadgeDollarSign, 
  Download, 
  Plus, 
  RefreshCw, 
  Search, 
  Filter, 
  Users,
  CalendarClock,
  BriefcaseBusiness,
  CheckCircle,
  Clock,
  MoreHorizontal,
  FileText,
  PieChart,
  DollarSign,
  PiggyBank,
  Loader
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { financeService } from "@/lib/services/financeService"
import { Partner, Distribution, PartnerDistribution } from "@/lib/types/finance"
import { toast } from "sonner"

export default function DividendsManagement() {
  const [activeTab, setActiveTab] = useState("partners")
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false)
  const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null)
  const [distributionDialogOpen, setDistributionDialogOpen] = useState(false)
  
  // Estados para datos
  const [partners, setPartners] = useState<Partner[]>([])
  const [distributions, setDistributions] = useState<Distribution[]>([])
  const [partnerDistributions, setPartnerDistributions] = useState<PartnerDistribution[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [summaryData, setSummaryData] = useState<any>({
    activePartners: 0,
    totalCapital: 0,
    totalDistributionsYTD: 0,
    distributionsCount: 0,
    nextDistribution: null,
    totalReinvestmentYTD: 0
  })
  
  // Cargar datos cuando el componente se monta
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    setIsLoading(true)
    try {
      // Cargar datos en paralelo
      const [partnersData, distributionsData, summaryData] = await Promise.all([
        financeService.getPartners(),
        financeService.getDistributions(),
        financeService.getDividendsSummary()
      ])
      
      setPartners(partnersData)
      setDistributions(distributionsData)
      setSummaryData(summaryData)
      
      // Cargar todas las distribuciones por socio
      const partnerDistributionsData = await financeService.getPartnerDistributions()
      setPartnerDistributions(partnerDistributionsData)
      
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("Error al cargar los datos. Intente nuevamente más tarde.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const viewPartnerDetails = async (partner: Partner) => {
    setSelectedPartner(partner)
    setPartnerDialogOpen(true)
  }
  
  const viewDistributionDetails = async (distribution: Distribution) => {
    setSelectedDistribution(distribution)
    setDistributionDialogOpen(true)
  }
  
  const formatCurrency = (value: string) => {
    // Si el valor ya tiene formato de moneda, devolverlo como está
    if (value.startsWith('$')) return value
    
    // Si no, formatearlo
    return `$${parseFloat(value).toFixed(2)}`
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dividendos y Participaciones</h2>
          <p className="text-muted-foreground">
            Administra socios, distribución de utilidades y reinversiones
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar</span>
          </Button>
          <Button size="sm" className="h-9" asChild>
            <Link href="/finanzas/nueva-distribucion">
              <Plus className="mr-2 h-4 w-4" />
              <span>Nueva Distribución</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Mostrar loader mientras se cargan los datos */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Cargando datos...</span>
        </div>
      ) : (
        <>
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Socios Activos</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.activePartners}</div>
                <p className="text-xs text-muted-foreground pt-1">
                  Capital total: ${summaryData.totalCapital?.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Distribuciones YTD</CardTitle>
                <BadgeDollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summaryData.totalDistributionsYTD?.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground pt-1">
                  {summaryData.distributionsCount} distribuciones en 2023
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Próxima Distribución</CardTitle>
                <CalendarClock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summaryData.nextDistribution ? summaryData.nextDistribution.totalAmount : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  {summaryData.nextDistribution ? `Planificada: ${summaryData.nextDistribution.date}` : "Sin distribuciones planificadas"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Reinversión</CardTitle>
                <PiggyBank className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summaryData.totalReinvestmentYTD?.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground pt-1">
                  Total reinvertido YTD
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="partners">Socios</TabsTrigger>
              <TabsTrigger value="distributions">Distribuciones</TabsTrigger>
              <TabsTrigger value="analytics">Análisis</TabsTrigger>
            </TabsList>
            
            {/* Pestaña de Socios */}
            <TabsContent value="partners" className="space-y-4">
              {/* Tabla de socios */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Socio</TableHead>
                        <TableHead className="text-center">Cargo</TableHead>
                        <TableHead className="text-center">Participación</TableHead>
                        <TableHead className="text-right">Capital Invertido</TableHead>
                        <TableHead className="text-right">Dividendos YTD</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.length > 0 ? (
                        partners.map(partner => (
                          <TableRow key={partner._id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{partner.name}</div>
                                  <div className="text-xs text-muted-foreground">{partner.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{partner.position}</TableCell>
                            <TableCell className="text-center font-medium">{partner.participation}</TableCell>
                            <TableCell className="text-right font-medium">{partner.totalInvested}</TableCell>
                            <TableCell className="text-right font-medium">{partner.dividendsYTD}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => viewPartnerDetails(partner)}>
                                    <BriefcaseBusiness className="mr-2 h-4 w-4" />
                                    <span>Ver detalles</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Historial de pagos</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <PieChart className="mr-2 h-4 w-4" />
                                    <span>Análisis de retorno</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No hay socios disponibles
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Pestaña de Distribuciones */}
            <TabsContent value="distributions" className="space-y-4">
              {/* Filtros */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar distribución..."
                        className="pl-9"
                      />
                    </div>
                    
                    <div>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los años</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="completed">Completados</SelectItem>
                          <SelectItem value="pending">Pendientes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={loadData}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span>Actualizar</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Tabla de distribuciones */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Utilidad</TableHead>
                        <TableHead className="text-right">Distribución</TableHead>
                        <TableHead className="text-right">Reinversión</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributions.length > 0 ? (
                        distributions.map(distribution => (
                          <TableRow key={distribution._id}>
                            <TableCell className="font-medium">{distribution._id}</TableCell>
                            <TableCell>{distribution.period}</TableCell>
                            <TableCell className="text-right">{distribution.profit}</TableCell>
                            <TableCell className="text-right font-medium">{distribution.totalAmount}</TableCell>
                            <TableCell className="text-right">{distribution.reinvestment}</TableCell>
                            <TableCell>{distribution.date}</TableCell>
                            <TableCell>
                              <Badge className={
                                distribution.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : 
                                "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                              }>
                                {distribution.status === "completed" ? (
                                  <CheckCircle className="mr-1 h-3 w-3 inline" />
                                ) : (
                                  <Clock className="mr-1 h-3 w-3 inline" />
                                )}
                                {distribution.status === "completed" ? "Completada" : "Pendiente"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => viewDistributionDetails(distribution)}>
                                Ver detalles
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                            No hay distribuciones disponibles
                          </TableCell>
                        </TableRow>
                      )}
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
                    <CardTitle>Distribuciones Históricas</CardTitle>
                    <CardDescription>
                      Total por trimestre
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] border rounded-lg p-4 flex items-center justify-center">
                      <div className="space-y-8 w-full">
                        <p className="text-sm text-center text-muted-foreground">
                          Aquí se mostraría un gráfico de barras con las distribuciones históricas por trimestre
                        </p>
                        <div className="space-y-4">
                          {distributions
                            .filter(d => d.period.includes('2023'))
                            .slice(0, 3)
                            .map((dist, idx) => {
                              const value = parseFloat(dist.totalAmount.replace('$', '').replace(',', ''))
                              const maxValue = 150000 // Valor máximo para calcular porcentaje de la barra
                              const percentage = (value / maxValue) * 100
                              
                              return (
                                <div key={idx} className="space-y-2">
                                  <div className="text-sm">{dist.period}</div>
                                  <Progress value={percentage} className="h-2" />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{dist.totalAmount}</span>
                                    <span>+{Math.floor(Math.random() * 30)}% vs {dist.period.replace('2023', '2022')}</span>
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución por Socio</CardTitle>
                    <CardDescription>
                      Acumulado año actual
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] border rounded-lg p-4 flex flex-col justify-between">
                      <div className="text-center text-sm text-muted-foreground mb-4">
                        Aquí se mostraría un gráfico de torta con la distribución por socio
                      </div>
                      <div className="space-y-4">
                        {partners.map((partner, idx) => (
                          <div key={partner._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full ${
                                idx === 0 ? "bg-blue-500" : 
                                idx === 1 ? "bg-green-500" :
                                idx === 2 ? "bg-amber-500" :
                                "bg-purple-500"
                              }`}></div>
                              <span className="text-sm">{partner.name}</span>
                            </div>
                            <div className="space-x-2">
                              <span className="text-sm font-medium">{partner.dividendsYTD}</span>
                              <span className="text-xs text-muted-foreground">({partner.participation})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
      
      {/* Dialog de detalle de socio */}
      <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Perfil de Socio</DialogTitle>
            <DialogDescription>
              Información detallada del socio
            </DialogDescription>
          </DialogHeader>
          
          {selectedPartner && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{selectedPartner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedPartner.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPartner.position}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">ID Socio</h4>
                  <p className="text-sm">{selectedPartner._id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Email</h4>
                  <p className="text-sm">{selectedPartner.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Fecha de inicio</h4>
                  <p className="text-sm">{selectedPartner.startDate}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Participación</h4>
                  <p className="text-sm font-bold">{selectedPartner.participation}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Capital invertido</h4>
                  <p className="text-sm">{selectedPartner.totalInvested}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Cuenta bancaria</h4>
                  <p className="text-sm">{selectedPartner.account}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Dividendos YTD</h4>
                  <p className="text-sm">{selectedPartner.dividendsYTD}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Estado</h4>
                  <Badge className="bg-green-100 text-green-800">
                    {selectedPartner.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-2">Historial de Pagos Recientes</h4>
                <div className="space-y-3">
                  {partnerDistributions
                    .filter(pd => pd.partnerId === selectedPartner._id)
                    .map((pd, idx) => {
                      const distribution = distributions.find(d => d._id === pd.distributionId);
                      return (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium">
                              {distribution ? distribution.period : 'Distribución desconocida'}
                            </span>
                            <span className="text-muted-foreground ml-2">({pd.date})</span>
                          </div>
                          <div className="font-medium">{pd.amount}</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPartnerDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de detalle de distribución */}
      <Dialog open={distributionDialogOpen} onOpenChange={setDistributionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de Distribución</DialogTitle>
            <DialogDescription>
              {selectedDistribution?._id} - {selectedDistribution?.period}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDistribution && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">ID Distribución</h4>
                  <p className="text-sm">{selectedDistribution._id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Período</h4>
                  <p className="text-sm">{selectedDistribution.period}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Fecha</h4>
                  <p className="text-sm">{selectedDistribution.date}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Estado</h4>
                  <Badge className={
                    selectedDistribution.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : 
                    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                  }>
                    {selectedDistribution.status === "completed" ? "Completada" : "Pendiente"}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Resumen Financiero</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <h5 className="text-xs text-muted-foreground mb-1">Utilidad total</h5>
                    <p className="text-base font-medium">{selectedDistribution.profit}</p>
                  </div>
                  <div>
                    <h5 className="text-xs text-muted-foreground mb-1">Retención</h5>
                    <p className="text-base font-medium">{selectedDistribution.retention}</p>
                  </div>
                  <div>
                    <h5 className="text-xs text-muted-foreground mb-1">Monto distribuido</h5>
                    <p className="text-base font-medium">{selectedDistribution.totalAmount}</p>
                  </div>
                  <div>
                    <h5 className="text-xs text-muted-foreground mb-1">Reinversión</h5>
                    <p className="text-base font-medium">{selectedDistribution.reinvestment}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Distribución por Socio</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Socio</TableHead>
                      <TableHead className="text-center">Participación</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partnerDistributions
                      .filter(pd => pd.distributionId === selectedDistribution._id)
                      .map((pd, idx) => {
                        const partner = partners.find(p => p._id === pd.partnerId);
                        return (
                          <TableRow key={idx}>
                            <TableCell className="py-2">{partner?.name}</TableCell>
                            <TableCell className="text-center py-2">{pd.participation}</TableCell>
                            <TableCell className="text-right font-medium py-2">{pd.amount}</TableCell>
                            <TableCell className="py-2">
                              <Badge className={
                                pd.status === "paid" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : 
                                "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                              }>
                                {pd.status === "paid" ? (
                                  <CheckCircle className="mr-1 h-3 w-3 inline" />
                                ) : (
                                  <Clock className="mr-1 h-3 w-3 inline" />
                                )}
                                {pd.status === "paid" ? "Pagado" : "Pendiente"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setDistributionDialogOpen(false)}>
              Cerrar
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              <span>Exportar Informe</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 