"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import EmployeeService from "@/lib/services/employeeService"
import { Switch } from "@/components/ui/switch"

interface ChangePasswordPageProps {
  params: Promise<{ id: string }>
}

export default function ChangePasswordPage({ params }: ChangePasswordPageProps) {
  const router = useRouter()
  const { id } = React.use(params)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [employee, setEmployee] = useState<any>(null)
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
    forcePasswordChange: false
  })
  
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const data = await EmployeeService.getEmployee(id as string)
        setEmployee(data)
      } catch (error) {
        console.error("Error al cargar el empleado:", error)
        toast.error("No se pudo cargar el empleado")
        router.push("/empleados")
      }
    }
    
    fetchEmployee()
  }, [id, router])
  
  const handleResetPassword = async () => {
    // Validación básica
    if (!passwordData.newPassword) {
      return toast.error("Debes ingresar la nueva contraseña")
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Las contraseñas no coinciden")
    }
    
    try {
      setIsLoading(true)
      // Llamamos al endpoint para cambiar la contraseña
      await EmployeeService.resetPassword(
        id as string, 
        passwordData.newPassword,
        passwordData.forcePasswordChange
      )
      
      toast.success("Contraseña actualizada correctamente")
      router.push(`/empleados/${id}`)
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error)
      toast.error("Error al cambiar la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-lg space-y-6">
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => router.back()}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Cambiar contraseña
              </h1>
              <p className="text-muted-foreground">
                {employee ? `Establecer nueva contraseña para ${employee.firstName} ${employee.lastName}` : 'Cargando...'}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Nueva contraseña</CardTitle>
                <CardDescription>
                  Ingresa y confirma la nueva contraseña para este empleado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="force-password-change">Forzar cambio de contraseña</Label>
                    <p className="text-sm text-muted-foreground">
                      El empleado deberá cambiar esta contraseña la próxima vez que inicie sesión
                    </p>
                  </div>
                  <Switch
                    id="force-password-change"
                    checked={passwordData.forcePasswordChange}
                    onCheckedChange={(checked) => 
                      setPasswordData({
                        ...passwordData,
                        forcePasswordChange: checked
                      })
                    }
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/empleados/${id}`)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleResetPassword}
                    disabled={isLoading}
                  >
                    {isLoading ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 