"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Upload, Save, Building, Mail, Phone, Globe, MapPin } from "lucide-react"

export default function CompanySettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Simulación de datos de la empresa
  const [formData, setFormData] = useState({
    name: 'Bayres Software',
    legalName: 'Bayres Software Solutions S.L.',
    taxId: 'B-12345678',
    email: 'info@bayressoftware.com',
    phone: '+34 912 345 678',
    website: 'https://bayressoftware.com',
    address: 'Calle Gran Vía 123',
    city: 'Madrid',
    postalCode: '28013',
    country: 'España',
    logo: null as File | null,
    currency: 'EUR',
    language: 'es',
    timezone: 'Europe/Madrid',
    description: 'Empresa especializada en desarrollo de software y soluciones digitales para empresas.',
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, logo: e.target.files![0] }))
    }
  }
  
  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast({
        title: "Información guardada",
        description: "Los datos de la empresa se han actualizado correctamente"
      })
    } catch (error) {
      console.error("Error al guardar:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
        <div className="space-y-2">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/logo.png" alt="Logo de la empresa" />
            <AvatarFallback className="bg-primary text-xl">BS</AvatarFallback>
          </Avatar>
          <div className="flex justify-center">
            <label
              htmlFor="logo-upload"
              className="cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-accent flex items-center gap-1"
            >
              <Upload className="h-3 w-3" />
              <span>Cambiar logo</span>
              <input id="logo-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          </div>
        </div>
        <div className="flex-1 space-y-1 text-center sm:text-left">
          <h3 className="font-semibold text-lg">Información Principal</h3>
          <p className="text-sm text-muted-foreground">
            Actualiza la información básica de tu empresa
          </p>
        </div>
      </div>

      <Separator />
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre Comercial</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            placeholder="Nombre comercial de la empresa"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="legalName">Razón Social</Label>
          <Input 
            id="legalName" 
            name="legalName" 
            value={formData.legalName} 
            onChange={handleInputChange} 
            placeholder="Razón social completa" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxId">CIF/NIF</Label>
          <Input 
            id="taxId" 
            name="taxId" 
            value={formData.taxId} 
            onChange={handleInputChange} 
            placeholder="Identificación fiscal" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              placeholder="Email principal" 
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              id="phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange} 
              placeholder="Teléfono de contacto" 
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Sitio Web</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              id="website" 
              name="website" 
              value={formData.website} 
              onChange={handleInputChange} 
              placeholder="https://ejemplo.com" 
              className="pl-10"
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Dirección
      </h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="address">Calle y Número</Label>
          <Input 
            id="address" 
            name="address" 
            value={formData.address} 
            onChange={handleInputChange} 
            placeholder="Dirección completa" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input 
            id="city" 
            name="city" 
            value={formData.city} 
            onChange={handleInputChange} 
            placeholder="Ciudad" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Código Postal</Label>
          <Input 
            id="postalCode" 
            name="postalCode" 
            value={formData.postalCode} 
            onChange={handleInputChange} 
            placeholder="Código postal" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input 
            id="country" 
            name="country" 
            value={formData.country} 
            onChange={handleInputChange} 
            placeholder="País" 
          />
        </div>
      </div>
      
      <Separator />
      
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Globe className="h-4 w-4" />
        Configuración Regional
      </h3>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="currency">Moneda Predeterminada</Label>
          <Select 
            value={formData.currency} 
            onValueChange={(value) => handleSelectChange('currency', value)}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="Seleccionar moneda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">Euro (€)</SelectItem>
              <SelectItem value="USD">Dólar EE.UU. ($)</SelectItem>
              <SelectItem value="GBP">Libra Esterlina (£)</SelectItem>
              <SelectItem value="ARS">Peso Argentino ($)</SelectItem>
              <SelectItem value="MXN">Peso Mexicano ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Idioma Predeterminado</Label>
          <Select 
            value={formData.language} 
            onValueChange={(value) => handleSelectChange('language', value)}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Seleccionar idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">Inglés</SelectItem>
              <SelectItem value="fr">Francés</SelectItem>
              <SelectItem value="de">Alemán</SelectItem>
              <SelectItem value="pt">Portugués</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Zona Horaria</Label>
          <Select 
            value={formData.timezone} 
            onValueChange={(value) => handleSelectChange('timezone', value)}
          >
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Seleccionar zona horaria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Europe/Madrid">Europa/Madrid (UTC+1)</SelectItem>
              <SelectItem value="America/New_York">América/Nueva York (UTC-5)</SelectItem>
              <SelectItem value="America/Mexico_City">América/Ciudad de México (UTC-6)</SelectItem>
              <SelectItem value="America/Buenos_Aires">América/Buenos Aires (UTC-3)</SelectItem>
              <SelectItem value="America/Bogota">América/Bogotá (UTC-5)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descripción de la Empresa</Label>
        <Textarea 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleInputChange} 
          placeholder="Describe brevemente a qué se dedica tu empresa" 
          className="min-h-[100px]"
        />
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  )
} 