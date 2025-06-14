"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Plus, 
  Search, 
  Settings, 
  Play, 
  Pause, 
  Copy, 
  Trash2, 
  Edit,
  MoreHorizontal,
  Zap,
  Activity,
  Clock,
  CheckCircle2,
  ExternalLink,
  Link,
  Key,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import axios from "axios"
import { API_ENDPOINT } from "@/lib/config"
import { apiKeyService, ApiKey, CreateApiKeyDto } from "@/lib/services/apiKey.service"

interface Automation {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  fields: Array<{
    name: string;
    label: string;
    description?: string;
    size: 'small' | 'medium' | 'large';
    required: boolean;
  }>;
  config: {
    webhookUrl: string;
    sendEmployeeId: boolean;
  };
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AutomationStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
}

export default function AutomatizacionesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("automatizaciones")
  
  // Estados para automatizaciones
  const [automations, setAutomations] = useState<Automation[]>([])
  const [stats, setStats] = useState<AutomationStats>({ total: 0, active: 0, inactive: 0, draft: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Estados para API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [newApiKeyName, setNewApiKeyName] = useState("")
  const [newApiKeyPermissions, setNewApiKeyPermissions] = useState<string>("read")
  const [newApiKeyExpiration, setNewApiKeyExpiration] = useState("never")
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState<{[key: string]: boolean}>({})

  // Cargar automatizaciones y estadísticas
  useEffect(() => {
    fetchAutomations()
    fetchStats()
    fetchApiKeys()
  }, [])

  const fetchAutomations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await axios.get(`${API_ENDPOINT}/automations?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.data.success) {
        setAutomations(response.data.data)
      }
    } catch (error) {
      console.error('Error al cargar automatizaciones:', error)
      toast.error('Error al cargar las automatizaciones')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINT}/automations/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  // Filtrar automatizaciones
  useEffect(() => {
    fetchAutomations()
  }, [searchTerm, statusFilter])

  const handleStatusChange = async (automationId: string, newStatus: 'active' | 'inactive') => {
    try {
      const response = await axios.patch(
        `${API_ENDPOINT}/automations/${automationId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.data.success) {
        toast.success(`Automatización ${newStatus === 'active' ? 'activada' : 'desactivada'} exitosamente`)
        fetchAutomations()
        fetchStats()
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar el estado de la automatización')
    }
  }

  const handleDuplicate = async (automationId: string, originalName: string) => {
    try {
      const newName = `${originalName} (Copia)`
      const response = await axios.post(
        `${API_ENDPOINT}/automations/${automationId}/duplicate`,
        { newName },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.data.success) {
        toast.success('Automatización duplicada exitosamente')
        fetchAutomations()
        fetchStats()
      }
    } catch (error) {
      console.error('Error al duplicar:', error)
      toast.error('Error al duplicar la automatización')
    }
  }

  const handleDelete = async (automationId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta automatización?')) {
      return
    }

    try {
      const response = await axios.delete(`${API_ENDPOINT}/automations/${automationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.data.success) {
        toast.success('Automatización eliminada exitosamente')
        fetchAutomations()
        fetchStats()
      }
    } catch (error) {
      console.error('Error al eliminar:', error)
      toast.error('Error al eliminar la automatización')
    }
  }

  const handleCopyLink = async (automationId: string) => {
    try {
      const url = `${window.location.origin}/automation/${automationId}`
      await navigator.clipboard.writeText(url)
      toast.success('Enlace copiado al portapapeles')
    } catch (error) {
      console.error('Error al copiar enlace:', error)
      toast.error('Error al copiar el enlace')
    }
  }

  // Funciones para API Keys
  const fetchApiKeys = async () => {
    try {
      setLoadingKeys(true)
      const keys = await apiKeyService.getAllApiKeys()
      setApiKeys(keys)
    } catch (err) {
      console.error('Error al cargar claves API:', err)
      toast.error('No se pudieron cargar las claves API')
    } finally {
      setLoadingKeys(false)
    }
  }

  const handleCreateApiKey = async () => {
    if (!newApiKeyName) {
      toast.error('Por favor, introduce un nombre para la clave API')
      return
    }

    try {
      setLoadingKeys(true)
      
      const expiresIn = newApiKeyExpiration === 'never' 
        ? undefined
        : newApiKeyExpiration
      
      const createdKey = await apiKeyService.createApiKey({
        name: newApiKeyName,
        permissions: newApiKeyPermissions,
        expiresIn
      })
      
      setCreatedApiKey(createdKey.key)
      toast.success('Clave API creada correctamente')
      
      // Limpiar y cerrar el formulario
      setNewApiKeyName("")
      setNewApiKeyPermissions("read")
      setNewApiKeyExpiration("never")
      setShowNewKeyDialog(false)
      
      // Actualizar la lista de claves
      fetchApiKeys()
    } catch (err) {
      console.error('Error al crear clave API:', err)
      toast.error('No se pudo crear la clave API')
    } finally {
      setLoadingKeys(false)
    }
  }

  const handleRevokeApiKey = async (keyId: string) => {
    if (confirm("¿Estás seguro de que deseas revocar esta clave API? Esta acción no se puede deshacer.")) {
      try {
        setLoadingKeys(true)
        await apiKeyService.deleteApiKey(keyId)
        toast.success('Clave API revocada correctamente')
        
        // Actualizar la lista de claves
        fetchApiKeys()
      } catch (err) {
        console.error('Error al revocar clave API:', err)
        toast.error('No se pudo revocar la clave API')
      } finally {
        setLoadingKeys(false)
      }
    }
  }

  const handleToggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copiado al portapapeles')
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err)
      toast.error('No se pudo copiar al portapapeles')
    }
  }

  const getPermissionsLabel = (permissions: string[]) => {
    if (permissions.includes('delete')) return 'Completo (lectura, escritura, eliminación)'
    if (permissions.includes('write')) return 'Lectura y escritura'
    return 'Solo lectura'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No vence'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Activa</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Inactiva</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Borrador</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Automatizaciones</h1>
                <p className="text-muted-foreground">
                  Gestiona formularios dinámicos y claves de API para integraciones
                </p>
              </div>
              <div className="flex gap-2">
                {activeTab === "automatizaciones" && (
                  <Button onClick={() => router.push("/admin/automatizaciones/nueva")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Automatización
                  </Button>
                )}
                {activeTab === "apikeys" && (
                  <Button onClick={() => setShowNewKeyDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva API Key
                  </Button>
                )}
              </div>
            </div>
            
            {/* Pestañas */}
            <Tabs defaultValue="automatizaciones" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="automatizaciones" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>Automatizaciones</span>
                </TabsTrigger>
                <TabsTrigger value="apikeys" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span>API Keys</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="automatizaciones" className="space-y-8">
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
                      <div className="bg-blue-500/20 p-3 rounded-full">
                        <Zap className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium leading-none text-muted-foreground">
                          Total Automatizaciones
                        </p>
                        <p className="text-3xl font-bold">{stats.total}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
                    <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
                      <div className="bg-green-500/20 p-3 rounded-full">
                        <Activity className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium leading-none text-muted-foreground">
                          Activas
                        </p>
                        <p className="text-3xl font-bold">{stats.active}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
                      <div className="bg-yellow-500/20 p-3 rounded-full">
                        <Clock className="h-8 w-8 text-yellow-500" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium leading-none text-muted-foreground">
                          Borradores
                        </p>
                        <p className="text-3xl font-bold">{stats.draft}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/50 dark:to-gray-900/50 border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
                      <div className="bg-gray-500/20 p-3 rounded-full">
                        <CheckCircle2 className="h-8 w-8 text-gray-500" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium leading-none text-muted-foreground">
                          Inactivas
                        </p>
                        <p className="text-3xl font-bold">{stats.inactive}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filtros */}
                <Card>
                  <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                    <CardDescription>
                      Busca y filtra automatizaciones por nombre o estado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar automatizaciones..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="active">Activas</SelectItem>
                          <SelectItem value="inactive">Inactivas</SelectItem>
                          <SelectItem value="draft">Borradores</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de automatizaciones */}
                <Card>
                  <CardHeader>
                    <CardTitle>Automatizaciones</CardTitle>
                    <CardDescription>
                      {automations.length} automatización{automations.length !== 1 ? 'es' : ''} encontrada{automations.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : automations.length === 0 ? (
                      <div className="text-center py-8">
                        <Zap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No hay automatizaciones</h3>
                        <p className="text-muted-foreground mt-2">
                          Crea tu primera automatización para comenzar
                        </p>
                        <Button 
                          className="mt-4" 
                          onClick={() => router.push("/admin/automatizaciones/nueva")}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Nueva Automatización
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {automations.map((automation) => (
                          <Card key={automation._id} className={`hover:shadow-md transition-shadow ${automation.status === 'active' ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}>
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg">{automation.name}</CardTitle>
                                  {automation.description && (
                                    <CardDescription className="mt-1">
                                      {automation.description}
                                    </CardDescription>
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {automation.status === 'active' && (
                                      <>
                                        <DropdownMenuItem 
                                          onClick={() => window.open(`/automation/${automation._id}`, '_blank')}
                                        >
                                          <ExternalLink className="mr-2 h-4 w-4" />
                                          Ver Formulario
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleCopyLink(automation._id)}
                                        >
                                          <Link className="mr-2 h-4 w-4" />
                                          Copiar Enlace
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    <DropdownMenuItem 
                                      onClick={() => router.push(`/admin/automatizaciones/${automation._id}/edit`)}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDuplicate(automation._id, automation.name)}
                                    >
                                      <Copy className="mr-2 h-4 w-4" />
                                      Duplicar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleStatusChange(
                                        automation._id, 
                                        automation.status === 'active' ? 'inactive' : 'active'
                                      )}
                                    >
                                      {automation.status === 'active' ? (
                                        <>
                                          <Pause className="mr-2 h-4 w-4" />
                                          Desactivar
                                        </>
                                      ) : (
                                        <>
                                          <Play className="mr-2 h-4 w-4" />
                                          Activar
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDelete(automation._id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Estado:</span>
                                  {getStatusBadge(automation.status)}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Campos:</span>
                                  <span className="text-sm font-medium">{automation.fields.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Creado por:</span>
                                  <span className="text-sm font-medium">
                                    {automation.createdBy.firstName} {automation.createdBy.lastName}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Creado:</span>
                                  <span className="text-sm">
                                    {new Date(automation.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Botones para acceder al formulario */}
                              {automation.status === 'active' && (
                                <div className="mt-4 pt-3 border-t">
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="flex-1"
                                      onClick={() => window.open(`/automation/${automation._id}`, '_blank')}
                                    >
                                      <ExternalLink className="mr-2 h-4 w-4" />
                                      Abrir
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleCopyLink(automation._id)}
                                    >
                                      <Link className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Contenido de la pestaña API Keys */}
              <TabsContent value="apikeys" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      API Keys
                    </CardTitle>
                    <CardDescription>
                      Gestiona las claves de acceso a la API para integraciones externas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingKeys ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : apiKeys.length === 0 ? (
                      <div className="text-center py-8">
                        <Key className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No hay claves API</h3>
                        <p className="text-muted-foreground mt-2">
                          Crea tu primera clave API para integrar con servicios externos
                        </p>
                        <Button 
                          className="mt-4" 
                          onClick={() => setShowNewKeyDialog(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Nueva API Key
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {apiKeys.map((key) => (
                          <Card key={key.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                  <CardTitle className="text-lg">{key.name}</CardTitle>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                                      {key.status === 'active' ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                    {key.expiresAt && (
                                      <Badge variant="outline">
                                        Vence: {formatDate(key.expiresAt)}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1 block">Clave API</Label>
                                  <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                                    <code className="text-xs sm:text-sm font-mono flex-1 break-all">
                                      {key.maskedKey ? (
                                        showKey[key.id] ? key.key : key.maskedKey
                                      ) : 'No disponible'}
                                    </code>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleToggleKeyVisibility(key.id)}
                                    >
                                      {showKey[key.id] ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => key.key && copyToClipboard(key.key)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-xs text-muted-foreground mb-1 block">Permisos</Label>
                                    <p className="text-sm">{getPermissionsLabel(key.permissions)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground mb-1 block">Creada</Label>
                                    <p className="text-sm">{formatDate(key.createdAt)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground mb-1 block">Último uso</Label>
                                    <p className="text-sm">{key.lastUsed ? formatDate(key.lastUsed) : 'Nunca'}</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-end pt-0 pb-3">
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRevokeApiKey(key.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Revocar
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Modal para crear nueva API Key */}
            <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear nueva clave API</DialogTitle>
                  <DialogDescription>
                    Crea una nueva clave API para integrar con servicios externos
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="apiKeyName">Nombre</Label>
                    <Input
                      id="apiKeyName"
                      placeholder="Nombre de la clave API"
                      value={newApiKeyName}
                      onChange={(e) => setNewApiKeyName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Un nombre descriptivo para identificar el propósito de esta clave
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="apiKeyPermissions">Permisos</Label>
                    <Select value={newApiKeyPermissions} onValueChange={setNewApiKeyPermissions}>
                      <SelectTrigger id="apiKeyPermissions">
                        <SelectValue placeholder="Selecciona los permisos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Solo lectura</SelectItem>
                        <SelectItem value="readwrite">Lectura y escritura</SelectItem>
                        <SelectItem value="full">Completo (incluye eliminación)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Define qué operaciones puede realizar esta clave API
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="apiKeyExpiration">Expiración</Label>
                    <Select value={newApiKeyExpiration} onValueChange={setNewApiKeyExpiration}>
                      <SelectTrigger id="apiKeyExpiration">
                        <SelectValue placeholder="Selecciona cuándo expira" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">No expira</SelectItem>
                        <SelectItem value="30days">30 días</SelectItem>
                        <SelectItem value="90days">90 días</SelectItem>
                        <SelectItem value="1year">1 año</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Establece cuándo dejará de funcionar esta clave API
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewKeyDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateApiKey} disabled={loadingKeys}>
                    {loadingKeys ? 'Creando...' : 'Crear API Key'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Modal para mostrar la clave API recién creada */}
            {createdApiKey && (
              <Dialog open={!!createdApiKey} onOpenChange={() => setCreatedApiKey(null)}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      API Key creada exitosamente
                    </DialogTitle>
                    <DialogDescription>
                      Guarda esta clave en un lugar seguro. Por seguridad, no podrás verla completa de nuevo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm font-mono break-all">{createdApiKey}</code>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => copyToClipboard(createdApiKey)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => setCreatedApiKey(null)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Entendido
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 