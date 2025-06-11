"use client"

import { useState, useEffect } from "react"
import {
  Users,
  UserCircle,
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  ArrowUpRight,
  FileText,
  Wifi,
  Clock,
  AlertCircle,
  CheckCircle,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import UpcomingNotifications from "./upcoming-notifications"
import RecentActivity from "./recent-activity"
import api from "@/lib/api"
import { EmployeeStatusService } from "@/lib/services/employeeStatusService"
import { useHasPermission } from "@/hooks/useHasPermission"

interface DashboardStats {
  employeesOnline: number
  assignedLeads: number
  pendingTasks: number
  leadsToReview: number
  leadsToAssign: number
}

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    employeesOnline: 0,
    assignedLeads: 0,
    pendingTasks: 0,
    leadsToReview: 0,
    leadsToAssign: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Permisos para las cards del dashboard
  const canViewEmpleadosOnline = useHasPermission("dashboard:empleados_online")
  const canViewLeadsAsignados = useHasPermission("dashboard:leads_asignados")
  const canViewTareasPendientes = useHasPermission("dashboard:tareas_pendientes")
  const canViewActividadReciente = useHasPermission("dashboard:actividad_reciente")
  const canViewProximasNotificaciones = useHasPermission("dashboard:proximas_notificaciones")
  const canViewLeadsPorRevisar = useHasPermission("dashboard:leads_por_revisar")
  const canViewLeadsPorAsignar = useHasPermission("dashboard:leads_por_asignar")

  useEffect(() => {
    setIsLoaded(true)
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Obtener información del empleado actual
      const currentUser = await api.get('/auth/me')
      const currentEmployeeId = currentUser.data._id
      
      // Cargar estadísticas en paralelo (por ahora solo empleados online funcionará completamente)
      const [employeesData] = await Promise.all([
        EmployeeStatusService.getAllEmployeesStatus(), // Usar el servicio existente
      ])

      // Contar empleados online
      const onlineCount = employeesData.filter((emp: any) => emp.status === 'online').length

      // Para leads y tareas, vamos a obtener todos y filtrar en el frontend por ahora
      try {
        const leadsResponse = await api.get('/leads', { params: { assignedTo: currentEmployeeId, limit: 1000 } })
        const assignedLeads = leadsResponse.data.total || leadsResponse.data.data?.length || 0
        
        setStats(prev => ({ ...prev, assignedLeads }))
      } catch (error) {
        console.error('Error cargando leads:', error)
      }

      try {
        const tasksResponse = await api.get('/tasks')
        // Filtrar tareas asignadas al usuario actual y pendientes en el frontend
        const allTasks = tasksResponse.data || []
        const userTasks = allTasks.filter((task: any) => 
          task.assignedTo && task.assignedTo._id === currentEmployeeId &&
          (task.status === 'pending' || task.status === 'in_progress' || !task.status)
        )
        
        setStats(prev => ({ ...prev, pendingTasks: userTasks.length }))
      } catch (error) {
        console.error('Error cargando tareas:', error)
      }

      // Cargar leads por revisar (pendientes de aprobación)
      try {
        const leadsToReviewResponse = await api.get('/leads', { params: { status: 'pending', limit: 1000 } })
        const leadsToReview = leadsToReviewResponse.data.total || leadsToReviewResponse.data.data?.length || 0
        
        setStats(prev => ({ ...prev, leadsToReview }))
      } catch (error) {
        console.error('Error cargando leads por revisar:', error)
      }

      // Cargar leads por asignar (aprobados sin asignar)
      try {
        const leadsToAssignResponse = await api.get('/leads', { params: { status: 'approved', assignedTo: null, limit: 1000 } })
        const leadsToAssign = leadsToAssignResponse.data.total || leadsToAssignResponse.data.data?.length || 0
        
        setStats(prev => ({ ...prev, leadsToAssign }))
      } catch (error) {
        console.error('Error cargando leads por asignar:', error)
      }

      setStats(prev => ({ ...prev, employeesOnline: onlineCount }))
    } catch (error) {
      console.error('Error cargando estadísticas del dashboard:', error)
      // Mantener valores por defecto en caso de error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Bienvenido al panel de control de Bayres CRM</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 sm:h-9 text-xs sm:text-sm"
            onClick={() => router.push('/docs?section=dashboard')}
          >
            <FileText className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Documentación</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      {(() => {
        const visibleCards = []
        
        if (canViewEmpleadosOnline) {
          visibleCards.push(
            <Card key="empleados-online">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Empleados Online</CardTitle>
                <Wifi className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
              </CardHeader>
              <CardContent className="pb-3 sm:pb-4 pt-0 px-3 sm:px-4">
                <div className="text-lg sm:text-2xl font-bold">
                  {loading ? (
                    <div className="animate-pulse bg-muted rounded h-6 w-8"></div>
                  ) : (
                    stats.employeesOnline
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-green-500 inline" />
                  Conectados ahora
                </p>
              </CardContent>
            </Card>
          )
        }
        
        if (canViewLeadsAsignados) {
          visibleCards.push(
            <Card key="leads-asignados">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Leads Asignados</CardTitle>
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
              </CardHeader>
              <CardContent className="pb-3 sm:pb-4 pt-0 px-3 sm:px-4">
                <div className="text-lg sm:text-2xl font-bold">
                  {loading ? (
                    <div className="animate-pulse bg-muted rounded h-6 w-8"></div>
                  ) : (
                    stats.assignedLeads
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-amber-500 inline" />
                  Asignados a ti
                </p>
              </CardContent>
            </Card>
          )
        }
        
        if (canViewTareasPendientes) {
          visibleCards.push(
            <Card key="tareas-pendientes">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Tareas Pendientes</CardTitle>
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
              </CardHeader>
              <CardContent className="pb-3 sm:pb-4 pt-0 px-3 sm:px-4">
                <div className="text-lg sm:text-2xl font-bold">
                  {loading ? (
                    <div className="animate-pulse bg-muted rounded h-6 w-8"></div>
                  ) : (
                    stats.pendingTasks
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-red-500 inline" />
                  Vencen esta semana
                </p>
              </CardContent>
            </Card>
          )
        }
        
        if (canViewLeadsPorRevisar) {
          visibleCards.push(
            <Card key="leads-por-revisar" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/leads/aprobar')}>
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Leads por Revisar</CardTitle>
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
              </CardHeader>
              <CardContent className="pb-3 sm:pb-4 pt-0 px-3 sm:px-4">
                <div className="text-lg sm:text-2xl font-bold">
                  {loading ? (
                    <div className="animate-pulse bg-muted rounded h-6 w-8"></div>
                  ) : (
                    stats.leadsToReview
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-blue-500 inline" />
                  Pendientes de aprobación
                </p>
              </CardContent>
            </Card>
          )
        }
        
        if (canViewLeadsPorAsignar) {
          visibleCards.push(
            <Card key="leads-por-asignar" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/leads/asignar')}>
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Leads por Asignar</CardTitle>
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
              </CardHeader>
              <CardContent className="pb-3 sm:pb-4 pt-0 px-3 sm:px-4">
                <div className="text-lg sm:text-2xl font-bold">
                  {loading ? (
                    <div className="animate-pulse bg-muted rounded h-6 w-8"></div>
                  ) : (
                    stats.leadsToAssign
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-purple-500 inline" />
                  Aprobados sin asignar
                </p>
              </CardContent>
            </Card>
          )
        }
        
        const gridColsClass = visibleCards.length === 1 ? 'grid-cols-1 max-w-sm' 
                            : visibleCards.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
                            : visibleCards.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                            : visibleCards.length === 4 ? 'grid-cols-2 lg:grid-cols-4'
                            : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
        
        return (
          <div className={`grid gap-2 sm:gap-4 ${gridColsClass}`}>
            {visibleCards}
          </div>
        )
      })()}

      {/* Contenido principal */}
      {(() => {
        const contentSections = []
        
        if (canViewActividadReciente) {
          contentSections.push(
            <RecentActivity key="actividad-reciente" />
          )
        }
        
        if (canViewProximasNotificaciones) {
          contentSections.push(
            <div key="proximas-notificaciones" className="col-span-1">
              <UpcomingNotifications />
            </div>
          )
        }
        
        if (contentSections.length === 0) {
          return null
        }
        
        const gridClass = contentSections.length === 1 
          ? "grid grid-cols-1 gap-4 sm:gap-6"
          : "grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3"
        
        return (
          <div className={gridClass}>
            {contentSections}
          </div>
        )
      })()}
    </div>
  )
}
