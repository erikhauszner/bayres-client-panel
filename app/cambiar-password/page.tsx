"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "sonner"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { AuthService } from "@/lib/services/authService"

export default function ChangePasswordForcedPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  const handleChangePassword = async () => {
    // Validación básica
    if (!passwordData.currentPassword) {
      return toast.error("Debes ingresar tu contraseña actual")
    }
    
    if (!passwordData.newPassword) {
      return toast.error("Debes ingresar la nueva contraseña")
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Las contraseñas no coinciden")
    }
    
    try {
      setIsLoading(true)
      // Llamamos al endpoint para cambiar la contraseña
      await AuthService.changePasswordForced(
        passwordData.currentPassword,
        passwordData.newPassword
      )
      
      toast.success("Contraseña actualizada correctamente")
      // Redirigir al panel principal
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error al cambiar la contraseña:", error)
      
      // Mensaje de error personalizado según la respuesta del servidor
      const errorMessage = error.response?.data?.message || "Error al cambiar la contraseña"
      toast.error(errorMessage)
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
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Cambiar contraseña
              </h1>
              <p className="text-muted-foreground">
                Por razones de seguridad, debes cambiar tu contraseña para continuar.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Nueva contraseña</CardTitle>
                <CardDescription>
                  Ingresa tu contraseña actual y establece una nueva para continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Contraseña actual</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
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
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
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
                
                <div className="pt-4">
                  <Button 
                    className="w-full"
                    onClick={handleChangePassword}
                    disabled={isLoading}
                  >
                    {isLoading ? "Actualizando..." : "Cambiar contraseña"}
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