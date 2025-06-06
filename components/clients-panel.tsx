"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Edit,
  Trash2,
  Filter,
  MoreVertical,
  Building,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  FileText,
  Plus,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { clientService, convertClientToLead } from "@/lib/services/clientService"
import { Client } from "@/lib/types/client"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

export default function ClientsPanel() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalClients, setTotalClients] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isConverting, setIsConverting] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState<string | undefined>("all")
  const [clientType, setClientType] = useState<string | undefined>("all")

  // Cargar clientes desde el API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await clientService.getClients({
          search: searchTerm,
          page: currentPage,
          limit: 10,
          status: currentStatus === "all" ? undefined : currentStatus,
          type: clientType === "all" ? undefined : clientType,
        })
        
        setClients(response.data || [])
        setTotalClients(response.total || 0)
        setTotalPages(response.pages || 1)
        setIsLoading(false)
      } catch (err) {
        console.error("Error al cargar los clientes:", err)
        setError("No se pudieron cargar los clientes. Por favor, intenta de nuevo más tarde.")
        setIsLoading(false)
        setClients([]) // Asegurar que clients sea un array vacío en caso de error
      }
    }

    fetchClients()
  }, [searchTerm, currentPage, currentStatus, clientType])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Resetear a la primera página al buscar
  }

  const handleDeleteClient = async (id: string) => {
    if (window.confirm("¿Estás seguro que deseas eliminar este cliente?")) {
      try {
        await clientService.deleteClient(id)
        // Actualizar la lista después de eliminar
        setClients(clients.filter(client => client._id !== id))
        setTotalClients(prev => prev - 1)
      } catch (err) {
        console.error("Error al eliminar el cliente:", err)
        setError("No se pudo eliminar el cliente. Por favor, intenta de nuevo más tarde.")
      }
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    try {
      if (currentStatus === 'active') {
        await clientService.deactivateClient(id)
      } else {
        await clientService.activateClient(id)
      }
      
      // Actualizar el cliente en la lista local
      setClients(clients.map(client => 
        client._id === id 
          ? {...client, status: currentStatus === 'active' ? 'inactive' : 'active'} 
          : client
      ))
    } catch (err) {
      console.error("Error al cambiar el estado del cliente:", err)
      setError("No se pudo actualizar el estado del cliente. Por favor, intenta de nuevo más tarde.")
    }
  }

  const handleConvertToLead = async (clientId: string | undefined) => {
    if (!clientId) return;
    
    try {
      setIsConverting(clientId);
      const { leadId } = await convertClientToLead(clientId);
      toast({
        title: "Cliente convertido a lead",
        description: "El cliente ha sido convertido a lead exitosamente.",
      });
      // Actualizar la lista después de convertir
      setClients(clients.filter(client => client._id !== clientId));
      setTotalClients(prev => prev - 1);
      router.push(`/leads/${leadId}`);
    } catch (error) {
      console.error('Error al convertir cliente a lead:', error);
      toast({
        title: "Error",
        description: "No se pudo convertir el cliente a lead.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(null);
    }
  };

  // Obtener estadísticas
  const activeClients = clients ? clients.filter(client => client.status === 'active').length : 0;
  const inactiveClients = clients ? clients.filter(client => client.status === 'inactive').length : 0;
  const clientsWithProjects = clients ? clients.filter(client => client.projects && Array.isArray(client.projects) && client.projects.length > 0).length : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona los clientes y sus datos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline"
            className="h-9"
            onClick={() => router.push('/docs?section=clients')}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Documentación</span>
          </Button>
          <Button 
            size="sm" 
            className="h-9 bg-primary hover:bg-primary/90"
            onClick={() => router.push('/clientes/nuevo')}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Nuevo Cliente</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clientes</p>
                <h3 className="mt-1 text-2xl font-bold">{totalClients}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Building className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Activos</p>
                <h3 className="mt-1 text-2xl font-bold">{activeClients}</h3>
              </div>
              <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                <Building className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Con Proyectos</p>
                <h3 className="mt-1 text-2xl font-bold">{clientsWithProjects}</h3>
              </div>
              <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactivos</p>
                <h3 className="mt-1 text-2xl font-bold">{inactiveClients}</h3>
              </div>
              <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
                <Building className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="overflow-visible">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar clientes..."
                className="bg-background pl-9"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div>
              <Select value={currentStatus || "all"} onValueChange={val => setCurrentStatus(val === "all" ? undefined : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={clientType || "all"} onValueChange={val => setClientType(val === "all" ? undefined : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="business">Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manejo de errores */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Mostrar un estado de carga */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Cargando clientes...</p>
          </div>
        </div>
      )}

      {/* Si no hay clientes y no está cargando */}
      {!isLoading && clients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
          <h3 className="mb-1 text-lg font-semibold">No hay clientes</h3>
          <p className="mb-4 max-w-sm text-muted-foreground">
            No se encontraron clientes que coincidan con tu búsqueda. Prueba con otros términos o crea un nuevo cliente.
          </p>
          <Button 
            size="sm" 
            className="mt-2"
            onClick={() => router.push('/clientes/nuevo')}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Nuevo Cliente</span>
          </Button>
        </div>
      )}

      {/* Lista de clientes */}
      {!isLoading && clients && clients.length > 0 && (
        <Card>
          <CardContent className="p-0 py-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Nombre / Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback>
                            {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          {client.type === 'business' && client.businessName && (
                            <div className="text-xs text-muted-foreground">{client.businessName}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(client.status)}>
                        {client.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/clientes/${client._id}`)}>
                            <FileText className="mr-2 h-4 w-4" /> Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/clientes/${client._id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-start"
                                disabled={isConverting === client._id}
                              >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                <span>Convertir a Lead</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Qué acción deseas realizar?</AlertDialogTitle>
                              </AlertDialogHeader>
                              <section className="space-y-4 px-2">
                                <div className="space-y-2">
                                  <h4 className="font-medium">Desactivar Cliente</h4>
                                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                    <li>El cliente está temporalmente inactivo pero podría volver a ser activo</li>
                                    <li>Necesitas mantener el historial del cliente y sus proyectos</li>
                                    <li>El cliente está en pausa por razones temporales</li>
                                    <li>Quieres ocultar el cliente de las vistas principales sin perder su información</li>
                                  </ul>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-medium">Convertir a Lead</h4>
                                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                    <li>El cliente ya no es viable y quieres volver a tratarlo como lead</li>
                                    <li>Necesitas reiniciar el proceso de conversión</li>
                                    <li>El cliente no ha progresado como se esperaba</li>
                                    <li>Quieres eliminar el cliente pero mantener su información básica como lead</li>
                                  </ul>
                                </div>
                              </section>
                              <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <Button
                                  variant="outline"
                                  onClick={() => client._id && handleToggleStatus(client._id, client.status)}
                                  className="flex-1"
                                >
                                  Desactivar Cliente
                                </Button>
                                <AlertDialogAction
                                  onClick={() => client._id && handleConvertToLead(client._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex-1"
                                >
                                  Convertir a Lead
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <DropdownMenuItem
                            onClick={() => client._id && handleToggleStatus(client._id, client.status)}
                            className={client.status === 'active' ? 'text-amber-500' : 'text-green-500'}
                          >
                            {client.status === 'active' ? (
                              <>
                                <AlertCircle className="mr-2 h-4 w-4" />
                                <span>Desactivar</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="mr-2 h-4 w-4" />
                                <span>Activar</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => client._id && handleDeleteClient(client._id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}
