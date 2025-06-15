"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Upload,
  FileText,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  Bell,
  User,
  AlertCircle,
  Loader2,
  Plus,
  Pencil,
  UserMinus,
  FileSpreadsheet
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation"
import { Lead } from "@/lib/types/lead"
import { leadService } from "@/lib/services/leadService"
import { toast } from "@/components/ui/use-toast"
import { clientService } from "../lib/services/clientService"
import { AvatarImage } from "@radix-ui/react-avatar"
import { useAuth } from "@/contexts/auth-context"
import useHasPermission from "@/hooks/useHasPermission"

export default function LeadsPanel() {
  const router = useRouter()
  const { employee } = useAuth()
  const canImportLeads = useHasPermission("leads:import")
  const [leads, setLeads] = useState<Lead[]>([])
  const [totalLeads, setTotalLeads] = useState(0)
  const [totalNewLeads, setTotalNewLeads] = useState(0)
  const [totalInProcessLeads, setTotalInProcessLeads] = useState(0)
  const [totalQualifiedLeads, setTotalQualifiedLeads] = useState(0)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined)
  const [refreshFlag, setRefreshFlag] = useState(0)
  // Estado para control de visualización en móvil
  const [showFilters, setShowFilters] = useState(false)

  // Cargar leads desde API
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Solo obtener leads asignados al empleado actual
        const result = await leadService.getLeads({
          status: statusFilter,
          priority: priorityFilter as 'baja' | 'media' | 'alta' | undefined,
          search: searchTerm,
          page: currentPage,
          limit: itemsPerPage,
          assignedTo: employee?._id // Filtrar por el ID del empleado actual
        })
        
        console.log("Leads recibidos:", result.data);
        
        setLeads(result.data)
        setTotalLeads(result.total)
        setTotalPages(result.pages)
        
        // Calcular estadísticas
        const newLeads = result.data.filter(lead => lead.status === 'nuevo').length
        const inProcessLeads = result.data.filter(lead => lead.status === 'en_proceso').length
        const qualifiedLeads = result.data.filter(lead => lead.status === 'calificado').length
        
        setTotalNewLeads(newLeads)
        setTotalInProcessLeads(inProcessLeads)
        setTotalQualifiedLeads(qualifiedLeads)
      } catch (err: any) {
        console.error("Error al cargar leads:", err)
        setError(err.response?.data?.message || "No se pudieron cargar los leads. Por favor, intente de nuevo.")
      } finally {
        setLoading(false)
      }
    }
    
    if (employee) {
      fetchLeads()
    } else {
      setLoading(false)
      setError("Debes iniciar sesión para ver tus leads asignados.")
    }
  }, [currentPage, searchTerm, statusFilter, priorityFilter, refreshFlag, employee, itemsPerPage])

  const handleRefresh = () => {
    setRefreshFlag(prev => prev + 1)
  }

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
  }, [searchTerm, statusFilter, priorityFilter])

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

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este lead?")) {
      try {
        await leadService.deleteLead(id)
        toast({
          title: "Lead eliminado",
          description: "El lead ha sido eliminado exitosamente"
        })
        handleRefresh()
      } catch (err: any) {
        console.error("Error al eliminar lead:", err)
        toast({
          variant: "destructive",
          title: "Error",
          description: err.response?.data?.message || "No se pudo eliminar el lead"
        })
      }
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await leadService.updateStatus(id, {
        status: newStatus,
        currentStage: leads.find(lead => lead._id === id)?.currentStage || 'conciencia',
        date: new Date(),
        reason: `Cambio manual de estado a ${newStatus}`,
        user: "" // Se rellenará en el backend con el usuario actual
      })
      toast({
        title: "Estado actualizado",
        description: `El estado del lead ha sido actualizado a ${newStatus}`
      })
      handleRefresh()
    } catch (err: any) {
      console.error("Error al actualizar estado:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "No se pudo actualizar el estado del lead"
      })
    }
  }



  const toggleSelectLead = (id: string) => {
    setSelectedLeads((prev) => (prev.includes(id) ? prev.filter((leadId) => leadId !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map((lead) => lead._id || ""))
    }
  }

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-100 text-red-800"
      case "media":
        return "bg-amber-100 text-amber-800"
      case "baja":
        return "bg-green-100 text-green-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
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
      case "en_proceso":
        return "bg-amber-100 text-amber-800"
      case "calificado":
        return "bg-green-100 text-green-800"
      case "no_calificado":
        return "bg-red-100 text-red-800"
      case "cerrado":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="w-full mx-auto max-w-full space-y-4 px-2 sm:px-4">
      {/* Encabezado */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Mis Leads</h1>
          <p className="text-sm text-muted-foreground">Gestiona los leads asignados a ti</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-2 sm:px-3"
            onClick={() => router.push('/docs?section=leads')}
          >
            <FileText className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Documentación</span>
          </Button>
          
          {canImportLeads && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-2 sm:px-3"
              onClick={() => router.push('/leads/import')}
            >
              <FileSpreadsheet className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Importar</span>
            </Button>
          )}
          
          <Button 
            size="sm" 
            className="h-9 px-2 sm:px-3 bg-primary hover:bg-primary/90"
            onClick={() => router.push('/leads/nuevo')}
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden xs:inline">Nuevo Lead</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100">Total Leads</p>
              <h3 className="mt-1 text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-200">{totalLeads}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-100">Nuevos</p>
              <h3 className="mt-1 text-lg sm:text-2xl font-bold text-emerald-700 dark:text-emerald-200">{totalNewLeads}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-100">En Proceso</p>
              <h3 className="mt-1 text-lg sm:text-2xl font-bold text-purple-700 dark:text-purple-200">{totalInProcessLeads}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100">Calificados</p>
              <h3 className="mt-1 text-lg sm:text-2xl font-bold text-green-700 dark:text-green-200">{totalQualifiedLeads}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="overflow-visible">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-auto sm:flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar leads..."
                className="bg-background pl-8 w-full h-9 text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                className="h-9 w-full sm:w-auto"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                <span>Filtros</span>
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <Select value={statusFilter || "all"} onValueChange={val => setStatusFilter(val === "all" ? undefined : val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="nuevo">Nuevo</SelectItem>
                    <SelectItem value="aprobado">Aprobado</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                    <SelectItem value="asignado">Asignado</SelectItem>
                    <SelectItem value="convertido">Convertido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={priorityFilter || "all"} onValueChange={val => setPriorityFilter(val === "all" ? undefined : val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las prioridades</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabla de Leads */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px] sm:w-[40px]">
                    <Checkbox
                      checked={leads.length > 0 && selectedLeads.length === leads.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Seleccionar todos"
                    />
                  </TableHead>
                  <TableHead className="w-[150px] sm:w-[250px]">Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Etapa</TableHead>
                  <TableHead className="hidden md:table-cell">Prioridad</TableHead>
                  <TableHead className="hidden lg:table-cell">Origen</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
                        <span className="ml-2 text-sm sm:text-base">Cargando leads...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-4 sm:p-8 text-center">
                        <User className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                        <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">No tienes leads asignados</h3>
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                          {employee ? 
                            "No tienes leads asignados actualmente. Contacta a un administrador para que te asigne leads." :
                            "Debes iniciar sesión para ver tus leads asignados."
                          }
                        </p>
                        {employee && (
                          <Button 
                            size="sm" 
                            className="mt-3 sm:mt-4 bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                            onClick={() => router.push('/leads/nuevo')}
                          >
                            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Crear Nuevo Lead</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead._id} className="h-[60px]">
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.includes(lead._id || "")}
                          onCheckedChange={() => toggleSelectLead(lead._id || "")}
                          aria-label={`Seleccionar ${lead.firstName}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                            <AvatarFallback className="text-xs sm:text-sm">
                              {`${lead.firstName.charAt(0)}${lead.lastName?.charAt(0) || ""}`.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm sm:text-base truncate max-w-[100px] sm:max-w-full">{`${lead.firstName} ${lead.lastName}`}</div>
                            {lead.company && <div className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-full">{lead.company}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={`text-xs ${getStatusColor(lead.status)}`}>
                          {lead.currentStage || "No definida"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(lead.priority || "media")}`}>
                          {lead.priority === "alta" ? "Alta" : lead.priority === "baja" ? "Baja" : "Media"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-xs sm:text-sm">
                          {lead.source === "sitio_web" ? "Sitio Web" : 
                           lead.source === "referido" ? "Referido" : 
                           lead.source === "redes_sociales" ? "Redes Sociales" : 
                           lead.source === "evento" ? "Evento" : 
                           lead.source === "anuncio" ? "Anuncio" : 
                           lead.source === "otro" ? "Otro" :
                           lead.source === "manual" ? "Manual" :
                           lead.source === "conversión de cliente" ? "Conversión de Cliente" :
                           lead.source || "No especificado"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuItem 
                              onClick={() => router.push(`/leads/${lead._id}`)}
                              className="text-xs sm:text-sm"
                            >
                              <Eye className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span>Ver Detalles</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/leads/${lead._id}/edit`)}
                              className="text-xs sm:text-sm"
                            >
                              <Edit className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDelete(lead._id || "")}
                              className="text-red-600 text-xs sm:text-sm"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span>Eliminar</span>
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
                  {loading && (
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
                {loading && (
                  <span className="ml-2 inline-flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
