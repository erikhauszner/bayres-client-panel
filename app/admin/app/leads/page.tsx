"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Check, ExternalLink, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axios from "axios"
import { useAuth } from "@/contexts/auth-context"

// API URL base para el backend - Usar el puerto correcto 3000
const API_BASE_URL = "http://localhost:3000/api"

// Añadir log para depuración
console.log("API URL:", API_BASE_URL)

// Constantes para la configuración
const APP_NAME = "leads-app"
const APP_KEY = "config-general"

// Configuración por defecto
const DEFAULT_CONFIG = {
  webhookUrl: "http://localhost:5678/webhook-test/be66b691-8c96-40f7-b761-1c0890ce5301",
  apiKey: "",
  sendEmployeeId: false,
  notificationEmail: "",
  successRedirectUrl: "",
  errorRedirectUrl: ""
}

export default function LeadsAppPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { employee } = useAuth() // Obtener el empleado del contexto de autenticación
  
  // Estado para el formulario de leads
  const [formState, setFormState] = useState({
    keywords: "",
    location: "",
    quantity: "20",
    industry: "",
    companySize: "",
    positionLevel: ""
  })
  
  // Estado para la configuración de la app
  const [appConfig, setAppConfig] = useState(DEFAULT_CONFIG)
  const [configLoaded, setConfigLoaded] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [requestStatus, setRequestStatus] = useState<null | "success" | "error">(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Cargar configuración desde la API al iniciar
  useEffect(() => {
    const fetchConfig = async () => {
      setConfigLoaded(false)
      setError(null)
      
      try {
        console.log("Intentando cargar configuración desde:", `${API_BASE_URL}/app-config/public/${APP_NAME}/${APP_KEY}`)
        // Intentar obtener la configuración del backend
        const response = await axios.get(`${API_BASE_URL}/app-config/public/${APP_NAME}/${APP_KEY}`)
        
        if (response.data && response.data.success) {
          // Si hay configuración guardada, usarla
          setAppConfig(response.data.data || DEFAULT_CONFIG)
          console.log("Configuración cargada desde la API:", response.data.data)
        } else {
          // Si no hay configuración guardada, usar valores por defecto
          setAppConfig(DEFAULT_CONFIG)
          console.log("Usando configuración por defecto")
        }
      } catch (err) {
        console.error("Error al cargar la configuración:", err)
        // En caso de error (404 u otro), usar la configuración por defecto
        setAppConfig(DEFAULT_CONFIG)
        
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
        setConfigLoaded(true)
      }
    }
    
    fetchConfig()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setRequestStatus(null)
    setError(null)

    try {
      if (configLoaded && appConfig.webhookUrl) {
        console.log("Enviando datos a:", appConfig.webhookUrl)
        
        // Verificar si employee existe y si sendEmployeeId está activado
        console.log("Estado de employee:", employee ? "Disponible" : "No disponible", "ID:", employee?._id)
        console.log("Objeto employee completo:", JSON.stringify(employee, null, 2))
        console.log("sendEmployeeId activado:", appConfig.sendEmployeeId)
        
        // Determinar el ID del empleado con fallbacks
        let employeeId = '';
        
        // En MongoDB, los IDs son objetos pero tienen una representación en string
        if (employee && employee._id) {
          // Si es un objeto de MongoDB con toString
          if (typeof employee._id === 'object' && employee._id !== null && typeof (employee._id as any).toString === 'function') {
            employeeId = (employee._id as any).toString();
          } else {
            // Si ya es un string
            employeeId = String(employee._id);
          }
        } else if (employee && (employee as any).id) {
          employeeId = String((employee as any).id);
        } else {
          // Intentar obtener desde localStorage como último recurso
          const storedId = localStorage.getItem('employeeId');
          employeeId = storedId || '64f5a2e7c4231a6a940d6c89'; // ID de respaldo por si todo falla
        }
        
        console.log("ID del empleado a usar:", employeeId)
        
        // Preparar los datos para el envío
        const requestData = {
          ...formState,
          // Siempre incluir el employee_id
          employee_id: employeeId,
          timestamp: new Date().toISOString()
        }
        
        console.log("Datos enviados:", requestData)
        console.log("ID del empleado enviado:", requestData.employee_id)
        
        // Enviar datos al webhook de n8n
        const response = await axios.post(appConfig.webhookUrl, requestData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': appConfig.apiKey ? `Bearer ${appConfig.apiKey}` : undefined
          }
        })
        
        console.log("Respuesta de n8n:", response.data)
        
        // Marcar como exitoso y generar ID de solicitud
        setRequestStatus("success")
        setRequestId(`gen_req_${Date.now()}`)
        
        // Mostrar mensaje de éxito
        toast({
          title: "Solicitud enviada",
          description: "Tu solicitud de generación de leads ha sido recibida. n8n procesará tu solicitud.",
          variant: "default"
        })
        
        // Redirigir a URL de éxito si está configurada
        if (appConfig.successRedirectUrl) {
          window.location.href = appConfig.successRedirectUrl
        }
        
        // Reset form
        setFormState({
          keywords: "",
          location: "",
          quantity: "20",
          industry: "",
          companySize: "",
          positionLevel: ""
        })
      } else {
        throw new Error("Configuración de webhook no disponible")
      }
    } catch (err) {
      console.error("Error al enviar solicitud:", err)
      setRequestStatus("error")
      
      let errorMessage = "Ocurrió un problema al procesar tu solicitud. Inténtalo nuevamente."
      
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      setError(errorMessage)
      
      // Mostrar mensaje de error
      toast({
        title: "Error al procesar la solicitud",
        description: errorMessage,
        variant: "destructive"
      })
      
      // Redirigir a URL de error si está configurada
      if (appConfig.errorRedirectUrl) {
        window.location.href = appConfig.errorRedirectUrl
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">App de Generación de Leads</h1>
              <p className="text-muted-foreground mt-1">
                Genera leads de alta calidad basados en criterios específicos
              </p>
            </div>

            {!configLoaded ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !appConfig.webhookUrl ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuración incompleta</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>La app requiere configuración para funcionar correctamente.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push("/admin/app/leads/config")}
                  >
                    Ir a configuración
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                <ExternalLink className="h-4 w-4" />
                <AlertTitle>Webhook configurado</AlertTitle>
                <AlertDescription>
                  Los datos se enviarán a: {appConfig.webhookUrl.length > 40 ? appConfig.webhookUrl.substring(0, 40) + '...' : appConfig.webhookUrl}
                  {employee && <div className="mt-1 text-xs">ID de empleado: {employee._id || 'No disponible'}</div>}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Solicitar Generación de Leads</CardTitle>
                <CardDescription>
                  Completa el formulario para generar leads según tus criterios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="lead-generate-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="keywords">Palabras clave</Label>
                      <Textarea 
                        id="keywords" 
                        name="keywords"
                        placeholder="Ej: desarrollo web, marketing digital, diseño gráfico"
                        value={formState.keywords}
                        onChange={handleInputChange}
                        className="min-h-20"
                      />
                      <p className="text-xs text-muted-foreground">
                        Ingresa palabras clave relacionadas con la industria o servicio que te interesa
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Ubicación</Label>
                      <Input 
                        id="location" 
                        name="location"
                        placeholder="Ej: Madrid, España"
                        value={formState.location}
                        onChange={handleInputChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        Especifica la ciudad, región o país objetivo
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Cantidad de leads</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        placeholder="Ej: 20"
                        value={formState.quantity}
                        onChange={handleInputChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        Indica la cantidad de leads que necesitas generar
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <p className="text-sm font-medium">Filtros adicionales (opcionales)</p>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industria</Label>
                        <Input 
                          id="industry" 
                          name="industry"
                          placeholder="Ej: Tecnología, Finanzas, Educación"
                          value={formState.industry}
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-muted-foreground">
                          Especifica la industria o sector de interés
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="companySize">Tamaño de empresa</Label>
                        <Input 
                          id="companySize" 
                          name="companySize"
                          placeholder="Ej: Pequeña, Mediana, Grande"
                          value={formState.companySize}
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-muted-foreground">
                          Especifica el tamaño de las empresas objetivo
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="positionLevel">Nivel de cargo</Label>
                        <Input 
                          id="positionLevel" 
                          name="positionLevel"
                          placeholder="Ej: Gerente, Director, Ejecutivo"
                          value={formState.positionLevel}
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-muted-foreground">
                          Especifica el nivel jerárquico del cargo
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
                
                {requestStatus === "success" && (
                  <Alert className="mt-6 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Solicitud enviada correctamente</AlertTitle>
                    <AlertDescription>
                      Tu solicitud de generación de leads está siendo procesada. Recibirás una notificación cuando esté lista.
                    </AlertDescription>
                  </Alert>
                )}
                
                {requestStatus === "error" && (
                  <Alert className="mt-6 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error al procesar la solicitud</AlertTitle>
                    <AlertDescription>
                      Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  type="submit" 
                  form="lead-generate-form" 
                  disabled={loading || !configLoaded || !appConfig.webhookUrl}
                  className="min-w-32"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : "Generar Leads"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 