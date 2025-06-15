"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import EmployeeService from "@/lib/services/employeeService"
import { Employee } from "@/lib/types/employee"
import { toast } from "@/components/ui/use-toast"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import EmployeeStats from "@/components/monitoring/EmployeeStats"
import { ArrowLeft } from "lucide-react"
import React from "react"

interface EmployeePageProps {
  params: Promise<{ id: string }>
}

export default function EmployeePage({ params }: EmployeePageProps) {
  const { id } = React.use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployee = async () => {
      if (id) {
        try {
          const data = await EmployeeService.getEmployee(id as string)
          setEmployee(data)
        } catch (error) {
          console.error("Error al cargar el empleado:", error)
          setError("No se pudo cargar el empleado")
          toast({
            title: "Error",
            description: "No se pudo cargar el empleado",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchEmployee()
  }, [id])

  const handleBack = () => {
    router.push('/empleados')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mb-4"></div>
              <p className="text-muted-foreground ml-4">Cargando empleado...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver a Empleados</span>
                </Button>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">
                  {error || "No se pudo cargar el empleado"}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
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
                <span>Volver a Empleados</span>
              </Button>
            </div>

            {/* Contenido principal - EmployeeStats */}
            <div className="w-full">
              <EmployeeStats
                employeeId={employee._id}
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