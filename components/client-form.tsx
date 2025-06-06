"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Building, User, Phone, MapPin, Plus, X, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert" 
import { Loader2 } from "lucide-react"
import { clientService } from "@/lib/services/clientService"
import { toast } from "@/components/ui/use-toast"
import { Client, ContactPerson } from "@/lib/types/client"

interface ClientFormProps {
  clientId?: string;
  isEditing: boolean;
  initialData?: Partial<Client> & { leadId?: string };
  onClienteCreado?: (clienteId: string) => void;
}

export default function ClientForm({ clientId, isEditing, initialData, onClienteCreado }: ClientFormProps) {
  const router = useRouter()
  const [clientType, setClientType] = useState<"personal" | "business">("personal")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEditing)
  const [error, setError] = useState<string | null>(null)
  
  // Estado para los contactos de la empresa
  const [contacts, setContacts] = useState<ContactPerson[]>([])
  
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

    // Status
    status: "active" as "active" | "inactive"
  })

  useEffect(() => {
    if (initialData && !isEditing) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData, isEditing])

  useEffect(() => {
    // Si estamos en modo edición, cargar los datos del cliente
    if (isEditing && clientId) {
      const fetchClientData = async () => {
        try {
          setLoadingData(true)
          const data = await clientService.getClientById(clientId)
          
          // Actualizar el estado con los datos del cliente
          setFormData({
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            type: data.type || "personal",
            businessName: data.businessName || "",
            businessTaxId: data.businessTaxId || "",
            industry: data.industry || "",
            website: data.website || "",
            instagram: data.instagram || "",
            twitter: data.twitter || "",
            linkedin: data.linkedin || "",
            facebook: data.facebook || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            country: data.country || "",
            postalCode: data.postalCode || "",
            status: data.status || "active"
          })
          
          // Actualizar tipo de cliente
          setClientType(data.type || "personal")
          
          // Cargar contactos si existen
          if (data.representatives && Array.isArray(data.representatives)) {
            setContacts(data.representatives.map((rep: any) => ({
              name: rep.name || "",
              position: rep.position || "",
              email: rep.email || "",
              phone: rep.phone || ""
            })))
          }
        } catch (err: any) {
          console.error("Error al cargar datos del cliente:", err)
          setError(err.response?.data?.message || "No se pudieron cargar los datos del cliente")
        } finally {
          setLoadingData(false)
        }
      }
      
      fetchClientData()
    }
  }, [clientId, isEditing])

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
  
  // Manejadores para los contactos de la empresa
  const addContact = () => {
    setContacts([...contacts, { name: "", position: "", email: "", phone: "" }])
  }
  
  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index))
  }
  
  const updateContact = (index: number, field: keyof ContactPerson, value: string) => {
    const updatedContacts = [...contacts]
    updatedContacts[index][field] = value
    setContacts(updatedContacts)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    // Filtra los contactos vacíos
    const validContacts = contacts.filter(contact => contact.name.trim() !== "")
    
    try {
      if (isEditing && clientId) {
        // Actualizar cliente existente
        await clientService.updateClient(clientId, {
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
          representatives: formData.type === "business" ? validContacts : undefined,
        })
        
        // Notificar éxito
        toast({
          title: "Cliente actualizado",
          description: "La información del cliente ha sido actualizada exitosamente",
        })
        
        // Redirigir al perfil del cliente
        router.push(`/clientes/${clientId}`)
      } else if (initialData && initialData.leadId) {
        // Estamos convirtiendo un lead a cliente
        const response = await clientService.convertLeadToClient(
          initialData.leadId as string,
          formData.type
        )
        
        // Notificar éxito
        toast({
          title: "Lead convertido",
          description: "El lead ha sido convertido a cliente exitosamente",
        })
        
        if (onClienteCreado && response && response.clientId) {
          onClienteCreado(response.clientId)
          return
        }
        if (response && response.clientId) {
          router.push(`/clientes/${response.clientId}`)
        } else {
          router.push('/clientes')
        }
      } else {
        // Crear nuevo cliente
        const response = await clientService.createClient({
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
          representatives: formData.type === "business" ? validContacts : undefined,
        })
        
        // Notificar éxito
        toast({
          title: "Cliente creado",
          description: "El cliente ha sido creado exitosamente",
        })
        
        if (onClienteCreado && response && response._id) {
          onClienteCreado(response._id)
          return
        }
        if (response && response._id) {
          router.push(`/clientes/${response._id}`)
        } else {
          router.push('/clientes')
        }
      }
    } catch (err: any) {
      console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} cliente:`, err)
      setError(err.response?.data?.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el cliente. Inténtalo de nuevo.`)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Cargando información...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Cliente */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Tipo de Cliente</h3>
          <RadioGroup
            value={clientType}
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
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="industry">Industria</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-border/10" />

        {/* Información de Contacto */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <MapPin className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Localización y Contacto</h3>
          </div>
          <Separator className="bg-border/10" />

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">Provincia/Estado</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
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
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Representantes o Contactos de Empresa - Solo visible si es tipo empresa */}
        {clientType === "business" && (
          <>
            <Separator className="bg-border/10" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <UserPlus className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Contactos de la Empresa</h3>
                </div>
                <Button 
                  type="button"
                  onClick={addContact}
                  variant="outline" 
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Contacto
                </Button>
              </div>
              <Separator className="bg-border/10" />
              
              {contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                  <User className="mb-2 h-8 w-8" />
                  <p>Aún no hay contactos añadidos</p>
                  <Button 
                    type="button"
                    onClick={addContact}
                    variant="secondary" 
                    size="sm"
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Contacto
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact, index) => (
                    <div key={index} className="rounded-md border border-border/10 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium">Contacto #{index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeContact(index)}
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Eliminar contacto</span>
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`contact-${index}-name`}>Nombre *</Label>
                          <Input
                            id={`contact-${index}-name`}
                            value={contact.name}
                            onChange={(e) => updateContact(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`contact-${index}-position`}>Cargo / Posición</Label>
                          <Input
                            id={`contact-${index}-position`}
                            value={contact.position}
                            onChange={(e) => updateContact(index, 'position', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`contact-${index}-email`}>Email</Label>
                          <Input
                            id={`contact-${index}-email`}
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateContact(index, 'email', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`contact-${index}-phone`}>Teléfono</Label>
                          <Input
                            id={`contact-${index}-phone`}
                            value={contact.phone}
                            onChange={(e) => updateContact(index, 'phone', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <Separator className="bg-border/10" />

        {/* Redes Sociales */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Building className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Redes Sociales</h3>
          </div>
          <Separator className="bg-border/10" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@usuario o URL"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="@usuario o URL"
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

        {/* Botones */}
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
            {loading 
              ? (isEditing ? "Actualizando..." : "Guardando...") 
              : (isEditing ? "Actualizar Cliente" : "Guardar Cliente")}
          </Button>
        </div>
      </form>
    </div>
  )
} 