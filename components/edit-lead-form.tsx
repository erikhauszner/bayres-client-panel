"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lead } from "@/lib/types/lead"
import { leadService } from "@/lib/services/leadService"
import Sidebar from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AvatarImage } from "@radix-ui/react-avatar"
import Header from "@/components/header"
import api from "@/lib/api"

// Interfaces para las categorías
interface LeadStageCategory {
  _id: string
  name: string
  description?: string
}

interface LeadOriginCategory {
  _id: string
  name: string
  description?: string
}

export default function EditLeadForm({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para las categorías
  const [leadStageCategories, setLeadStageCategories] = useState<LeadStageCategory[]>([])
  const [leadOriginCategories, setLeadOriginCategories] = useState<LeadOriginCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  
  const [formData, setFormData] = useState<Partial<Lead>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    industry: "",
    source: "",
    status: "",
    currentStage: "",
    priority: "media",
    estimatedValue: 0,
    estimatedBudget: 0,
    website: "",
    notes: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    facebook: ""
  })

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        setLoading(true)
        const data = await leadService.getLeadById(id)
        setFormData(data)
        setError(null)
      } catch (err: any) {
        console.error(`Error fetching lead with ID ${id}:`, err)
        setError(err.response?.data?.message || "No se pudo cargar la información del lead")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchLeadData()
    }
  }, [id])
  
  // Cargar categorías al iniciar
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true)
      try {
        // Cargar etapas de leads
        const stagesResponse = await api.get('/api/leads/categories/stages')
        setLeadStageCategories(stagesResponse.data || [])
        
        // Cargar orígenes de leads
        const originsResponse = await api.get('/api/leads/categories/origins')
        setLeadOriginCategories(originsResponse.data || [])
      } catch (error) {
        console.error("Error al cargar categorías:", error)
      } finally {
        setLoadingCategories(false)
      }
    }
    
    fetchCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = value === "" ? undefined : parseFloat(value)
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await leadService.updateLead(id, formData)
      toast({
        title: "Lead actualizado",
        description: "El lead ha sido actualizado exitosamente"
      })
      router.push(`/leads/${id}`)
    } catch (err: any) {
      console.error("Error al actualizar lead:", err)
      setError(err.response?.data?.message || "No se pudo actualizar el lead")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Cargando información del lead...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="netflix-scrollbar flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full" 
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">Editar Lead</h1>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">Información General</TabsTrigger>
                  <TabsTrigger value="contact">Información de Contacto</TabsTrigger>
                  <TabsTrigger value="social">Redes Sociales</TabsTrigger>
                  <TabsTrigger value="business">Detalles del Lead</TabsTrigger>
                </TabsList>

                {/* Pestaña de Información General */}
                <TabsContent value="general" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información Personal</CardTitle>
                      <CardDescription>Información básica sobre el lead</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Nombre *</Label>
                          <Input 
                            id="firstName" 
                            name="firstName" 
                            value={formData.firstName || ""} 
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Apellido *</Label>
                          <Input 
                            id="lastName" 
                            name="lastName" 
                            value={formData.lastName || ""} 
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={formData.email || ""} 
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input 
                            id="phone" 
                            name="phone" 
                            value={formData.phone || ""} 
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Empresa</Label>
                          <Input 
                            id="company" 
                            name="company" 
                            value={formData.company || ""} 
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="position">Cargo</Label>
                          <Input 
                            id="position" 
                            name="position" 
                            value={formData.position || ""} 
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="industry">Industria</Label>
                          <Input 
                            id="industry" 
                            name="industry" 
                            value={formData.industry || ""} 
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Sitio Web</Label>
                          <Input 
                            id="website" 
                            name="website" 
                            value={formData.website || ""} 
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pestaña de Información de Contacto */}
                <TabsContent value="contact" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Datos de Contacto y Ubicación</CardTitle>
                      <CardDescription>Información de ubicación y contacto</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="address">Dirección</Label>
                          <Input 
                            id="address" 
                            name="address" 
                            value={formData.address || ""} 
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">Ciudad</Label>
                          <Input 
                            id="city" 
                            name="city" 
                            value={formData.city || ""} 
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">Estado/Provincia</Label>
                          <Input 
                            id="state" 
                            name="state" 
                            value={formData.state || ""} 
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">País</Label>
                          <Input 
                            id="country" 
                            name="country" 
                            value={formData.country || ""} 
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Código Postal</Label>
                          <Input 
                            id="postalCode" 
                            name="postalCode" 
                            value={formData.postalCode || ""} 
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Nueva Pestaña de Redes Sociales */}
                <TabsContent value="social" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Redes Sociales</CardTitle>
                      <CardDescription>Perfiles y enlaces en redes sociales</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="website">Sitio Web</Label>
                          <Input 
                            id="website" 
                            name="website" 
                            value={formData.website || ""} 
                            onChange={handleChange}
                            placeholder="https://"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instagram">Instagram</Label>
                          <Input 
                            id="instagram" 
                            name="instagram" 
                            value={formData.instagram || ""} 
                            onChange={handleChange}
                            placeholder="@usuario"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twitter">Twitter</Label>
                          <Input 
                            id="twitter" 
                            name="twitter" 
                            value={formData.twitter || ""} 
                            onChange={handleChange}
                            placeholder="@usuario"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Input 
                            id="linkedin" 
                            name="linkedin" 
                            value={formData.linkedin || ""} 
                            onChange={handleChange}
                            placeholder="URL o usuario"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="facebook">Facebook</Label>
                          <Input 
                            id="facebook" 
                            name="facebook" 
                            value={formData.facebook || ""} 
                            onChange={handleChange}
                            placeholder="URL o nombre de usuario"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pestaña de Información del lead */}
                <TabsContent value="business" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detalles del Lead</CardTitle>
                      <CardDescription>Detalles del estado del lead</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="source">Origen *</Label>
                          <Select 
                            name="source" 
                            value={formData.source || ""} 
                            onValueChange={(value) => handleSelectChange("source", value)}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar origen" />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingCategories ? (
                                <SelectItem value="loading">Cargando orígenes...</SelectItem>
                              ) : leadOriginCategories.length > 0 ? (
                                leadOriginCategories.map((origin) => (
                                  <SelectItem key={origin._id} value={origin.name}>
                                    {origin.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="sitio_web">Sitio Web</SelectItem>
                                  <SelectItem value="referido">Referido</SelectItem>
                                  <SelectItem value="redes_sociales">Redes Sociales</SelectItem>
                                  <SelectItem value="evento">Evento</SelectItem>
                                  <SelectItem value="anuncio">Anuncio</SelectItem>
                                  <SelectItem value="otro">Otro</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Estado *</Label>
                          <Select 
                            name="status" 
                            value={formData.status || ""} 
                            onValueChange={(value) => handleSelectChange("status", value)}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nuevo">Nuevo</SelectItem>
                              <SelectItem value="aprobado">Aprobado</SelectItem>
                              <SelectItem value="rechazado">Rechazado</SelectItem>
                              <SelectItem value="asignado">Asignado</SelectItem>
                              <SelectItem value="convertido">Convertido</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currentStage">Etapa actual *</Label>
                          <Select 
                            name="currentStage" 
                            value={formData.currentStage || ""} 
                            onValueChange={(value) => handleSelectChange("currentStage", value)}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar etapa" />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingCategories ? (
                                <SelectItem value="loading">Cargando etapas...</SelectItem>
                              ) : leadStageCategories.length > 0 ? (
                                leadStageCategories.map((stage) => (
                                  <SelectItem key={stage._id} value={stage.name}>
                                    {stage.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="conciencia">Conciencia</SelectItem>
                                  <SelectItem value="consideracion">Consideración</SelectItem>
                                  <SelectItem value="decision">Decisión</SelectItem>
                                  <SelectItem value="accion">Acción</SelectItem>
                                  <SelectItem value="retencion">Retención</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority">Prioridad</Label>
                          <Select 
                            name="priority" 
                            value={formData.priority || "media"} 
                            onValueChange={(value) => handleSelectChange("priority", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="alta">Alta</SelectItem>
                              <SelectItem value="media">Media</SelectItem>
                              <SelectItem value="baja">Baja</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notas</Label>
                        <Textarea 
                          id="notes" 
                          name="notes" 
                          value={formData.notes || ""} 
                          onChange={handleChange}
                          rows={5}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
} 