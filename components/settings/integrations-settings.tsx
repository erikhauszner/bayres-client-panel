"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  Server, 
  Globe, 
  Mail, 
  CreditCard, 
  Database, 
  RefreshCw, 
  Plus, 
  ChevronDown, 
  ExternalLink, 
  Copy, 
  Key, 
  Lock,
  Save,
  Check,
  Plug,
  Workflow
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Datos simulados para integraciones
const mockIntegrations = [
  {
    id: "email",
    name: "Servicio de Email",
    description: "Configuración de envío de emails del sistema",
    enabled: true,
    connected: true,
    icon: <Mail className="h-5 w-5" />,
    type: "system",
    fields: [
      { key: "smtp_server", name: "Servidor SMTP", value: "smtp.example.com", type: "text" },
      { key: "smtp_port", name: "Puerto SMTP", value: "587", type: "number" },
      { key: "smtp_user", name: "Usuario SMTP", value: "user@example.com", type: "text" },
      { key: "smtp_password", name: "Contraseña SMTP", value: "********", type: "password" },
      { key: "from_email", name: "Email Remitente", value: "noreply@bayressoftware.com", type: "email" }
    ]
  },
  {
    id: "payment",
    name: "Pasarela de Pago",
    description: "Configuración para procesamiento de pagos",
    enabled: true,
    connected: true,
    icon: <CreditCard className="h-5 w-5" />,
    type: "system",
    fields: [
      { key: "gateway", name: "Proveedor", value: "stripe", type: "text" },
      { key: "api_key", name: "API Key", value: "sk_test_*********************", type: "password" },
      { key: "webhook_url", name: "URL de Webhook", value: "https://bayressoftware.com/api/webhooks/payments", type: "url" }
    ]
  },
  {
    id: "storage",
    name: "Almacenamiento",
    description: "Servicio de almacenamiento de archivos",
    enabled: true,
    connected: true,
    icon: <Database className="h-5 w-5" />,
    type: "system",
    fields: [
      { key: "provider", name: "Proveedor", value: "aws_s3", type: "text" },
      { key: "bucket", name: "Bucket", value: "bayres-files", type: "text" },
      { key: "region", name: "Región", value: "eu-west-1", type: "text" },
      { key: "access_key", name: "Access Key", value: "AKIA*************", type: "password" },
      { key: "secret_key", name: "Secret Key", value: "************************", type: "password" }
    ]
  },
  {
    id: "google",
    name: "Google Workspace",
    description: "Integración con servicios de Google",
    enabled: false,
    connected: false,
    icon: <Globe className="h-5 w-5" />,
    type: "external",
    authUrl: "https://accounts.google.com/o/oauth2/auth"
  },
  {
    id: "slack",
    name: "Slack",
    description: "Integración con Slack para notificaciones",
    enabled: true,
    connected: true,
    icon: <Plug className="h-5 w-5" />,
    type: "external",
    authUrl: "https://slack.com/oauth/authorize"
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automatización con flujos de trabajo",
    enabled: false,
    connected: false,
    icon: <Workflow className="h-5 w-5" />,
    type: "external",
    authUrl: "https://zapier.com/dashboard/auth"
  }
]

export default function IntegrationsSettings() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("sistema")
  const [isLoading, setIsLoading] = useState(false)
  const [integrations, setIntegrations] = useState(mockIntegrations)
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // API Keys y Webhooks
  const [apiKeys, setApiKeys] = useState([
    { id: "key-1", name: "App Principal", key: "api_123456789abcdef", active: true, created: "2023-04-15T10:30:00Z" },
    { id: "key-2", name: "Servicio Externo", key: "api_abcdef123456789", active: true, created: "2023-05-20T14:45:00Z" }
  ])
  
  const [webhooks, setWebhooks] = useState([
    { id: "wh-1", name: "Nuevos Leads", url: "https://ejemplo.com/webhook/leads", events: ["lead.created", "lead.updated"], active: true }
  ])
  
  const handleIntegrationToggle = (id: string) => {
    setIntegrations(
      integrations.map(integration => 
        integration.id === id 
          ? { ...integration, enabled: !integration.enabled } 
          : integration
      )
    )
    
    toast({
      title: "Estado actualizado",
      description: `La integración ha sido ${integrations.find(i => i.id === id)?.enabled ? 'desactivada' : 'activada'}`
    })
  }
  
  const handleConnectIntegration = (integration: any) => {
    // En un caso real, esto redirigiría al flujo de autenticación del servicio
    window.open(integration.authUrl, '_blank')
  }
  
  const openIntegrationDialog = (integration: any) => {
    setSelectedIntegration(integration)
    setIsDialogOpen(true)
  }
  
  const handleSaveIntegration = () => {
    setIsLoading(true)
    
    // Simulación de guardado
    setTimeout(() => {
      toast({
        title: "Configuración guardada",
        description: `Los ajustes de ${selectedIntegration.name} han sido actualizados`
      })
      setIsLoading(false)
      setIsDialogOpen(false)
    }, 800)
  }
  
  const handleCreateApiKey = () => {
    const newKey = {
      id: `key-${Date.now()}`,
      name: "Nueva API Key",
      key: `api_${Math.random().toString(36).substring(2, 15)}`,
      active: true,
      created: new Date().toISOString()
    }
    
    setApiKeys([...apiKeys, newKey])
    
    toast({
      title: "API Key creada",
      description: "Se ha generado una nueva API Key"
    })
  }
  
  const handleRevokeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id))
    
    toast({
      title: "API Key revocada",
      description: "La API Key ha sido eliminada correctamente"
    })
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    
    toast({
      title: "Copiado",
      description: "El texto ha sido copiado al portapapeles"
    })
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline-block">Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="externas" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline-block">Aplicaciones</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline-block">API</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Pestaña de integraciones del sistema */}
        <TabsContent value="sistema" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Integraciones del Sistema</h3>
          </div>
          
          <div className="grid gap-4">
            {integrations
              .filter(integration => integration.type === "system")
              .map((integration) => (
                <Card key={integration.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-secondary p-2 rounded-md">
                          {integration.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription>{integration.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={integration.connected ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400" : "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400"}>
                          {integration.connected ? "Conectado" : "Desconectado"}
                        </Badge>
                        <Switch 
                          checked={integration.enabled} 
                          onCheckedChange={() => handleIntegrationToggle(integration.id)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => openIntegrationDialog(integration)}
                      >
                        Configurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        {/* Pestaña de integraciones externas */}
        <TabsContent value="externas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Integraciones con Aplicaciones Externas</h3>
          </div>
          
          <div className="grid gap-4">
            {integrations
              .filter(integration => integration.type === "external")
              .map((integration) => (
                <Card key={integration.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-secondary p-2 rounded-md">
                          {integration.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription>{integration.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={integration.enabled} 
                          onCheckedChange={() => handleIntegrationToggle(integration.id)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    <div className="flex justify-end">
                      {integration.connected ? (
                        <Button 
                          variant="outline" 
                          onClick={() => openIntegrationDialog(integration)}
                        >
                          Configurar
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleConnectIntegration(integration)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Conectar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        {/* Pestaña de API */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Keys
                  </CardTitle>
                  <CardDescription>
                    Gestiona las claves de acceso a la API del sistema
                  </CardDescription>
                </div>
                <Button size="sm" onClick={handleCreateApiKey}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div 
                    key={apiKey.id} 
                    className="rounded-md border p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{apiKey.name}</div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                        Activa
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {apiKey.key}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleRevokeApiKey(apiKey.id)}
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Creada el {new Date(apiKey.created).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Webhooks
                  </CardTitle>
                  <CardDescription>
                    Configura notificaciones push para eventos del sistema
                  </CardDescription>
                </div>
                <Button size="sm" disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.length === 0 ? (
                  <div className="text-center p-6 text-muted-foreground">
                    No hay webhooks configurados
                  </div>
                ) : (
                  webhooks.map((webhook) => (
                    <Collapsible key={webhook.id} className="rounded-md border">
                      <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{webhook.name}</div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                            Activo
                          </Badge>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <Separator className="mb-4" />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">URL</div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => copyToClipboard(webhook.url)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {webhook.url}
                          </div>
                          
                          <div className="mt-2 text-sm font-medium">Eventos</div>
                          <div className="flex flex-wrap gap-2">
                            {webhook.events.map((event) => (
                              <Badge key={event} variant="outline">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para configurar integración */}
      {selectedIntegration && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedIntegration.icon}
                <span>{selectedIntegration.name}</span>
              </DialogTitle>
              <DialogDescription>
                Configura los parámetros de conexión para esta integración
              </DialogDescription>
            </DialogHeader>
            
            {selectedIntegration.type === "system" && selectedIntegration.fields && (
              <div className="space-y-4 py-4">
                {selectedIntegration.fields.map((field: any) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.name}</Label>
                    {field.type === "password" ? (
                      <div className="relative">
                        <Input 
                          id={field.key} 
                          type="password" 
                          defaultValue={field.value}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-full"
                          onClick={() => copyToClipboard(field.value)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Input 
                        id={field.key} 
                        type={field.type} 
                        defaultValue={field.value}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {selectedIntegration.type === "external" && selectedIntegration.connected && (
              <div className="space-y-4 py-4">
                <div className="rounded-md bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">Conexión establecida</h3>
                      <div className="mt-2 text-sm">
                        <p>La integración está correctamente configurada y conectada.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Permisos solicitados</Label>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Lectura de datos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Escritura de datos</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook">Webhook URL</Label>
                  <div className="relative">
                    <Input 
                      id="webhook" 
                      value="https://bayressoftware.com/api/webhooks/slack" 
                      readOnly
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-full"
                      onClick={() => copyToClipboard("https://bayressoftware.com/api/webhooks/slack")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Utiliza esta URL en la configuración de la aplicación externa
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveIntegration} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 