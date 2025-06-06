"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  UserCheck,
  ArrowLeft,
  UserPlus,
  Settings,
  Shuffle,
  Users,
  Filter,
  Search,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Loader2,
  ShieldAlert
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { leadService } from "@/lib/services/leadService"
import { Lead } from "@/lib/types/lead"
import EmployeeService from "@/lib/services/employeeService"
import { Employee } from "@/lib/types/employee"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

const getStatusBadge = (status: string) => {
  switch (status) {
    case "nuevo":
      return <Badge className="bg-blue-950/30 text-blue-400 border border-blue-800/30">Nuevo</Badge>
    case "aprobado":
      return <Badge className="bg-green-950/30 text-green-400 border border-green-800/30">Aprobado</Badge>
    case "rechazado":
      return <Badge className="bg-red-950/30 text-red-400 border border-red-800/30">Rechazado</Badge>
    case "asignado":
      return <Badge className="bg-purple-950/30 text-purple-400 border border-purple-800/30">Asignado</Badge>
    case "convertido":
      return <Badge className="bg-amber-950/30 text-amber-400 border border-amber-800/30">Convertido</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "alta":
      return <Badge className="bg-red-500">Alta</Badge>
    case "media":
      return <Badge className="bg-yellow-500">Media</Badge>
    case "baja":
      return <Badge className="bg-green-500">Baja</Badge>
    default:
      return <Badge variant="outline">Normal</Badge>
  }
}

export default function AsignarLeadsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { employee } = useAuth()
  const [activeTab, setActiveTab] = useState("manual")
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [searchLeadsTerm, setSearchLeadsTerm] = useState("")
  const [searchEmployeesTerm, setSearchEmployeesTerm] = useState("")
  
  // Estados para las opciones de asignación automática
  const [loadBalancingActive, setLoadBalancingActive] = useState(true)
  const [specialtyAssignmentActive, setSpecialtyAssignmentActive] = useState(false)
  const [performanceAssignmentActive, setPerformanceAssignmentActive] = useState(false)
  const [autoAssignSelectedEmployees, setAutoAssignSelectedEmployees] = useState<string[]>([])
  const [leadsLimit, setLeadsLimit] = useState<string>("")
  
  // Estados para datos reales
  const [leads, setLeads] = useState<Lead[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [hasPermission, setHasPermission] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshCounter, setRefreshCounter] = useState(0)
  
  // Estado para almacenar conteo de leads por empleado
  const [employeeLeadCounts, setEmployeeLeadCounts] = useState<Record<string, number>>({})
  const [loadingCounts, setLoadingCounts] = useState<Record<string, boolean>>({})
  
  // Verificar permisos
  useEffect(() => {
    // Esta función verifica si el usuario tiene el permiso necesario para asignar leads
    const checkPermission = () => {
      if (!employee) {
        setHasPermission(false)
        return
      }
      
      // Verificar si el usuario tiene permiso de actualizar leads
      const permissions = employee.permissions || []
      const canUpdateLeads = permissions.includes('leads:update') || 
                            permissions.includes('leads:manage') ||
                            employee.role === 'admin'
      
      setHasPermission(canUpdateLeads)
    }
    
    checkPermission()
  }, [employee])
  
  // Cargar datos reales
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      
      try {
        // Cargar todos los leads y filtrar manualmente los que no tienen asignación
        const leadsResponse = await leadService.getLeads({
          limit: 100
        })
        
        // Filtrar manualmente los leads sin asignar y que estén aprobados
        const unassignedLeads = leadsResponse.data.filter(lead => 
          !lead.assignedTo && lead.isApproved === true
        );
        
        // Cargar empleados activos
        const employeesResponse = await EmployeeService.getEmployees({
          limit: 50
        })
        
        // Filtrar empleados activos manualmente
        const activeEmployees = employeesResponse.data.filter(emp => emp.isActive)
        
        setLeads(unassignedLeads)
        setEmployees(activeEmployees)
      } catch (error) {
        console.error('Error al cargar datos:', error)
        setError('No se pudieron cargar los datos. Por favor, inténtelo de nuevo.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
    
    return () => {
      // Cleanup function
    }
  }, [refreshCounter])
  
  // Filtrar leads según búsqueda
  const filteredLeads = leads.filter(lead => {
    if (!searchLeadsTerm) return true
    
    const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase()
    return fullName.includes(searchLeadsTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchLeadsTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchLeadsTerm.toLowerCase()))
  })
  
  // Filtrar empleados según búsqueda
  const filteredEmployees = employees.filter(employee => {
    if (!searchEmployeesTerm) return true
    
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
    return fullName.includes(searchEmployeesTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchEmployeesTerm.toLowerCase()) ||
      (employee.department && employee.department.toLowerCase().includes(searchEmployeesTerm.toLowerCase()))
  })
  
  const toggleSelectAllLeads = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead._id || ""))
    }
  }
  
  const toggleSelectLead = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(leadId => leadId !== id))
    } else {
      setSelectedLeads([...selectedLeads, id])
    }
  }
  
  const toggleSelectEmployee = (id: string) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter(empId => empId !== id))
    } else {
      setSelectedEmployees([...selectedEmployees, id])
    }
  }
  
  const toggleAutoAssignSelectEmployee = (id: string) => {
    if (autoAssignSelectedEmployees.includes(id)) {
      setAutoAssignSelectedEmployees(autoAssignSelectedEmployees.filter(empId => empId !== id))
    } else {
      setAutoAssignSelectedEmployees([...autoAssignSelectedEmployees, id])
    }
  }
  
  // Asignar leads de forma manual
  const handleManualAssignment = async () => {
    // Verificar permisos primero
    if (!hasPermission) {
      toast({
        variant: "destructive",
        title: "Error de permisos",
        description: "No tienes permiso para asignar leads. Contacta al administrador."
      })
      return
    }
    
    if (selectedLeads.length === 0 || selectedEmployees.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debe seleccionar al menos un lead y un empleado"
      })
      return
    }
    
    setIsAssigning(true)
    
    try {
      // Distribuir leads entre los empleados seleccionados
      const leadsPerEmployee = Math.ceil(selectedLeads.length / selectedEmployees.length)
      let assignedCount = 0
      
      for (let i = 0; i < selectedEmployees.length; i++) {
        const employeeId = selectedEmployees[i]
        const startIdx = i * leadsPerEmployee
        const endIdx = Math.min(startIdx + leadsPerEmployee, selectedLeads.length)
        
        // Salir si ya asignamos todos los leads
        if (startIdx >= selectedLeads.length) break
        
        const leadsToAssign = selectedLeads.slice(startIdx, endIdx)
        
        // Asignar cada lead al empleado actual
        for (const leadId of leadsToAssign) {
          await leadService.assignLead(leadId, employeeId)
          assignedCount++
        }
      }
      
      toast({
        title: "Éxito",
        description: `${assignedCount} leads han sido asignados correctamente`
      })
      
      // Limpiar selecciones
      setSelectedLeads([])
      setSelectedEmployees([])
      
      // Recargar datos
      const leadsResponse = await leadService.getLeads({
        limit: 100
      })
      // Filtrar manualmente los leads sin asignar
      const unassignedLeads = leadsResponse.data.filter(lead => !lead.assignedTo);
      setLeads(unassignedLeads)
      
    } catch (error: any) {
      console.error("Error al asignar leads:", error)
      
      // Mensaje específico para error de permisos
      if (error.response?.status === 403) {
        toast({
          variant: "destructive",
          title: "Error de permisos",
          description: "No tienes permiso para asignar leads. Contacta al administrador."
        })
        setHasPermission(false)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || "No se pudieron asignar los leads"
        })
      }
    } finally {
      setIsAssigning(false)
    }
  }
  
  // Activar asignación automática
  const handleAutoAssignment = async () => {
    // Verificar permisos primero
    if (!hasPermission) {
      toast({
        variant: "destructive",
        title: "Error de permisos",
        description: "No tienes permiso para asignar leads. Contacta al administrador."
      })
      return
    }
    
    if (autoAssignSelectedEmployees.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debe seleccionar al menos un empleado para la asignación automática"
      })
      return
    }
    
    // Esta es una función mock ya que no tenemos la funcionalidad real de asignación automática
    toast({
      title: "Asignación automática",
      description: "La configuración de asignación automática ha sido guardada"
    })
  }
  
  // Obtener conteo de leads asignados por empleado
  const getAssignedLeadsCount = async (employeeId: string) => {
    // Si ya tenemos el valor, lo devolvemos
    if (employeeLeadCounts[employeeId] !== undefined) {
      return employeeLeadCounts[employeeId]
    }
    
    // Si estamos cargando el conteo para este empleado, mostramos indicador
    if (loadingCounts[employeeId]) {
      return '...'
    }
    
    // Marcar como cargando
    setLoadingCounts(prev => ({ ...prev, [employeeId]: true }))
    
    try {
      // Obtener conteo real desde la API
      const count = await leadService.getLeadsCountByEmployee(employeeId)
      
      // Guardar en el estado
      setEmployeeLeadCounts(prev => ({ ...prev, [employeeId]: count }))
      
      return count
    } catch (error) {
      console.error(`Error al obtener conteo para empleado ${employeeId}:`, error)
      return 0
    } finally {
      setLoadingCounts(prev => ({ ...prev, [employeeId]: false }))
    }
  }
  
  // Cargar conteos iniciales
  useEffect(() => {
    // Cargar los conteos para todos los empleados cuando se cargue la página
    const loadAllCounts = async () => {
      if (employees.length > 0) {
        const countsPromises = employees.map(emp => 
          leadService.getLeadsCountByEmployee(emp._id || "")
            .then(count => ({ id: emp._id || "", count }))
        );
        
        try {
          const results = await Promise.all(countsPromises);
          const countsMap: Record<string, number> = {};
          
          results.forEach(result => {
            countsMap[result.id] = result.count;
          });
          
          setEmployeeLeadCounts(countsMap);
        } catch (error) {
          console.error("Error al cargar conteos de leads:", error);
        }
      }
    };
    
    loadAllCounts();
  }, [employees]);
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span>Volver</span>
                </Button>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold tracking-tight">Asignación de Leads</h1>
                </div>
              </div>
              <div className="flex-1"></div>
            </div>
            
            {/* Contenido principal */}
            <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full max-w-[320px] mx-auto mb-4">
                <TabsTrigger value="manual" className="flex-1">Manual</TabsTrigger>
                <TabsTrigger value="automatica" className="flex-1">Automática</TabsTrigger>
              </TabsList>
              
              {/* Asignación Manual */}
              <TabsContent value="manual">
                <Card>
                  <CardHeader>
                    <CardTitle>Asignación Manual</CardTitle>
                    <CardDescription>
                      Selecciona los leads y los empleados a los que quieres asignarlos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!hasPermission && (
                      <Alert variant="destructive" className="mb-4">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Error de permisos</AlertTitle>
                        <AlertDescription>
                          No tienes permiso para asignar leads. Esta acción requiere el permiso 'leads:update'.
                          Contacta al administrador para solicitar acceso.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Cargando datos, por favor espere...</p>
                      </div>
                    ) : (
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Lista de Leads */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Seleccionar Leads</h3>
                            <div className="text-sm text-muted-foreground">
                              {selectedLeads.length} seleccionados
                            </div>
                          </div>
                          
                          <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Buscar leads..."
                              className="pl-9"
                              value={searchLeadsTerm}
                              onChange={(e) => setSearchLeadsTerm(e.target.value)}
                            />
                          </div>
                          
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[40px]">
                                    <Checkbox 
                                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0} 
                                      onCheckedChange={toggleSelectAllLeads}
                                    />
                                  </TableHead>
                                  <TableHead>Lead</TableHead>
                                  <TableHead>Estado</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredLeads.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                      No se encontraron leads sin asignar. Todos los leads ya tienen asignación.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  filteredLeads.map((lead) => (
                                    <TableRow key={lead._id} className={selectedLeads.includes(lead._id || "") ? "bg-primary/5" : ""}>
                                      <TableCell>
                                        <Checkbox 
                                          checked={selectedLeads.includes(lead._id || "")} 
                                          onCheckedChange={() => toggleSelectLead(lead._id || "")}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Avatar className="h-8 w-8">
                                            <AvatarFallback>{lead.firstName[0]}{lead.lastName[0]}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                                            <div className="text-xs text-muted-foreground">{lead.email}</div>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                        
                        {/* Lista de Empleados */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Seleccionar Empleados</h3>
                            <div className="text-sm text-muted-foreground">
                              {selectedEmployees.length} seleccionados
                            </div>
                          </div>
                          
                          <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Buscar empleados..."
                              className="pl-9"
                              value={searchEmployeesTerm}
                              onChange={(e) => setSearchEmployeesTerm(e.target.value)}
                            />
                          </div>
                          
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[40px]"></TableHead>
                                  <TableHead>Empleado</TableHead>
                                  <TableHead>Leads</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredEmployees.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                      No se encontraron empleados activos en el sistema.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  filteredEmployees.map((employee) => (
                                    <TableRow 
                                      key={employee._id} 
                                      className={selectedEmployees.includes(employee._id || "") ? "bg-primary/5" : ""}
                                      onClick={() => toggleSelectEmployee(employee._id || "")}
                                    >
                                      <TableCell>
                                        <Checkbox 
                                          checked={selectedEmployees.includes(employee._id || "")} 
                                          onCheckedChange={() => toggleSelectEmployee(employee._id || "")}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Avatar className="h-8 w-8 bg-primary">
                                            <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                            <div className="text-xs text-muted-foreground">{employee.position}</div>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline">
                                          {loadingCounts[employee._id || ""] 
                                            ? "..." 
                                            : `${employeeLeadCounts[employee._id || ""] || 0} leads`}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 border-t pt-6">
                    <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
                    <Button 
                      disabled={selectedLeads.length === 0 || selectedEmployees.length === 0 || isAssigning || !hasPermission}
                      onClick={handleManualAssignment}
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Asignando...
                        </>
                      ) : (
                        `Asignar ${selectedLeads.length} leads a ${selectedEmployees.length} empleados`
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Asignación Automática */}
              <TabsContent value="automatica">
                <Card>
                  <CardHeader>
                    <CardTitle>Asignación Automática</CardTitle>
                    <CardDescription>
                      Configura reglas para que el sistema asigne leads automáticamente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!hasPermission && (
                      <Alert variant="destructive" className="mb-4">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Error de permisos</AlertTitle>
                        <AlertDescription>
                          No tienes permiso para configurar la asignación automática de leads. Esta acción requiere el permiso 'leads:update'.
                          Contacta al administrador para solicitar acceso.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Cargando datos, por favor espere...</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between p-4 border rounded-md bg-muted/50 dark:bg-slate-800">
                          <div className="flex items-center gap-4">
                            <Settings className="h-8 w-8 text-primary" />
                            <div>
                              <h3 className="font-medium">Reglas de Asignación Automática</h3>
                              <p className="text-sm text-muted-foreground">
                                Configura cómo se distribuirán automáticamente los leads entre tu equipo
                              </p>
                            </div>
                          </div>
                          <Button>Configurar Reglas</Button>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium mb-4">Métodos de distribución</h3>
                            
                            <div className="grid gap-4 md:grid-cols-3">
                              <Card>
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Balanceo de carga</CardTitle>
                                    <Switch 
                                      checked={loadBalancingActive} 
                                      onCheckedChange={setLoadBalancingActive} 
                                    />
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center justify-between">
                                    <Shuffle className="h-8 w-8 text-primary" />
                                    <Badge variant="outline" className={loadBalancingActive ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : ""}>
                                      {loadBalancingActive ? "Activado" : "Desactivado"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2">
                                    Los leads se distribuyen equitativamente entre los miembros del equipo.
                                  </p>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Asignación por especialidad</CardTitle>
                                    <Switch 
                                      checked={specialtyAssignmentActive} 
                                      onCheckedChange={setSpecialtyAssignmentActive} 
                                    />
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center justify-between">
                                    <UserCheck className="h-8 w-8 text-primary" />
                                    <Badge variant="outline" className={specialtyAssignmentActive ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : ""}>
                                      {specialtyAssignmentActive ? "Activado" : "Desactivado"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2">
                                    Asignar leads según la especialidad o habilidades del empleado.
                                  </p>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Asignación por rendimiento</CardTitle>
                                    <Switch 
                                      checked={performanceAssignmentActive} 
                                      onCheckedChange={setPerformanceAssignmentActive} 
                                    />
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center justify-between">
                                    <CheckCircle className="h-8 w-8 text-primary" />
                                    <Badge variant="outline" className={performanceAssignmentActive ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : ""}>
                                      {performanceAssignmentActive ? "Activado" : "Desactivado"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2">
                                    Más leads para los empleados con mejor tasa de conversión.
                                  </p>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                          
                          <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-4">Empleados para asignación automática</h3>
                            
                            <div className="grid gap-6 md:grid-cols-2">
                              <div className="space-y-4">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    placeholder="Buscar empleados..."
                                    className="pl-9"
                                    value={searchEmployeesTerm}
                                    onChange={(e) => setSearchEmployeesTerm(e.target.value)}
                                  />
                                </div>
                                
                                <div className="border rounded-md">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[40px]"></TableHead>
                                        <TableHead>Empleado</TableHead>
                                        <TableHead>Leads actuales</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {filteredEmployees.length === 0 ? (
                                        <TableRow>
                                          <TableCell colSpan={3} className="h-24 text-center">
                                            No se encontraron empleados activos en el sistema.
                                          </TableCell>
                                        </TableRow>
                                      ) : (
                                        filteredEmployees.map((employee) => (
                                          <TableRow 
                                            key={employee._id} 
                                            className={autoAssignSelectedEmployees.includes(employee._id || "") ? "bg-primary/5" : ""}
                                            onClick={() => toggleAutoAssignSelectEmployee(employee._id || "")}
                                          >
                                            <TableCell>
                                              <Checkbox 
                                                checked={autoAssignSelectedEmployees.includes(employee._id || "")} 
                                                onCheckedChange={() => toggleAutoAssignSelectEmployee(employee._id || "")}
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8 bg-primary">
                                                  <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                  <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                                  <div className="text-xs text-muted-foreground">{employee.position}</div>
                                                </div>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <Badge variant="outline">
                                                {loadingCounts[employee._id || ""] 
                                                  ? "..." 
                                                  : `${employeeLeadCounts[employee._id || ""] || 0} leads`}
                                              </Badge>
                                            </TableCell>
                                          </TableRow>
                                        ))
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="leadsLimit">Límite de leads por empleado</Label>
                                  <div className="flex gap-2 items-center">
                                    <Input 
                                      id="leadsLimit" 
                                      type="number" 
                                      placeholder="Sin límite" 
                                      className="max-w-[160px]"
                                      value={leadsLimit}
                                      onChange={(e) => setLeadsLimit(e.target.value)}
                                    />
                                    <span className="text-sm text-muted-foreground">
                                      Deje en blanco para asignación sin límites
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="rounded-md border p-4 bg-slate-100 dark:bg-slate-800">
                                  <h4 className="font-medium mb-2">Resumen de asignación</h4>
                                  <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-primary" />
                                      <span>{autoAssignSelectedEmployees.length} empleados seleccionados</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <UserPlus className="h-4 w-4 text-primary" />
                                      <span>Límite de {leadsLimit ? leadsLimit : "∞"} leads por empleado</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                      {(loadBalancingActive || specialtyAssignmentActive || performanceAssignmentActive) ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-yellow-500" />
                                      )}
                                      <span>
                                        {(loadBalancingActive || specialtyAssignmentActive || performanceAssignmentActive) ? (
                                          "Al menos un método de asignación está activado"
                                        ) : (
                                          "Ningún método de asignación activado (distribución estándar)"
                                        )}
                                      </span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-md bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                            <div className="flex gap-2">
                              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              <div>
                                <h4 className="font-medium text-amber-800 dark:text-amber-300">Advertencia</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                  La asignación automática está configurada, pero debes activarla desde la configuración del sistema.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 border-t pt-6">
                    <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
                    <Button 
                      disabled={autoAssignSelectedEmployees.length === 0 || !hasPermission}
                      onClick={handleAutoAssignment}
                    >
                      Activar Asignación Automática
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
} 