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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { 
  Users, 
  Filter, 
  Search, 
  Clock, 
  MoreHorizontal, 
  CheckCircle2,
  Timer,
  Zap,
  UserCog,
  UserCheck,
  PieChart
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { EmployeeService } from "@/lib/services/employeeService";
import { EmployeeStatusService } from "@/lib/services/employeeStatusService";
import { Employee, EmployeeFilters } from "@/lib/types/employee";
import { EmployeeStatus } from "@/lib/types/employeeStatus";


interface MonitoredEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  department?: string;
  avatar: string;
  status: 'online' | 'offline' | 'break';
  isOnline: boolean;
  lastLogin?: Date;
  lastLogout?: Date;
  activeTime: number;
  activeTimeFormatted: string;
  statistics?: {
    onlineTime?: number;
    breakTime?: number;
    offlineTime?: number;
    onlineTimeFormatted: string;
    breakTimeFormatted: string;
    offlineTimeFormatted: string;
    totalTimeFormatted: string;
    currentSessionTime?: number;
    currentSessionTimeFormatted?: string;
  };
}

interface EmployeeActivityTabProps {
  onRefresh?: () => void;
}

const EmployeeActivityTab: React.FC<EmployeeActivityTabProps> = ({ onRefresh }) => {
  const [monitoredEmployees, setMonitoredEmployees] = useState<MonitoredEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");


  // Carga los datos de monitoreo de empleados
  useEffect(() => {
    fetchEmployeeStatus();
  }, []);

  const fetchEmployeeStatus = async () => {
    try {
      setIsLoading(true);
      // Obtener empleados de la API
      const employeesResponse = await EmployeeService.getEmployees({} as EmployeeFilters);
      const employees = employeesResponse.data || [];
      // Obtener estados de los empleados
      const statusesResponse = await EmployeeStatusService.getAllEmployeesStatus();
      const statuses = statusesResponse || [];

      // Combinar los datos de empleados con su estado
      const monitored = employees.map(employee => {
        const status = statuses.find(s => s._id === employee._id) || 
          { 
            status: 'offline', 
            lastLogin: null, 
            lastLogout: null, 
            isOnline: false, 
            activeTime: 0, 
            activeTimeFormatted: '0h 0m',
            statistics: undefined
          };
        
        return {
          _id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          position: employee.position,
          department: employee.department as string,
          avatar: '',
          status: status.status as 'online' | 'offline' | 'break',
          isOnline: status.isOnline,
          lastLogin: status.lastLogin ? new Date(status.lastLogin) : undefined,
          lastLogout: status.lastLogout ? new Date(status.lastLogout) : undefined,
          activeTime: status.statistics?.onlineTime || 0, // Solo tiempo online
          activeTimeFormatted: status.statistics ? formatTime(status.statistics.onlineTime || 0) : '0h 0m', // Formatear solo tiempo online
          // Estadísticas de tiempo usando datos reales
          statistics: status.statistics ? {
            onlineTime: status.statistics.onlineTime,
            breakTime: status.statistics.breakTime,
            offlineTime: status.statistics.offlineTime,
            onlineTimeFormatted: status.statistics.onlineTimeFormatted,
            breakTimeFormatted: status.statistics.breakTimeFormatted,
            offlineTimeFormatted: status.statistics.offlineTimeFormatted,
            totalTimeFormatted: status.statistics.totalTimeFormatted,
            currentSessionTime: status.statistics.currentSessionTime,
            currentSessionTimeFormatted: status.statistics.currentSessionTimeFormatted
          } : {
            onlineTime: 0,
            breakTime: 0,
            offlineTime: 0,
            onlineTimeFormatted: '0h 0m',
            breakTimeFormatted: '0h 0m',
            offlineTimeFormatted: '0h 0m',
            totalTimeFormatted: '0h 0m',
            currentSessionTime: 0,
            currentSessionTimeFormatted: '0h 0m'
          }
        };
      });

      setMonitoredEmployees(monitored);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar los datos de monitoreo:", error);
      toast.error("Error al cargar los datos de monitoreo");
      setIsLoading(false);
    }
  };

  // Función para manejar el refresco de datos
  const handleLocalRefresh = () => {
    fetchEmployeeStatus();
    if (onRefresh) onRefresh();
  };

  // Formato de fecha/hora para lastLogin
  const formatLastLogin = (lastLogin?: Date): string => {
    if (!lastLogin) return "No registrado";
    
    const now = new Date();
    const diff = now.getTime() - lastLogin.getTime();
    
    // Si fue hoy
    if (lastLogin.toDateString() === now.toDateString()) {
      const hours = lastLogin.getHours().toString().padStart(2, '0');
      const minutes = lastLogin.getMinutes().toString().padStart(2, '0');
      return `Hoy, ${hours}:${minutes}`;
    }
    
    // Si fue ayer
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (lastLogin.toDateString() === yesterday.toDateString()) {
      const hours = lastLogin.getHours().toString().padStart(2, '0');
      const minutes = lastLogin.getMinutes().toString().padStart(2, '0');
      return `Ayer, ${hours}:${minutes}`;
    }
    
    // Si fue hace menos de 7 días
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const dayName = days[lastLogin.getDay()];
      const hours = lastLogin.getHours().toString().padStart(2, '0');
      const minutes = lastLogin.getMinutes().toString().padStart(2, '0');
      return `${dayName}, ${hours}:${minutes}`;
    }
    
    // Si fue hace más tiempo
    const day = lastLogin.getDate().toString().padStart(2, '0');
    const month = (lastLogin.getMonth() + 1).toString().padStart(2, '0');
    const hours = lastLogin.getHours().toString().padStart(2, '0');
    const minutes = lastLogin.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}, ${hours}:${minutes}`;
  };

  // Función auxiliar para formatear el tiempo
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  
  // Renderizar indicador de estado
  const renderEmployeeStatus = (status: string) => {
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

  // Calcular tiempo promedio activo
  const calculateAverageActiveTime = (): string => {
    if (monitoredEmployees.length === 0) return "0h 0m";
    
    // Calcular para todos los empleados que tienen tiempo online
    const employeesWithStats = monitoredEmployees.filter(emp => emp.statistics && (emp.statistics.onlineTime || 0) > 0);
    if (employeesWithStats.length === 0) return "0h 0m";
    
    const totalActiveTime = employeesWithStats.reduce((sum, emp) => sum + (emp.statistics?.onlineTime || 0), 0);
    const averageActiveTime = Math.floor(totalActiveTime / employeesWithStats.length);
    
    return formatTime(averageActiveTime);
  };

  // Manejar cambio de estado del empleado
  const handleStatusChange = async (employeeId: string, newStatus: 'online' | 'offline' | 'break') => {
    try {
      // Llamar al servicio para cambiar el estado
      await EmployeeStatusService.updateEmployeeStatus(employeeId, newStatus);
      
      // Actualizar la UI
      setMonitoredEmployees(employees => 
        employees.map(emp => 
          emp._id === employeeId 
            ? { 
                ...emp, 
                status: newStatus,
                isOnline: newStatus === 'online'
              } 
            : emp
        )
      );
      
      toast.success(`Estado cambiado a: ${newStatus}`);
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      toast.error("Error al cambiar el estado del empleado");
    }
  };

  // Filtrar empleados
  const filteredEmployees = monitoredEmployees.filter(employee => {
    const nameMatches = `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const departmentMatches = departmentFilter === "all" || employee.department === departmentFilter;
    const statusMatches = statusFilter === "all" || employee.status === statusFilter;
    
    return nameMatches && departmentMatches && statusMatches;
  });

  // Obtener departamentos únicos para el filtro
  const departments = Array.from(new Set(monitoredEmployees.map(emp => emp.department))).filter(Boolean);

  // Manejador para abrir modal de estadísticas
  const handleViewStats = (employeeId: string) => {
    window.location.href = `/monitoreo/empleados/${employeeId}`;
  };

  // Manejador para cerrar modal de estadísticas


  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resumen de actividad */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
            <div className="bg-green-500/20 p-3 rounded-full">
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none text-muted-foreground">
                Empleados En Línea
              </p>
              <p className="text-3xl font-bold">
                {monitoredEmployees.filter(emp => emp.isOnline).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
            <div className="bg-amber-500/20 p-3 rounded-full">
              <Timer className="h-8 w-8 text-amber-500" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none text-muted-foreground">
                Tiempo Activo Promedio
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-3xl font-bold cursor-help">
                      {calculateAverageActiveTime()}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Solo tiempo en línea</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none text-muted-foreground">
                Productividad Promedio
              </p>
              <p className="text-3xl font-bold">
                {monitoredEmployees.length > 0 
                  ? "0%"
                  : "0%"
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
            <div className="bg-purple-500/20 p-3 rounded-full">
              <CheckCircle2 className="h-8 w-8 text-purple-500" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none text-muted-foreground">
                Tareas Completadas Hoy
              </p>
              <p className="text-3xl font-bold">
                0
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtra la lista de empleados por nombre, departamento o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar por nombre</label>
              <div className="flex">
                <Input 
                  placeholder="Buscar..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="ghost" className="ml-2">
                  <Search size={18} />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Departamento</label>
              <Select 
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los departamentos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept || ""}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select 
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="online">En línea</SelectItem>
                  <SelectItem value="break">Descanso</SelectItem>
                  <SelectItem value="offline">Desconectado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de empleados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Empleados Monitoreados
          </CardTitle>
          <CardDescription>
            {filteredEmployees.length} empleados encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mb-4"></div>
              <p className="text-muted-foreground ml-4">Cargando datos de empleados...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No hay empleados para mostrar</h3>
              <p className="text-muted-foreground mt-2">
                No se encontraron empleados con los filtros actuales.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        Tiempo activo
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
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {employee.firstName[0]}{employee.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                            <div className="text-xs text-muted-foreground">{employee.position || "No especificado"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{renderEmployeeStatus(employee.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{formatLastLogin(employee.lastLogin)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{employee.statistics?.onlineTimeFormatted || '0h 0m'}</span>
                            <span className="text-muted-foreground">8h</span>
                          </div>
                          <Progress value={(employee.statistics?.onlineTime || 0) / 28800 * 100} />
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(employee._id, "online")}>
                              <UserCheck className="mr-2 h-4 w-4" />
                              <span>Marcar en línea</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(employee._id, "break")}>
                              <Timer className="mr-2 h-4 w-4" />
                              <span>Marcar en descanso</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(employee._id, "offline")}>
                              <UserCog className="mr-2 h-4 w-4" />
                              <span>Marcar desconectado</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewStats(employee._id)}>
                              <PieChart className="mr-2 h-4 w-4" />
                              <span>Ver estadísticas</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" onClick={handleLocalRefresh}>
            Actualizar
          </Button>
          <div>
            <Button variant="outline" size="sm" className="mr-2">
              Exportar
            </Button>
            <Button size="sm">
              Ver Todos
            </Button>
          </div>
        </CardFooter>
      </Card>


    </div>
  );
};

export default EmployeeActivityTab; 