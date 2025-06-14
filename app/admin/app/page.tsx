"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Smartphone, ShieldCheck, Settings, Globe, Layers, RefreshCw, Database, Plus, Copy, Eye, EyeOff, ArrowRight, Trash, Clipboard, CheckCircle, XCircle, UserCheck } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { apiKeyService, ApiKey } from "@/lib/services/apiKey.service"

export default function AdminAppPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("general")
  const [newApiKeyName, setNewApiKeyName] = useState("")
  const [newApiKeyPermissions, setNewApiKeyPermissions] = useState<string[]>([])
  const [newApiKeyExpiration, setNewApiKeyExpiration] = useState("never")
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(false)
  const [showKey, setShowKey] = useState<{[key: string]: boolean}>({})
  const [copied, setCopied] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      const keys = await apiKeyService.getAllApiKeys()
      setApiKeys(keys)
    } catch (err) {
      console.error('Error al cargar claves API:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las claves API"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateApiKey = async () => {
    if (!newApiKeyName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, introduce un nombre para la clave API"
      })
      return
    }

    try {
      setLoading(true)
      
      const expiresIn = newApiKeyExpiration === 'never' 
        ? undefined
        : newApiKeyExpiration
      
      const createdKey = await apiKeyService.createApiKey({
        name: newApiKeyName,
        permissions: newApiKeyPermissions.length > 0 ? newApiKeyPermissions.join(',') : '',
        expiresIn
      })
      
      setCreatedApiKey(createdKey.key)
      toast({
        title: "Éxito",
        description: "Clave API creada correctamente"
      })
      
      // Limpiar y cerrar el formulario
      setNewApiKeyName("")
      setNewApiKeyPermissions([])
      setNewApiKeyExpiration("never")
      setShowNewKeyDialog(false)
      
      // Actualizar la lista de claves
      fetchApiKeys()
    } catch (err) {
      console.error('Error al crear clave API:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la clave API"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeApiKey = async (keyId: string) => {
    if (confirm("¿Estás seguro de que deseas revocar esta clave API? Esta acción no se puede deshacer.")) {
      try {
        setLoading(true)
        await apiKeyService.deleteApiKey(keyId)
        toast({
          title: "Éxito",
          description: "Clave API revocada correctamente"
        })
        
        // Actualizar la lista de claves
        fetchApiKeys()
      } catch (err) {
        console.error('Error al revocar clave API:', err)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo revocar la clave API"
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCopyApiKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
      .then(() => {
        setCopied({...copied, [id]: true})
        setTimeout(() => {
          setCopied({...copied, [id]: false})
        }, 2000)
      })
      .catch(err => {
        console.error('Error al copiar al portapapeles:', err)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo copiar la clave al portapapeles"
        })
      })
  }

  const toggleKeyVisibility = (id: string) => {
    setShowKey({...showKey, [id]: !showKey[id]})
  }

  const getPermissionsLabel = (permissions: string[]) => {
    if (!permissions || permissions.length === 0) return "Sin permisos específicos"
    
    if (permissions.includes('*')) return "Acceso completo"
    
    if (permissions.length === 1) return `1 permiso: ${permissions[0]}`
    
    return `${permissions.length} permisos`
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Gestión de Aplicación Móvil</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Administra y configura la aplicación móvil de Bayres CRM
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-3 mb-4 w-full sm:w-auto">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>General</span>
                </TabsTrigger>
                <TabsTrigger value="usuarios" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Usuarios</span>
                </TabsTrigger>
                <TabsTrigger value="configuracion" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Configuración</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Aplicaciones Disponibles</CardTitle>
                      <CardDescription>
                        Listado de aplicaciones disponibles para la plataforma móvil
                      </CardDescription>
                    </div>
                    <Button size="sm" className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Aplicación
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base sm:text-lg flex items-center">
                            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                            Leads
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            Gestión de leads en movilidad
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
                            <span>Versión: 1.0.1</span>
                            <Badge className="bg-green-100 text-green-800 text-xs">Activa</Badge>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-4">
                          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => router.push("/admin/app/leads/config")}>Configurar</Button>
                          <Button variant="outline" size="sm" onClick={() => router.push("/admin/app/leads")}>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usuarios">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Gestión de Usuarios</CardTitle>
                    <CardDescription className="text-sm">
                      Administra los usuarios de la aplicación móvil
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 sm:py-10 text-sm text-muted-foreground">
                      <p>Esta sección está en desarrollo.</p>
                      <p>Aquí podrás gestionar los usuarios de la aplicación móvil, permisos y accesos.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="configuracion">
                <div className="space-y-4 sm:space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">Claves API</CardTitle>
                      <CardDescription className="text-sm">
                        Gestiona las claves API para integrar con servicios externos
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-sm text-muted-foreground">
                          <p>Las claves API permiten a aplicaciones externas acceder a los datos de tu sistema de forma segura.</p>
                        </div>
                        <Button 
                          onClick={() => setShowNewKeyDialog(true)} 
                          className="w-full sm:w-auto"
                          size="sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          <span>Nueva Clave API</span>
                        </Button>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      {apiKeys.length > 0 ? (
                        <div className="rounded-md border">
                          <div className="divide-y">
                            {apiKeys.map((key) => (
                              <div key={key.id} className="p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-medium text-sm sm:text-base">{key.name}</span>
                                      <Badge variant={key.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                        {key.status === 'active' ? 'Activa' : 'Inactiva'}
                                      </Badge>
                                      {key.expiresAt && (
                                        <Badge variant="outline" className="text-xs">
                                          Vence: {key.expiresAt}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center text-xs text-muted-foreground">
                                      <Database className="mr-1 h-3 w-3" />
                                      <span>{getPermissionsLabel(key.permissions)}</span>
                                      <span className="mx-2">•</span>
                                      <span>Creada el {key.createdAt}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 sm:justify-end">
                                    <div className="w-full sm:w-auto flex items-center gap-2 p-2 bg-muted rounded text-xs">
                                      <code className="text-xs font-mono truncate max-w-[120px] sm:max-w-[180px]">
                                        {showKey[key.id] ? key.key || 'N/A' : key.key ? key.key.replace(/./g, '•') : '•••••••••••'}
                                      </code>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                                              onClick={() => toggleKeyVisibility(key.id)}
                                            >
                                              {showKey[key.id] ? (
                                                <EyeOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                              ) : (
                                                <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                              )}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">
                                              {showKey[key.id] ? "Ocultar clave" : "Mostrar clave"}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                                              onClick={() => key.key && handleCopyApiKey(key.key, key.id)}
                                              disabled={!key.key || copied[key.id]}
                                            >
                                              {copied[key.id] ? (
                                                <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
                                              ) : (
                                                <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                              )}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">{copied[key.id] ? "Copiado" : "Copiar clave"}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-red-500"
                                            onClick={() => handleRevokeApiKey(key.id)}
                                          >
                                            <Trash className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-xs">Revocar clave</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-md border border-dashed p-6 text-center">
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <Database className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <h3 className="mt-3 text-sm font-medium">No hay claves API</h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Crea una nueva clave API para integrar con servicios externos
                          </p>
                          <div className="mt-4">
                            <Button 
                              size="sm" 
                              onClick={() => setShowNewKeyDialog(true)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Nueva Clave API
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

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
                          <Select
                            value={newApiKeyPermissions.includes('*') ? '*' : newApiKeyPermissions.join(',')}
                            onValueChange={(value) => {
                              if (value === '*') {
                                setNewApiKeyPermissions(['*'])
                              } else {
                                setNewApiKeyPermissions(value.split(',').filter(Boolean))
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona los permisos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="*">Acceso completo</SelectItem>
                              <SelectItem value="read">Solo lectura</SelectItem>
                              <SelectItem value="write">Solo escritura</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Define qué operaciones puede realizar esta clave
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="apiKeyExpiration">Expiración</Label>
                          <Select
                            value={newApiKeyExpiration}
                            onValueChange={setNewApiKeyExpiration}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la expiración" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="never">Nunca expira</SelectItem>
                              <SelectItem value="30">30 días</SelectItem>
                              <SelectItem value="90">90 días</SelectItem>
                              <SelectItem value="365">1 año</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Establece cuándo expirará esta clave API
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewKeyDialog(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" onClick={handleCreateApiKey} disabled={loading}>
                          {loading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Creando...
                            </>
                          ) : (
                            "Crear clave API"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Dialog to show the created key */}
                  <Dialog open={!!createdApiKey} onOpenChange={(open) => !open && setCreatedApiKey(null)}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-center text-green-600">
                          <CheckCircle className="mx-auto mb-2 h-8 w-8" />
                          Clave API creada correctamente
                        </DialogTitle>
                        <DialogDescription className="text-center">
                          Guarda esta clave en un lugar seguro. No podrás verla de nuevo.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="my-4 flex items-center space-x-2 rounded-md border bg-muted p-4">
                        <code className="text-sm font-mono flex-1 break-all">{createdApiKey}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => createdApiKey && handleCopyApiKey(createdApiKey, 'new')}
                        >
                          {copied['new'] ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="sr-only">{copied['new'] ? "Copiado" : "Copiar"}</span>
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => setCreatedApiKey(null)}>
                          Entendido
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
} 