"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Save, X, Building, User, Phone, MapPin, Plus, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert" 
import { cn } from "@/lib/utils"
import { clientService } from "@/lib/services/clientService"
import { toast } from "@/components/ui/use-toast"

interface NewClientFormProps {
  className?: string;
  onClientCreated?: () => void;
}

export default function NewClientForm({ className, onClientCreated }: NewClientFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [clientType, setClientType] = useState<"personal" | "business">("personal")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    // Datos básicos
    name: "",
    email: "",
    phone: "",
    
    // Tipo de cliente y datos de empresa
    type: "personal" as "personal" | "business",
    businessName: "",
    businessTaxId: "",
    industry: "",
    
    // Redes sociales y web
    website: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    facebook: "",
    
    // Información de ubicación
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleClientTypeChange = (value: string) => {
    setClientType(value as "personal" | "business")
    setFormData(prev => ({ ...prev, type: value as "personal" | "business" }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      type: "personal",
      businessName: "",
      businessTaxId: "",
      industry: "",
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
    })
    setClientType("personal")
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      // Crear cliente con el servicio
      await clientService.createClient({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        type: formData.type,
        businessName: formData.businessName || undefined,
        businessTaxId: formData.businessTaxId || undefined,
        industry: formData.industry || undefined,
        website: formData.website || undefined,
        instagram: formData.instagram || undefined,
        twitter: formData.twitter || undefined,
        linkedin: formData.linkedin || undefined,
        facebook: formData.facebook || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        postalCode: formData.postalCode || undefined,
      })
      
      // Cerrar el modal y resetear el formulario
      setIsOpen(false)
      resetForm()
      
      // Notificar éxito
      toast({
        title: "Cliente creado",
        description: "El cliente ha sido creado exitosamente",
      })
      
      // Llamar al callback si existe
      if (onClientCreated) {
        onClientCreated()
      }
    } catch (err: any) {
      console.error("Error al crear cliente:", err)
      setError(err.response?.data?.message || "No se pudo crear el cliente. Inténtalo de nuevo.")
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
        <Button size="sm" className={cn("h-9 bg-primary hover:bg-primary/90", className)}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Nuevo Cliente</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="netflix-scrollbar max-h-[90vh] max-w-3xl overflow-y-auto bg-gradient-to-b from-background to-background/95 p-0 backdrop-blur-md">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/10 bg-background/80 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Button>
            </DialogClose>
            <DialogTitle className="text-xl font-bold">Crear Nuevo Cliente</DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" form="client-form" variant="default" size="sm" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Guardando..." : "Guardar Cliente"}
            </Button>
            <DialogClose asChild>
            </DialogClose>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mx-4 mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form id="client-form" onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Tipo de Cliente */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Tipo de Cliente</h3>
            <RadioGroup
              defaultValue={clientType}
              onValueChange={handleClientTypeChange}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal">Personal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business" id="business" />
                <Label htmlFor="business">Empresa</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator className="bg-border/10" />

          {/* Datos Básicos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Datos {clientType === "personal" ? "Personales" : "de Empresa"}</h3>
            </div>
            <Separator className="bg-border/10" />

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {clientType === "personal" ? "Nombre Completo" : "Persona de Contacto"} *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                {clientType === "business" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Nombre de Empresa *</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        required={clientType === "business"}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessTaxId">Identificación Fiscal</Label>
                      <Input
                        id="businessTaxId"
                        name="businessTaxId"
                        value={formData.businessTaxId}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industria</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange("industry", value)}
                        value={formData.industry}
                      >
                        <SelectTrigger id="industry">
                          <SelectValue placeholder="Seleccionar industria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tecnologia">Tecnología</SelectItem>
                          <SelectItem value="finanzas">Finanzas</SelectItem>
                          <SelectItem value="salud">Salud</SelectItem>
                          <SelectItem value="educacion">Educación</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="servicios">Servicios</SelectItem>
                          <SelectItem value="manufactura">Manufactura</SelectItem>
                          <SelectItem value="otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Información de Ubicación */}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado/Provincia</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <h3 className="text-lg font-semibold">Contacto Adicional</h3>
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
                  placeholder="https://www.ejemplo.com"
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="URL o usuario"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Guardando..." : "Guardar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
