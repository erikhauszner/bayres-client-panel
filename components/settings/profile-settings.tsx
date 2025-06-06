"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Employee } from "@/lib/types/employee"

export default function ProfileSettings() {
  const { toast } = useToast()
  const { employee } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  // Usar datos reales del empleado
  const [formData, setFormData] = useState<Partial<Employee>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  
  // Cargar datos del empleado cuando esté disponible
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || ''
      })
    }
  }, [employee])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Perfil actualizado",
        description: "Tu información de perfil se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar tu perfil",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Si no hay empleado, mostrar mensaje de carga
  if (!employee) {
    return <div className="p-4 text-center">Cargando información del perfil...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={employee.avatar || ""} alt={`${formData.firstName} ${formData.lastName}`} />
          <AvatarFallback className="text-lg">
            {formData.firstName?.charAt(0) || ''}{formData.lastName?.charAt(0) || ''}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="text-lg font-medium">{formData.firstName} {formData.lastName}</h3>
          <p className="text-sm text-muted-foreground">{formData.email}</p>
        </div>
      </div>
      
      <Separator />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre</Label>
            <Input 
              id="firstName" 
              name="firstName" 
              value={formData.firstName || ""} 
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido</Label>
            <Input 
              id="lastName" 
              name="lastName" 
              value={formData.lastName || ""} 
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input 
              id="email" 
              name="email" 
              type="email"
              value={formData.email || ""} 
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input 
              id="phone" 
              name="phone" 
              type="tel"
              value={formData.phone || ""} 
              onChange={handleInputChange}
            />
          </div>
        </div>
        
      </form>
      
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña actual</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input id="confirmPassword" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Actualizar contraseña</Button>
        </CardFooter>
      </Card>
    </div>
  )
} 