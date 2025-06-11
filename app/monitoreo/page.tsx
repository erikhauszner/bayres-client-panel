"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Users, FileText, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import AuditTab from "@/components/audit/AuditTab"
import EmployeeActivityTab from "@/components/monitoring/EmployeeActivityTab"

export default function MonitoreoPage() {
  const [activeTab, setActiveTab] = useState("audit")

  // Función auxiliar para actualizar
  const handleRefresh = () => {
    toast.success("Datos actualizados correctamente")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Monitoreo</h1>
                <p className="text-muted-foreground">
                  Monitorea actividad en tiempo real, productividad y registros de auditoría.
                </p>
              </div>
              <Button onClick={handleRefresh} size="sm" variant="outline" className="gap-1">
                <RefreshCw size={16} /> Actualizar
              </Button>
            </div>

            <Tabs 
              defaultValue="audit" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid grid-cols-3 max-w-md">
                <TabsTrigger value="dashboard">
                  <Activity size={16} className="mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Users size={16} className="mr-2" />
                  Empleados
                </TabsTrigger>
                <TabsTrigger value="audit">
                  <FileText size={16} className="mr-2" />
                  Auditoría
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard">
                <Card>
                  <CardHeader>
                    <CardTitle>Dashboard de Monitoreo</CardTitle>
                    <CardDescription>
                      Vista general de la actividad del sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Esta sección está en desarrollo.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Employee Activity Tab */}
              <TabsContent value="activity">
                <EmployeeActivityTab onRefresh={handleRefresh} />
              </TabsContent>

              {/* Audit Logs Tab */}
              <TabsContent value="audit">
                <AuditTab onRefresh={handleRefresh} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
} 