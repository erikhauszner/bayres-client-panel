import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  UserCircle, 
  Activity, 
  FileText, 
  BarChart3, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, addWeeks, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { EmployeeService } from "@/lib/services/employeeService";
import { EmployeeStatusService, DailyStats } from "@/lib/services/employeeStatusService";
import auditService from "@/lib/services/auditService";
import { Employee } from "@/lib/types/employee";
import { EmployeeStatus } from "@/lib/types/employeeStatus";
import { AuditLog } from "@/lib/services/auditService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DailyActivity {
  date: Date;
  onlineTime: number;
  breakTime: number;
  offlineTime: number;
  totalTime: number;
  onlineTimeFormatted: string;
  breakTimeFormatted: string;
  offlineTimeFormatted: string;
  totalTimeFormatted: string;
  actionsCount: number;
}

interface EmployeeStatsProps {
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
  isFullPage?: boolean;
}

const EmployeeStats: React.FC<EmployeeStatsProps> = ({ 
  employeeId, 
  isOpen, 
  onClose,
  isFullPage = false
}) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employeeStatus, setEmployeeStatus] = useState<EmployeeStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resumen");
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activityPeriod, setActivityPeriod] = useState<"week" | "month">("week");

  // Cargar datos del empleado
  useEffect(() => {
    if (employeeId && isOpen) {
      loadEmployeeData();
    }
  }, [employeeId, isOpen]);

  // Cargar datos del empleado cuando cambia la semana
  useEffect(() => {
    if (employeeId && isOpen) {
      loadEmployeeActivity();
    }
  }, [employeeId, isOpen, currentWeekStart, activityPeriod]);

  const loadEmployeeData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar datos básicos del empleado
      const employeeData = await EmployeeService.getEmployee(employeeId);
      setEmployee(employeeData);
      
      // Cargar estado del empleado
      const statusData = await EmployeeStatusService.getEmployeeStatus(employeeId);
      setEmployeeStatus(statusData);
      
      // Cargar logs de auditoría
      const auditResponse = await auditService.getUserActivityHistory(employeeId);
      setAuditLogs(auditResponse.data);
      
      // Cargar actividad diaria
      await loadEmployeeActivity();
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar datos del empleado:", error);
      setIsLoading(false);
    }
  };

  const loadEmployeeActivity = async () => {
    try {
      let periodStart = currentWeekStart;
      let periodEnd;
      
      if (activityPeriod === "week") {
        periodEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      } else {
        // Periodo de un mes (aproximado como 4 semanas)
        periodEnd = addDays(currentWeekStart, 27);
      }
      
      // Formatear fechas para la API (YYYY-MM-DD)
      const startDateStr = format(periodStart, 'yyyy-MM-dd');
      const endDateStr = format(periodEnd, 'yyyy-MM-dd');
      
      try {
        // Obtener datos reales de la API
        console.log(`Solicitando estadísticas diarias para empleado ${employeeId} desde ${startDateStr} hasta ${endDateStr}`);
        const dailyStats = await EmployeeStatusService.getEmployeeDailyStats(
          employeeId,
          startDateStr,
          endDateStr
        );
        
        console.log("Datos recibidos de la API:", dailyStats);
        
        // Convertir los datos de la API al formato esperado por el componente
        const dailyData: DailyActivity[] = dailyStats.map(stat => {
          console.log(`Procesando día ${stat.date}: Online=${stat.onlineTime}s (${stat.onlineTimeFormatted}), Break=${stat.breakTime}s (${stat.breakTimeFormatted}), Total=${stat.totalTime}s (${stat.totalTimeFormatted}), Acciones=${stat.actionsCount}`);
          
          // Crear la fecha evitando problemas de zona horaria
          // Al agregar T12:00:00 forzamos que sea interpretada como mediodía y evitamos el cambio de día
          const dateParts = stat.date.split('-');
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // Mes es 0-indexed en Date
          const day = parseInt(dateParts[2]);
          const correctDate = new Date(year, month, day);
          
          console.log(`Fecha original: ${stat.date} -> Fecha corregida: ${correctDate.toDateString()}`);
          
          return {
            date: correctDate,
            onlineTime: stat.onlineTime,
            breakTime: stat.breakTime,
            offlineTime: stat.offlineTime,
            totalTime: stat.totalTime,
            onlineTimeFormatted: stat.onlineTimeFormatted,
            breakTimeFormatted: stat.breakTimeFormatted,
            offlineTimeFormatted: stat.offlineTimeFormatted,
            totalTimeFormatted: stat.totalTimeFormatted,
            actionsCount: stat.actionsCount
          };
        });
        
        console.log("Datos procesados para el componente:", dailyData);
        setDailyActivities(dailyData);
      } catch (apiError) {
        console.warn("Error al obtener datos reales, usando datos fallback:", apiError);
        
        // Fallback con datos básicos si la API falla
        const dateRange = eachDayOfInterval({ start: periodStart, end: periodEnd });
        const fallbackData: DailyActivity[] = dateRange.map(date => ({
          date,
          onlineTime: 0,
          breakTime: 0,
          offlineTime: 0,
          totalTime: 0,
          onlineTimeFormatted: "0h 0m",
          breakTimeFormatted: "0h 0m",
          offlineTimeFormatted: "0h 0m",
          totalTimeFormatted: "0h 0m",
          actionsCount: 0
        }));
        
        setDailyActivities(fallbackData);
      }
    } catch (error) {
      console.error("Error al cargar actividad del empleado:", error);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handlePreviousPeriod = () => {
    if (activityPeriod === "week") {
      setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    } else {
      setCurrentWeekStart(subWeeks(currentWeekStart, 4));
    }
  };

  const handleNextPeriod = () => {
    if (activityPeriod === "week") {
      setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    } else {
      setCurrentWeekStart(addWeeks(currentWeekStart, 4));
    }
  };

  const renderEmployeeStatus = (status?: string) => {
    switch (status) {
      case 'online':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <span className="inline-block w-2 h-2 rounded-full bg-white mr-1"></span>
            En línea
          </Badge>
        );
      case 'break':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            <span className="inline-block w-2 h-2 rounded-full bg-white mr-1"></span>
            Descanso
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
            Desconectado
          </Badge>
        );
    }
  };

  const getProductivityClass = (value?: number) => {
    if (!value) return "bg-gray-300";
    if (value >= 75) return "bg-green-500";
    if (value >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const StatsContent = () => (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mb-4"></div>
          <p className="text-muted-foreground ml-4">Cargando datos del empleado...</p>
        </div>
      ) : (
        <div className="space-y-6">
            {/* Información básica del empleado */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {employee?.firstName?.[0]}{employee?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{employee?.firstName} {employee?.lastName}</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-muted-foreground">{employee?.position || "Sin cargo"}</span>
                  <span>•</span>
                  <span className="text-muted-foreground">{employee?.department || "Sin departamento"}</span>
                  <span>•</span>
                  {renderEmployeeStatus(employeeStatus?.status)}
                </div>
              </div>
            </div>

            {/* Pestañas */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="resumen">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger value="actividad">
                  <Calendar className="h-4 w-4 mr-2" />
                  Actividad Diaria
                </TabsTrigger>
                <TabsTrigger value="auditoria">
                  <FileText className="h-4 w-4 mr-2" />
                  Registros de Auditoría
                </TabsTrigger>
              </TabsList>

              {/* Pestaña de Resumen */}
              <TabsContent value="resumen" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        Tiempo Activo
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-1 cursor-help">
                                <span className="inline-block w-4 h-4 rounded-full text-xs flex items-center justify-center bg-muted text-muted-foreground">?</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Solo incluye tiempo en línea</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {employeeStatus?.statistics ? 
                          formatTime(employeeStatus.statistics.onlineTime || 0) : 
                          "0h 0m"}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Acumulado hoy
                      </p>
                                              <Progress 
                          className="mt-2" 
                          value={employeeStatus?.statistics ? 
                            (employeeStatus.statistics.onlineTime || 0) / 28800 * 100 : 
                            0} 
                        />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Acciones Realizadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {auditLogs.length}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total de acciones registradas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Productividad</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        // Calcular productividad basada en tiempo online vs tiempo esperado (8 horas = 28800 segundos)
                        const expectedWorkTime = 28800; // 8 horas en segundos
                        const actualOnlineTime = employeeStatus?.statistics?.onlineTime || 0;
                        const productivity = Math.min(Math.round((actualOnlineTime / expectedWorkTime) * 100), 100);
                        
                        return (
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${getProductivityClass(productivity)}`}></div>
                            <div className="text-2xl font-bold">{productivity}%</div>
                          </div>
                        );
                      })()}
                      <p className="text-xs text-muted-foreground mt-1">
                        Basado en tiempo online vs tiempo esperado
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Detalles de Sesión</CardTitle>
                    <CardDescription>
                      Información sobre tiempos de sesión actual y acumulados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Sesión Actual:</span>
                          <span>{employeeStatus?.statistics?.currentSessionTimeFormatted || "No en sesión"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Último Acceso:</span>
                          <span>
                            {employeeStatus?.lastLogin 
                              ? format(new Date(employeeStatus.lastLogin), 'dd/MM/yyyy HH:mm') 
                              : "No registrado"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Última Salida:</span>
                          <span>
                            {employeeStatus?.lastLogout 
                              ? format(new Date(employeeStatus.lastLogout), 'dd/MM/yyyy HH:mm') 
                              : "No registrado"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Tiempo En Línea:</span>
                          <span>{employeeStatus?.statistics?.onlineTimeFormatted || "0h 0m"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Tiempo En Descanso:</span>
                          <span>{employeeStatus?.statistics?.breakTimeFormatted || "0h 0m"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Tiempo Desconectado:</span>
                          <span>{employeeStatus?.statistics?.offlineTimeFormatted || "0h 0m"}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Tiempo Total:</span>
                          <span>{employeeStatus?.statistics?.totalTimeFormatted || "0h 0m"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Email:</span>
                          <span className="text-sm">{employee?.email || "No disponible"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Estado:</span>
                          <span>{renderEmployeeStatus(employeeStatus?.status)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de Actividad Diaria */}
              <TabsContent value="actividad" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Actividad Diaria</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={activityPeriod === "week" ? "bg-primary text-primary-foreground" : ""}
                          onClick={() => setActivityPeriod("week")}
                        >
                          Semana
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={activityPeriod === "month" ? "bg-primary text-primary-foreground" : ""}
                          onClick={() => setActivityPeriod("month")}
                        >
                          Mes
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="flex justify-between items-center">
                      <span>
                        {activityPeriod === "week" 
                          ? `Semana del ${format(currentWeekStart, 'dd/MM/yyyy', { locale: es })}`
                          : `Mes desde ${format(currentWeekStart, 'dd/MM/yyyy', { locale: es })}`
                        }
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={handlePreviousPeriod}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={handleNextPeriod}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Día</TableHead>
                            <TableHead>
                              <div className="flex items-center">
                                Tiempos de Actividad
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="ml-1 cursor-help">
                                        <span className="inline-block w-4 h-4 rounded-full text-xs flex items-center justify-center bg-muted text-muted-foreground">?</span>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="space-y-1">
                                        <p><span className="text-green-600">Online:</span> Tiempo trabajando activamente</p>
                                        <p><span className="text-amber-600">Descanso:</span> Tiempo en pausa</p>
                                        <p><span className="text-gray-600">Total:</span> Tiempo total registrado</p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableHead>
                            <TableHead>Acciones</TableHead>
                            <TableHead>Porcentaje</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dailyActivities.map((day) => (
                            <TableRow key={day.date.toISOString()}>
                              <TableCell>{format(day.date, 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{format(day.date, 'EEEE', { locale: es })}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm">
                                    <span className="text-green-600">Online: </span>
                                    {day.onlineTimeFormatted}
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-amber-600">Descanso: </span>
                                    {day.breakTimeFormatted}
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-gray-600">Total: </span>
                                    {day.totalTimeFormatted}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{day.actionsCount}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Progress value={(day.onlineTime / 28800) * 100} className="w-24" />
                                  <span>{Math.round((day.onlineTime / 28800) * 100)}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de Auditoría */}
              <TabsContent value="auditoria" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Registros de Auditoría</CardTitle>
                    <CardDescription>
                      Últimas {auditLogs.length} acciones realizadas por el empleado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha y Hora</TableHead>
                            <TableHead>Módulo</TableHead>
                            <TableHead>Acción</TableHead>
                            <TableHead>Descripción</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditLogs.length > 0 ? (
                            auditLogs.map((log) => (
                              <TableRow key={log._id}>
                                <TableCell>
                                  {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm')}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{log.module}</Badge>
                                </TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell>{log.description}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-6">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                <p>No hay registros de auditoría disponibles.</p>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      Ver Todos
                    </Button>
                    <Button variant="outline" size="sm">
                      Exportar
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </>
    );

  if (isFullPage) {
    return <div className="w-full">{StatsContent()}</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Estadísticas de Empleado</DialogTitle>
          <DialogDescription>
            Información detallada sobre actividad y rendimiento
          </DialogDescription>
        </DialogHeader>
        
        {StatsContent()}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeStats; 