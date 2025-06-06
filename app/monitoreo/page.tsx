"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  Cpu, 
  AlertTriangle, 
  Server, 
  Zap, 
  Clock, 
  Bell, 
  Calendar,
  CircleCheck,
  BarChart,
  LineChart,
  ArrowUpRight,
  Users,
  UserCheck,
  History,
  Timer,
  CheckCircle2,
  ClipboardList,
  Eye,
  Filter,
  Search,
  CalendarDays,
  MoreHorizontal,
  Flame,
  FileBarChart,
  BadgeCheck,
  Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

// Datos de ejemplo para monitoreo de empleados
const EMPLOYEE_DATA = [
  {
    id: "E001",
    name: "Carlos Rodríguez",
    email: "carlos@bayres.com",
    position: "Ejecutivo de Ventas",
    avatar: "CR",
    lastLogin: "Hoy, 09:32 AM",
    activeTime: "5h 42m",
    status: "online",
    productivity: 87,
    activities: 32,
    leadsProcessed: 15,
    tasksCompleted: 8,
    // Datos para nuevas métricas
    salesMetrics: {
      quota: 10000,
      achieved: 8540,
      conversion: 68,
      deals: 12
    },
    taskTime: {
      lead: 42,
      calls: 25,
      meetings: 15,
      admin: 18
    },
    absences: {
      total: 2,
      lastMonth: 1,
      inactivityPeriods: [
        { date: "12/05/2023", duration: "45m", reason: "Reunión no registrada" },
        { date: "28/04/2023", duration: "120m", reason: "Sin justificar" }
      ]
    }
  },
  {
    id: "E002",
    name: "María González",
    email: "maria@bayres.com",
    position: "Gerente de Marketing",
    avatar: "MG",
    lastLogin: "Hoy, 08:15 AM",
    activeTime: "6h 20m",
    status: "online",
    productivity: 92,
    activities: 45,
    leadsProcessed: 8,
    tasksCompleted: 12,
    // Datos para nuevas métricas
    salesMetrics: {
      quota: 8000,
      achieved: 9200,
      conversion: 75,
      deals: 8
    },
    taskTime: {
      lead: 18,
      calls: 12,
      meetings: 45,
      admin: 25
    },
    absences: {
      total: 0,
      lastMonth: 0,
      inactivityPeriods: []
    }
  },
  {
    id: "E003",
    name: "Javier Méndez",
    email: "javier@bayres.com",
    position: "Ejecutivo de Ventas",
    avatar: "JM",
    lastLogin: "Ayer, 16:45 PM",
    activeTime: "0h 0m",
    status: "offline",
    productivity: 75,
    activities: 18,
    leadsProcessed: 10,
    tasksCompleted: 5,
    // Datos para nuevas métricas
    salesMetrics: {
      quota: 10000,
      achieved: 6200,
      conversion: 52,
      deals: 7
    },
    taskTime: {
      lead: 38,
      calls: 32,
      meetings: 12,
      admin: 18
    },
    absences: {
      total: 5,
      lastMonth: 2,
      inactivityPeriods: [
        { date: "10/05/2023", duration: "1d", reason: "Enfermedad" },
        { date: "02/05/2023", duration: "1d", reason: "Personal" },
        { date: "15/04/2023", duration: "3h", reason: "Sin justificar" }
      ]
    }
  },
  {
    id: "E004",
    name: "Laura Torres",
    email: "laura@bayres.com",
    position: "Atención al Cliente",
    avatar: "LT",
    lastLogin: "Hoy, 10:05 AM",
    activeTime: "4h 15m",
    status: "online",
    productivity: 89,
    activities: 27,
    leadsProcessed: 12,
    tasksCompleted: 9,
    // Datos para nuevas métricas
    salesMetrics: {
      quota: 5000,
      achieved: 4800,
      conversion: 62,
      deals: 5
    },
    taskTime: {
      lead: 15,
      calls: 42,
      meetings: 18,
      admin: 25
    },
    absences: {
      total: 1,
      lastMonth: 0,
      inactivityPeriods: [
        { date: "20/04/2023", duration: "1d", reason: "Personal" }
      ]
    }
  },
  {
    id: "E005",
    name: "Roberto Sánchez",
    email: "roberto@bayres.com",
    position: "Ejecutivo de Ventas",
    avatar: "RS",
    lastLogin: "Hoy, 08:50 AM",
    activeTime: "5h 10m",
    status: "break",
    productivity: 82,
    activities: 24,
    leadsProcessed: 9,
    tasksCompleted: 7,
    // Datos para nuevas métricas
    salesMetrics: {
      quota: 10000,
      achieved: 7850,
      conversion: 65,
      deals: 9
    },
    taskTime: {
      lead: 35,
      calls: 28,
      meetings: 20,
      admin: 17
    },
    absences: {
      total: 3,
      lastMonth: 1,
      inactivityPeriods: [
        { date: "05/05/2023", duration: "1d", reason: "Enfermedad" },
        { date: "20/04/2023", duration: "2h", reason: "Sin justificar" },
        { date: "15/04/2023", duration: "45m", reason: "Reunión no registrada" }
      ]
    }
  }
];

// Datos de ejemplo para el registro de auditoría
const AUDIT_LOGS = [
  {
    id: "A001",
    userId: "E001",
    userName: "Carlos Rodríguez",
    action: "Actualización de lead",
    description: "Actualizó estado del lead #L-382 a 'Calificado'",
    timestamp: "Hoy, 10:45 AM",
    ip: "192.168.1.45",
    module: "Leads"
  },
  {
    id: "A002",
    userId: "E002",
    userName: "María González",
    action: "Creación de campaña",
    description: "Creó nueva campaña de marketing 'Promoción Verano 2023'",
    timestamp: "Hoy, 09:30 AM",
    ip: "192.168.1.62",
    module: "Marketing"
  },
  {
    id: "A003",
    userId: "E004",
    userName: "Laura Torres",
    action: "Respuesta a cliente",
    description: "Respondió caso #CS-291 de soporte al cliente",
    timestamp: "Hoy, 11:15 AM",
    ip: "192.168.1.38",
    module: "Atención al Cliente"
  },
  {
    id: "A004",
    userId: "E001",
    userName: "Carlos Rodríguez",
    action: "Exportación de datos",
    description: "Exportó listado de leads a Excel",
    timestamp: "Hoy, 08:50 AM",
    ip: "192.168.1.45",
    module: "Leads"
  },
  {
    id: "A005",
    userId: "E005",
    userName: "Roberto Sánchez",
    action: "Asignación de tarea",
    description: "Asignó tarea #T-129 a María González",
    timestamp: "Ayer, 16:20 PM",
    ip: "192.168.1.72",
    module: "Tareas"
  },
  {
    id: "A006",
    userId: "E002",
    userName: "María González",
    action: "Actualización de presupuesto",
    description: "Actualizó presupuesto de proyecto #P-045",
    timestamp: "Hoy, 10:10 AM",
    ip: "192.168.1.62",
    module: "Proyectos"
  },
  {
    id: "A007",
    userId: "E001",
    userName: "Carlos Rodríguez",
    action: "Inicio de sesión",
    description: "Inicio de sesión exitoso",
    timestamp: "Hoy, 09:32 AM",
    ip: "192.168.1.45",
    module: "Autenticación"
  }
];

export default function MonitoreoPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("")
  const [auditLogSearchTerm, setAuditLogSearchTerm] = useState("")
  const [employeeFilter, setEmployeeFilter] = useState("all")
  
  // Filtrar empleados según el término de búsqueda y filtro
  const filteredEmployees = EMPLOYEE_DATA.filter(employee => {
    const searchMatch = employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) || 
                       employee.email.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                       employee.position.toLowerCase().includes(employeeSearchTerm.toLowerCase());
    
    const statusMatch = employeeFilter === "all" || 
                      (employeeFilter === "online" && employee.status === "online") ||
                      (employeeFilter === "offline" && employee.status === "offline") ||
                      (employeeFilter === "break" && employee.status === "break");
    
    return searchMatch && statusMatch;
  });
  
  // Filtrar registros de auditoría según el término de búsqueda
  const filteredAuditLogs = AUDIT_LOGS.filter(log => {
    return log.userName.toLowerCase().includes(auditLogSearchTerm.toLowerCase()) ||
           log.action.toLowerCase().includes(auditLogSearchTerm.toLowerCase()) ||
           log.description.toLowerCase().includes(auditLogSearchTerm.toLowerCase()) ||
           log.module.toLowerCase().includes(auditLogSearchTerm.toLowerCase());
  });
  
  // Función para renderizar el estado del empleado
  const renderEmployeeStatus = (status: string) => {
    switch(status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">En línea</Badge>;
      case 'offline':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Desconectado</Badge>;
      case 'break':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">En pausa</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col space-y-6 p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Monitoreo</h1>
              <div className="flex items-center gap-4">
                <Button variant="outline">
                  <Bell className="mr-2 h-4 w-4" />
                  Configurar Alertas
                </Button>
                <Button>
                  <Activity className="mr-2 h-4 w-4" />
                  Ver Reportes
                </Button>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="overflow-x-auto pb-2">
                <TabsList className="inline-flex min-w-max w-full md:w-auto">
                  <TabsTrigger value="dashboard" className="flex items-center">
                    <BarChart className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="employees" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Empleados</span>
                  </TabsTrigger>
                  <TabsTrigger value="audit" className="flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    <span>Registro de Auditoría</span>
                  </TabsTrigger>
                  <TabsTrigger value="alerts" className="flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    <span>Alertas</span>
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Logs</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="dashboard" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
                      <Server className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8/8</div>
                      <div className="flex items-center pt-1">
                        <CircleCheck className="mr-1 h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-500 font-medium">Todos operativos</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Uso de CPU</CardTitle>
                      <Cpu className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">32%</div>
                      <div className="mt-2">
                        <Progress value={32} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
                      <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">145ms</div>
                      <div className="flex items-center pt-1">
                        <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-500 font-medium">-12ms vs 24h</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
                      <Bell className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2</div>
                      <div className="flex items-center pt-1">
                        <span className="text-xs text-muted-foreground">Desde hace 12 horas</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen del Sistema</CardTitle>
                    <CardDescription>
                      Estado general de los principales indicadores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Servidor Principal</Badge>
                          </div>
                          <Badge variant="outline">Operativo</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>CPU</span>
                            <span>28%</span>
                          </div>
                          <Progress value={28} className="h-1" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Memoria</span>
                            <span>42%</span>
                          </div>
                          <Progress value={42} className="h-1" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Almacenamiento</span>
                            <span>65%</span>
                          </div>
                          <Progress value={65} className="h-1" />
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Base de Datos</Badge>
                          </div>
                          <Badge variant="outline">Operativo</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>CPU</span>
                            <span>35%</span>
                          </div>
                          <Progress value={35} className="h-1" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Memoria</span>
                            <span>62%</span>
                          </div>
                          <Progress value={62} className="h-1" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Almacenamiento</span>
                            <span>48%</span>
                          </div>
                          <Progress value={48} className="h-1" />
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">CDN</Badge>
                          </div>
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            Rendimiento Degradado
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Disponibilidad</span>
                            <span>98.2%</span>
                          </div>
                          <Progress value={98.2} className="h-1" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Tiempo de Respuesta</span>
                            <span>240ms</span>
                          </div>
                          <Progress value={70} className="h-1" indicatorClassName="bg-amber-500" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="h-[300px] rounded-lg border p-6 flex flex-col items-center justify-center text-center">
                  <LineChart className="h-10 w-10 mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Gráfico de Rendimiento</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Esta área contendrá gráficos detallados sobre el rendimiento del sistema a lo largo del tiempo.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="employees" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                      <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{EMPLOYEE_DATA.length}</div>
                      <div className="text-xs text-muted-foreground pt-1">
                        Registrados en el sistema
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
                      <UserCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{EMPLOYEE_DATA.filter(e => e.status === 'online').length}</div>
                      <Progress 
                        value={(EMPLOYEE_DATA.filter(e => e.status === 'online').length / EMPLOYEE_DATA.length) * 100} 
                        className="h-2 mt-2" 
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Productividad Media</CardTitle>
                      <FileBarChart className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.round(EMPLOYEE_DATA.reduce((sum, emp) => sum + emp.productivity, 0) / EMPLOYEE_DATA.length)}%
                      </div>
                      <div className="flex items-center pt-1">
                        <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-500 font-medium">+2% vs semana anterior</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Tiempo Activo Medio</CardTitle>
                      <Timer className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">5h 24m</div>
                      <div className="flex items-center pt-1">
                        <span className="text-xs text-muted-foreground">Hoy</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Monitoreo de Empleados</CardTitle>
                    <CardDescription>
                      Visualización del estado y actividad de los miembros del equipo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Buscar empleados..."
                          className="w-full appearance-none bg-background pl-9"
                          value={employeeSearchTerm}
                          onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="online">En línea</SelectItem>
                            <SelectItem value="offline">Desconectado</SelectItem>
                            <SelectItem value="break">En pausa</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Filter className="h-4 w-4" />
                          <span>Filtros</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Empleado</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Última Sesión</TableHead>
                            <TableHead>Tiempo Activo</TableHead>
                            <TableHead>Productividad</TableHead>
                            <TableHead>Actividades</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEmployees.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                No se encontraron empleados que coincidan con los criterios.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredEmployees.map((employee) => (
                              <TableRow key={employee.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarFallback>{employee.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{employee.name}</div>
                                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {employee.email}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{renderEmployeeStatus(employee.status)}</TableCell>
                                <TableCell>{employee.lastLogin}</TableCell>
                                <TableCell>{employee.activeTime}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress 
                                      value={employee.productivity} 
                                      className="h-2 w-[80px]" 
                                      indicatorClassName={
                                        employee.productivity > 85 ? "bg-green-500" : 
                                        employee.productivity > 70 ? "bg-amber-500" : "bg-red-500"
                                      }
                                    />
                                    <span>{employee.productivity}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span>{employee.activities}</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="text-sm">
                                          <div>Leads procesados: {employee.leadsProcessed}</div>
                                          <div>Tareas completadas: {employee.tasksCompleted}</div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Abrir menú</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span>Ver detalles</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <FileBarChart className="mr-2 h-4 w-4" />
                                        <span>Ver rendimiento</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <History className="mr-2 h-4 w-4" />
                                        <span>Ver actividad</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen de Desempeño</CardTitle>
                    <CardDescription>
                      Estadísticas de desempeño por departamento y actividad
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 mb-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Estadísticas por Departamento</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Ventas</span>
                              <span className="text-sm font-medium">90%</span>
                            </div>
                            <Progress value={90} className="h-2" indicatorClassName="bg-green-500" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Marketing</span>
                              <span className="text-sm font-medium">85%</span>
                            </div>
                            <Progress value={85} className="h-2" indicatorClassName="bg-green-500" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Atención al Cliente</span>
                              <span className="text-sm font-medium">78%</span>
                            </div>
                            <Progress value={78} className="h-2" indicatorClassName="bg-amber-500" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Administración</span>
                              <span className="text-sm font-medium">92%</span>
                            </div>
                            <Progress value={92} className="h-2" indicatorClassName="bg-green-500" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-2">Actividad por Tipo</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Gestión de Leads</span>
                              <span className="text-sm font-medium">125</span>
                            </div>
                            <Progress value={80} className="h-2" indicatorClassName="bg-blue-500" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Tareas Completadas</span>
                              <span className="text-sm font-medium">98</span>
                            </div>
                            <Progress value={60} className="h-2" indicatorClassName="bg-blue-500" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Atención a Clientes</span>
                              <span className="text-sm font-medium">67</span>
                            </div>
                            <Progress value={40} className="h-2" indicatorClassName="bg-blue-500" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Actualizaciones</span>
                              <span className="text-sm font-medium">103</span>
                            </div>
                            <Progress value={70} className="h-2" indicatorClassName="bg-blue-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Nueva sección: Métricas de Ventas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Ventas</CardTitle>
                    <CardDescription>
                      Correlación entre actividad del empleado y resultados de ventas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Empleado</TableHead>
                            <TableHead>Cuota</TableHead>
                            <TableHead>Alcanzado</TableHead>
                            <TableHead>% Conversión</TableHead>
                            <TableHead>Acuerdos</TableHead>
                            <TableHead>Eficiencia</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEmployees.filter(emp => emp.position.includes("Ventas") || emp.position.includes("Marketing")).map((employee) => (
                            <TableRow key={`sales-${employee.id}`}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-7 w-7">
                                    <AvatarFallback>{employee.avatar}</AvatarFallback>
                                  </Avatar>
                                  <span>{employee.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>${employee.salesMetrics.quota.toLocaleString()}</TableCell>
                              <TableCell>${employee.salesMetrics.achieved.toLocaleString()}</TableCell>
                              <TableCell>{employee.salesMetrics.conversion}%</TableCell>
                              <TableCell>{employee.salesMetrics.deals}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress 
                                    value={(employee.salesMetrics.achieved / employee.salesMetrics.quota) * 100} 
                                    className="h-2 w-[80px]" 
                                    indicatorClassName={
                                      (employee.salesMetrics.achieved / employee.salesMetrics.quota) > 0.9 ? "bg-green-500" : 
                                      (employee.salesMetrics.achieved / employee.salesMetrics.quota) > 0.7 ? "bg-amber-500" : "bg-red-500"
                                    }
                                  />
                                  <span>{Math.round((employee.salesMetrics.achieved / employee.salesMetrics.quota) * 100)}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-3">Correlación Actividad-Ventas</h4>
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="border rounded-md p-3">
                          <div className="text-sm text-muted-foreground mb-1">Tiempo Activo vs Ventas</div>
                          <div className="font-medium">Correlación Alta</div>
                          <div className="text-sm text-green-600">+0.84</div>
                        </div>
                        <div className="border rounded-md p-3">
                          <div className="text-sm text-muted-foreground mb-1">Productividad vs Conversión</div>
                          <div className="font-medium">Correlación Media</div>
                          <div className="text-sm text-amber-600">+0.67</div>
                        </div>
                        <div className="border rounded-md p-3">
                          <div className="text-sm text-muted-foreground mb-1">Leads Procesados vs Acuerdos</div>
                          <div className="font-medium">Correlación Alta</div>
                          <div className="text-sm text-green-600">+0.92</div>
                        </div>
                        <div className="border rounded-md p-3">
                          <div className="text-sm text-muted-foreground mb-1">Ausencias vs Ventas</div>
                          <div className="font-medium">Correlación Negativa</div>
                          <div className="text-sm text-red-600">-0.78</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Nueva sección: Tiempo en Tareas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tiempo en Tareas</CardTitle>
                    <CardDescription>
                      Desglose detallado del tiempo dedicado a diferentes tipos de actividades
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Lista de empleados con gráficas de tiempo */}
                      <div className="space-y-6">
                        {filteredEmployees.slice(0, 3).map((employee) => (
                          <div key={`task-time-${employee.id}`} className="border rounded-md p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{employee.avatar}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{employee.name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">{employee.position}</Badge>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                  <span>Gestión de Leads</span>
                                  <span>{employee.taskTime.lead}%</span>
                                </div>
                                <Progress value={employee.taskTime.lead} className="h-2" indicatorClassName="bg-blue-500" />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                  <span>Llamadas y Comunicación</span>
                                  <span>{employee.taskTime.calls}%</span>
                                </div>
                                <Progress value={employee.taskTime.calls} className="h-2" indicatorClassName="bg-green-500" />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                  <span>Reuniones</span>
                                  <span>{employee.taskTime.meetings}%</span>
                                </div>
                                <Progress value={employee.taskTime.meetings} className="h-2" indicatorClassName="bg-amber-500" />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                  <span>Tareas Administrativas</span>
                                  <span>{employee.taskTime.admin}%</span>
                                </div>
                                <Progress value={employee.taskTime.admin} className="h-2" indicatorClassName="bg-purple-500" />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {filteredEmployees.length > 3 && (
                          <Button variant="outline" className="w-full">
                            Ver todos los empleados
                          </Button>
                        )}
                      </div>
                      
                      {/* Resumen y estadísticas */}
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium mb-4">Distribución Media del Tiempo</h4>
                        
                        <div className="space-y-6">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-medium">Por Tipo de Tarea</h5>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="border rounded-md p-3">
                                <div className="text-2xl font-bold text-blue-500 mb-1">32%</div>
                                <div className="text-sm">Gestión de Leads</div>
                              </div>
                              <div className="border rounded-md p-3">
                                <div className="text-2xl font-bold text-green-500 mb-1">28%</div>
                                <div className="text-sm">Llamadas</div>
                              </div>
                              <div className="border rounded-md p-3">
                                <div className="text-2xl font-bold text-amber-500 mb-1">22%</div>
                                <div className="text-sm">Reuniones</div>
                              </div>
                              <div className="border rounded-md p-3">
                                <div className="text-2xl font-bold text-purple-500 mb-1">18%</div>
                                <div className="text-sm">Administración</div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-medium">Tiempo Productivo vs. No Productivo</h5>
                            </div>
                            <div className="border rounded-md p-4">
                              <div className="mb-2 flex justify-between items-center">
                                <span className="text-sm">Tiempo Productivo</span>
                                <span className="text-sm font-medium">82%</span>
                              </div>
                              <Progress value={82} className="h-2 mb-4" indicatorClassName="bg-green-500" />
                              
                              <div className="mb-2 flex justify-between items-center">
                                <span className="text-sm">Tiempo No Productivo</span>
                                <span className="text-sm font-medium">18%</span>
                              </div>
                              <Progress value={18} className="h-2" indicatorClassName="bg-red-500" />
                            </div>
                          </div>
                          
                          <div className="border rounded-md p-3">
                            <h5 className="text-sm font-medium mb-2">Observaciones</h5>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              <li>• Mayor productividad en horario de 9am - 11am</li>
                              <li>• Tiempo excesivo en tareas administrativas</li>
                              <li>• Reuniones podrían optimizarse (duración media: 45min)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Nueva sección: Inactividad y Ausencias */}
                <Card>
                  <CardHeader>
                    <CardTitle>Inactividad y Ausencias</CardTitle>
                    <CardDescription>
                      Registro automático de períodos de inactividad prolongados y patrones de ausencia
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 mb-6">
                      <div>
                        <h4 className="font-medium mb-3">Resumen de Ausencias</h4>
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Empleado</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Último Mes</TableHead>
                                <TableHead>Estado</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredEmployees.map((employee) => (
                                <TableRow key={`absence-${employee.id}`}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-7 w-7">
                                        <AvatarFallback>{employee.avatar}</AvatarFallback>
                                      </Avatar>
                                      <span>{employee.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{employee.absences.total}</TableCell>
                                  <TableCell>{employee.absences.lastMonth}</TableCell>
                                  <TableCell>
                                    {employee.absences.total > 4 ? (
                                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Alto</Badge>
                                    ) : employee.absences.total > 2 ? (
                                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Medio</Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Bajo</Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Estadísticas de Inactividad</h4>
                        <div className="border rounded-md p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Total Horas de Inactividad</div>
                              <div className="text-2xl font-bold">28h 15m</div>
                              <div className="text-sm text-amber-600">+5.2% vs. mes anterior</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Tiempo Medio Inactividad</div>
                              <div className="text-2xl font-bold">42m</div>
                              <div className="text-sm text-green-600">-8.5% vs. mes anterior</div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium mb-2">Causas Principales</div>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                  <span>Reuniones no registradas</span>
                                  <span>38%</span>
                                </div>
                                <Progress value={38} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                  <span>Sin justificar</span>
                                  <span>32%</span>
                                </div>
                                <Progress value={32} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                  <span>Enfermedad</span>
                                  <span>18%</span>
                                </div>
                                <Progress value={18} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                  <span>Asuntos personales</span>
                                  <span>12%</span>
                                </div>
                                <Progress value={12} className="h-2" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Períodos de Inactividad Recientes</h4>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Empleado</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Duración</TableHead>
                              <TableHead>Motivo</TableHead>
                              <TableHead>Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredEmployees.flatMap(employee => 
                              employee.absences.inactivityPeriods.slice(0, 1).map((period, index) => (
                                <TableRow key={`inactivity-${employee.id}-${index}`}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-7 w-7">
                                        <AvatarFallback>{employee.avatar}</AvatarFallback>
                                      </Avatar>
                                      <span>{employee.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{period.date}</TableCell>
                                  <TableCell>{period.duration}</TableCell>
                                  <TableCell>
                                    {period.reason === "Sin justificar" ? (
                                      <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200">
                                        {period.reason}
                                      </Badge>
                                    ) : (
                                      period.reason
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="sm">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <Button variant="outline">Ver historial completo</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="audit" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Registro de Auditoría</CardTitle>
                    <CardDescription>
                      Historial de actividades de los usuarios en el sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Buscar en registros..."
                          className="w-full appearance-none bg-background pl-9"
                          value={auditLogSearchTerm}
                          onChange={(e) => setAuditLogSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <CalendarDays className="h-4 w-4" />
                          <span>Filtrar por fecha</span>
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <BadgeCheck className="h-4 w-4" />
                          <span>Filtrar por tipo</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Acción</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Módulo</TableHead>
                            <TableHead>IP</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAuditLogs.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No se encontraron registros que coincidan con los criterios.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredAuditLogs.map((log) => (
                              <TableRow key={log.id}>
                                <TableCell>
                                  <span className="font-medium">{log.timestamp}</span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7">
                                      <AvatarFallback>
                                        {log.userName.split(' ').map(name => name[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{log.userName}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell>
                                  <span className="text-sm">{log.description}</span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{log.module}</Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-mono">{log.ip}</span>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Mostrando los últimos {filteredAuditLogs.length} de {AUDIT_LOGS.length} registros
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Ver registro completo
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="alerts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Alertas del Sistema</CardTitle>
                    <CardDescription>
                      Historial y configuración de alertas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Contenido en desarrollo. Esta sección mostrará las alertas y notificaciones del sistema.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="logs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Registros del Sistema</CardTitle>
                    <CardDescription>
                      Logs detallados de eventos y actividades
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Contenido en desarrollo. Esta sección mostrará logs y registros de actividad del sistema.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
} 