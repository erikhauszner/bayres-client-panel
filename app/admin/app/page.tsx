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
  const [activeTab, setActiveTab] = useState("general")
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyPermissions, setNewKeyPermissions] = useState("read")
  const [newKeyExpiration, setNewKeyExpiration] = useState("never")
  const [isCreatingKey, setIsCreatingKey] = useState(false)
  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null)
  const [isOpenDialog, setIsOpenDialog] = useState(false)
  const router = useRouter()

  // Cargar las API keys del servidor
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        setIsLoading(true);
        const keys = await apiKeyService.getAllApiKeys();
        setApiKeys(keys);
      } catch (error) {
        console.error('Error al cargar API keys:', error);
        toast({
          title: "Error al cargar las API keys",
          description: "No se pudieron cargar las API keys. Inténtalo de nuevo.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "configuracion") {
      fetchApiKeys();
    }
  }, [activeTab, toast]);

  const toggleKeyVisibility = (id: string) => {
    setShowKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleCreateKey = async () => {
    try {
      if (!newKeyName) {
        toast({
          title: "Nombre requerido",
          description: "Debes proporcionar un nombre para la API key",
          variant: "destructive"
        });
        return;
      }

      setIsCreatingKey(true);
      
      const response = await apiKeyService.createApiKey({
        name: newKeyName,
        permissions: newKeyPermissions,
        expiresIn: newKeyExpiration === "never" ? undefined : newKeyExpiration
      });
      
      // Añadir la nueva API key a la lista
      setApiKeys(prev => [
        {
          id: response.id,
          name: response.name,
          key: response.key,
          permissions: response.permissions,
          status: response.status as 'active' | 'inactive',
          expiresAt: response.expiresAt,
          createdAt: response.createdAt
        },
        ...prev
      ]);
      
      // Mostrar la clave generada
      setNewKeyGenerated(response.key);
      setIsOpenDialog(false);
      
      toast({
        title: "API key creada con éxito",
        description: "Tu nueva clave API ha sido generada y está lista para usar.",
      });
      
      // Reiniciar el formulario
      setNewKeyName("");
      setNewKeyPermissions("read");
      setNewKeyExpiration("never");
    } catch (error) {
      toast({
        title: "Error al crear la API key",
        description: "Ocurrió un problema al generar la clave. Inténtalo de nuevo.",
        variant: "destructive"
      });
      console.error("Error creando API key:", error);
    } finally {
      setIsCreatingKey(false);
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copiado al portapapeles",
      description: "La clave API ha sido copiada al portapapeles.",
    });
  }

  const handleToggleKeyStatus = async (id: string) => {
    try {
      const targetKey = apiKeys.find(key => key.id === id);
      if (!targetKey) return;
      
      const newStatus = targetKey.status === 'active' ? 'inactive' : 'active';
      
      // Actualizar estado localmente para mejor UX
      setApiKeys(apiKeys.map(key => 
        key.id === id 
          ? { ...key, status: newStatus }
          : key
      ));
      
      // Enviar la actualización al servidor
      await apiKeyService.updateApiKeyStatus(id, newStatus);
      
      toast({
        title: `API key ${newStatus === 'active' ? 'activada' : 'desactivada'}`,
        description: `La clave "${targetKey.name}" ha sido ${newStatus === 'active' ? 'activada' : 'desactivada'}.`,
      });
    } catch (error) {
      // Revertir cambio en caso de error
      setApiKeys(prev => [...prev]);
      
      toast({
        title: "Error al actualizar la API key",
        description: "No se pudo actualizar el estado de la clave. Inténtalo de nuevo.",
        variant: "destructive"
      });
      console.error("Error actualizando API key:", error);
    }
  }

  const handleDeleteKey = async (id: string) => {
    try {
      const keyToDelete = apiKeys.find(key => key.id === id);
      if (!keyToDelete) return;
      
      // Actualizar estado localmente para mejor UX
      setApiKeys(apiKeys.filter(key => key.id !== id));
      
      // Enviar la solicitud de eliminación al servidor
      await apiKeyService.deleteApiKey(id);
      
      toast({
        title: "API key eliminada",
        description: `La clave "${keyToDelete.name}" ha sido eliminada permanentemente.`,
      });
    } catch (error) {
      // Recargar lista en caso de error
      const keys = await apiKeyService.getAllApiKeys();
      setApiKeys(keys);
      
      toast({
        title: "Error al eliminar la API key",
        description: "No se pudo eliminar la clave. Inténtalo de nuevo.",
        variant: "destructive"
      });
      console.error("Error eliminando API key:", error);
    }
  }

  const getPermissionsLabel = (permissions: string[]) => {
    if (permissions.includes("delete")) return "Acceso completo";
    if (permissions.includes("write")) return "Lectura y escritura";
    return "Solo lectura";
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Gestión de Aplicación Móvil</h1>
              <p className="text-muted-foreground mt-1">
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
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Aplicaciones Disponibles</CardTitle>
                      <CardDescription>
                        Listado de aplicaciones disponibles para la plataforma móvil
                      </CardDescription>
                    </div>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Aplicación
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <UserCheck className="h-5 w-5 mr-2 text-primary" />
                            Leads
                          </CardTitle>
                          <CardDescription>
                            Gestión de leads en movilidad
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>Versión: 1.0.1</span>
                            <Badge className="bg-green-100 text-green-800">Activa</Badge>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-4">
                          <Button variant="outline" size="sm" onClick={() => router.push("/admin/app/leads/config")}>Configurar</Button>
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
                    <CardTitle>Gestión de Usuarios</CardTitle>
                    <CardDescription>
                      Administra los usuarios de la aplicación móvil
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10 text-muted-foreground">
                      <p>Esta sección está en desarrollo.</p>
                      <p>Aquí podrás gestionar los usuarios de la aplicación móvil, permisos y accesos.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="configuracion">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sección de API Keys */}
                  <Card className="col-span-1 lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>API Keys</CardTitle>
                        <CardDescription>
                          Gestiona las claves de API para integrar sistemas externos
                        </CardDescription>
                      </div>
                      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
                        <DialogTrigger asChild>
                          <Button variant="default">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva API Key
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Crear nueva API Key</DialogTitle>
                            <DialogDescription>
                              Configura una nueva clave para permitir acceso a la API desde sistemas externos.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-2">
                            <div className="space-y-2">
                              <Label htmlFor="name">Nombre descriptivo</Label>
                              <Input
                                id="name"
                                placeholder="Ej: Integración con Sistema X"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="permissions">Permisos</Label>
                              <Select 
                                value={newKeyPermissions} 
                                onValueChange={setNewKeyPermissions}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona permisos" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="read">Solo lectura</SelectItem>
                                  <SelectItem value="readwrite">Lectura y escritura</SelectItem>
                                  <SelectItem value="full">Acceso completo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="expiration">Vencimiento</Label>
                              <Select 
                                value={newKeyExpiration} 
                                onValueChange={setNewKeyExpiration}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona vencimiento" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="never">Sin vencimiento</SelectItem>
                                  <SelectItem value="30days">30 días</SelectItem>
                                  <SelectItem value="90days">90 días</SelectItem>
                                  <SelectItem value="1year">1 año</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleCreateKey}
                              disabled={isCreatingKey || !newKeyName}
                            >
                              {isCreatingKey && (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Crear API Key
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      {newKeyGenerated && (
                        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-medium text-primary">Nueva API key generada</p>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setNewKeyGenerated(null)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="bg-background p-2 rounded border flex justify-between items-center">
                            <code className="text-sm font-mono">{newKeyGenerated}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyKey(newKeyGenerated)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs mt-2 text-muted-foreground">
                            <strong>¡Importante!</strong> Guarda esta API key en un lugar seguro. No se volverá a mostrar.
                          </p>
                        </div>
                      )}
                      
                      {apiKeys.length > 0 ? (
                        <div className="rounded-md border">
                          <div className="divide-y">
                            {apiKeys.map((key) => (
                              <div key={key.id} className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{key.name}</span>
                                      <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                                        {key.status === 'active' ? 'Activa' : 'Inactiva'}
                                      </Badge>
                                      {key.expiresAt && (
                                        <Badge variant="outline">
                                          Vence: {key.expiresAt}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="mt-1 flex items-center text-sm text-muted-foreground">
                                      <Database className="mr-1 h-3 w-3" />
                                      <span>{getPermissionsLabel(key.permissions)}</span>
                                      <span className="mx-2">•</span>
                                      <span>Creada el {key.createdAt}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 sm:justify-end">
                                    <div className="w-full sm:w-auto flex items-center gap-2 p-2 bg-muted rounded text-sm">
                                      <code className="text-xs font-mono truncate max-w-[180px]">
                                        {showKey[key.id] ? key.key || 'N/A' : key.key ? key.key.replace(/./g, '•') : '•••••••••••'}
                                      </code>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 w-7 p-0"
                                              onClick={() => toggleKeyVisibility(key.id)}
                                            >
                                              {showKey[key.id] ? (
                                                <EyeOff className="h-3.5 w-3.5" />
                                              ) : (
                                                <Eye className="h-3.5 w-3.5" />
                                              )}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
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
                                              className="h-7 w-7 p-0"
                                              onClick={() => key.key && handleCopyKey(key.key)}
                                            >
                                              <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Copiar al portapapeles</p>
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
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleToggleKeyStatus(key.id)}
                                          >
                                            {key.status === 'active' ? (
                                              <XCircle className="h-4 w-4 text-destructive" />
                                            ) : (
                                              <CheckCircle className="h-4 w-4 text-success" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            {key.status === 'active'
                                              ? "Desactivar clave"
                                              : "Activar clave"}
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
                                            className="h-8 w-8 p-0 text-destructive"
                                            onClick={() => handleDeleteKey(key.id)}
                                          >
                                            <Trash className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Eliminar clave</p>
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
                        <div className="flex flex-col items-center justify-center py-12 border rounded-md">
                          <ShieldCheck className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-1">No hay API keys</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Crea una nueva API key para integrar sistemas externos
                          </p>
                          <Button onClick={() => setIsOpenDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva API Key
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
} 