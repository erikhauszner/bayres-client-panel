"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Upload, FileSpreadsheet, Download, CheckCircle2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { leadService } from "@/lib/services/leadService"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function LeadImportForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ totalImported: number } | null>(null)
  const [duplicatedEmails, setDuplicatedEmails] = useState<string[]>([])
  const [missingFields, setMissingFields] = useState<string[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const selectedFile = files[0]
      // Verificar que sea un archivo Excel o CSV
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase()
      if (fileExt && ['xlsx', 'xls', 'csv'].includes(fileExt)) {
        setFile(selectedFile)
        setError(null)
      } else {
        setFile(null)
        setError("Por favor, selecciona un archivo Excel (.xlsx, .xls) o CSV (.csv)")
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!file) {
      setError("Por favor, selecciona un archivo para importar")
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccess(null)
    setDuplicatedEmails([])
    setMissingFields([])
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await leadService.importLeads(formData)
      
      if (response.success) {
        setSuccess({ totalImported: response.totalImported })
        toast({
          title: "Importación exitosa",
          description: `Se importaron ${response.totalImported} leads correctamente`,
          variant: "default"
        })
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Ocurrió un error durante la importación")
      
      // Capturar emails duplicados si existen
      if (error.response?.data?.duplicatedEmails) {
        setDuplicatedEmails(error.response.data.duplicatedEmails)
      }
      
      // Capturar campos faltantes si existen
      if (error.response?.data?.missingFields) {
        setMissingFields(error.response.data.missingFields)
      }
      
      toast({
        title: "Error en la importación",
        description: error.response?.data?.message || "Ocurrió un error durante la importación",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    // Crear un blob con el contenido del archivo CSV de plantilla
    const headers = "firstName,lastName,source,email,phone,company,position,priority,status,currentStage,notes"
    const example = "Juan,Pérez,web,juan@ejemplo.com,123456789,Empresa ABC,Gerente,baja,pendiente,nuevo,Cliente interesado en nuestros servicios"
    
    const csvContent = [headers, example].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    
    // Crear un enlace temporal para la descarga
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'plantilla_leads.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Importación Masiva de Leads</CardTitle>
        <CardDescription>
          Importa múltiples leads desde un archivo Excel o CSV.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Se importaron {success.totalImported} leads exitosamente.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Instrucciones</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Para importar leads correctamente, tu archivo debe seguir estas pautas:
            </p>
            <div className="rounded-md bg-slate-50 dark:bg-slate-900 p-4 mb-4">
              <h4 className="font-medium mb-2">Campos requeridos:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>firstName - Nombre del lead</li>
                <li>lastName - Apellido del lead</li>
                <li>source - Origen del lead (web, referido, etc.)</li>
              </ul>
              
              <h4 className="font-medium mt-4 mb-2">Campos con valores por defecto:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>priority - Prioridad (baja, media, alta) - <span className="text-gray-500">Por defecto: baja</span></li>
                <li>status - Estado (pendiente, en_proceso, etc.) - <span className="text-gray-500">Por defecto: pendiente</span></li>
                <li>currentStage - Etapa actual (nuevo, contactado, etc.) - <span className="text-gray-500">Por defecto: nuevo</span></li>
              </ul>
              
              <h4 className="font-medium mt-4 mb-2">Campos opcionales comunes:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>email - Correo electrónico (debe ser único si se proporciona)</li>
                <li>phone - Teléfono</li>
                <li>company - Empresa</li>
                <li>position - Cargo</li>
                <li>notes - Notas</li>
              </ul>
            </div>
            
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar plantilla CSV
            </Button>
          </div>
          
          <Separator />
          
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Selecciona archivo Excel o CSV
                </label>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Formatos soportados: Excel (.xlsx, .xls) y CSV (.csv)
                </p>
              </div>
              
              {file && (
                <div className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{file.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {(file.size / 1024).toFixed(1)} KB
                  </Badge>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full sm:w-auto" 
                disabled={loading || !file}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar Leads
                  </>
                )}
              </Button>
            </div>
          </form>
          
          {duplicatedEmails.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 text-red-600">Correos electrónicos duplicados:</h4>
              <div className="max-h-40 overflow-y-auto rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {duplicatedEmails.map((email, index) => (
                      <TableRow key={index}>
                        <TableCell>{email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Estos correos ya existen en la base de datos. Por favor, elimínalos del archivo e intenta nuevamente.
              </p>
            </div>
          )}
          
          {missingFields.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 text-red-600">Campos requeridos faltantes:</h4>
              <div className="flex flex-wrap gap-2">
                {missingFields.map((field, index) => (
                  <Badge key={index} variant="outline" className="bg-red-50 text-red-600 border-red-200">
                    {field}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tu archivo no contiene estos campos requeridos. Por favor, añádelos e intenta nuevamente.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 