"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import EmployeeStats from "@/components/monitoring/EmployeeStats"

export default function EmpleadoEstadisticasPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const handleBack = () => {
    router.push('/monitoreo')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <div className="space-y-6">
            {/* Header con botón de regreso */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Monitoreo</span>
              </Button>
            </div>

            {/* Contenido de estadísticas */}
            <div className="w-full">
              <EmployeeStats
                employeeId={employeeId}
                isOpen={true}
                onClose={handleBack}
                isFullPage={true}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 