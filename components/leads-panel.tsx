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
  Building2,
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined)
  const [refreshFlag, setRefreshFlag] = useState(0)

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
          limit: 10,
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
  }, [currentPage, searchTerm, statusFilter, priorityFilter, refreshFlag, employee])

  const handleRefresh = () => {
    setRefreshFlag(prev => prev + 1)
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

  const handleConvertToPersonalClient = async (leadId: string | undefined) => {
    if (!leadId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se puede convertir un lead sin ID"
      });
      return;
    }

    router.push(`/leads/${leadId}/convertir`);
  };

  const handleConvertToBusinessClient = async (leadId: string | undefined) => {
    if (!leadId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se puede convertir un lead sin ID"
      });
      return;
    }

    router.push(`/leads/${leadId}/convertir`);
  };

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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Mis Leads</h1>
          <p className="text-muted-foreground">Gestiona los leads asignados a ti</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={() => router.push('/docs?section=leads')}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Documentación</span>
          </Button>
          
          {canImportLeads && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9"
              onClick={() => router.push('/leads/import')}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Importar</span>
            </Button>
          )}
          
          <Button 
            size="sm" 
            className="h-9 bg-primary hover:bg-primary/90"
            onClick={() => router.push('/leads/nuevo')}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Nuevo Lead</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <h3 className="mt-1 text-2xl font-bold">{totalLeads}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <User className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nuevos</p>
                <h3 className="mt-1 text-2xl font-bold">{totalNewLeads}</h3>
              </div>
              <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
                <User className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Proceso</p>
                <h3 className="mt-1 text-2xl font-bold">{totalInProcessLeads}</h3>
              </div>
              <div className="rounded-full bg-purple-500/10 p-2 text-purple-500">
                <User className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Calificados</p>
                <h3 className="mt-1 text-2xl font-bold">{totalQualifiedLeads}</h3>
              </div>
              <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                <User className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
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
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter || "all"} onValueChange={val => setStatusFilter(val === "all" ? undefined : val)}>
                <SelectTrigger>
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
                <SelectTrigger>
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
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={leads.length > 0 && selectedLeads.length === leads.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Seleccionar todos"
                    />
                  </TableHead>
                  <TableHead className="w-[250px]">Nombre</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Cargando leads...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <User className="h-10 w-10 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No tienes leads asignados</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {employee ? 
                            "No tienes leads asignados actualmente. Contacta a un administrador para que te asigne leads." :
                            "Debes iniciar sesión para ver tus leads asignados."
                          }
                        </p>
                        {employee && (
                          <Button 
                            size="sm" 
                            className="mt-4 bg-primary hover:bg-primary/90"
                            onClick={() => router.push('/leads/nuevo')}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Crear Nuevo Lead</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead._id} className="h-[64px]">
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
                            <AvatarFallback>
                              {`${lead.firstName.charAt(0)}${lead.lastName?.charAt(0) || ""}`.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{`${lead.firstName} ${lead.lastName}`}</div>
                            {lead.company && <div className="text-xs text-muted-foreground">{lead.company}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(lead.status)}>
                          {lead.currentStage || "No definida"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPriorityColor(lead.priority || "media")}>
                          {lead.priority === "alta" ? "Alta" : lead.priority === "baja" ? "Baja" : "Media"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
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
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => router.push(`/leads/${lead._id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Ver Detalles</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/leads/${lead._id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleConvertToPersonalClient(lead._id)}
                            >
                              <User className="mr-2 h-4 w-4" />
                              <span>Convertir a Cliente Personal</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleConvertToBusinessClient(lead._id)}
                            >
                              <Building2 className="mr-2 h-4 w-4" />
                              <span>Convertir a Cliente Empresa</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(lead._id || "")}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium">{leads.length}</span> de{" "}
            <span className="font-medium">{totalLeads}</span> leads
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
    </div>
  )
}
