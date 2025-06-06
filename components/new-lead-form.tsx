"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X, User, Phone, MapPin, BarChart3, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus } from "lucide-react"
import { leadService } from "@/lib/services/leadService"
import { toast } from "@/components/ui/use-toast"

interface NewLeadFormProps {
  onLeadCreated?: () => void;
  className?: string;
}

export default function NewLeadForm({ onLeadCreated, className }: NewLeadFormProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
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
    whatsapp: "",
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

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      industry: "",
      companySize: "",
      website: "",
      whatsapp: "",
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
    setError(null)
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
        whatsapp: formData.whatsapp || undefined,
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
      
      // Llamar al servicio para crear el lead
      const newLead = await leadService.createLead(leadData)
      
      // Cerrar modal y resetear formulario
      setIsOpen(false)
      resetForm()
      
      // Mostrar notificación de éxito
      toast({
        title: "Lead creado",
        description: "El lead ha sido creado exitosamente",
      })
      
      // Llamar al callback si existe
      if (onLeadCreated) {
        onLeadCreated()
      }
    } catch (err: any) {
      console.error("Error al crear lead:", err)
      setError(err.response?.data?.message || "No se pudo crear el lead. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className={`h-9 bg-primary hover:bg-primary/90 ${className}`}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Nuevo Lead</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="netflix-scrollbar max-h-[90vh] max-w-4xl overflow-y-auto bg-gradient-to-b from-background to-background/95 p-0 backdrop-blur-md">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/10 bg-background/80 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Button>
            </DialogClose>
            <DialogTitle className="text-xl font-bold">Nuevo Lead</DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSubmit} 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            <DialogClose asChild>
            </DialogClose>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mx-6 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
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
                <Label htmlFor="position">Posición/Cargo</Label>
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
                <Label htmlFor="companySize">Tamaño de la empresa</Label>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) => handleSelectChange("companySize", value)}
                >
                  <SelectTrigger className="netflix-input">
                    <SelectValue placeholder="Seleccionar tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 empleados</SelectItem>
                    <SelectItem value="11-50">11-50 empleados</SelectItem>
                    <SelectItem value="51-200">51-200 empleados</SelectItem>
                    <SelectItem value="201-500">201-500 empleados</SelectItem>
                    <SelectItem value="501+">501+ empleados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="website">Sitio web</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="netflix-input"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Phone className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Información de Contacto Adicional</h3>
            </div>
            <Separator className="bg-border/10" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
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
                  className="netflix-input"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Ubicación</h3>
            </div>
            <Separator className="bg-border/10" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="netflix-input"
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
                <Label htmlFor="state">Estado/Provincia</Label>
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

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <BarChart3 className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Información del Lead</h3>
            </div>
            <Separator className="bg-border/10" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="source">Origen *</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => handleSelectChange("source", value)}
                  required
                >
                  <SelectTrigger className="netflix-input">
                    <SelectValue placeholder="Seleccionar origen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sitio_web">Sitio Web</SelectItem>
                    <SelectItem value="referido">Referido</SelectItem>
                    <SelectItem value="redes_sociales">Redes Sociales</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="anuncio">Anuncio</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  required
                >
                  <SelectTrigger className="netflix-input">
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
                <Label htmlFor="currentStage">Etapa *</Label>
                <Select
                  value={formData.currentStage}
                  onValueChange={(value) => handleSelectChange("currentStage", value)}
                  required
                >
                  <SelectTrigger className="netflix-input">
                    <SelectValue placeholder="Seleccionar etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conciencia">Conciencia</SelectItem>
                    <SelectItem value="consideracion">Consideración</SelectItem>
                    <SelectItem value="decision">Decisión</SelectItem>
                    <SelectItem value="negociacion">Negociación</SelectItem>
                    <SelectItem value="cerrado">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange("priority", value)}
                  required
                >
                  <SelectTrigger className="netflix-input">
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestedProducts">Productos de Interés (separados por comas)</Label>
                <Input
                  id="interestedProducts"
                  name="interestedProducts"
                  value={formData.interestedProducts}
                  onChange={handleChange}
                  className="netflix-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="netflix-input"
                />
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
