"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Settings, Grid3X3, Database, Users, Building, Euro, Globe, Palette, Server, User } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import CategoriesSettings from "@/components/settings/categories-settings"
import CompanySettings from "@/components/settings/company-settings"
import ProfileSettings from "@/components/settings/profile-settings"
import useHasPermission from "@/hooks/useHasPermission"

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("perfil")
  const canAccessCompanySettings = useHasPermission("settings:company")
  const canAccessCategoriesSettings = useHasPermission("settings:categories")
  
  // Si el usuario no tiene permiso para acceder a la pestaña activa, establecer pestaña de perfil
  useEffect(() => {
    if ((activeTab === "empresa" && !canAccessCompanySettings) || 
        (activeTab === "categorias" && !canAccessCategoriesSettings)) {
      setActiveTab("perfil")
    }
  }, [activeTab, canAccessCompanySettings, canAccessCategoriesSettings])
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="flex-1 space-y-4 p-2 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Configuración</h2>
            </div>
            
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="overflow-x-auto pb-1">
                <TabsList className="w-auto inline-flex min-w-max">
                  <TabsTrigger value="perfil" className="text-xs sm:text-sm whitespace-nowrap">
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </TabsTrigger>
                  
                  {canAccessCategoriesSettings && (
                    <TabsTrigger value="categorias" className="text-xs sm:text-sm whitespace-nowrap">
                      <Grid3X3 className="mr-2 h-4 w-4" />
                      <span>Categorías</span>
                    </TabsTrigger>
                  )}
                  
                  {canAccessCompanySettings && (
                    <TabsTrigger value="empresa" className="text-xs sm:text-sm whitespace-nowrap">
                      <Building className="mr-2 h-4 w-4" />
                      <span>Empresa</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
              
              <TabsContent value="perfil" className="space-y-4">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">Mi Perfil</CardTitle>
                    <CardDescription className="text-sm">
                      Gestiona tu información personal y configuración de cuenta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                    <ProfileSettings />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {canAccessCategoriesSettings && (
                <TabsContent value="categorias" className="space-y-4">
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-lg sm:text-xl">Configuración de Categorías</CardTitle>
                      <CardDescription className="text-sm">
                        Gestiona las categorías de ingresos, egresos, proyectos y más
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                      <CategoriesSettings />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
              
              {canAccessCompanySettings && (
                <TabsContent value="empresa" className="space-y-4">
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-lg sm:text-xl">Información de la Empresa</CardTitle>
                      <CardDescription className="text-sm">
                        Administra la información básica de tu empresa
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                      <CompanySettings />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
} 