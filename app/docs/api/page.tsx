"use client"

import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Info, FileText, Link2, Shield, Zap } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ApiDocsPage() {
  const { toast } = useToast()

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Código copiado",
      description: "El código ha sido copiado al portapapeles",
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Documentación de la API</h1>
              <p className="text-muted-foreground mt-2">
                Guía completa para integrar sistemas externos con la API de Bayres CRM
              </p>
            </div>

            <Tabs defaultValue="authentication" className="space-y-6">
              <TabsList className="grid grid-cols-3 w-full lg:w-3/4">
                <TabsTrigger value="authentication" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Autenticación</span>
                </TabsTrigger>
                <TabsTrigger value="endpoints" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  <span>Endpoints</span>
                </TabsTrigger>
                <TabsTrigger value="examples" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Ejemplos</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="authentication" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Autenticación con API Keys
                    </CardTitle>
                    <CardDescription>
                      Cómo autenticar tus solicitudes a la API de Bayres CRM
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      Para autenticar tus solicitudes a la API de Bayres CRM, debes utilizar una API Key.
                      Estas claves se pueden generar desde el panel de administración en la sección
                      <strong> Configuración &gt; API Keys</strong>.
                    </p>

                    <div className="p-4 border rounded-md bg-muted/30 space-y-2">
                      <p className="font-medium">Requisitos de autenticación:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Todas las solicitudes a la API deben incluir una API Key válida.</li>
                        <li>La API Key debe enviarse en el encabezado <code className="bg-muted px-1 py-0.5 rounded">X-API-Key</code>.</li>
                        <li>Las API Keys tienen diferentes niveles de permisos (lectura, escritura, eliminación).</li>
                        <li>Las solicitudes sin una API Key válida recibirán un error 401 Unauthorized.</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">Ejemplo de solicitud con API Key:</p>
                      <div className="relative bg-black rounded-md p-4 text-white">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
{`// Ejemplo utilizando fetch en JavaScript
fetch('https://api.bayrescrm.com/api/external/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'brs_your_api_key_here'
  },
  body: JSON.stringify({
    title: 'Nueva notificación',
    message: 'Este es el contenido de la notificación',
    type: 'info',
    recipientId: '60d21b4667d0d8992e610c85'
  })
})`}
                        </pre>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => handleCopyCode(`fetch('https://api.bayrescrm.com/api/external/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'brs_your_api_key_here'
  },
  body: JSON.stringify({
    title: 'Nueva notificación',
    message: 'Este es el contenido de la notificación',
    type: 'info',
    recipientId: '60d21b4667d0d8992e610c85'
  })
})`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 p-4 border rounded-md bg-blue-50 space-y-2">
                      <p className="font-medium text-blue-800">Obtención y gestión de API Keys:</p>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                        <li>
                          <span className="font-medium">Generación:</span> Desde el panel, ve a <strong>Configuración &gt; API Keys &gt; Nueva API Key</strong>.
                        </li>
                        <li>
                          <span className="font-medium">Formato:</span> Todas las API Keys comienzan con el prefijo <code className="bg-blue-100 px-1 py-0.5 rounded">brs_</code> seguido de una cadena alfanumérica.
                        </li>
                        <li>
                          <span className="font-medium">Almacenamiento:</span> Guarda tu API Key de forma segura, solo se mostrará una vez al momento de crearla.
                        </li>
                        <li>
                          <span className="font-medium">Permisos:</span> Al crear una API Key, puedes asignar permisos específicos:
                          <ul className="list-disc list-inside ml-4 mt-1">
                            <li><strong>Lectura (read):</strong> Permite solo consultar datos.</li>
                            <li><strong>Lectura/Escritura (readwrite):</strong> Permite consultar y modificar datos.</li>
                            <li><strong>Completo (full):</strong> Permite todas las operaciones, incluida la eliminación.</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">Expiración:</span> Puedes configurar un período de validez (30 días, 90 días o 1 año).
                        </li>
                      </ol>
                    </div>

                    <div className="p-4 border border-amber-200 bg-amber-50 rounded-md flex">
                      <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium">Importante sobre la seguridad:</p>
                        <p className="mt-1">
                          Nunca compartas tu API Key o la incluyas en código del lado del cliente público.
                          Las API Keys deben ser almacenadas de forma segura y utilizadas solo en servidores
                          o entornos protegidos.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gestión de API Keys</CardTitle>
                    <CardDescription>
                      Recomendaciones para administrar tus API Keys
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-4 border rounded-md space-y-2">
                        <h3 className="font-medium flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Mejores prácticas
                        </h3>
                        <ul className="text-sm space-y-2">
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Utiliza nombres descriptivos para tus API Keys.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Configura fecha de expiración para mayor seguridad.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Asigna los permisos mínimos necesarios.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Rota tus API Keys periódicamente.</span>
                          </li>
                        </ul>
                      </div>
                      <div className="p-4 border rounded-md space-y-2">
                        <h3 className="font-medium flex items-center gap-2">
                          <Info className="h-4 w-4 text-primary" />
                          ¿Cuándo regenerar una API Key?
                        </h3>
                        <ul className="text-sm space-y-2">
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Cuando sospechas que ha sido comprometida.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Al cambiar el equipo de desarrollo.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Como parte de tus políticas de seguridad periódicas.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Después de completar una auditoría de seguridad.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="endpoints" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-primary" />
                      Endpoints Disponibles
                    </CardTitle>
                    <CardDescription>
                      Lista de endpoints disponibles para uso con API Keys
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="notificaciones" className="space-y-4">
                      <TabsList className="grid grid-cols-6 w-full">
                        <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
                        <TabsTrigger value="leads">Leads</TabsTrigger>
                        <TabsTrigger value="clientes">Clientes</TabsTrigger>
                        <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
                        <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
                        <TabsTrigger value="configuracion">Configuración</TabsTrigger>
                      </TabsList>

                      <TabsContent value="notificaciones" className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          Esta categoría contiene endpoints para gestionar notificaciones en el sistema.
                        </p>

                        {/* POST notifications endpoint */}
                        <div className="border rounded-md overflow-hidden">
                          <div className="p-3 border-b bg-muted/30">
                            <div className="flex justify-between items-center">
                              <div className="flex gap-2 items-center">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900"
                                >
                                  POST
                                </Button>
                                <code className="text-sm">/api/external/notifications</code>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs h-7" 
                                onClick={() => document.getElementById('notifications-post-details')?.classList.toggle('hidden')}
                              >
                                <span>Expandir</span>
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Envía una notificación a un usuario o grupo de usuarios.
                            </p>
                          </div>
                          <div id="notifications-post-details" className="hidden">
                            <div className="p-4 space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">Descripción</h4>
                                <p className="text-sm text-muted-foreground">
                                  Este endpoint permite enviar notificaciones personalizadas a los usuarios del sistema.
                                  Las notificaciones pueden ser informativas, alertas, errores o éxitos.
                                </p>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Parámetros del cuerpo</h4>
                                <div className="bg-muted/30 rounded-md overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 px-3">Campo</th>
                                        <th className="text-left py-2 px-3">Tipo</th>
                                        <th className="text-left py-2 px-3">Requerido</th>
                                        <th className="text-left py-2 px-3">Descripción</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">title</td>
                                        <td>string</td>
                                        <td>Sí</td>
                                        <td>Título de la notificación</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">message</td>
                                        <td>string</td>
                                        <td>Sí</td>
                                        <td>Contenido de la notificación</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">type</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Tipo: 'info', 'warning', 'error', 'success'</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">recipientId</td>
                                        <td>string</td>
                                        <td>Sí</td>
                                        <td>ID del empleado destinatario</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 px-3">link</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>URL opcional para redireccionar al hacer clic</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Ejemplo de petición</h4>
                                <div className="relative bg-black rounded-md p-4 text-white">
                                  <pre className="text-sm font-mono whitespace-pre-wrap">
{`fetch('https://api.bayrescrm.com/api/external/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'brs_your_api_key_here'
  },
  body: JSON.stringify({
    title: 'Nueva notificación',
    message: 'Este es el contenido de la notificación',
    type: 'info',
    recipientId: '60d21b4667d0d8992e610c85'
  })
})`}
                                  </pre>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                    onClick={() => handleCopyCode(`fetch('https://api.bayrescrm.com/api/external/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'brs_your_api_key_here'
  },
  body: JSON.stringify({
    title: 'Nueva notificación',
    message: 'Este es el contenido de la notificación',
    type: 'info',
    recipientId: '60d21b4667d0d8992e610c85'
  })
})`)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Respuesta exitosa (200 OK)</h4>
                                <div className="relative bg-black rounded-md p-4 text-white">
                                  <pre className="text-sm font-mono whitespace-pre-wrap">
{`{
  "success": true,
  "message": "Notificación enviada correctamente",
  "data": {
    "id": "64f7b2d5e9a72d3e5bc92a1c",
    "title": "Nueva notificación",
    "message": "Este es el contenido de la notificación",
    "type": "info",
    "recipientId": "60d21b4667d0d8992e610c85",
    "read": false,
    "createdAt": "2023-09-05T14:32:21.000Z"
  }
}`}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* GET notifications endpoint */}
                        <div className="border rounded-md overflow-hidden">
                          <div className="p-3 border-b bg-muted/30">
                            <div className="flex justify-between items-center">
                              <div className="flex gap-2 items-center">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:text-blue-900"
                                >
                                  GET
                                </Button>
                                <code className="text-sm">/api/external/notifications</code>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs h-7" 
                                onClick={() => document.getElementById('notifications-get-details')?.classList.toggle('hidden')}
                              >
                                <span>Expandir</span>
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Obtiene las notificaciones para un usuario específico.
                            </p>
                          </div>
                          <div id="notifications-get-details" className="hidden">
                            <div className="p-4 space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">Descripción</h4>
                                <p className="text-sm text-muted-foreground">
                                  Este endpoint permite obtener todas las notificaciones asociadas a un usuario específico. 
                                  Incluye opciones de filtrado y paginación.
                                </p>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Parámetros de consulta</h4>
                                <div className="bg-muted/30 rounded-md overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 px-3">Parámetro</th>
                                        <th className="text-left py-2 px-3">Tipo</th>
                                        <th className="text-left py-2 px-3">Requerido</th>
                                        <th className="text-left py-2 px-3">Descripción</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {/* Paginación y ordenamiento */}
                                      <tr className="border-b bg-gray-50">
                                        <td colSpan={4} className="py-2 px-3 font-medium text-gray-600">Paginación y ordenamiento</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">page</td>
                                        <td>number</td>
                                        <td>No</td>
                                        <td>Número de página (por defecto: 1)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">limit</td>
                                        <td>number</td>
                                        <td>No</td>
                                        <td>Resultados por página (por defecto: 10)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">sort</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Campo por el cual ordenar (ej. 'createdAt', 'firstName')</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">order</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Dirección de ordenamiento ('asc' o 'desc', por defecto: 'desc')</td>
                                      </tr>
                                      
                                      {/* Filtros básicos */}
                                      <tr className="border-b bg-gray-50">
                                        <td colSpan={4} className="py-2 px-3 font-medium text-gray-600">Filtros básicos</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">search</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Búsqueda por nombre, email, empresa, teléfono</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">status</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por estado (ej. nuevo, contactado, calificado)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">stage</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por etapa del lead (ej. conciencia, consideración)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">priority</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por prioridad (baja, media, alta)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">source</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por origen del lead</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">assignedTo</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>ID del empleado asignado</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">unassigned</td>
                                        <td>boolean</td>
                                        <td>No</td>
                                        <td>Si es true, muestra solo leads sin asignar</td>
                                      </tr>
                                      
                                      {/* Filtros por fecha */}
                                      <tr className="border-b bg-gray-50">
                                        <td colSpan={4} className="py-2 px-3 font-medium text-gray-600">Filtros por fecha</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">createdAfter</td>
                                        <td>date</td>
                                        <td>No</td>
                                        <td>Leads creados después de esta fecha (ISO format)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">createdBefore</td>
                                        <td>date</td>
                                        <td>No</td>
                                        <td>Leads creados antes de esta fecha (ISO format)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">lastActivityAfter</td>
                                        <td>date</td>
                                        <td>No</td>
                                        <td>Leads con actividad después de esta fecha</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">nextContactAfter</td>
                                        <td>date</td>
                                        <td>No</td>
                                        <td>Leads con próximo contacto después de esta fecha</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">nextContactBefore</td>
                                        <td>date</td>
                                        <td>No</td>
                                        <td>Leads con próximo contacto antes de esta fecha</td>
                                      </tr>
                                      
                                      {/* Filtros adicionales */}
                                      <tr className="border-b bg-gray-50">
                                        <td colSpan={4} className="py-2 px-3 font-medium text-gray-600">Filtros adicionales</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">industry</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por industria</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">city</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por ciudad</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">country</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por país</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">tag</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por etiqueta específica</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">minEstimatedValue</td>
                                        <td>number</td>
                                        <td>No</td>
                                        <td>Valor estimado mínimo</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">maxEstimatedValue</td>
                                        <td>number</td>
                                        <td>No</td>
                                        <td>Valor estimado máximo</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 px-3">interestedIn</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Producto o servicio de interés</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Respuesta exitosa (200 OK)</h4>
                                <div className="relative bg-black rounded-md p-4 text-white">
                                  <pre className="text-sm font-mono whitespace-pre-wrap">
{`{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "64f7b2d5e9a72d3e5bc92a1c",
        "title": "Nueva notificación",
        "message": "Este es el contenido de la notificación",
        "type": "info",
        "recipientId": "60d21b4667d0d8992e610c85",
        "read": false,
        "createdAt": "2023-09-05T14:32:21.000Z"
      },
      // ... más notificaciones
    ],
    "total": 24,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}`}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* DELETE notifications endpoint */}
                        <div className="border rounded-md overflow-hidden">
                          <div className="p-3 border-b bg-muted/30">
                            <div className="flex justify-between items-center">
                              <div className="flex gap-2 items-center">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:text-red-900"
                                >
                                  DELETE
                                </Button>
                                <code className="text-sm">/api/external/notifications/{'{notificationId}'}</code>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs h-7" 
                                onClick={() => document.getElementById('notifications-delete-details')?.classList.toggle('hidden')}
                              >
                                <span>Expandir</span>
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Elimina una notificación específica.
                            </p>
                          </div>
                          <div id="notifications-delete-details" className="hidden">
                            <div className="p-4 space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">Descripción</h4>
                                <p className="text-sm text-muted-foreground">
                                  Este endpoint permite eliminar una notificación específica por su ID.
                                </p>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Parámetros de ruta</h4>
                                <div className="bg-muted/30 rounded-md overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 px-3">Parámetro</th>
                                        <th className="text-left py-2 px-3">Tipo</th>
                                        <th className="text-left py-2 px-3">Requerido</th>
                                        <th className="text-left py-2 px-3">Descripción</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td className="py-2 px-3">notificationId</td>
                                        <td>string</td>
                                        <td>Sí</td>
                                        <td>ID de la notificación a eliminar</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Respuesta exitosa (200 OK)</h4>
                                <div className="relative bg-black rounded-md p-4 text-white">
                                  <pre className="text-sm font-mono whitespace-pre-wrap">
{`{
  "success": true,
  "message": "Notificación eliminada correctamente"
}`}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="leads" className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          Esta categoría contiene endpoints para gestionar leads en el sistema.
                        </p>
                        
                        {/* GET leads endpoint */}
                        <div className="border rounded-md overflow-hidden">
                          <div className="p-3 border-b bg-muted/30">
                            <div className="flex justify-between items-center">
                              <div className="flex gap-2 items-center">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:text-blue-900"
                                >
                                  GET
                                </Button>
                                <code className="text-sm">/api/external/leads</code>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs h-7" 
                                onClick={() => document.getElementById('leads-get-details')?.classList.toggle('hidden')}
                              >
                                <span>Expandir</span>
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Obtiene una lista paginada y filtrable de leads.
                            </p>
                          </div>
                          <div id="leads-get-details" className="hidden">
                            <div className="p-4 space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">Descripción</h4>
                                <p className="text-sm text-muted-foreground">
                                  Este endpoint permite obtener una lista de leads con opciones avanzadas de filtrado y paginación.
                                </p>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Parámetros de consulta</h4>
                                <div className="bg-muted/30 rounded-md overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 px-3">Parámetro</th>
                                        <th className="text-left py-2 px-3">Tipo</th>
                                        <th className="text-left py-2 px-3">Requerido</th>
                                        <th className="text-left py-2 px-3">Descripción</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {/* Paginación y ordenamiento */}
                                      <tr className="border-b bg-gray-50">
                                        <td colSpan={4} className="py-2 px-3 font-medium text-gray-600">Paginación y ordenamiento</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">page</td>
                                        <td>number</td>
                                        <td>No</td>
                                        <td>Número de página (por defecto: 1)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">limit</td>
                                        <td>number</td>
                                        <td>No</td>
                                        <td>Resultados por página (por defecto: 10)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">sort</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Campo por el cual ordenar (ej. 'createdAt', 'firstName')</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">order</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Dirección de ordenamiento ('asc' o 'desc', por defecto: 'desc')</td>
                                      </tr>
                                      
                                      {/* Filtros básicos */}
                                      <tr className="border-b bg-gray-50">
                                        <td colSpan={4} className="py-2 px-3 font-medium text-gray-600">Filtros básicos</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">search</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Búsqueda por nombre, email, empresa, teléfono</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">status</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por estado (ej. nuevo, contactado, calificado)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">stage</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por etapa del lead (ej. conciencia, consideración)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">priority</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por prioridad (baja, media, alta)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">source</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por origen del lead</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">assignedTo</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>ID del empleado asignado</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">unassigned</td>
                                        <td>boolean</td>
                                        <td>No</td>
                                        <td>Si es true, muestra solo leads sin asignar</td>
                                      </tr>
                                      
                                      {/* Filtros por fecha */}
                                      <tr className="border-b bg-gray-50">
                                        <td colSpan={4} className="py-2 px-3 font-medium text-gray-600">Filtros por fecha</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">createdAfter</td>
                                        <td>date</td>
                                        <td>No</td>
                                        <td>Leads creados después de esta fecha (ISO format)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">createdBefore</td>
                                        <td>date</td>
                                        <td>No</td>
                                        <td>Leads creados antes de esta fecha (ISO format)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">lastActivityAfter</td>
                                        <td>date</td>
                                        <td>No</td>
                                        <td>Leads con actividad después de esta fecha</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">nextContactAfter</td>
                                        <td>date</td>
                                        <td>No</td>
                                        <td>Leads con próximo contacto después de esta fecha</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">nextContactBefore</td>
                                        <td>date</td>
                                        <td>No</td>
                                        <td>Leads con próximo contacto antes de esta fecha</td>
                                      </tr>
                                      
                                      {/* Filtros adicionales */}
                                      <tr className="border-b bg-gray-50">
                                        <td colSpan={4} className="py-2 px-3 font-medium text-gray-600">Filtros adicionales</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">industry</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por industria</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">city</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por ciudad</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">country</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por país</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">tag</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filtrar por etiqueta específica</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">minEstimatedValue</td>
                                        <td>number</td>
                                        <td>No</td>
                                        <td>Valor estimado mínimo</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">maxEstimatedValue</td>
                                        <td>number</td>
                                        <td>No</td>
                                        <td>Valor estimado máximo</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 px-3">interestedIn</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Producto o servicio de interés</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Respuesta exitosa (200 OK)</h4>
                                <div className="relative bg-black rounded-md p-4 text-white">
                                  <pre className="text-sm font-mono whitespace-pre-wrap">
{`{
  "data": [
    {
      "_id": "64f7b2d5e9a72d3e5bc92a1c",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan.perez@example.com",
      "phone": "+541123456789",
      "company": "Empresa de Ejemplo",
      "status": "pendiente",
      "currentStage": "nuevo",
      "source": "web",
      "priority": "media",
      "assignedTo": {
        "_id": "60d21b4667d0d8992e610c85",
        "firstName": "Ana",
        "lastName": "García",
        "email": "ana.garcia@bayrescrm.com"
      },
      "createdAt": "2023-09-05T14:32:21.000Z",
      "updatedAt": "2023-09-05T14:32:21.000Z"
    },
    // ... más leads
  ],
  "total": 143,
  "page": 1,
  "limit": 10,
  "pages": 15
}`}
                                  </pre>
                                </div>
                              </div>

                              <div className="mt-4">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => document.getElementById('leads-get-examples')?.classList.toggle('hidden')}
                                  className="w-full justify-center"
                                >
                                  <span>Ver ejemplos de peticiones</span>
                                </Button>
                              </div>

                              <div id="leads-get-examples" className="hidden mt-4 space-y-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium">Ejemplo con cURL</h4>
                                  <div className="relative bg-black rounded-md p-4 text-white">
                                    <pre className="text-sm font-mono whitespace-pre-wrap">
{`curl -X GET "https://api.bayrescrm.com/api/external/leads?page=1&limit=10&status=nuevo&priority=alta" \\
  -H "X-API-Key: brs_your_api_key_here"`}
                                    </pre>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                      onClick={() => handleCopyCode(`curl -X GET "https://api.bayrescrm.com/api/external/leads?page=1&limit=10&status=nuevo&priority=alta" \\
  -H "X-API-Key: brs_your_api_key_here"`)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="font-medium">Ejemplo con JavaScript</h4>
                                  <div className="relative bg-black rounded-md p-4 text-white">
                                    <pre className="text-sm font-mono whitespace-pre-wrap">
{`// Obtener leads con filtros
async function getLeads() {
  try {
    const response = await fetch(
      'https://api.bayrescrm.com/api/external/leads?page=1&limit=10&status=nuevo&priority=alta', 
      {
        method: 'GET',
        headers: {
          'X-API-Key': 'brs_your_api_key_here'
        }
      }
    );
    
    const data = await response.json();
    console.log('Leads obtenidos:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener leads:', error);
    throw error;
  }
}`}
                                    </pre>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                      onClick={() => handleCopyCode(`async function getLeads() {
  try {
    const response = await fetch(
      'https://api.bayrescrm.com/api/external/leads?page=1&limit=10&status=nuevo&priority=alta', 
      {
        method: 'GET',
        headers: {
          'X-API-Key': 'brs_your_api_key_here'
        }
      }
    );
    
    const data = await response.json();
    console.log('Leads obtenidos:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener leads:', error);
    throw error;
  }
}`)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="font-medium">Ejemplo con Python</h4>
                                  <div className="relative bg-black rounded-md p-4 text-white">
                                    <pre className="text-sm font-mono whitespace-pre-wrap">
{`import requests

def get_leads():
    api_url = "https://api.bayrescrm.com/api/external/leads"
    api_key = "brs_your_api_key_here"
    
    params = {
        "page": 1,
        "limit": 10,
        "status": "nuevo",
        "priority": "alta"
    }
    
    headers = {
        "X-API-Key": api_key
    }
    
    try:
        response = requests.get(
            api_url,
            headers=headers,
            params=params
        )
        
        response.raise_for_status()
        result = response.json()
        print("Leads obtenidos:", result)
        return result
    except requests.exceptions.RequestException as e:
        print("Error al obtener leads:", e)
        raise`}
                                    </pre>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                      onClick={() => handleCopyCode(`import requests

def get_leads():
    api_url = "https://api.bayrescrm.com/api/external/leads"
    api_key = "brs_your_api_key_here"
    
    params = {
        "page": 1,
        "limit": 10,
        "status": "nuevo",
        "priority": "alta"
    }
    
    headers = {
        "X-API-Key": api_key
    }
    
    try:
        response = requests.get(
            api_url,
            headers=headers,
            params=params
        )
        
        response.raise_for_status()
        result = response.json()
        print("Leads obtenidos:", result)
        return result
    except requests.exceptions.RequestException as e:
        print("Error al obtener leads:", e)
        raise`)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* POST leads endpoint */}
                        <div className="border rounded-md overflow-hidden">
                          <div className="p-3 border-b bg-muted/30">
                            <div className="flex justify-between items-center">
                              <div className="flex gap-2 items-center">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900"
                                >
                                  POST
                                </Button>
                                <code className="text-sm">/api/external/leads</code>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs h-7" 
                                onClick={() => document.getElementById('leads-post-details')?.classList.toggle('hidden')}
                              >
                                <span>Expandir</span>
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Crea un nuevo lead en el sistema.
                            </p>
                          </div>
                          <div id="leads-post-details" className="hidden">
                            <div className="p-4 space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">Descripción</h4>
                                <p className="text-sm text-muted-foreground">
                                  Este endpoint permite crear un nuevo lead con todos sus datos asociados. 
                                  Se verificará la unicidad de campos como email, teléfono, etc.
                                </p>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Parámetros del cuerpo</h4>
                                <div className="bg-muted/30 rounded-md overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 px-3">Campo</th>
                                        <th className="text-left py-2 px-3">Tipo</th>
                                        <th className="text-left py-2 px-3">Requerido</th>
                                        <th className="text-left py-2 px-3">Descripción</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {/* Información Básica */}
                                      <tr className="border-b bg-gray-50">
                                        <td colSpan={4} className="py-2 px-3 font-medium text-gray-600">Información Básica</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">firstName</td>
                                        <td>string</td>
                                        <td>Sí</td>
                                        <td>Nombre del lead</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">lastName</td>
                                        <td>string</td>
                                        <td>Sí</td>
                                        <td>Apellido del lead</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">company</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Empresa del lead</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">position</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Cargo o puesto en la empresa</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">industry</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Industria o sector de la empresa</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">companySize</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Tamaño de la empresa (ej. pequeña, mediana, grande)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">website</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Sitio web de la empresa</td>
                                      </tr>

                                      {/* Información de Contacto */}
                                      <tr className="border-b bg-gray-50">
                                        <td colSpan={4} className="py-2 px-3 font-medium text-gray-600">Información de Contacto</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">email</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Correo electrónico del lead</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">phone</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Teléfono de contacto</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">whatsapp</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Número de WhatsApp</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">instagram</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Perfil de Instagram</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">twitter</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Perfil de Twitter</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">linkedin</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Perfil de LinkedIn</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">facebook</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Perfil de Facebook</td>
                                      </tr>

                                      {/* Información de Ubicación */}
                                      <tr className="border-b bg-gray-50">
                                        <td colSpan={4} className="py-2 px-3 font-medium text-gray-600">Información de Ubicación</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">address</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Dirección</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">city</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Ciudad</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">state</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Estado o provincia</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">country</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>País</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">postalCode</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Código postal</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">timezone</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Zona horaria</td>
                                      </tr>

                                      {/* Información de Lead */}
                                      <tr className="border-b bg-gray-50">
                                        <td colSpan={4} className="py-2 px-3 font-medium text-gray-600">Información de Lead</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">source</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Origen del lead (ej. sitio_web, referido, redes_sociales, evento, anuncio)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">captureDate</td>
                                        <td>date</td>
                                        <td>No</td>
                                        <td>Fecha de captura (por defecto: fecha actual)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">initialScore</td>
                                        <td>number</td>
                                        <td>No</td>
                                        <td>Puntuación inicial (por defecto: 0)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">currentStage</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Etapa actual (ej. conciencia, consideración, decisión)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">status</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Estado (ej. nuevo, contactado, calificado, no_calificado, en_proceso)</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">priority</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Prioridad (baja, media, alta) (por defecto: media)</td>
                                      </tr>

                                      {/* Información Adicional */}
                                      <tr className="border-b bg-gray-50">
                                        <td colSpan={4} className="py-2 px-3 font-medium text-gray-600">Información Adicional</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">notes</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Notas adicionales</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">attachments</td>
                                        <td>array[string]</td>
                                        <td>No</td>
                                        <td>URLs de archivos adjuntos</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">tags</td>
                                        <td>array[string]</td>
                                        <td>No</td>
                                        <td>Etiquetas para categorizar el lead</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">categories</td>
                                        <td>array[string]</td>
                                        <td>No</td>
                                        <td>Categorías asignadas al lead</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">trackingStatus</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Estado de seguimiento</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">preferredContactTime</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Horario preferido de contacto</td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2 px-3">nextContactDate</td>
                                        <td>date</td>
                                        <td>No</td>
                                        <td>Fecha para el próximo contacto</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Ejemplo de petición</h4>
                                <div className="relative bg-black rounded-md p-4 text-white">
                                  <pre className="text-sm font-mono whitespace-pre-wrap">
{`fetch('https://api.bayrescrm.com/api/external/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'brs_your_api_key_here'
  },
  body: JSON.stringify({
    // Información Básica
    firstName: 'Juan',
    lastName: 'Pérez',
    company: 'Empresa de Ejemplo',
    position: 'Director de Marketing',
    industry: 'Tecnología',
    companySize: 'mediana',
    website: 'https://example.com',
    
    // Información de Contacto
    email: 'juan.perez@example.com',
    phone: '+541123456789',
    whatsapp: '+541123456789',
    instagram: '@juanperez',
    linkedin: 'https://linkedin.com/in/juanperez',
    
    // Información de Ubicación
    address: 'Calle Ejemplo 123',
    city: 'Buenos Aires',
    state: 'CABA',
    country: 'Argentina',
    postalCode: '1425',
    
    // Información de Lead
    source: 'sitio_web',
    status: 'nuevo',
    currentStage: 'conciencia',
    priority: 'alta',
    estimatedValue: 5000,
    estimatedBudget: 10000,
    interestedProducts: ['marketing digital', 'diseño web'],
    
    // Información Adicional
    notes: 'Interesado en servicios de marketing digital y rediseño de su sitio web',
    tags: ['marketing', 'diseño', 'cliente potencial'],
    preferredContactTime: 'mañanas',
    nextContactDate: '2023-10-15T10:00:00.000Z'
  })
})`}
                                  </pre>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                    onClick={() => handleCopyCode(`fetch('https://api.bayrescrm.com/api/external/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'brs_your_api_key_here'
  },
  body: JSON.stringify({
    // Información Básica
    firstName: 'Juan',
    lastName: 'Pérez',
    company: 'Empresa de Ejemplo',
    position: 'Director de Marketing',
    industry: 'Tecnología',
    companySize: 'mediana',
    website: 'https://example.com',
    
    // Información de Contacto
    email: 'juan.perez@example.com',
    phone: '+541123456789',
    whatsapp: '+541123456789',
    instagram: '@juanperez',
    linkedin: 'https://linkedin.com/in/juanperez',
    
    // Información de Ubicación
    address: 'Calle Ejemplo 123',
    city: 'Buenos Aires',
    state: 'CABA',
    country: 'Argentina',
    postalCode: '1425',
    
    // Información de Lead
    source: 'sitio_web',
    status: 'nuevo',
    currentStage: 'conciencia',
    priority: 'alta',
    estimatedValue: 5000,
    estimatedBudget: 10000,
    interestedProducts: ['marketing digital', 'diseño web'],
    
    // Información Adicional
    notes: 'Interesado en servicios de marketing digital y rediseño de su sitio web',
    tags: ['marketing', 'diseño', 'cliente potencial'],
    preferredContactTime: 'mañanas',
    nextContactDate: '2023-10-15T10:00:00.000Z'
  })
})`)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Respuesta exitosa (201 Created)</h4>
                                <div className="relative bg-black rounded-md p-4 text-white">
                                  <pre className="text-sm font-mono whitespace-pre-wrap">
{`{
  "_id": "64f7b2d5e9a72d3e5bc92a1c",
  
  // Información Básica (obligatorios)
  "firstName": "Juan",
  "lastName": "Pérez",
  
  // Información Básica (opcionales)
  "company": "Empresa de Ejemplo",
  "position": "Director de Marketing",
  "industry": "Tecnología",
  "companySize": "mediana",
  "website": "https://example.com",
  
  // Información de Contacto (opcionales)
  "email": "juan.perez@example.com",
  "phone": "+541123456789",
  "whatsapp": "+541123456789",
  "instagram": "@juanperez",
  "twitter": "@juanperez",
  "linkedin": "https://linkedin.com/in/juanperez",
  "facebook": "https://facebook.com/juanperez",
  
  // Información de Ubicación (opcionales)
  "address": "Calle Ejemplo 123",
  "city": "Buenos Aires",
  "state": "CABA",
  "country": "Argentina",
  "postalCode": "1425",
  "timezone": "America/Argentina/Buenos_Aires",
  
  // Información de Lead (opcionales)
  "source": "sitio_web",
  "status": "nuevo",
  "currentStage": "conciencia",
  "priority": "alta",
  "estimatedValue": 5000,
  "estimatedBudget": 10000,
  "interestedProducts": ["marketing digital", "diseño web"],
  
  // Información Adicional (opcionales)
  "notes": "Interesado en servicios de marketing digital y rediseño de su sitio web",
  "attachments": ["https://storage.bayrescrm.com/leads/64f7b2d5e9a72d3e5bc92a1c/propuesta.pdf"],
  "tags": ["marketing", "diseño", "cliente potencial"],
  "categories": ["empresa", "tecnología"],
  "trackingStatus": "en seguimiento",
  "preferredContactTime": "mañanas",
  "lastActivity": "2023-09-10T09:15:00.000Z",
  "nextContactDate": "2023-10-15T10:00:00.000Z",
  
  // Interacciones y tareas
  "interactionHistory": [
    {
      "_id": "64f7b2d5e9a72d3e5bc92a1d",
      "date": "2023-09-05T14:32:21.000Z",
      "type": "email",
      "title": "Primer contacto",
      "description": "Email de bienvenida enviado",
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "firstName": "Ana",
        "lastName": "García"
      }
    },
    {
      "_id": "64f8c3e5f9a72d3e5bc92a2e",
      "date": "2023-09-10T09:15:00.000Z",
      "type": "llamada",
      "title": "Llamada de seguimiento",
      "description": "Se habló sobre las necesidades específicas de marketing",
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "firstName": "Ana",
        "lastName": "García"
      }
    }
  ],
  "tasks": [
    {
      "_id": "64f9d4f6g0b83e6f7cd3b1f",
      "title": "Enviar propuesta",
      "description": "Preparar y enviar propuesta comercial",
      "dueDate": "2023-09-20T12:00:00.000Z",
      "status": "pending",
      "priority": "alta",
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "firstName": "Ana",
        "lastName": "García"
      },
      "createdAt": "2023-09-10T10:00:00.000Z"
    }
  ],
  "documents": [
    {
      "_id": "65a2e5f7h1c94f7g8de4c2g",
      "name": "Propuesta comercial",
      "description": "Propuesta inicial de servicios",
      "fileUrl": "https://storage.bayrescrm.com/leads/64f7b2d5e9a72d3e5bc92a1c/propuesta.pdf",
      "fileType": "pdf",
      "fileSize": 1254000,
      "tags": ["propuesta", "comercial"],
      "uploadDate": "2023-09-15T16:45:00.000Z",
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "firstName": "Ana",
        "lastName": "García"
      }
    }
  ],
  
  // Campos de sistema
  "assignedTo": {
    "_id": "60d21b4667d0d8992e610c85",
    "firstName": "Ana",
    "lastName": "García",
    "email": "ana.garcia@bayrescrm.com"
  },
  "createdBy": {
    "_id": "60d21b4667d0d8992e610c85",
    "firstName": "Ana",
    "lastName": "García",
    "email": "ana.garcia@bayrescrm.com"
  },
  "createdAt": "2023-09-05T14:32:21.000Z",
  "updatedAt": "2023-09-15T16:45:00.000Z"
}`}
                                  </pre>
                                </div>
                              </div>

                              <div className="mt-4">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => document.getElementById('leads-post-examples')?.classList.toggle('hidden')}
                                  className="w-full justify-center"
                                >
                                  <span>Ver ejemplos de peticiones</span>
                                </Button>
                              </div>

                              <div id="leads-post-examples" className="hidden mt-4 space-y-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium">Ejemplo con cURL</h4>
                                  <div className="relative bg-black rounded-md p-4 text-white">
                                    <pre className="text-sm font-mono whitespace-pre-wrap">
{`curl -X POST https://api.bayrescrm.com/api/external/leads \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: brs_your_api_key_here" \\
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "phone": "+541123456789",
    "company": "Empresa de Ejemplo",
    "position": "Director de Marketing",
    "source": "sitio_web",
    "status": "nuevo",
    "priority": "alta"
  }'`}
                                    </pre>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                      onClick={() => handleCopyCode(`curl -X POST https://api.bayrescrm.com/api/external/leads \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: brs_your_api_key_here" \\
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "phone": "+541123456789",
    "company": "Empresa de Ejemplo",
    "position": "Director de Marketing",
    "source": "sitio_web",
    "status": "nuevo",
    "priority": "alta"
  }'`)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="font-medium">Ejemplo del cuerpo JSON completo</h4>
                                  <div className="relative bg-black rounded-md p-4 text-white">
                                    <pre className="text-sm font-mono whitespace-pre-wrap">
{`{
  // Información Básica (obligatorios)
  "firstName": "Juan",
  "lastName": "Pérez",
  
  // Información Básica (opcionales)
  "company": "Empresa de Ejemplo",
  "position": "Director de Marketing",
  "industry": "Tecnología",
  "companySize": "mediana",
  "website": "https://example.com",
  
  // Información de Contacto (opcionales)
  "email": "juan.perez@example.com",
  "phone": "+541123456789",
  "whatsapp": "+541123456789",
  "instagram": "@juanperez",
  "twitter": "@juanperez",
  "linkedin": "https://linkedin.com/in/juanperez",
  "facebook": "https://facebook.com/juanperez",
  
  // Información de Ubicación (opcionales)
  "address": "Calle Ejemplo 123",
  "city": "Buenos Aires",
  "state": "CABA",
  "country": "Argentina",
  "postalCode": "1425",
  "timezone": "America/Argentina/Buenos_Aires",
  
  // Información de Lead (opcionales)
  "source": "sitio_web",
  "status": "nuevo",
  "currentStage": "conciencia",
  "priority": "alta",
  "estimatedValue": 5000,
  "estimatedBudget": 10000,
  "interestedProducts": ["marketing digital", "diseño web"],
  
  // Información Adicional (opcionales)
  "notes": "Interesado en servicios de marketing digital y rediseño de su sitio web",
  "tags": ["marketing", "diseño", "cliente potencial"],
  "preferredContactTime": "mañanas",
  "nextContactDate": "2023-10-15T10:00:00.000Z"
}`}
                                    </pre>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                      onClick={() => handleCopyCode(`{
  // Información Básica (obligatorios)
  "firstName": "Juan",
  "lastName": "Pérez",
  
  // Información Básica (opcionales)
  "company": "Empresa de Ejemplo",
  "position": "Director de Marketing",
  "industry": "Tecnología",
  "companySize": "mediana",
  "website": "https://example.com",
  
  // Información de Contacto (opcionales)
  "email": "juan.perez@example.com",
  "phone": "+541123456789",
  "whatsapp": "+541123456789",
  "instagram": "@juanperez",
  "twitter": "@juanperez",
  "linkedin": "https://linkedin.com/in/juanperez",
  "facebook": "https://facebook.com/juanperez",
  
  // Información de Ubicación (opcionales)
  "address": "Calle Ejemplo 123",
  "city": "Buenos Aires",
  "state": "CABA",
  "country": "Argentina",
  "postalCode": "1425",
  "timezone": "America/Argentina/Buenos_Aires",
  
  // Información de Lead (opcionales)
  "source": "sitio_web",
  "status": "nuevo",
  "currentStage": "conciencia",
  "priority": "alta",
  "estimatedValue": 5000,
  "estimatedBudget": 10000,
  "interestedProducts": ["marketing digital", "diseño web"],
  
  // Información Adicional (opcionales)
  "notes": "Interesado en servicios de marketing digital y rediseño de su sitio web",
  "tags": ["marketing", "diseño", "cliente potencial"],
  "preferredContactTime": "mañanas",
  "nextContactDate": "2023-10-15T10:00:00.000Z"
}`)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="font-medium">Ejemplo con Python</h4>
                                  <div className="relative bg-black rounded-md p-4 text-white">
                                    <pre className="text-sm font-mono whitespace-pre-wrap">
{`import requests
import json

def create_lead():
    api_url = "https://api.bayrescrm.com/api/external/leads"
    api_key = "brs_your_api_key_here"
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }
    
    lead_data = {
        "firstName": "Juan",
        "lastName": "Pérez",
        "email": "juan.perez@example.com",  # Campo opcional
        "phone": "+541123456789",
        "company": "Empresa de Ejemplo",
        "position": "Director de Marketing",
        "industry": "Tecnología",
        "source": "sitio_web",
        "status": "nuevo",
        "priority": "alta",
        "notes": "Interesado en servicios de marketing digital"
    }
    
    try:
        response = requests.post(
            api_url,
            headers=headers,
            data=json.dumps(lead_data)
        )
        
        response.raise_for_status()
        result = response.json()
        print("Lead creado:", result)
        return result
    except requests.exceptions.RequestException as e:
        print("Error al crear lead:", e)
        raise`}
                                    </pre>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                      onClick={() => handleCopyCode(`import requests
import json

def create_lead():
    api_url = "https://api.bayrescrm.com/api/external/leads"
    api_key = "brs_your_api_key_here"
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }
    
    lead_data = {
        "firstName": "Juan",
        "lastName": "Pérez",
        "email": "juan.perez@example.com",  # Campo opcional
        "phone": "+541123456789",
        "company": "Empresa de Ejemplo",
        "position": "Director de Marketing",
        "industry": "Tecnología",
        "source": "sitio_web",
        "status": "nuevo",
        "priority": "alta",
        "notes": "Interesado en servicios de marketing digital"
    }
    
    try:
        response = requests.post(
            api_url,
            headers=headers,
            data=json.dumps(lead_data)
        )
        
        response.raise_for_status()
        result = response.json()
        print("Lead creado:", result)
        return result
    except requests.exceptions.RequestException as e:
        print("Error al crear lead:", e)
        raise`)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* GET lead by ID endpoint */}
                        <div className="border rounded-md overflow-hidden">
                          <div className="p-3 border-b bg-muted/30">
                            <div className="flex justify-between items-center">
                              <div className="flex gap-2 items-center">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:text-blue-900"
                                >
                                  GET
                                </Button>
                                <code className="text-sm">/api/external/leads/{'{id}'}</code>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs h-7" 
                                onClick={() => document.getElementById('leads-get-id-details')?.classList.toggle('hidden')}
                              >
                                <span>Expandir</span>
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Obtiene los detalles de un lead específico por su ID.
                            </p>
                          </div>
                          <div id="leads-get-id-details" className="hidden">
                            <div className="p-4 space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">Descripción</h4>
                                <p className="text-sm text-muted-foreground">
                                  Este endpoint permite obtener información detallada de un lead específico por su ID, 
                                  incluyendo su historial de interacciones y tareas asociadas.
                                </p>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Parámetros de ruta</h4>
                                <div className="bg-muted/30 rounded-md overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 px-3">Parámetro</th>
                                        <th className="text-left py-2 px-3">Tipo</th>
                                        <th className="text-left py-2 px-3">Requerido</th>
                                        <th className="text-left py-2 px-3">Descripción</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td className="py-2 px-3">id</td>
                                        <td>string</td>
                                        <td>Sí</td>
                                        <td>ID del lead a consultar</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Respuesta exitosa (200 OK)</h4>
                                <div className="relative bg-black rounded-md p-4 text-white">
                                  <pre className="text-sm font-mono whitespace-pre-wrap">
{`{
  "_id": "64f7b2d5e9a72d3e5bc92a1c",
  
  // Información Básica
  "firstName": "Juan",
  "lastName": "Pérez",
  "company": "Empresa de Ejemplo",
  "position": "Director de Marketing",
  "industry": "Tecnología",
  "companySize": "mediana",
  "website": "https://example.com",
  
  // Información de Contacto
  "email": "juan.perez@example.com",
  "phone": "+541123456789",
  "whatsapp": "+541123456789",
  "instagram": "@juanperez",
  "twitter": "@juanperez",
  "linkedin": "https://linkedin.com/in/juanperez",
  "facebook": "https://facebook.com/juanperez",
  
  // Información de Ubicación
  "address": "Calle Ejemplo 123",
  "city": "Buenos Aires",
  "state": "CABA",
  "country": "Argentina",
  "postalCode": "1425",
  "timezone": "America/Argentina/Buenos_Aires",
  
  // Información de Lead
  "source": "sitio_web",
  "captureDate": "2023-09-05T14:32:21.000Z",
  "initialScore": 0,
  "currentStage": "conciencia",
  "status": "nuevo",
  "estimatedValue": 5000,
  "priority": "alta",
  "interestedProducts": ["marketing digital", "diseño web"],
  "estimatedBudget": 10000,
  
  // Información Adicional
  "notes": "Interesado en servicios de marketing digital y rediseño de su sitio web",
  "attachments": ["https://storage.bayrescrm.com/leads/64f7b2d5e9a72d3e5bc92a1c/propuesta.pdf"],
  "tags": ["marketing", "diseño", "cliente potencial"],
  "categories": ["empresa", "tecnología"],
  "trackingStatus": "en seguimiento",
  "preferredContactTime": "mañanas",
  "lastActivity": "2023-09-10T09:15:00.000Z",
  "nextContactDate": "2023-10-15T10:00:00.000Z",
  
  // Interacciones y tareas
  "interactionHistory": [
    {
      "_id": "64f7b2d5e9a72d3e5bc92a1d",
      "date": "2023-09-05T14:32:21.000Z",
      "type": "email",
      "title": "Primer contacto",
      "description": "Email de bienvenida enviado",
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "firstName": "Ana",
        "lastName": "García"
      }
    },
    {
      "_id": "64f8c3e5f9a72d3e5bc92a2e",
      "date": "2023-09-10T09:15:00.000Z",
      "type": "llamada",
      "title": "Llamada de seguimiento",
      "description": "Se habló sobre las necesidades específicas de marketing",
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "firstName": "Ana",
        "lastName": "García"
      }
    }
  ],
  "tasks": [
    {
      "_id": "64f9d4f6g0b83e6f7cd3b1f",
      "title": "Enviar propuesta",
      "description": "Preparar y enviar propuesta comercial",
      "dueDate": "2023-09-20T12:00:00.000Z",
      "status": "pending",
      "priority": "alta",
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "firstName": "Ana",
        "lastName": "García"
      },
      "createdAt": "2023-09-10T10:00:00.000Z"
    }
  ],
  "documents": [
    {
      "_id": "65a2e5f7h1c94f7g8de4c2g",
      "name": "Propuesta comercial",
      "description": "Propuesta inicial de servicios",
      "fileUrl": "https://storage.bayrescrm.com/leads/64f7b2d5e9a72d3e5bc92a1c/propuesta.pdf",
      "fileType": "pdf",
      "fileSize": 1254000,
      "tags": ["propuesta", "comercial"],
      "uploadDate": "2023-09-15T16:45:00.000Z",
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "firstName": "Ana",
        "lastName": "García"
      }
    }
  ],
  
  // Campos de sistema
  "assignedTo": {
    "_id": "60d21b4667d0d8992e610c85",
    "firstName": "Ana",
    "lastName": "García",
    "email": "ana.garcia@bayrescrm.com"
  },
  "createdBy": {
    "_id": "60d21b4667d0d8992e610c85",
    "firstName": "Ana",
    "lastName": "García",
    "email": "ana.garcia@bayrescrm.com"
  },
  "createdAt": "2023-09-05T14:32:21.000Z",
  "updatedAt": "2023-09-15T16:45:00.000Z"
}`}
                                  </pre>
                                </div>
                              </div>

                              <div className="mt-4">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => document.getElementById('leads-get-id-examples')?.classList.toggle('hidden')}
                                  className="w-full justify-center"
                                >
                                  <span>Ver ejemplos de peticiones</span>
                                </Button>
                              </div>

                              <div id="leads-get-id-examples" className="hidden mt-4 space-y-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium">Ejemplo con cURL</h4>
                                  <div className="relative bg-black rounded-md p-4 text-white">
                                    <pre className="text-sm font-mono whitespace-pre-wrap">
{`curl -X GET "https://api.bayrescrm.com/api/external/leads/64f7b2d5e9a72d3e5bc92a1c" \\
  -H "X-API-Key: brs_your_api_key_here"`}
                                    </pre>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                      onClick={() => handleCopyCode(`curl -X GET "https://api.bayrescrm.com/api/external/leads/64f7b2d5e9a72d3e5bc92a1c" \\
  -H "X-API-Key: brs_your_api_key_here"`)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="font-medium">Ejemplo con JavaScript</h4>
                                  <div className="relative bg-black rounded-md p-4 text-white">
                                    <pre className="text-sm font-mono whitespace-pre-wrap">
{`// Obtener un lead por su ID
async function getLeadById(leadId) {
  try {
    const response = await fetch(
      \`https://api.bayrescrm.com/api/external/leads/\${leadId}\`, 
      {
        method: 'GET',
        headers: {
          'X-API-Key': 'brs_your_api_key_here'
        }
      }
    );
    
    const data = await response.json();
    console.log('Lead obtenido:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener lead:', error);
    throw error;
  }
}

// Llamada a la función
getLeadById('64f7b2d5e9a72d3e5bc92a1c');`}
                                    </pre>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                      onClick={() => handleCopyCode(`// Obtener un lead por su ID
async function getLeadById(leadId) {
  try {
    const response = await fetch(
      \`https://api.bayrescrm.com/api/external/leads/\${leadId}\`, 
      {
        method: 'GET',
        headers: {
          'X-API-Key': 'brs_your_api_key_here'
        }
      }
    );
    
    const data = await response.json();
    console.log('Lead obtenido:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener lead:', error);
    throw error;
  }
}

// Llamada a la función
getLeadById('64f7b2d5e9a72d3e5bc92a1c');`)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="font-medium">Ejemplo con Python</h4>
                                  <div className="relative bg-black rounded-md p-4 text-white">
                                    <pre className="text-sm font-mono whitespace-pre-wrap">
{`import requests

def get_lead_by_id(lead_id):
    api_url = f"https://api.bayrescrm.com/api/external/leads/{lead_id}"
    api_key = "brs_your_api_key_here"
    
    headers = {
        "X-API-Key": api_key
    }
    
    try:
        response = requests.get(
            api_url,
            headers=headers
        )
        
        response.raise_for_status()
        result = response.json()
        print("Lead obtenido:", result)
        return result
    except requests.exceptions.RequestException as e:
        print("Error al obtener lead:", e)
        raise

# Llamada a la función
get_lead_by_id('64f7b2d5e9a72d3e5bc92a1c')`}
                                    </pre>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                      onClick={() => handleCopyCode(`import requests

def get_lead_by_id(lead_id):
    api_url = f"https://api.bayrescrm.com/api/external/leads/{lead_id}"
    api_key = "brs_your_api_key_here"
    
    headers = {
        "X-API-Key": api_key
    }
    
    try:
        response = requests.get(
            api_url,
            headers=headers
        )
        
        response.raise_for_status()
        result = response.json()
        print("Lead obtenido:", result)
        return result
    except requests.exceptions.RequestException as e:
        print("Error al obtener lead:", e)
        raise

# Llamada a la función
get_lead_by_id('64f7b2d5e9a72d3e5bc92a1c')`)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="clientes" className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Esta categoría contiene endpoints para gestionar clientes en el sistema.
                        </p>
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Endpoints de clientes serán implementados en esta sección.</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="proyectos" className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Esta categoría contiene endpoints para gestionar proyectos en el sistema.
                        </p>
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Endpoints de proyectos serán implementados en esta sección.</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="finanzas" className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Esta categoría contiene endpoints para gestionar finanzas en el sistema.
                        </p>
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Endpoints de finanzas serán implementados en esta sección.</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="configuracion" className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Esta categoría contiene endpoints para gestionar la configuración del sistema.
                        </p>
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Endpoints de configuración serán implementados en esta sección.</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="examples" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Ejemplos de Código
                    </CardTitle>
                    <CardDescription>
                      Ejemplos prácticos para integrar con la API de Bayres CRM
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Enviar una notificación (JavaScript)</h3>
                      <div className="relative bg-black rounded-md p-4 text-white">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
{`// Enviar una notificación a un usuario
async function sendNotification() {
  try {
    const response = await fetch('https://api.bayrescrm.com/api/external/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'brs_your_api_key_here'
      },
      body: JSON.stringify({
        title: 'Recordatorio de reunión',
        message: 'Tienes una reunión programada para mañana a las 10:00 AM',
        type: 'info',
        recipientId: '60d21b4667d0d8992e610c85',
        link: '/calendario/reuniones'
      })
    });
    
    const data = await response.json();
    console.log('Notificación enviada:', data);
    return data;
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    throw error;
  }
}`}
                        </pre>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => handleCopyCode(`async function sendNotification() {
  try {
    const response = await fetch('https://api.bayrescrm.com/api/external/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'brs_your_api_key_here'
      },
      body: JSON.stringify({
        title: 'Recordatorio de reunión',
        message: 'Tienes una reunión programada para mañana a las 10:00 AM',
        type: 'info',
        recipientId: '60d21b4667d0d8992e610c85',
        link: '/calendario/reuniones'
      })
    });
    
    const data = await response.json();
    console.log('Notificación enviada:', data);
    return data;
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    throw error;
  }
}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Enviar una notificación (Python)</h3>
                      <div className="relative bg-black rounded-md p-4 text-white">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
{`# Enviar una notificación a un usuario
import requests
import json

def send_notification():
    api_url = "https://api.bayrescrm.com/api/external/notifications"
    api_key = "brs_your_api_key_here"
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }
    
    payload = {
        "title": "Recordatorio de reunión",
        "message": "Tienes una reunión programada para mañana a las 10:00 AM",
        "type": "info",
        "recipientId": "60d21b4667d0d8992e610c85",
        "link": "/calendario/reuniones"
    }
    
    try:
        response = requests.post(
            api_url,
            headers=headers,
            data=json.dumps(payload)
        )
        
        response.raise_for_status()
        result = response.json()
        print("Notificación enviada:", result)
        return result
    except requests.exceptions.RequestException as e:
        print("Error al enviar notificación:", e)
        raise`}
                        </pre>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => handleCopyCode(`import requests
import json

def send_notification():
    api_url = "https://api.bayrescrm.com/api/external/notifications"
    api_key = "brs_your_api_key_here"
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }
    
    payload = {
        "title": "Recordatorio de reunión",
        "message": "Tienes una reunión programada para mañana a las 10:00 AM",
        "type": "info",
        "recipientId": "60d21b4667d0d8992e610c85",
        "link": "/calendario/reuniones"
    }
    
    try:
        response = requests.post(
            api_url,
            headers=headers,
            data=json.dumps(payload)
        )
        
        response.raise_for_status()
        result = response.json()
        print("Notificación enviada:", result)
        return result
    except requests.exceptions.RequestException as e:
        print("Error al enviar notificación:", e)
        raise`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Enviar una notificación (cURL)</h3>
                      <div className="relative bg-black rounded-md p-4 text-white">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
{`curl -X POST https://api.bayrescrm.com/api/external/notifications \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: brs_your_api_key_here" \\
  -d '{
    "title": "Recordatorio de reunión",
    "message": "Tienes una reunión programada para mañana a las 10:00 AM",
    "type": "info",
    "recipientId": "60d21b4667d0d8992e610c85",
    "link": "/calendario/reuniones"
  }'`}
                        </pre>
                          <Button 
                          variant="ghost" 
                            size="sm" 
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => handleCopyCode(`curl -X POST https://api.bayrescrm.com/api/external/notifications \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: brs_your_api_key_here" \\
  -d '{
    "title": "Recordatorio de reunión",
    "message": "Tienes una reunión programada para mañana a las 10:00 AM",
    "type": "info",
    "recipientId": "60d21b4667d0d8992e610c85",
    "link": "/calendario/reuniones"
  }'`)}
                        >
                          <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
  )
} 