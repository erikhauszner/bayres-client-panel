"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Loader2,
  GripVertical,
  Eye,
  EyeOff
} from "lucide-react"
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

interface AutomationField {
  name: string;
  label: string;
  description?: string;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
  order: number;
}

interface AutomationConfig {
  webhookUrl: string;
  apiKey?: string;
  sendEmployeeId: boolean;
  notificationEmail?: string;
  successRedirectUrl?: string;
  errorRedirectUrl?: string;
}

export default function NuevaAutomatizacionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // Estado del formulario
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [fields, setFields] = useState<AutomationField[]>([])
  const [config, setConfig] = useState<AutomationConfig>({
    webhookUrl: "",
    apiKey: "",
    sendEmployeeId: false,
    notificationEmail: "",
    successRedirectUrl: "",
    errorRedirectUrl: ""
  })

  // Agregar nuevo campo
  const addField = () => {
    const newField: AutomationField = {
      name: "",
      label: "",
      description: "",
      size: "md",
      required: false,
      placeholder: "",
      defaultValue: "",
      order: fields.length
    }
    setFields([...fields, newField])
  }

  // Eliminar campo
  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index)
    // Reordenar los campos
    const reorderedFields = newFields.map((field, i) => ({ ...field, order: i }))
    setFields(reorderedFields)
  }

  // Actualizar campo
  const updateField = (index: number, updates: Partial<AutomationField>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  // Mover campo hacia arriba
  const moveFieldUp = (index: number) => {
    if (index === 0) return
    const newFields = [...fields]
    const temp = newFields[index]
    newFields[index] = newFields[index - 1]
    newFields[index - 1] = temp
    // Actualizar orden
    newFields[index].order = index
    newFields[index - 1].order = index - 1
    setFields(newFields)
  }

  // Mover campo hacia abajo
  const moveFieldDown = (index: number) => {
    if (index === fields.length - 1) return
    const newFields = [...fields]
    const temp = newFields[index]
    newFields[index] = newFields[index + 1]
    newFields[index + 1] = temp
    // Actualizar orden
    newFields[index].order = index
    newFields[index + 1].order = index + 1
    setFields(newFields)
  }

  // Validar formulario
  const validateForm = () => {
    const errors: string[] = []

    if (!name.trim()) {
      errors.push("El nombre es obligatorio")
    }

    if (fields.length === 0) {
      errors.push("Debe agregar al menos un campo")
    }

    fields.forEach((field, index) => {
      if (!field.name.trim()) {
        errors.push(`Campo ${index + 1}: El nombre del campo es obligatorio`)
      }
      if (!field.label.trim()) {
        errors.push(`Campo ${index + 1}: La etiqueta del campo es obligatoria`)
      }
    })

    // Validar nombres únicos
    const fieldNames = fields.map(f => f.name.trim().toLowerCase())
    const duplicateNames = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index)
    if (duplicateNames.length > 0) {
      errors.push("Los nombres de los campos deben ser únicos")
    }

    if (!config.webhookUrl.trim()) {
      errors.push("La URL del webhook es obligatoria")
    }

    // Validar formato de URL
    if (config.webhookUrl.trim()) {
      try {
        new URL(config.webhookUrl)
      } catch {
        errors.push("La URL del webhook no tiene un formato válido")
      }
    }

    return errors
  }

  // Función para mapear nuevos tamaños a valores compatibles con el backend
  const mapSizeForBackend = (size: string): 'small' | 'medium' | 'large' => {
    switch (size) {
      case 'xs':
      case 'sm':
        return 'small';
      case 'md':
        return 'medium';
      case 'lg':
      case 'xl':
      case 'full':
        return 'large';
      default:
        return 'medium';
    }
  };

  // Guardar automatización
  const handleSave = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      toast.error(`Errores de validación:\n${errors.join('\n')}`)
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(
        `${API_ENDPOINT}/automations`,
        {
          name: name.trim(),
          description: description.trim() || undefined,
          fields: fields.map(field => ({
            ...field,
            name: field.name.trim(),
            label: field.label.trim(),
            description: field.description?.trim() || undefined,
            placeholder: field.placeholder?.trim() || undefined,
            defaultValue: field.defaultValue?.trim() || undefined,
            size: mapSizeForBackend(field.size)
          })),
          config: {
            ...config,
            webhookUrl: config.webhookUrl.trim(),
            apiKey: config.apiKey?.trim() || undefined,
            notificationEmail: config.notificationEmail?.trim() || undefined,
            successRedirectUrl: config.successRedirectUrl?.trim() || undefined,
            errorRedirectUrl: config.errorRedirectUrl?.trim() || undefined
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.data.success) {
        toast.success("Automatización creada exitosamente")
        router.push("/admin/automatizaciones")
      }
    } catch (error: any) {
      console.error('Error al crear automatización:', error)
      const errorMessage = error.response?.data?.message || 'Error al crear la automatización'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'xs': return 'Extra Pequeño'
      case 'sm': return 'Pequeño'
      case 'md': return 'Mediano'
      case 'lg': return 'Grande'
      case 'xl': return 'Extra Grande'
      case 'full': return 'Ancho Completo'
      default: return size
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full" 
                onClick={() => router.push("/admin/automatizaciones")}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Nueva Automatización</h1>
                <p className="text-muted-foreground mt-1">
                  Crea una nueva automatización con campos personalizados
                </p>
              </div>
            </div>

            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>
                  Configura el nombre y descripción de la automatización
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Generación de Leads"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe brevemente qué hace esta automatización"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Campos del formulario */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Campos del Formulario</CardTitle>
                    <CardDescription>
                      Define los campos de texto que aparecerán en el formulario
                    </CardDescription>
                  </div>
                  <Button onClick={addField}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Campo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                    <p className="text-muted-foreground">
                      No hay campos agregados. Haz clic en "Agregar Campo" para comenzar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Campo {index + 1}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveFieldUp(index)}
                                disabled={index === 0}
                              >
                                <GripVertical className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeField(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Nombre del campo *</Label>
                            <Input
                              value={field.name}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateField(index, { name: value, label: value });
                              }}
                              placeholder="Ej: Palabras clave, Ubicación"
                            />
                            <p className="text-xs text-muted-foreground">
                              Nombre del campo que verá el usuario
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Input
                              value={field.description || ""}
                              onChange={(e) => updateField(index, { description: e.target.value })}
                              placeholder="Descripción opcional del campo"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Tamaño</Label>
                              <Select
                                value={field.size}
                                onValueChange={(value: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full') => 
                                  updateField(index, { size: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                                                  <SelectItem value="xs">Extra Pequeño</SelectItem>
                                <SelectItem value="sm">Pequeño</SelectItem>
                                <SelectItem value="md">Mediano</SelectItem>
                                <SelectItem value="lg">Grande</SelectItem>
                                <SelectItem value="xl">Extra Grande</SelectItem>
                                <SelectItem value="full">Ancho Completo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Placeholder</Label>
                              <Input
                                value={field.placeholder || ""}
                                onChange={(e) => updateField(index, { placeholder: e.target.value })}
                                placeholder="Texto de ayuda"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Valor por defecto</Label>
                              <Input
                                value={field.defaultValue || ""}
                                onChange={(e) => updateField(index, { defaultValue: e.target.value })}
                                placeholder="Valor inicial"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.required}
                              onCheckedChange={(checked) => updateField(index, { required: checked })}
                            />
                            <Label>Campo obligatorio</Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuración de webhook */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Webhook</CardTitle>
                <CardDescription>
                  Configura el webhook para recibir los datos del formulario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">URL del Webhook *</Label>
                  <Input
                    id="webhookUrl"
                    value={config.webhookUrl}
                    onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                    placeholder="https://ejemplo.com/webhook"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL donde se enviarán los datos del formulario
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key (opcional)</Label>
                  <div className="flex">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      value={config.apiKey || ""}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      placeholder="Clave de API para autenticación"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="ml-2"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.sendEmployeeId}
                    onCheckedChange={(checked) => setConfig({ ...config, sendEmployeeId: checked })}
                  />
                  <Label>Enviar ID de empleado</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">Email de notificación (opcional)</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={config.notificationEmail || ""}
                    onChange={(e) => setConfig({ ...config, notificationEmail: e.target.value })}
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="successRedirectUrl">URL de redirección (éxito)</Label>
                    <Input
                      id="successRedirectUrl"
                      value={config.successRedirectUrl || ""}
                      onChange={(e) => setConfig({ ...config, successRedirectUrl: e.target.value })}
                      placeholder="https://ejemplo.com/gracias"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="errorRedirectUrl">URL de redirección (error)</Label>
                    <Input
                      id="errorRedirectUrl"
                      value={config.errorRedirectUrl || ""}
                      onChange={(e) => setConfig({ ...config, errorRedirectUrl: e.target.value })}
                      placeholder="https://ejemplo.com/error"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => router.push("/admin/automatizaciones")}
              >
                Cancelar
              </Button>
              
              <Button 
                onClick={handleSave} 
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
                    Crear Automatización
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 