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
  Star,
  Activity,
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
import { dashboardService, DashboardStats as DashboardStatsApi } from "@/lib/services/dashboard.service"
import { useHasPermission } from "@/hooks/useHasPermission"

type DashboardStats = DashboardStatsApi

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    employeesOnline: 0,
    assignedLeads: 0,
    pendingTasks: 0,
    leadsToReview: 0,
    leadsToAssign: 0,
    myOpportunities: 0,
    activeOpportunities: 0
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
  const canViewMisOportunidades = useHasPermission("dashboard:mis_oportunidades")
  const canViewOportunidadesActivas = useHasPermission("dashboard:oportunidades_activas")

  useEffect(() => {
    setIsLoaded(true)
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Error cargando estadísticas del dashboard:', error)
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
            <Card key="empleados-online" className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                  <Wifi className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">Empleados Online</p>
                  {loading ? (
                    <div className="animate-pulse bg-green-300 dark:bg-green-700 rounded h-6 w-8"></div>
                  ) : (
                    <p className="text-lg font-bold text-green-700 dark:text-green-200">
                      {stats.employeesOnline}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        }
        
        if (canViewLeadsAsignados) {
          visibleCards.push(
            <Card key="leads-asignados" className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Leads Asignados</p>
                  {loading ? (
                    <div className="animate-pulse bg-amber-300 dark:bg-amber-700 rounded h-6 w-8"></div>
                  ) : (
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-200">
                      {stats.assignedLeads}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        }
        
        if (canViewTareasPendientes) {
          visibleCards.push(
            <Card key="tareas-pendientes" className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-red-200 dark:border-red-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">Tareas Pendientes</p>
                  {loading ? (
                    <div className="animate-pulse bg-red-300 dark:bg-red-700 rounded h-6 w-8"></div>
                  ) : (
                    <p className="text-lg font-bold text-red-700 dark:text-red-200">
                      {stats.pendingTasks}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        }
        
        if (canViewLeadsPorRevisar) {
          visibleCards.push(
            <Card key="leads-por-revisar" className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/leads/aprobar')}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Leads por Revisar</p>
                  {loading ? (
                    <div className="animate-pulse bg-blue-300 dark:bg-blue-700 rounded h-6 w-8"></div>
                  ) : (
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-200">
                      {stats.leadsToReview}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        }
        
        if (canViewLeadsPorAsignar) {
          visibleCards.push(
            <Card key="leads-por-asignar" className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/leads/asignar')}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Leads por Asignar</p>
                  {loading ? (
                    <div className="animate-pulse bg-purple-300 dark:bg-purple-700 rounded h-6 w-8"></div>
                  ) : (
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-200">
                      {stats.leadsToAssign}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        }
        
        if (canViewMisOportunidades) {
          visibleCards.push(
            <Card key="mis-oportunidades" className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 border-yellow-200 dark:border-yellow-800 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/oportunidades')}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-200 dark:bg-yellow-800 flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Mis Oportunidades</p>
                  {loading ? (
                    <div className="animate-pulse bg-yellow-300 dark:bg-yellow-700 rounded h-6 w-8"></div>
                  ) : (
                    <p className="text-lg font-bold text-yellow-700 dark:text-yellow-200">
                      {stats.myOpportunities}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        }
        
        if (canViewOportunidadesActivas) {
          visibleCards.push(
            <Card key="oportunidades-activas" className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200 dark:border-emerald-800 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/oportunidades')}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Oportunidades Activas</p>
                  {loading ? (
                    <div className="animate-pulse bg-emerald-300 dark:bg-emerald-700 rounded h-6 w-8"></div>
                  ) : (
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-200">
                      {stats.activeOpportunities}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        }
        
        const gridColsClass = visibleCards.length === 1 ? 'grid-cols-1 max-w-sm' 
                            : visibleCards.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
                            : visibleCards.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                            : visibleCards.length === 4 ? 'grid-cols-2 lg:grid-cols-4'
                            : visibleCards.length === 5 ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                            : visibleCards.length === 6 ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
                            : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        
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
