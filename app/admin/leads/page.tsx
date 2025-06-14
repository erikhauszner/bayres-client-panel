"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  Mail,
  Building,
  AlertCircle,
  XCircle,
  User,
  Users,
  UserPlus,
  UserMinus,
  Settings,
  FileText,
  Eye,
  Upload,
  Loader2,
  UserCheck,
  RefreshCcw,
  ChevronRight,
  Phone,
  ArrowUpDown,
  ChevronLeft,
  FileSpreadsheet,
  Trash2,
  Edit,
  ShieldCheck,
  Check,
  Ban,
  X
} from "lucide-react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { leadService } from "@/lib/services/leadService"
import { Lead, LeadResponse } from "@/lib/types/lead"
import { useToast } from "@/components/ui/use-toast"
import EmployeeService from "@/lib/services/employeeService"
import { Employee } from "@/lib/types/employee"
import { Alert, AlertDescription } from "@/components/ui/alert"
import useHasPermission from "@/hooks/useHasPermission"

// Datos de ejemplo para la lista de leads
const LEADS_DATA = [
  {
    id: "LEAD-001",
    firstName: "Carlos",
    lastName: "González",
    email: "carlos.gonzalez@example.com",
    phone: "+54 11 5555-1234",
    company: "Tecnología Avanzada",
    position: "Director de Tecnología",
    status: "nuevo",
    source: "sitio_web",
    priority: "alta",
    captureDate: "2023-05-15",
    lastActivity: "2023-05-18",
    assignedTo: null
  },
  {
    id: "LEAD-002",
    firstName: "María",
    lastName: "Rodríguez",
    email: "maria.rodriguez@example.com",
    phone: "+54 11 5555-5678",
    company: "Consultoría ABC",
    position: "Gerente de Marketing",
    status: "en_proceso",
    source: "referencia",
    priority: "media",
    captureDate: "2023-05-10",
    lastActivity: "2023-05-17",
    assignedTo: {
      id: "EMP-001",
      name: "Juan Pérez",
      position: "Ejecutivo de Ventas",
      avatar: ""
    }
  },
  {
    id: "LEAD-003",
    firstName: "Roberto",
    lastName: "Fernández",
    email: "roberto.fernandez@example.com",
    phone: "+54 11 5555-9012",
    company: "Soluciones Digitales",
    position: "CEO",
    status: "calificado",
    source: "linkedin",
    priority: "alta",
    captureDate: "2023-05-05",
    lastActivity: "2023-05-16",
    assignedTo: {
      id: "EMP-002",
      name: "Ana García",
      position: "Directora Comercial",
      avatar: ""
    }
  },
  {
    id: "LEAD-004",
    firstName: "Lucía",
    lastName: "Martínez",
    email: "lucia.martinez@example.com",
    phone: "+54 11 5555-3456",
    company: "Marketing Global",
    position: "Directora de Operaciones",
    status: "nuevo",
    source: "evento",
    priority: "baja",
    captureDate: "2023-05-14",
    lastActivity: "2023-05-14",
    assignedTo: null
  },
  {
    id: "LEAD-005",
    firstName: "Santiago",
    lastName: "López",
    email: "santiago.lopez@example.com",
    phone: "+54 11 5555-7890",
    company: "Innovación Tech",
    position: "CTO",
    status: "en_proceso",
    source: "facebook",
    priority: "media",
    captureDate: "2023-05-08",
    lastActivity: "2023-05-15",
    assignedTo: {
      id: "EMP-003",
      name: "Carolina Sánchez",
      position: "Ejecutiva de Cuentas",
      avatar: ""
    }
  }
]

// Datos de ejemplo para empleados
const EMPLOYEES_DATA = [
  {
    id: "EMP-001",
    name: "Juan Pérez",
    position: "Ejecutivo de Ventas",
    email: "juan.perez@empresa.com",
    department: "Ventas",
    avatar: "",
    activeLeads: 5,
    isActive: true
  },
  {
    id: "EMP-002",
    name: "Ana García",
    position: "Directora Comercial",
    email: "ana.garcia@empresa.com",
    department: "Comercial",
    avatar: "",
    activeLeads: 3,
    isActive: true
  },
  {
    id: "EMP-003",
    name: "Carolina Sánchez",
    position: "Ejecutiva de Cuentas",
    email: "carolina.sanchez@empresa.com",
    department: "Ventas",
    avatar: "",
    activeLeads: 7,
    isActive: true
  },
  {
    id: "EMP-004",
    name: "Martín Rodríguez",
    position: "Representante de Ventas",
    email: "martin.rodriguez@empresa.com",
    department: "Ventas",
    avatar: "",
    activeLeads: 4,
    isActive: false
  },
  {
    id: "EMP-005",
    name: "Laura Fernández",
    position: "Consultora de Soluciones",
    email: "laura.fernandez@empresa.com",
    department: "Consultoría",
    avatar: "",
    activeLeads: 2,
    isActive: true
  }
]

export default function AdminLeadsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all-leads")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null)
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [assignedFilter, setAssignedFilter] = useState<string>("todos")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [totalLeads, setTotalLeads] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [refreshFlag, setRefreshFlag] = useState(0)
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [disapprovedCount, setDisapprovedCount] = useState(0)
  
  // Estados para el modal de razón de anulación
  const [showAnnulationReasonModal, setShowAnnulationReasonModal] = useState(false)
  const [selectedAnnulationReason, setSelectedAnnulationReason] = useState("")
  
  // Permisos para acciones
  const canApproveLeads = useHasPermission("leads:approve");
  const canRejectLeads = useHasPermission("leads:reject");
  const canAssignLeads = useHasPermission("leads:assign");
  const canReadLeads = useHasPermission("leads:read");
  const canUpdateLeads = useHasPermission("leads:update");
  const canDeleteLeads = useHasPermission("leads:delete");
  
  // Filtrar leads basado en criterios de búsqueda
  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        let result;
        
        // Si estamos en la pestaña de desaprobados, hacer consulta específica
        if (activeTab === "disapproved") {
          result = await leadService.getLeads({
            isApproved: false,
            status: JSON.stringify({ $ne: 'nuevo' }),
            search: searchTerm,
            page: currentPage,
            limit: itemsPerPage
          });
        } else if (activeTab === "cancelled") {
          // Para la pestaña de anulados, hacer consulta específica
          result = await leadService.getLeads({
            status: 'anulado',
            search: searchTerm,
            page: currentPage,
            limit: itemsPerPage
          });
        } else {
          // Para otras pestañas, usar la consulta normal
          result = await leadService.getLeads({
            status: statusFilter === "todos" ? undefined : statusFilter,
            search: searchTerm,
            page: currentPage,
            limit: itemsPerPage
          });
        }
        
        setLeads(result.data)
        setTotalLeads(result.total)
        setTotalPages(result.pages)
        
        // Obtener conteos totales para las tarjetas de resumen (sin paginación)
        // 1. Leads nuevos: status=nuevo
        const pendingApprovalLeads = await leadService.getLeads({
          status: 'nuevo',
          isApproved: false, // Solo los que están pendientes de aprobación
          limit: 1 // Solo necesitamos el conteo total, no los datos
        })
        
        // 2. Leads aprobados: isApproved=true
        const approvedLeads = await leadService.getLeads({
          isApproved: 'true',  // Como string para que sea tratado correctamente por el backend
          limit: 1
        })
        
        // 3. Leads rechazados: isApproved=false pero que no sean nuevos
        const rejectedFilters = {
          isApproved: false,
          status: JSON.stringify({ $ne: 'nuevo' }),  // Serializar el objeto para la consulta
        };
        const disapprovedLeads = await leadService.getLeads(rejectedFilters)
        
        // Guardar conteos en variables de estado adicionales
        setPendingApprovalCount(pendingApprovalLeads.total)
        setApprovedCount(approvedLeads.total)
        setDisapprovedCount(disapprovedLeads.total)
        
        // Para pestañas que no sean "disapproved" o "cancelled", aplicar filtro de asignación
        let filtered = [...result.data]
        
        if (activeTab !== "disapproved" && activeTab !== "cancelled") {
          if (assignedFilter === "asignados") {
            filtered = filtered.filter(lead => lead.assignedTo)
          } else if (assignedFilter === "no_asignados") {
            filtered = filtered.filter(lead => !lead.assignedTo)
          }
        }
        
        setFilteredLeads(filtered)
      } catch (err: any) {
        console.error("Error al cargar leads:", err)
        setError(err.response?.data?.message || "No se pudieron cargar los leads. Por favor, intente de nuevo.")
        setFilteredLeads([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchLeads()
  }, [currentPage, searchTerm, statusFilter, assignedFilter, refreshFlag, activeTab, itemsPerPage])
  
  // Resetear página cuando cambie la pestaña
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  // Funciones de paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: string) => {
    setItemsPerPage(parseInt(newItemsPerPage))
    setCurrentPage(1) // Resetear a la primera página
  }

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, assignedFilter])

  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const delta = 2 // Número de páginas a mostrar a cada lado de la página actual
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index)
  }
  
  // Cargar empleados
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await EmployeeService.getEmployees({ page: 1, limit: 100 })
        setEmployees(response.data)
      } catch (err: any) {
        console.error("Error al cargar empleados:", err)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los empleados"
        })
      }
    }
    
    fetchEmployees()
  }, [refreshFlag, toast])
  
  // Seleccionar/deseleccionar todos los leads
  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead._id || ""))
    }
  }
  
  // Seleccionar/deseleccionar un lead
  const toggleSelectLead = (leadId: string) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId))
    } else {
      setSelectedLeads([...selectedLeads, leadId])
    }
  }
  
  // Función para refrescar los datos
  const handleRefresh = () => {
    setRefreshFlag(prev => prev + 1)
  }
  
  // Asignar leads seleccionados a un empleado
  const handleAssignLeads = async () => {
    if (!selectedEmployee || selectedLeads.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debe seleccionar un empleado y al menos un lead"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Asignar cada lead seleccionado al empleado elegido
      for (const leadId of selectedLeads) {
        await leadService.assignLead(leadId, selectedEmployee)
      }
      
      toast({
        title: "Éxito",
        description: `${selectedLeads.length} lead(s) asignados correctamente`
      })
      
      // Limpiar selecciones y cerrar diálogo
      setShowAssignDialog(false)
      setSelectedLeads([])
      setSelectedEmployee("")
      
      // Refrescar la lista de leads
      handleRefresh()
    } catch (error: any) {
      console.error("Error al asignar leads:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudieron asignar los leads seleccionados"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Obtener texto de estado
  const getStatusText = (status: string) => {
    switch (status) {
      case "nuevo": return "Nuevo"
      case "aprobado": return "Aprobado"
      case "rechazado": return "Rechazado"
      case "asignado": return "Asignado"
      case "convertido": return "Convertido"
      case "anulado": return "Anulado"
      default: return status
    }
  }
  
  // Función para obtener el texto de la fuente del lead
  const getSourceText = (source: string) => {
    switch (source) {
      case "sitio_web": return "Sitio Web"
      case "formulario_web": return "Formulario Web"
      case "referido": return "Referido"
      case "redes_sociales": return "Redes Sociales"
      case "evento": return "Evento"
      case "linkedin": return "LinkedIn"
      case "facebook": return "Facebook"
      case "referencia": return "Referencia"
      case "llamada_entrante": return "Llamada"
      default: return source || "Desconocida"
    }
  }
  
  // Obtener color de badge para prioridad
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "alta":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Alta</Badge>
      case "media":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Media</Badge>
      case "baja":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Baja</Badge>
      default:
        return <Badge variant="outline">{priority || "No definida"}</Badge>
    }
  }
  
  // Obtener color de badge para estado
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "nuevo":
        return "bg-blue-950/30 text-blue-400 border border-blue-800/30"
      case "aprobado":
        return "bg-green-950/30 text-green-400 border border-green-800/30"
      case "rechazado":
        return "bg-red-950/30 text-red-400 border border-red-800/30"
      case "asignado":
        return "bg-purple-950/30 text-purple-400 border border-purple-800/30"
      case "convertido":
        return "bg-amber-950/30 text-amber-400 border border-amber-800/30"
      case "anulado":
        return "bg-orange-950/30 text-orange-400 border border-orange-800/30"
      default:
        return "bg-slate-950/30 text-slate-400 border border-slate-800/30"
    }
  }
  
  // Función para formatear fecha
  const formatDate = (date?: Date | string) => {
    if (!date) return "N/A";
    
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  // Función para obtener nombre del empleado
  const getEmployeeName = (assignedTo?: string | Employee | any) => {
    if (!assignedTo) return null;
    
    if (typeof assignedTo === 'string') {
      // Buscar el empleado por su ID
      const employee = employees.find(emp => emp._id === assignedTo);
      return employee ? `${employee.firstName} ${employee.lastName}` : "Desconocido";
    } else {
      // Si ya es un objeto con firstName y lastName
      return assignedTo.firstName && assignedTo.lastName 
        ? `${assignedTo.firstName} ${assignedTo.lastName}`
        : assignedTo.name || "Desconocido"; // Compatibilidad con ambos tipos
    }
  }
  
  // Función para obtener iniciales del empleado
  const getEmployeeInitials = (assignedTo?: string | Employee | any) => {
    if (!assignedTo) return "";
    
    if (typeof assignedTo === 'string') {
      const employee = employees.find(emp => emp._id === assignedTo);
      if (employee) {
        return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
      }
      return "";
    } else {
      // Si ya es un objeto con firstName y lastName
      if (assignedTo.firstName && assignedTo.lastName) {
        return `${assignedTo.firstName.charAt(0)}${assignedTo.lastName.charAt(0)}`.toUpperCase();
      }
      // Compatibilidad con formato antiguo
      return assignedTo.name ? assignedTo.name.charAt(0).toUpperCase() : "";
    }
  }
  
  // Función para desasignar un lead
  const handleUnassignLead = async (leadId: string) => {
    setIsLoading(true)
    
    try {
      await leadService.unassignLead(leadId)
      
      toast({
        title: "Éxito",
        description: "Lead desasignado correctamente"
      })
      
      // Refrescar la lista de leads
      handleRefresh()
    } catch (error: any) {
      console.error("Error al desasignar lead:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo desasignar el lead"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Función para eliminar un lead individual
  const handleDeleteLead = async (leadId: string) => {
    setIsLoading(true)
    
    try {
      await leadService.deleteLead(leadId)
      
      toast({
        title: "Éxito",
        description: "Lead eliminado correctamente"
      })
      
      // Refrescar la lista de leads
      handleRefresh()
      
      // Si hay leads seleccionados, actualizar la lista
      if (selectedLeads.includes(leadId)) {
        setSelectedLeads(prev => prev.filter(id => id !== leadId))
      }
    } catch (error: any) {
      console.error("Error al eliminar lead:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo eliminar el lead"
      })
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
      setLeadToDelete(null)
    }
  }
  
  // Función para eliminar múltiples leads
  const handleDeleteSelectedLeads = async () => {
    if (selectedLeads.length === 0) return
    
    setIsLoading(true)
    
    try {
      // Eliminar cada lead seleccionado en secuencia
      const promises = selectedLeads.map(leadId => leadService.deleteLead(leadId))
      await Promise.all(promises)
      
      toast({
        title: "Éxito",
        description: `${selectedLeads.length} leads eliminados correctamente`
      })
      
      // Refrescar la lista de leads
      handleRefresh()
      
      // Limpiar la selección
      setSelectedLeads([])
    } catch (error: any) {
      console.error("Error al eliminar leads:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudieron eliminar los leads"
      })
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }
  
  // Función para truncar texto y abrir modal
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }
  
  // Función para abrir el modal de razón de anulación
  const handleShowAnnulationReason = (reason: string) => {
    setSelectedAnnulationReason(reason)
    setShowAnnulationReasonModal(true)
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <div className="mx-auto max-w-full space-y-4 sm:space-y-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Administración de Leads</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Gestiona los leads, asignaciones y aprobaciones</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                  onClick={handleRefresh}
                >
                  <RefreshCcw className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Actualizar</span>
                </Button>
                {canAssignLeads && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                    onClick={() => router.push('/admin/leads/asignar')}
                  >
                    <UserCheck className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Asignación</span>
                  </Button>
                )}
                {canApproveLeads && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                    onClick={() => router.push('/admin/leads/aprobar')}
                  >
                    <ShieldCheck className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Aprobación</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                  onClick={() => router.push('/leads/import')}
                >
                  <Upload className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Importar Leads</span>
                </Button>
              </div>
            </div>
            
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Leads</p>
                    <h3 className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-200">{totalLeads}</h3>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-200 dark:bg-yellow-800 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Por Aprobar</p>
                    <h3 className="mt-1 text-2xl font-bold text-yellow-700 dark:text-yellow-200">{pendingApprovalCount}</h3>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
                <CardContent className="p-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Aprobados</p>
                    <h3 className="mt-1 text-2xl font-bold text-green-700 dark:text-green-200">{approvedCount}</h3>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-red-200 dark:border-red-800">
                <CardContent className="p-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">Desaprobados</p>
                    <h3 className="mt-1 text-2xl font-bold text-red-700 dark:text-red-200">{disapprovedCount}</h3>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Empleados</p>
                    <h3 className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-200">{employees.length}</h3>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Pestañas principales */}
            <Tabs defaultValue="all-leads" onValueChange={setActiveTab} className="space-y-4">
              <div className="overflow-x-auto pb-1">
                <TabsList className="w-auto inline-flex min-w-max">
                  <TabsTrigger value="all-leads" className="text-xs sm:text-sm whitespace-nowrap">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Todos los Leads</span>
                  </TabsTrigger>
                  <TabsTrigger value="unassigned" className="text-xs sm:text-sm whitespace-nowrap">
                    <User className="mr-2 h-4 w-4" />
                    <span>Sin Asignar (Aprobados)</span>
                  </TabsTrigger>
                  <TabsTrigger value="disapproved" className="text-xs sm:text-sm whitespace-nowrap">
                    <XCircle className="mr-2 h-4 w-4" />
                    <span>Desaprobados</span>
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="text-xs sm:text-sm whitespace-nowrap">
                    <Ban className="mr-2 h-4 w-4" />
                    <span>Anulados</span>
                  </TabsTrigger>
                  <TabsTrigger value="employees" className="text-xs sm:text-sm whitespace-nowrap">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Empleados</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Filtros y Búsqueda */}
              {(activeTab === "all-leads" || activeTab === "unassigned") && (
                <Card className="overflow-visible">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Buscar leads..."
                          className="bg-background pl-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos los estados</SelectItem>
                            <SelectItem value="nuevo">Nuevo</SelectItem>
                            <SelectItem value="aprobado">Aprobado</SelectItem>
                            <SelectItem value="rechazado">Rechazado</SelectItem>
                            <SelectItem value="asignado">Asignado</SelectItem>
                            <SelectItem value="convertido">Convertido</SelectItem>
                            <SelectItem value="anulado">Anulado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Select value={assignedFilter} onValueChange={setAssignedFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Asignación" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="asignados">Asignados</SelectItem>
                            <SelectItem value="no_asignados">Sin Asignar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Contenido: Todos los leads */}
              <TabsContent value="all-leads" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    {/* Tabla de leads */}
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px]">
                              <Checkbox 
                                checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0} 
                                onCheckedChange={toggleSelectAll}
                              />
                            </TableHead>
                            <TableHead>Lead</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead className="w-[150px]">Origen</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Asignado a</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={8} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                  <p className="text-muted-foreground">Cargando leads...</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : filteredLeads.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="h-24 text-center">
                                No se encontraron leads que coincidan con los criterios de búsqueda.
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
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarFallback>{lead.firstName[0]}{lead.lastName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        {lead.company ? (
                                          <>
                                            <Building className="h-3 w-3" />
                                            <span>{lead.company}</span>
                                          </>
                                        ) : (
                                          <>
                                            <Mail className="h-3 w-3" />
                                            <span>{lead.email}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getStatusBadgeClasses(lead.status)}>
                                    {getStatusText(lead.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {getPriorityBadge(lead.priority || "")}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {getSourceText(lead.source || "")}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(lead.captureDate)}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDate(lead.lastActivity)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {lead.assignedTo ? (
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-7 w-7">
                                        <AvatarFallback className="bg-primary text-white text-xs">
                                          {getEmployeeInitials(lead.assignedTo)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="text-xs">
                                        {getEmployeeName(lead.assignedTo)}
                                      </div>
                                    </div>
                                  ) : (
                                    <Badge variant="outline" className="text-gray-500 border-dashed">
                                      Sin asignar
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Acciones</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {/* Botón Aprobar - visible si el lead es nuevo o rechazado */}
                                      {(lead.status === "nuevo" || lead.status === "rechazado") && canApproveLeads && (
                                        <DropdownMenuItem onClick={async () => {
                                          try {
                                            await leadService.approveLead(lead._id || "");
                                            toast({
                                              title: "Lead aprobado",
                                              description: "El lead ha sido aprobado exitosamente"
                                            });
                                            handleRefresh();
                                          } catch (err: any) {
                                            toast({
                                              variant: "destructive",
                                              title: "Error",
                                              description: err.response?.data?.message || "No se pudo aprobar el lead"
                                            });
                                          }
                                        }}>
                                          <Check className="mr-2 h-4 w-4 text-green-500" />
                                          <span>Aprobar</span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Botón Desaprobar - visible si el lead es nuevo o está aprobado pero sin asignar */}
                                      {(lead.status === "nuevo" || (lead.status === "aprobado" && !lead.assignedTo)) && canRejectLeads && (
                                        <DropdownMenuItem onClick={async () => {
                                          try {
                                            await leadService.rejectLead(lead._id || "", "Rechazado desde panel de administración");
                                            toast({
                                              title: "Lead rechazado",
                                              description: "El lead ha sido rechazado exitosamente"
                                            });
                                            handleRefresh();
                                          } catch (err: any) {
                                            toast({
                                              variant: "destructive",
                                              title: "Error",
                                              description: err.response?.data?.message || "No se pudo rechazar el lead"
                                            });
                                          }
                                        }}>
                                          <X className="mr-2 h-4 w-4 text-red-500" />
                                          <span>Rechazar</span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Botón Asignar - visible si el lead está aprobado */}
                                      {lead.status === "aprobado" && canAssignLeads && (
                                        <DropdownMenuItem onClick={() => {
                                          setSelectedLeads([lead._id || ""]);
                                          setShowAssignDialog(true);
                                        }}>
                                          <UserPlus className="mr-2 h-4 w-4" />
                                          <span>Asignar</span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Botón Ver detalles - visible solo si tiene permiso de lectura */}
                                      {canReadLeads && (
                                        <DropdownMenuItem onClick={() => router.push(`/leads/${lead._id}`)}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          <span>Ver Detalles</span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Botón Editar - visible solo si tiene permiso de actualización */}
                                      {canUpdateLeads && (
                                        <DropdownMenuItem onClick={() => router.push(`/leads/${lead._id}/edit`)}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          <span>Editar</span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Botón Desasignar - visible si el lead está asignado */}
                                      {lead.assignedTo && canAssignLeads && (
                                        <DropdownMenuItem onClick={() => handleUnassignLead(lead._id || "")}>
                                          <UserMinus className="mr-2 h-4 w-4" />
                                          <span>Desasignar</span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Botón Eliminar - visible solo si tiene permiso de eliminación */}
                                      {canDeleteLeads && (
                                        <DropdownMenuItem 
                                          onClick={() => {
                                            setLeadToDelete(lead._id || "");
                                            setShowDeleteDialog(true);
                                          }}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          <span>Eliminar</span>
                                        </DropdownMenuItem>
                                      )}
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
                
                {/* Paginación Mejorada */}
                {(totalPages > 1 || totalLeads > 0) && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Información de paginación y selector de elementos por página */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>
                              Mostrando{" "}
                              <span className="font-medium">
                                {((currentPage - 1) * itemsPerPage) + 1}
                              </span>{" "}
                              a{" "}
                              <span className="font-medium">
                                {Math.min(currentPage * itemsPerPage, totalLeads)}
                              </span>{" "}
                              de{" "}
                              <span className="font-medium">{totalLeads}</span> leads
                            </span>
                            {isLoading && (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Mostrar:</span>
                            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                              <SelectTrigger className="w-20 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground">por página</span>
                          </div>
                        </div>

                        {/* Controles de navegación - Solo mostrar si hay más de una página */}
                        {totalPages > 1 && (
                          <div className="flex items-center gap-1">
                            {/* Botón Primera Página */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={goToFirstPage}
                              disabled={currentPage === 1}
                              title="Primera página"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <ChevronLeft className="h-4 w-4 -ml-2" />
                            </Button>

                            {/* Botón Página Anterior */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={goToPreviousPage}
                              disabled={currentPage === 1}
                              title="Página anterior"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {/* Números de página */}
                            <div className="flex items-center gap-1">
                              {getPageNumbers().map((pageNumber, index) => (
                                <div key={index}>
                                  {pageNumber === '...' ? (
                                    <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
                                  ) : (
                                    <Button
                                      variant={currentPage === pageNumber ? "default" : "outline"}
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handlePageChange(pageNumber as number)}
                                    >
                                      {pageNumber}
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Botón Página Siguiente */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={goToNextPage}
                              disabled={currentPage === totalPages}
                              title="Página siguiente"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>

                            {/* Botón Última Página */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={goToLastPage}
                              disabled={currentPage === totalPages}
                              title="Última página"
                            >
                              <ChevronRight className="h-4 w-4" />
                              <ChevronRight className="h-4 w-4 -ml-2" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Información adicional en móvil */}
                      <div className="mt-3 lg:hidden text-center">
                        <span className="text-sm text-muted-foreground">
                          Página {currentPage} de {totalPages}
                          {isLoading && (
                            <span className="ml-2 inline-flex items-center">
                              <Loader2 className="h-3 w-3 animate-spin" />
                            </span>
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Contenido: Leads sin asignar */}
              <TabsContent value="unassigned" className="space-y-4">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px]">
                              <Checkbox
                                checked={filteredLeads.filter(lead => !lead.assignedTo && lead.isApproved === true).length > 0 && 
                                  filteredLeads.filter(lead => !lead.assignedTo && lead.isApproved === true).every(lead => 
                                    selectedLeads.includes(lead._id || "")
                                  )}
                                onCheckedChange={() => {
                                  const unassignedApprovedLeads = filteredLeads.filter(lead => !lead.assignedTo && lead.isApproved === true);
                                  if (unassignedApprovedLeads.every(lead => selectedLeads.includes(lead._id || ""))) {
                                    setSelectedLeads(prev => prev.filter(id => 
                                      !unassignedApprovedLeads.some(lead => lead._id === id)
                                    ));
                                  } else {
                                    setSelectedLeads(prev => [
                                      ...prev,
                                      ...unassignedApprovedLeads
                                        .filter(lead => !selectedLeads.includes(lead._id || ""))
                                        .map(lead => lead._id || "")
                                    ]);
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead className="w-[250px]">Nombre</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead className="w-[180px]">Origen</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center">
                                <div className="flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                  <span className="ml-2">Cargando leads...</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : filteredLeads.filter(lead => !lead.assignedTo && lead.isApproved === true).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                  <CheckCircle className="h-10 w-10 text-green-500" />
                                  <h3 className="mt-4 text-lg font-medium">¡Todos los leads han sido asignados!</h3>
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    No hay leads aprobados pendientes de asignación en este momento.
                                  </p>
                                  <Button 
                                    size="sm" 
                                    className="mt-4 bg-primary hover:bg-primary/90"
                                    onClick={() => router.push('/leads/nuevo')}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span>Crear Nuevo Lead</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredLeads.filter(lead => !lead.assignedTo && lead.isApproved === true).map((lead) => (
                              <TableRow key={lead._id} className={selectedLeads.includes(lead._id || "") ? "bg-primary/5" : ""}>
                                <TableCell>
                                  <Checkbox 
                                    checked={selectedLeads.includes(lead._id || "")}
                                    onCheckedChange={() => toggleSelectLead(lead._id || "")}
                                    aria-label={`Seleccionar ${lead.firstName}`}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>{`${lead.firstName.charAt(0)}${lead.lastName?.charAt(0) || ""}`.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{`${lead.firstName} ${lead.lastName}`}</div>
                                      {lead.company && <div className="text-xs text-muted-foreground">{lead.company}</div>}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col text-xs">
                                    <span>{lead.email}</span>
                                    {lead.phone && <span>{lead.phone}</span>}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getStatusBadgeClasses(lead.status)}>
                                    {getStatusText(lead.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {getPriorityBadge(lead.priority || "")}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {getSourceText(lead.source || "")}
                                  </Badge>
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
                                      {/* Botón Aprobar - visible si el lead es nuevo o rechazado */}
                                      {(lead.status === "nuevo" || lead.status === "rechazado") && canApproveLeads && (
                                        <DropdownMenuItem onClick={async () => {
                                          try {
                                            await leadService.approveLead(lead._id || "");
                                            toast({
                                              title: "Lead aprobado",
                                              description: "El lead ha sido aprobado exitosamente"
                                            });
                                            handleRefresh();
                                          } catch (err: any) {
                                            toast({
                                              variant: "destructive",
                                              title: "Error",
                                              description: err.response?.data?.message || "No se pudo aprobar el lead"
                                            });
                                          }
                                        }}>
                                          <Check className="mr-2 h-4 w-4 text-green-500" />
                                          <span>Aprobar</span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Botón Desaprobar - visible si el lead es nuevo o está aprobado pero sin asignar */}
                                      {(lead.status === "nuevo" || (lead.status === "aprobado" && !lead.assignedTo)) && canRejectLeads && (
                                        <DropdownMenuItem onClick={async () => {
                                          try {
                                            await leadService.rejectLead(lead._id || "", "Rechazado desde panel de administración");
                                            toast({
                                              title: "Lead rechazado",
                                              description: "El lead ha sido rechazado exitosamente"
                                            });
                                            handleRefresh();
                                          } catch (err: any) {
                                            toast({
                                              variant: "destructive",
                                              title: "Error",
                                              description: err.response?.data?.message || "No se pudo rechazar el lead"
                                            });
                                          }
                                        }}>
                                          <X className="mr-2 h-4 w-4 text-red-500" />
                                          <span>Rechazar</span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Botón Asignar - visible si el lead está aprobado */}
                                      {lead.status === "aprobado" && canAssignLeads && (
                                        <DropdownMenuItem onClick={() => {
                                          setSelectedLeads([lead._id || ""]);
                                          setShowAssignDialog(true);
                                        }}>
                                          <UserPlus className="mr-2 h-4 w-4" />
                                          <span>Asignar</span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Botón Ver detalles - visible solo si tiene permiso de lectura */}
                                      {canReadLeads && (
                                        <DropdownMenuItem onClick={() => router.push(`/leads/${lead._id}`)}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          <span>Ver Detalles</span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Botón Editar - visible solo si tiene permiso de actualización */}
                                      {canUpdateLeads && (
                                        <DropdownMenuItem onClick={() => router.push(`/leads/${lead._id}/edit`)}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          <span>Editar</span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Botón Desasignar - visible si el lead está asignado */}
                                      {lead.assignedTo && canAssignLeads && (
                                        <DropdownMenuItem onClick={() => handleUnassignLead(lead._id || "")}>
                                          <UserMinus className="mr-2 h-4 w-4" />
                                          <span>Desasignar</span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Botón Eliminar - visible solo si tiene permiso de eliminación */}
                                      {canDeleteLeads && (
                                        <DropdownMenuItem 
                                          onClick={() => {
                                            setLeadToDelete(lead._id || "");
                                            setShowDeleteDialog(true);
                                          }}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          <span>Eliminar</span>
                                        </DropdownMenuItem>
                                      )}
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
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Mostrando <span className="font-medium">{filteredLeads.filter(lead => !lead.assignedTo && lead.isApproved === true).length}</span> de{" "}
                      <span className="font-medium">{leads.filter(lead => !lead.assignedTo && lead.isApproved === true).length}</span> leads sin asignar
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Página anterior</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Página siguiente</span>
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Contenido: Leads desaprobados */}
              <TabsContent value="disapproved" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Leads Desaprobados</CardTitle>
                    <CardDescription>
                      Leads que han sido rechazados durante el proceso de aprobación
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px]">
                              <Checkbox
                                checked={filteredLeads.filter(lead => lead.isApproved === false && lead.status !== 'nuevo').length > 0 && 
                                  filteredLeads.filter(lead => lead.isApproved === false && lead.status !== 'nuevo').every(lead => 
                                    selectedLeads.includes(lead._id || "")
                                  )}
                                onCheckedChange={() => {
                                  const disapprovedLeads = filteredLeads.filter(lead => lead.isApproved === false && lead.status !== 'nuevo');
                                  if (disapprovedLeads.every(lead => selectedLeads.includes(lead._id || ""))) {
                                    setSelectedLeads(prev => prev.filter(id => 
                                      !disapprovedLeads.some(lead => lead._id === id)
                                    ));
                                  } else {
                                    setSelectedLeads(prev => [
                                      ...prev,
                                      ...disapprovedLeads
                                        .filter(lead => !selectedLeads.includes(lead._id || ""))
                                        .map(lead => lead._id || "")
                                    ]);
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Fecha Rechazo</TableHead>
                            <TableHead>Razón</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                <div className="flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                  <span className="ml-2">Cargando leads desaprobados...</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : filteredLeads.filter(lead => lead.isApproved === false && lead.status !== 'nuevo').length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                  <CheckCircle className="h-10 w-10 text-green-500" />
                                  <h3 className="mt-4 text-lg font-medium">¡No hay leads desaprobados!</h3>
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    No hay leads que hayan sido rechazados en el proceso de aprobación.
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredLeads.filter(lead => lead.isApproved === false && lead.status !== 'nuevo').map((lead) => (
                              <TableRow key={lead._id} className={selectedLeads.includes(lead._id || "") ? "bg-primary/5" : ""}>
                                <TableCell>
                                  <Checkbox 
                                    checked={selectedLeads.includes(lead._id || "")}
                                    onCheckedChange={() => toggleSelectLead(lead._id || "")}
                                    aria-label={`Seleccionar ${lead.firstName}`}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>{`${lead.firstName.charAt(0)}${lead.lastName?.charAt(0) || ""}`.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{`${lead.firstName} ${lead.lastName}`}</div>
                                      {lead.company && <div className="text-xs text-muted-foreground">{lead.company}</div>}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col text-xs">
                                    <span>{lead.email}</span>
                                    {lead.phone && <span>{lead.phone}</span>}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {formatDate(lead.updatedAt)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-red-50 text-red-800">
                                    {lead.interactionHistory?.find(i => i.type === 'rechazo')?.description || "No especificada"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => router.push(`/leads/${lead._id}`)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => router.push(`/admin/leads/aprobar`)}
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Paginación para leads desaprobados */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Mostrando <span className="font-medium">{filteredLeads.filter(lead => lead.isApproved === false && lead.status !== 'nuevo').length}</span> de{" "}
                      <span className="font-medium">{totalLeads}</span> leads desaprobados
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Página anterior</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Página siguiente</span>
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Contenido: Leads anulados */}
              <TabsContent value="cancelled" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Leads Anulados</CardTitle>
                    <CardDescription>
                      Leads que han sido marcados como anulados por algún empleado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px]">
                              <Checkbox
                                checked={filteredLeads.filter(lead => lead.status === 'anulado').length > 0 &&
                                  filteredLeads.filter(lead => lead.status === 'anulado').every(lead =>
                                    selectedLeads.includes(lead._id || "")
                                  )}
                                onCheckedChange={() => {
                                  const cancelledLeads = filteredLeads.filter(lead => lead.status === 'anulado');
                                  if (cancelledLeads.every(lead => selectedLeads.includes(lead._id || ""))) {
                                    setSelectedLeads(prev => prev.filter(id =>
                                      !cancelledLeads.some(lead => lead._id === id)
                                    ));
                                  } else {
                                    setSelectedLeads(prev => [
                                      ...prev,
                                      ...cancelledLeads
                                        .filter(lead => !selectedLeads.includes(lead._id || ""))
                                        .map(lead => lead._id || "")
                                    ]);
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Fecha Anulación</TableHead>
                            <TableHead>Razón</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                <div className="flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                  <span className="ml-2">Cargando leads anulados...</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : filteredLeads.filter(lead => lead.status === 'anulado').length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                  <CheckCircle className="h-10 w-10 text-green-500" />
                                  <h3 className="mt-4 text-lg font-medium">¡No hay leads anulados!</h3>
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    No se han registrado leads en estado anulado.
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredLeads.filter(lead => lead.status === 'anulado').map((lead) => (
                              <TableRow key={lead._id} className={selectedLeads.includes(lead._id || "") ? "bg-primary/5" : ""}>
                                <TableCell>
                                  <Checkbox 
                                    checked={selectedLeads.includes(lead._id || "")}
                                    onCheckedChange={() => toggleSelectLead(lead._id || "")}
                                    aria-label={`Seleccionar ${lead.firstName}`}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>{`${lead.firstName.charAt(0)}${lead.lastName?.charAt(0) || ""}`.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{`${lead.firstName} ${lead.lastName}`}</div>
                                      {lead.company && <div className="text-xs text-muted-foreground">{lead.company}</div>}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col text-xs">
                                    <span>{lead.email}</span>
                                    {lead.phone && <span>{lead.phone}</span>}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {formatDate(lead.updatedAt)}
                                </TableCell>
                                <TableCell>
                                  {(() => {
                                    const reason = (lead as any).annulationReason || (lead as any).reason || "No especificada"
                                    const truncatedReason = truncateText(reason, 50)
                                    const isLong = reason.length > 50
                                    
                                    return (
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-orange-50 text-orange-800">
                                          {truncatedReason}
                                        </Badge>
                                        {isLong && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                                            onClick={() => handleShowAnnulationReason(reason)}
                                          >
                                            Ver más
                                          </Button>
                                        )}
                                      </div>
                                    )
                                  })()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => router.push(`/leads/${lead._id}`)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Paginación para leads anulados */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Mostrando <span className="font-medium">{filteredLeads.filter(lead => lead.status === 'anulado').length}</span> de{" "}
                      <span className="font-medium">{totalLeads}</span> leads anulados
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Página anterior</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Página siguiente</span>
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Contenido: Empleados y asignaciones */}
              <TabsContent value="employees">
                <Card>
                  <CardHeader>
                    <CardTitle>Empleados y distribución de leads</CardTitle>
                    <CardDescription>
                      Visualiza los empleados y sus leads asignados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="flex items-center space-x-2">
                          <Input 
                            placeholder="Buscar empleados..." 
                            className="w-[250px]" 
                          />
                          <Button variant="outline" size="sm" className="h-9">
                            <Filter className="mr-2 h-4 w-4" />
                            <span>Filtros</span>
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select defaultValue="all">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Departamento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos los departamentos</SelectItem>
                              <SelectItem value="sales">Ventas</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="cs">Atención al cliente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Empleado</TableHead>
                              <TableHead>Departamento</TableHead>
                              <TableHead>Cargo</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isLoading ? (
                              <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                  <div className="flex flex-col items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                    <p className="text-muted-foreground">Cargando empleados...</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : employees.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                  <div className="flex flex-col items-center justify-center">
                                    <User className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No hay empleados disponibles</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : (
                              employees.map((employee) => (
                                <TableRow key={employee._id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-9 w-9">
                                        <AvatarFallback>{employee.firstName.charAt(0)}{employee.lastName.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                        <div className="text-xs text-muted-foreground">{employee.email}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>{employee.department || "No asignado"}</TableCell>
                                  <TableCell>{employee.position || "No especificado"}</TableCell>
                                  <TableCell>
                                    {employee.isActive ? (
                                      <Badge className="bg-green-100 text-green-800">Activo</Badge>
                                    ) : (
                                      <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => router.push(`/admin/empleados/${employee._id}`)}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      <span>Ver</span>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Diálogo para asignar leads */}
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Asignar Leads a Empleado</DialogTitle>
                  <DialogDescription>
                    Selecciona un empleado para asignarle {selectedLeads.length} lead(s)
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee">Empleado</Label>
                      <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger id="employee">
                          <SelectValue placeholder="Selecciona un empleado" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.length === 0 ? (
                            <SelectItem value="no-employees" disabled>
                              No hay empleados disponibles
                            </SelectItem>
                          ) : (
                            employees.filter(emp => emp.isActive).map((employee) => (
                              <SelectItem key={employee._id} value={employee._id}>
                                {employee.firstName} {employee.lastName} - {employee.position}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Leads seleccionados:</Label>
                      <ScrollArea className="h-[120px] rounded-md border mt-2">
                        <div className="p-4">
                          <ul className="space-y-2">
                            {selectedLeads.map(leadId => {
                              const lead = filteredLeads.find(l => l._id === leadId);
                              return (
                                <li key={leadId} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  {lead ? `${lead.firstName} ${lead.lastName}` : leadId}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAssignLeads} 
                    disabled={!selectedEmployee || selectedLeads.length === 0 || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 animate-spin" />
                        Asignando...
                      </>
                    ) : (
                      "Asignar Leads"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog para confirmar la eliminación */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Eliminar {leadToDelete ? "Lead" : `${selectedLeads.length} Leads`}</DialogTitle>
                  <DialogDescription>
                    {leadToDelete 
                      ? "¿Estás seguro de que deseas eliminar este lead? Esta acción no se puede deshacer."
                      : `¿Estás seguro de que deseas eliminar ${selectedLeads.length} leads seleccionados? Esta acción no se puede deshacer.`
                    }
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setLeadToDelete(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (leadToDelete) {
                        handleDeleteLead(leadToDelete);
                      } else {
                        handleDeleteSelectedLeads();
                      }
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 animate-spin" />
                        <span>Eliminando...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4" />
                        <span>Eliminar</span>
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Modal para mostrar la razón completa de anulación */}
            <Dialog open={showAnnulationReasonModal} onOpenChange={setShowAnnulationReasonModal}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Ban className="h-5 w-5 text-orange-600" />
                    Razón de Anulación
                  </DialogTitle>
                  <DialogDescription>
                    Motivo detallado por el cual se anuló este lead
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                      {selectedAnnulationReason}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => setShowAnnulationReasonModal(false)}
                    className="w-full sm:w-auto"
                  >
                    Cerrar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
} 