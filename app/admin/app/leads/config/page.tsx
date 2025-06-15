"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, ArrowLeft, Check, Copy, ExternalLink, Loader2, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axios from "axios"
import { API_URL, API_ENDPOINT, WEBHOOK_URL } from '@/lib/config';

// Estructura por defecto de la configuración
const DEFAULT_CONFIG = {
  webhookUrl: "",
  apiKey: "",
  sendEmployeeId: false,
  notificationEmail: "",
  successRedirectUrl: "",
  errorRedirectUrl: ""
}

// API URL base para el backend - Usar el puerto correcto 3000
const API_BASE_URL = API_ENDPOINT;

// Añadir log para depuración
console.log("Config API URL:", API_BASE_URL)

// Constantes para la configuración
const APP_NAME = "leads-app"
const APP_KEY = "config-general"

export default function LeadsAppConfigPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Estado para los datos de configuración
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  
  const [loading, setLoading] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar configuración desde la API al iniciar
  useEffect(() => {
    const fetchConfig = async () => {
      setLoadingConfig(true)
      setError(null)
      
      try {
        console.log("Intentando cargar configuración desde:", `${API_BASE_URL}/app-config/public/${APP_NAME}/${APP_KEY}`)
        // Intentar obtener la configuración del backend
        const response = await axios.get(`${API_BASE_URL}/app-config/public/${APP_NAME}/${APP_KEY}`)
        
        if (response.data && response.data.success) {
          // Si hay configuración guardada, usarla
          setConfig(response.data.data || DEFAULT_CONFIG)
          console.log("Configuración cargada desde la API:", response.data.data)
        } else {
          // Si no hay configuración guardada, usar valores por defecto
          setConfig(DEFAULT_CONFIG)
          console.log("Usando configuración por defecto")
        }
      } catch (err) {
        console.error("Error al cargar la configuración:", err)
        // En caso de error (404 u otro), usar la configuración por defecto
        setConfig(DEFAULT_CONFIG)
        
        // Mostrar mensaje detallado del error
        let errorMessage = "Error al cargar la configuración. Usando valores por defecto."
        
        if (axios.isAxiosError(err)) {
          if (err.code === "ERR_NETWORK") {
            errorMessage = `Error de conexión: No se pudo conectar a ${API_BASE_URL}. Verifica que el servidor esté iniciado.`
          } else if (err.response) {
            errorMessage = `Error ${err.response.status}: ${err.response.statusText}. URL: ${API_BASE_URL}/app-config/public/${APP_NAME}/${APP_KEY}`
          }
        }
        
        setError(errorMessage)
        console.warn(errorMessage)
      } finally {
        setLoadingConfig(false)
      }
    }
    
    fetchConfig()
  }, [])

  // Manejar cambios en los campos de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Resetear el estado de éxito si hay cambios
    if (saveSuccess) {
      setSaveSuccess(false)
    }
  }

  // Manejar cambios en los switches
  const handleSwitchChange = (name: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      [name]: checked
    }))
    
    // Resetear el estado de éxito si hay cambios
    if (saveSuccess) {
      setSaveSuccess(false)
    }
  }

  // Función para copiar al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado al portapapeles",
      description: "El texto ha sido copiado correctamente.",
      duration: 3000,
    })
  }

  // Guardar configuración en la API
  const saveConfiguration = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log("Intentando guardar configuración en:", `${API_BASE_URL}/app-config/${APP_NAME}/${APP_KEY}`)
      // Guardar en el backend
      const response = await axios.post(
        `${API_BASE_URL}/app-config/${APP_NAME}/${APP_KEY}`, 
        config,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      
      if (response.data && response.data.success) {
        // Mostrar mensaje de éxito
        toast({
          title: "Configuración guardada",
          description: "Los cambios han sido guardados correctamente en la base de datos.",
          variant: "success",
        })
        
        setSaveSuccess(true)
      } else {
        throw new Error("No se pudo guardar la configuración")
      }
    } catch (err) {
      console.error("Error al guardar la configuración:", err)
      
      let errorMessage = "Ocurrió un problema al guardar la configuración."
      
      if (axios.isAxiosError(err)) {
        if (err.code === "ERR_NETWORK") {
          errorMessage = `Error de conexión: No se pudo conectar a ${API_BASE_URL}. Verifica que el servidor esté iniciado.`
        } else if (err.response?.status === 401) {
          errorMessage = "No tienes autorización para guardar la configuración. Por favor, inicia sesión nuevamente."
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message
        } else if (err.response) {
          errorMessage = `Error ${err.response.status}: ${err.response.statusText}`
        }
      }
      
      setError(errorMessage)
      
      toast({
        title: "Error al guardar",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Restablecer configuración por defecto
  const resetConfiguration = () => {
    if (window.confirm("¿Estás seguro? Esto restablecerá todos los valores a su configuración por defecto.")) {
      setConfig(DEFAULT_CONFIG)
      setSaveSuccess(false)
      toast({
        title: "Configuración restablecida",
        description: "Se han restablecido los valores predeterminados. No olvides guardar los cambios.",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full" 
                onClick={() => router.push("/admin/app")}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Configuración de la App de Leads</h1>
                <p className="text-muted-foreground mt-1">
                  Configura la integración con n8n para la generación de leads
                </p>
              </div>
            </div>

            {loadingConfig ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {saveSuccess && (
                  <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Configuración actualizada</AlertTitle>
                    <AlertDescription>
                      La configuración se ha guardado correctamente en la base de datos y está lista para usarse en la app.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Contenido de Webhooks (sin pestañas) */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración de Webhook</CardTitle>
                      <CardDescription>
                        Configura el webhook para recibir información de leads desde el formulario
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="webhookUrl">URL del Webhook</Label>
                        <div className="flex">
                          <Input 
                            id="webhookUrl" 
                            name="webhookUrl"
                            value={config.webhookUrl}
                            onChange={handleInputChange}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="ml-2"
                            onClick={() => copyToClipboard(config.webhookUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Esta es la URL a la que se enviarán los datos del formulario de leads
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key (opcional)</Label>
                        <div className="flex">
                          <Input 
                            id="apiKey" 
                            name="apiKey"
                            type={showApiKey ? "text" : "password"}
                            value={config.apiKey}
                            onChange={handleInputChange}
                            placeholder="Introduce una API key para autenticación"
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="ml-2"
                          >
                            {showApiKey ? "Ocultar" : "Mostrar"}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Una clave de API opcional para autenticar las solicitudes al webhook
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="sendEmployeeId"
                          checked={config.sendEmployeeId}
                          onCheckedChange={(checked) => handleSwitchChange("sendEmployeeId", checked)}
                        />
                        <Label htmlFor="sendEmployeeId">Enviar ID de empleado</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Si está activado, incluirá el ID del empleado autenticado en la solicitud (null si es un webhook público)
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Redirecciones</CardTitle>
                      <CardDescription>
                        URLs para redirigir después del envío del formulario
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="successRedirectUrl">URL de Redirección (Éxito)</Label>
                        <Input 
                          id="successRedirectUrl" 
                          name="successRedirectUrl"
                          value={config.successRedirectUrl}
                          onChange={handleInputChange}
                          placeholder="https://ejemplo.com/gracias"
                        />
                        <p className="text-xs text-muted-foreground">
                          Página a la que se redirigirá después de un envío exitoso
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="errorRedirectUrl">URL de Redirección (Error)</Label>
                        <Input 
                          id="errorRedirectUrl" 
                          name="errorRedirectUrl"
                          value={config.errorRedirectUrl}
                          onChange={handleInputChange}
                          placeholder="https://ejemplo.com/error"
                        />
                        <p className="text-xs text-muted-foreground">
                          Página a la que se redirigirá en caso de error
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={resetConfiguration}
                    className="gap-2"
                  >
                    Restablecer valores predeterminados
                  </Button>
                  
                  <Button 
                    onClick={saveConfiguration} 
                    disabled={loading}
                    className="gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Guardar Configuración
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 