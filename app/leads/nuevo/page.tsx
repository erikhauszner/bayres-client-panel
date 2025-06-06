"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Phone, MapPin, BarChart3, Save, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Sidebar from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { leadService } from "@/lib/services/leadService"
import { toast } from "@/components/ui/use-toast"
import { AvatarImage } from "@radix-ui/react-avatar"
import Header from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { Checkbox } from "@/components/ui/checkbox"
import useHasPermission from "@/hooks/useHasPermission"
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

export default function NewLeadPage() {
  const router = useRouter()
  const { employee } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoAssign, setAutoAssign] = useState(true)
  const canAutoAssign = useHasPermission("leads:auto_assign")
  
  // Estados para las categorías
  const [leadStageCategories, setLeadStageCategories] = useState<LeadStageCategory[]>([])
  const [leadOriginCategories, setLeadOriginCategories] = useState<LeadOriginCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  
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
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    industry: "",
    companySize: "",
    website: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    facebook: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    status: "nuevo",
    source: "sitio_web",
    currentStage: "conciencia",
    priority: "media",
    estimatedValue: "",
    estimatedBudget: "",
    interestedProducts: "",
    tags: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      // Preparar datos para la API (conversión de tipos)
      const leadData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company || undefined,
        position: formData.position || undefined,
        industry: formData.industry || undefined,
        companySize: formData.companySize || undefined,
        website: formData.website || undefined,
        phone: formData.phone || undefined,
        email: formData.email,
        instagram: formData.instagram || undefined,
        twitter: formData.twitter || undefined,
        linkedin: formData.linkedin || undefined,
        facebook: formData.facebook || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        postalCode: formData.postalCode || undefined,
        source: formData.source,
        status: formData.status,
        currentStage: formData.currentStage,
        priority: formData.priority as 'baja' | 'media' | 'alta',
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        estimatedBudget: formData.estimatedBudget ? parseFloat(formData.estimatedBudget) : undefined,
        interestedProducts: formData.interestedProducts ? formData.interestedProducts.split(',') : undefined,
        tags: formData.tags ? formData.tags.split(',') : undefined,
      }
      
      let newLead;
      
      // Si la opción de auto-asignación está activada, el usuario tiene el permiso especial y hay un empleado actual, asignar automáticamente
      if (autoAssign && canAutoAssign && employee?._id) {
        // Llamar al servicio para crear el lead y asignarlo al usuario actual
        newLead = await leadService.createAndAssignLead(leadData, employee._id);
        toast({
          title: "Lead creado y asignado",
          description: "El lead ha sido creado y asignado a ti exitosamente",
        });
      } else {
        // Llamar al servicio para crear el lead sin asignar
        newLead = await leadService.createLead(leadData);
        toast({
          title: "Lead creado",
          description: "El lead ha sido creado exitosamente",
        });
      }
      
      // Redirigir a la lista de leads o al perfil del nuevo lead
      if (newLead && newLead._id) {
        router.push(`/leads/${newLead._id}`);
      } else {
        router.push('/leads');
      }
    } catch (err: any) {
      console.error("Error al crear lead:", err);
      setError(err.response?.data?.message || "No se pudo crear el lead. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="netflix-scrollbar flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">Crear Nuevo Lead</h1>
            </div>

            <Card className="netflix-card">
              <div className="p-6">
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <User className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Información Personal</h3>
                    </div>
                    <Separator className="bg-border/10" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="netflix-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="netflix-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="netflix-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="netflix-input"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/10" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <BarChart3 className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Información Empresarial</h3>
                    </div>
                    <Separator className="bg-border/10" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Empresa</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="netflix-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Cargo</Label>
                        <Input
                          id="position"
                          name="position"
                          value={formData.position}
                          onChange={handleChange}
                          className="netflix-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industria</Label>
                        <Input
                          id="industry"
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          className="netflix-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companySize">Tamaño de la Empresa</Label>
                        <Select 
                          value={formData.companySize} 
                          onValueChange={(value) => handleSelectChange("companySize", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tamaño" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 empleados</SelectItem>
                            <SelectItem value="11-50">11-50 empleados</SelectItem>
                            <SelectItem value="51-200">51-200 empleados</SelectItem>
                            <SelectItem value="201-500">201-500 empleados</SelectItem>
                            <SelectItem value="501+">Más de 500 empleados</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/10" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <MapPin className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Ubicación</h3>
                    </div>
                    <Separator className="bg-border/10" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="netflix-input min-h-20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Ciudad</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="netflix-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Provincia/Estado</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="netflix-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">País</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="netflix-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Código Postal</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className="netflix-input"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/10" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Phone className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Redes Sociales</h3>
                    </div>
                    <Separator className="bg-border/10" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="website">Sitio Web</Label>
                        <Input
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://"
                          className="netflix-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleChange}
                          placeholder="@usuario"
                          className="netflix-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          name="twitter"
                          value={formData.twitter}
                          onChange={handleChange}
                          placeholder="@usuario"
                          className="netflix-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          placeholder="URL o usuario"
                          className="netflix-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          id="facebook"
                          name="facebook"
                          value={formData.facebook}
                          onChange={handleChange}
                          placeholder="URL o nombre de usuario"
                          className="netflix-input"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/10" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <BarChart3 className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Clasificación y Detalles</h3>
                    </div>
                    <Separator className="bg-border/10" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="source">Origen</Label>
                        <Select 
                          value={formData.source} 
                          onValueChange={(value) => handleSelectChange("source", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                                <SelectItem value="publicidad">Publicidad</SelectItem>
                                <SelectItem value="redes_sociales">Redes Sociales</SelectItem>
                                <SelectItem value="evento">Evento</SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currentStage">Etapa Actual</Label>
                        <Select 
                          value={formData.currentStage} 
                          onValueChange={(value) => handleSelectChange("currentStage", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priority">Prioridad</Label>
                        <Select 
                          value={formData.priority} 
                          onValueChange={(value) => handleSelectChange("priority", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baja">Baja</SelectItem>
                            <SelectItem value="media">Media</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {canAutoAssign && (
                        <div className="space-y-2 sm:col-span-2 flex items-center space-x-2">
                          <Checkbox 
                            id="autoAssign" 
                            checked={autoAssign} 
                            onCheckedChange={(checked) => setAutoAssign(checked as boolean)}
                          />
                          <Label 
                            htmlFor="autoAssign" 
                            className="font-normal cursor-pointer text-sm">
                            Asignarme automáticamente este lead
                          </Label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      <Save className="mr-2 h-4 w-4" />
                      {loading ? "Guardando..." : "Guardar Lead"}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 