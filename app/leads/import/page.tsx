"use client"

import { useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import LeadImportForm from "@/components/lead-import-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, FileJson, Code, Upload } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function LeadImportPage() {
  const [activeTab, setActiveTab] = useState("importar")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Importación Masiva de Leads</h1>
              <p className="text-muted-foreground mt-1">
                Importa múltiples leads desde archivos Excel o CSV
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="importar" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Importar Leads</span>
                </TabsTrigger>
                <TabsTrigger value="formato" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Formato de Archivo</span>
                </TabsTrigger>
                <TabsTrigger value="api" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>API</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="importar">
                <LeadImportForm />
              </TabsContent>

              <TabsContent value="formato">
                <Card>
                  <CardHeader>
                    <CardTitle>Formato de Archivo para Importación</CardTitle>
                    <CardDescription>
                      Guía detallada sobre cómo estructurar tu archivo de importación de leads
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Formatos Soportados</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        El sistema admite los siguientes formatos de archivo para la importación masiva de leads:
                      </p>
                      <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                        <li><strong>Excel:</strong> Archivos .xlsx o .xls</li>
                        <li><strong>CSV:</strong> Archivos .csv (valores separados por comas)</li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Estructura del Archivo</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Tu archivo debe contener una fila de encabezado con los nombres de las columnas, seguida por los datos:
                      </p>
                      
                      <div className="rounded-md bg-slate-50 dark:bg-slate-900 p-4 mb-4 overflow-x-auto">
                        <pre className="text-xs">
                          firstName,lastName,source,email,phone,company,position,priority,status,currentStage,notes<br/>
                          Juan,Pérez,web,juan@ejemplo.com,123456789,Empresa ABC,Gerente,baja,pendiente,nuevo,Cliente interesado<br/>
                          María,López,referido,maria@ejemplo.com,987654321,Corporación XYZ,Directora,media,,calificado,Interesada en nuestros servicios<br/>
                          Carlos,Gómez,redes_sociales,,555123456,,,,,,
                        </pre>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Campos del Archivo</h3>
                      
                      <h4 className="font-medium mt-4 mb-2">Campos Requeridos</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                        <li><strong>firstName:</strong> Nombre del lead</li>
                        <li><strong>lastName:</strong> Apellido del lead</li>
                        <li><strong>source:</strong> Origen del lead (web, referido, redes_sociales, etc.)</li>
                      </ul>
                      
                      <h4 className="font-medium mt-4 mb-2">Campos con Valores por Defecto</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                        <li><strong>priority:</strong> Prioridad del lead (baja, media, alta) - <span className="text-gray-500">Por defecto: baja</span></li>
                        <li><strong>status:</strong> Estado del lead (pendiente, en_proceso, etc.) - <span className="text-gray-500">Por defecto: pendiente</span></li>
                        <li><strong>currentStage:</strong> Etapa actual del lead (nuevo, contactado, etc.) - <span className="text-gray-500">Por defecto: nuevo</span></li>
                      </ul>
                      
                      <h4 className="font-medium mt-4 mb-2">Campos Opcionales</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                        <li><strong>email:</strong> Correo electrónico (debe ser único si se proporciona)</li>
                        <li><strong>phone:</strong> Número telefónico</li>
                        <li><strong>company:</strong> Empresa</li>
                        <li><strong>position:</strong> Cargo o posición</li>
                        <li><strong>notes:</strong> Notas adicionales</li>
                      </ul>
                      
                      <p className="text-sm text-muted-foreground mt-4">
                        Puedes incluir campos adicionales y serán almacenados con el lead, pero los mencionados son los más comunes.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Validaciones</h3>
                      <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                        <li>Si se proporciona un correo electrónico, este debe ser único tanto en el archivo como en la base de datos</li>
                        <li>Los campos firstName, lastName y source son obligatorios para cada fila</li>
                        <li>Las fechas deben estar en formato ISO (YYYY-MM-DD) o similar</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api">
                <Card>
                  <CardHeader>
                    <CardTitle>API para Importación y Creación de Leads</CardTitle>
                    <CardDescription>
                      Guía de referencia para desarrolladores que desean integrar la importación y creación de leads
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Endpoints Disponibles</h3>
                      <div className="space-y-4">
                        <div className="rounded-md bg-slate-50 dark:bg-slate-900 p-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">POST</span>
                            <span>/api/leads/import</span>
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Importa múltiples leads desde un archivo Excel o CSV.
                          </p>
                          <div className="mt-2">
                            <h5 className="text-sm font-medium mb-1">Parámetros:</h5>
                            <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                              <li><strong>file:</strong> Archivo Excel (.xlsx, .xls) o CSV (.csv) - <span className="text-red-500">Requerido</span></li>
                            </ul>
                          </div>
                        </div>

                        <div className="rounded-md bg-slate-50 dark:bg-slate-900 p-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">POST</span>
                            <span>/api/leads</span>
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Crea un nuevo lead.
                          </p>
                          <div className="mt-2">
                            <h5 className="text-sm font-medium mb-1">Parámetros JSON:</h5>
                            <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                              <li><strong>firstName:</strong> Nombre del lead - <span className="text-red-500">Requerido</span></li>
                              <li><strong>lastName:</strong> Apellido del lead - <span className="text-red-500">Requerido</span></li>
                              <li><strong>source:</strong> Origen del lead - <span className="text-red-500">Requerido</span></li>
                              <li><strong>email:</strong> Correo electrónico - <span className="text-gray-500">Opcional</span></li>
                              <li><strong>priority:</strong> Prioridad (baja, media, alta) - <span className="text-gray-500">Opcional (predeterminado: baja)</span></li>
                              <li><strong>status:</strong> Estado - <span className="text-gray-500">Opcional (predeterminado: pendiente)</span></li>
                              <li><strong>currentStage:</strong> Etapa actual - <span className="text-gray-500">Opcional (predeterminado: nuevo)</span></li>
                              <li>Otros campos opcionales (phone, company, position, etc.)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Ejemplos de Uso</h3>
                      
                      <h4 className="font-medium mt-4 mb-2">Importación de Leads (con cURL)</h4>
                      <div className="rounded-md bg-slate-800 p-4 mb-4">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          curl -X POST \<br/>
                          &nbsp;&nbsp;-H "Authorization: Bearer TU_TOKEN_DE_ACCESO" \<br/>
                          &nbsp;&nbsp;-F "file=@/ruta/a/tu/archivo.csv" \<br/>
                          &nbsp;&nbsp;https://tudominio.com/api/leads/import
                        </pre>
                      </div>

                      <h4 className="font-medium mt-4 mb-2">Creación de Lead (con cURL)</h4>
                      <div className="rounded-md bg-slate-800 p-4 mb-4">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          curl -X POST \<br/>
                          &nbsp;&nbsp;-H "Authorization: Bearer TU_TOKEN_DE_ACCESO" \<br/>
                          &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                          &nbsp;&nbsp;-d '{`{
  "firstName": "Juan",
  "lastName": "Pérez",
  "source": "web",
  "email": "juan@ejemplo.com",
  "phone": "123456789",
  "company": "Empresa ABC",
  "position": "Gerente",
  "priority": "baja",
  "status": "pendiente",
  "currentStage": "nuevo",
  "notes": "Cliente interesado en nuestros servicios"
}`}' \<br/>
                          &nbsp;&nbsp;https://tudominio.com/api/leads
                        </pre>
                      </div>

                      <h4 className="font-medium mt-4 mb-2">Importación de Leads (con JavaScript)</h4>
                      <div className="rounded-md bg-slate-800 p-4 mb-4">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          {`// Con Fetch API
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('https://tudominio.com/api/leads/import', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TU_TOKEN_DE_ACCESO'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
                        </pre>
                      </div>

                      <h4 className="font-medium mt-4 mb-2">Creación de Lead (con JavaScript)</h4>
                      <div className="rounded-md bg-slate-800 p-4">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          {`// Con Fetch API
const leadData = {
  firstName: "Juan",
  lastName: "Pérez",
  source: "web",
  email: "juan@ejemplo.com",
  phone: "123456789",
  company: "Empresa ABC",
  position: "Gerente",
  priority: "baja",
  status: "pendiente",
  currentStage: "nuevo",
  notes: "Cliente interesado en nuestros servicios"
};

fetch('https://tudominio.com/api/leads', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TU_TOKEN_DE_ACCESO',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(leadData)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
                        </pre>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Autenticación</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Todas las solicitudes a la API requieren autenticación mediante un token JWT en el encabezado Authorization.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Puedes obtener un token JWT iniciando sesión a través del endpoint <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">/api/auth/login</code>.
                      </p>
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