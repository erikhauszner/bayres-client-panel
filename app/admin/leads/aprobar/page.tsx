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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Search, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  Info,
  Eye
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { leadService } from "@/lib/services/leadService"
import { Lead } from "@/lib/types/lead"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function AprobarLeadsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { employee } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasPermission, setHasPermission] = useState(true)

  // Verificar permisos
  useEffect(() => {
    const checkPermission = () => {
      if (!employee) {
        setHasPermission(false)
        return
      }
      
      // Verificar si el usuario tiene permiso para aprobar leads
      const permissions = employee.permissions || []
      const canApproveLeads = permissions.includes('leads:approve') || 
                             permissions.includes('leads:manage') ||
                             employee.role === 'admin'
      
      setHasPermission(canApproveLeads)
    }
    
    checkPermission()
  }, [employee])
  
  // Cargar leads pendientes de aprobación
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      
      try {
        // Cargar todos los leads y filtrar manualmente los que están pendientes de aprobación
        const response = await leadService.getLeads({
          status: 'nuevo',
          limit: 100
        })
        
        // Filtrar por estado nuevo e isApproved = false
        const pendingLeads = response.data.filter(
          lead => lead.status === 'nuevo' && !lead.isApproved
        )
        
        setLeads(pendingLeads)
      } catch (error: any) {
        console.error("Error al cargar leads:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los leads pendientes de aprobación"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [toast])
  
  // Filtrar leads según búsqueda
  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true
    
    const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
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
  
  const handleApproveSelected = async () => {
    if (!hasPermission) {
      toast({
        variant: "destructive",
        title: "Error de permisos",
        description: "No tienes permiso para aprobar leads"
      })
      return
    }
    
    if (selectedLeads.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar al menos un lead para aprobar"
      })
      return
    }
    
    setIsProcessing(true)
    
    try {
      let approvedCount = 0
      
      for (const leadId of selectedLeads) {
        await leadService.approveLead(leadId)
        approvedCount++
      }
      
      toast({
        title: "Éxito",
        description: `Se han aprobado ${approvedCount} leads correctamente`
      })
      
      // Recargar leads pendientes
      const response = await leadService.getLeads({
        status: 'nuevo',
        limit: 100
      })
      
      const pendingLeads = response.data.filter(
        lead => lead.status === 'nuevo' && !lead.isApproved
      )
      
      setLeads(pendingLeads)
      setSelectedLeads([])
    } catch (error: any) {
      console.error("Error al aprobar leads:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudieron aprobar los leads seleccionados"
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  const openRejectDialog = (leadId: string) => {
    // Rechazar directamente sin mostrar diálogo
    handleDirectReject(leadId);
  }
  
  const handleDirectReject = async (leadId: string) => {
    setIsProcessing(true);
    
    try {
      await leadService.rejectLead(leadId, "Rechazado automáticamente");
      
      toast({
        title: "Éxito",
        description: "Lead rechazado correctamente"
      });
      
      // Recargar leads pendientes
      const response = await leadService.getLeads({
        status: 'nuevo',
        limit: 100
      });
      
      const pendingLeads = response.data.filter(
        lead => lead.status === 'nuevo' && !lead.isApproved
      );
      
      setLeads(pendingLeads);
    } catch (error: any) {
      console.error("Error al rechazar lead:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo rechazar el lead"
      });
    } finally {
      setIsProcessing(false);
    }
  }
  
  const handleRejectSelected = async () => {
    if (!hasPermission) {
      toast({
        variant: "destructive",
        title: "Error de permisos",
        description: "No tienes permiso para rechazar leads"
      });
      return;
    }
    
    if (selectedLeads.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar al menos un lead para rechazar"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      let rejectedCount = 0;
      
      for (const leadId of selectedLeads) {
        await leadService.rejectLead(leadId, "Rechazado automáticamente");
        rejectedCount++;
      }
      
      toast({
        title: "Éxito",
        description: `Se han rechazado ${rejectedCount} leads correctamente`
      });
      
      // Recargar leads pendientes
      const response = await leadService.getLeads({
        status: 'nuevo',
        limit: 100
      });
      
      const pendingLeads = response.data.filter(
        lead => lead.status === 'nuevo' && !lead.isApproved
      );
      
      setLeads(pendingLeads);
      setSelectedLeads([]);
    } catch (error: any) {
      console.error("Error al rechazar leads:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudieron rechazar los leads"
      });
    } finally {
      setIsProcessing(false);
    }
  }
  
  const handleApproveSingle = async (leadId: string) => {
    setIsProcessing(true)
    
    try {
      await leadService.approveLead(leadId)
      
      toast({
        title: "Éxito",
        description: "Lead aprobado correctamente"
      })
      
      // Recargar leads pendientes
      const response = await leadService.getLeads({
        status: 'nuevo',
        limit: 100
      })
      
      const pendingLeads = response.data.filter(
        lead => lead.status === 'nuevo' && !lead.isApproved
      )
      
      setLeads(pendingLeads)
    } catch (error: any) {
      console.error("Error al aprobar lead:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo aprobar el lead"
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
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
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold tracking-tight">Aprobación de Leads</h1>
                </div>
              </div>
              <div className="flex-1"></div>
            </div>
            
            {/* Contenido principal */}
            <Card>
              <CardHeader>
                <CardTitle>Leads Pendientes de Aprobación</CardTitle>
                <CardDescription>
                  Aprueba o rechaza los leads antes de que puedan ser asignados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!hasPermission && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error de permisos</AlertTitle>
                    <AlertDescription>
                      No tienes permiso para aprobar leads. Esta acción requiere el permiso 'leads:approve'.
                      Contacta al administrador para solicitar acceso.
                    </AlertDescription>
                  </Alert>
                )}
                
                {leads.length === 0 && !isLoading && (
                  <Alert className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Sin leads pendientes</AlertTitle>
                    <AlertDescription>
                      No hay leads pendientes de aprobación en este momento.
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Barra de búsqueda y acciones */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar leads..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRejectSelected}
                      disabled={selectedLeads.length === 0 || isProcessing || !hasPermission}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Rechazar seleccionados
                        </>
                      )}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleApproveSelected}
                      disabled={selectedLeads.length === 0 || isProcessing || !hasPermission}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprobar seleccionados
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Tabla de leads */}
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Cargando leads pendientes de aprobación...</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]">
                            <Checkbox 
                              checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0} 
                              onCheckedChange={toggleSelectAllLeads}
                              disabled={filteredLeads.length === 0}
                            />
                          </TableHead>
                          <TableHead>Lead</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead className="w-[180px]">Origen</TableHead>
                          <TableHead>Fecha de creación</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeads.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              No se encontraron leads pendientes de aprobación
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
                                <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                                <div className="text-sm text-muted-foreground">{lead.email}</div>
                              </TableCell>
                              <TableCell>{lead.company || "-"}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="px-2 py-1 w-full text-center justify-center">
                                  {lead.source === "sitio_web" ? "Sitio Web" : 
                                   lead.source === "referido" ? "Referido" : 
                                   lead.source === "redes_sociales" ? "Redes Sociales" : 
                                   lead.source === "evento" ? "Evento" : 
                                   lead.source === "anuncio" ? "Anuncio" : 
                                   lead.source === "otro" ? "Otro" :
                                   lead.source === "manual" ? "Manual" :
                                   lead.source || "Desconocido"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleApproveSingle(lead._id || "")}
                                    disabled={isProcessing || !hasPermission}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="sr-only">Aprobar</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleDirectReject(lead._id || "")}
                                    disabled={isProcessing || !hasPermission}
                                  >
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <span className="sr-only">Rechazar</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => router.push(`/leads/${lead._id}`)}
                                    disabled={isProcessing || !hasPermission}
                                  >
                                    <Eye className="h-4 w-4 text-blue-500" />
                                    <span className="sr-only">Ver Perfil</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {filteredLeads.length} leads pendientes de aprobación
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 