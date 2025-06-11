import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { 
  FileText, 
  List, 
  UserCheck, 
  CheckCircle2, 
  Info, 
  Search,
  Activity,
  Download,
  RefreshCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import AuditLogList from "@/components/audit/AuditLogList"
import AuditStatistics from "@/components/audit/AuditStatistics"
import auditService, { AuditLog, AuditLogFilters } from "@/lib/services/auditService"
import { exportAuditLogsToCSV } from "@/lib/utils/exportUtils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { CustomPagination } from "@/components/ui/CustomPagination"

interface AuditTabProps {
  onRefresh?: () => void;
}

// Interfaz para el rango de fechas
interface DateRange {
  from?: Date;
  to?: Date;
}

const AuditTab: React.FC<AuditTabProps> = ({ onRefresh }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditLogsLoading, setAuditLogsLoading] = useState(false)
  const [totalLogs, setTotalLogs] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [statsLoading, setStatsLoading] = useState(false)
  const [recentStats, setRecentStats] = useState<any>({
    total: 0,
    activeUsers: 0,
    todayActivities: 0,
    criticalChanges: 0
  })
  const [auditFilters, setAuditFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 10,
    sortBy: '-timestamp'
  })
  const [dateRange, setDateRange] = useState<DateRange>({})

  // Carga los datos de auditoría
  useEffect(() => {
    fetchAuditLogs()
    fetchAuditStatistics()
  }, [auditFilters])

  // Actualiza los filtros de fecha cuando cambia el rango
  useEffect(() => {
    if (dateRange.from || dateRange.to) {
      const newFilters = { ...auditFilters }
      
      if (dateRange.from) {
        newFilters.startDate = format(dateRange.from, 'yyyy-MM-dd')
      } else {
        delete newFilters.startDate
      }
      
      if (dateRange.to) {
        newFilters.endDate = format(dateRange.to, 'yyyy-MM-dd')
      } else {
        delete newFilters.endDate
      }
      
      setAuditFilters(newFilters)
    }
  }, [dateRange])

  const fetchAuditLogs = async () => {
    try {
      setAuditLogsLoading(true)
      const response = await auditService.getLogs(auditFilters)
      setAuditLogs(response.data)
      setTotalLogs(response.pagination.total)
      setTotalPages(response.pagination.pages)
      setAuditLogsLoading(false)
    } catch (error) {
      console.error("Error al cargar logs de auditoría:", error)
      toast.error("Error al cargar los registros de auditoría")
      setAuditLogsLoading(false)
    }
  }

  const fetchAuditStatistics = async () => {
    try {
      setStatsLoading(true)
      
      // Crear filtros para las estadísticas
      const statsFilters: any = {}
      if (auditFilters.startDate) statsFilters.startDate = auditFilters.startDate
      if (auditFilters.endDate) statsFilters.endDate = auditFilters.endDate
      
      const stats = await auditService.getStatistics(
        statsFilters.startDate,
        statsFilters.endDate
      )
      
      // Calcular las estadísticas para los cards
      const totalActivities = stats.total || 0
      
      // Usuarios activos (usuarios únicos que han realizado acciones)
      const activeUsers = stats.userStats?.length || 0
      
      // Actividades de hoy
      const today = new Date().toISOString().split('T')[0]
      const todayActivities = stats.dailyStats?.find(d => d._id === today)?.count || 0
      
      // Cambios críticos (eliminaciones y cambios de estado)
      const criticalChanges = 
        (stats.actionStats?.find(a => a._id === 'eliminación')?.count || 0) +
        (stats.actionStats?.find(a => a._id === 'cambio_estado')?.count || 0)
      
      setRecentStats({
        total: totalActivities,
        activeUsers,
        todayActivities,
        criticalChanges
      })
      
      setStatsLoading(false)
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
      toast.error("Error al cargar las estadísticas")
      setStatsLoading(false)
    }
  }

  // Manejar el refresco de datos
  const handleLocalRefresh = () => {
    fetchAuditLogs()
    fetchAuditStatistics()
    if (onRefresh) onRefresh()
    toast.success("Datos actualizados correctamente")
  }

  // Manejar la paginación
  const handlePageChange = (page: number) => {
    setAuditFilters({
      ...auditFilters,
      page
    })
  }

  // Manejar la exportación a CSV
  const handleExportCSV = () => {
    try {
      // Si hay registros cargados, exportarlos directamente
      if (auditLogs.length > 0) {
        exportAuditLogsToCSV(
          auditLogs, 
          `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
        )
        toast.success("Registros exportados correctamente")
        return
      }
      
      // Si no hay registros cargados, mostrar error
      toast.error("No hay registros para exportar")
    } catch (error) {
      console.error("Error al exportar registros:", error)
      toast.error("Error al exportar los registros")
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Resumen y estadísticas */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Registro de Auditoría
              </CardTitle>
              <CardDescription>
                Monitorea todas las acciones realizadas en el sistema por los usuarios.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleLocalRefresh}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <List className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium leading-none text-muted-foreground">
                      Total Actividades
                    </p>
                    <p className="text-3xl font-bold">{statsLoading ? '...' : recentStats.total.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                  <div className="bg-blue-500/20 p-3 rounded-full">
                    <UserCheck className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium leading-none text-muted-foreground">
                      Usuarios Activos
                    </p>
                    <p className="text-3xl font-bold">{statsLoading ? '...' : recentStats.activeUsers}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                  <div className="bg-green-500/20 p-3 rounded-full">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium leading-none text-muted-foreground">
                      Hoy
                    </p>
                    <p className="text-3xl font-bold">{statsLoading ? '...' : recentStats.todayActivities}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                  <div className="bg-orange-500/20 p-3 rounded-full">
                    <Info className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium leading-none text-muted-foreground">
                      Cambios Críticos
                    </p>
                    <p className="text-3xl font-bold">{statsLoading ? '...' : recentStats.criticalChanges}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Filtros de Búsqueda */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-medium">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Usuario</label>
                <Select 
                  onValueChange={(value) => setAuditFilters({...auditFilters, userId: value === "all" ? undefined : value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los usuarios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Acción</label>
                <Select
                  onValueChange={(value) => setAuditFilters({...auditFilters, action: value === "all" ? undefined : value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las acciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las acciones</SelectItem>
                    <SelectItem value="creación">Creación</SelectItem>
                    <SelectItem value="actualización">Actualización</SelectItem>
                    <SelectItem value="eliminación">Eliminación</SelectItem>
                    <SelectItem value="login">Inicio de sesión</SelectItem>
                    <SelectItem value="logout">Cierre de sesión</SelectItem>
                    <SelectItem value="cambio_estado">Cambio de estado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Módulo</label>
                <Select
                  onValueChange={(value) => setAuditFilters({...auditFilters, module: value === "all" ? undefined : value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los módulos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los módulos</SelectItem>
                    <SelectItem value="leads">Leads</SelectItem>
                    <SelectItem value="clientes">Clientes</SelectItem>
                    <SelectItem value="proyectos">Proyectos</SelectItem>
                    <SelectItem value="empleados">Empleados</SelectItem>
                    <SelectItem value="finanzas">Finanzas</SelectItem>
                    <SelectItem value="configuracion">Configuración</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rango de fechas</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy", { locale: es })} -{" "}
                            {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy", { locale: es })
                        )
                      ) : (
                        "Seleccionar fechas"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange as any}
                      onSelect={setDateRange as any}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="flex">
                  <Input 
                    placeholder="Buscar en descripción..." 
                    className="flex-1"
                    value={auditFilters.searchText || ''}
                    onChange={(e) => setAuditFilters({
                      ...auditFilters, 
                      searchText: e.target.value || undefined
                    })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchAuditLogs();
                      }
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    className="ml-2"
                    onClick={fetchAuditLogs}
                  >
                    <Search size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de logs de auditoría */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Registros de Auditoría</CardTitle>
            <Select 
              defaultValue="-timestamp"
              value={auditFilters.sortBy}
              onValueChange={(value) => setAuditFilters({...auditFilters, sortBy: value})}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-timestamp">Más reciente primero</SelectItem>
                <SelectItem value="timestamp">Más antiguo primero</SelectItem>
                <SelectItem value="-userName">Usuario (Z-A)</SelectItem>
                <SelectItem value="userName">Usuario (A-Z)</SelectItem>
                <SelectItem value="-action">Acción (Z-A)</SelectItem>
                <SelectItem value="action">Acción (A-Z)</SelectItem>
                <SelectItem value="-module">Módulo (Z-A)</SelectItem>
                <SelectItem value="module">Módulo (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {auditLogsLoading ? (
              <div className="flex justify-center items-center p-8">
                <p className="text-muted-foreground">Cargando registros de auditoría...</p>
              </div>
            ) : (
              <AuditLogList logs={auditLogs} />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {totalLogs > 0 && (
                <>
                  Mostrando {auditLogs.length} de {totalLogs} registros
                </>
              )}
            </div>
            <CustomPagination 
              currentPage={auditFilters.page || 1}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </CardFooter>
        </Card>

        {/* Estadísticas de auditoría */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Estadísticas de Auditoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AuditStatistics />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AuditTab; 