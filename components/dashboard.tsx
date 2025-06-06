"use client"

import { useState, useEffect } from "react"
import {
  BarChart2,
  Users,
  UserCircle,
  Briefcase,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  ArrowUpRight,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido al panel de control de Bayres CRM</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={() => router.push('/docs?section=dashboard')}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Documentación</span>
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Últimos 30 días</span>
          </Button>
          <Button size="sm" className="h-9 bg-primary hover:bg-primary/90">
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Generar Reporte</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <UserCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500 inline" />
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500 inline" />
              +5% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
            <Briefcase className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-4 w-4 text-amber-500 inline" />
              +2% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$48,250</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500 inline" />
              +8% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y estadísticas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Conversión de Leads</CardTitle>
            <CardDescription>Tasa de conversión por etapa del embudo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                    <span>Conciencia</span>
                  </div>
                  <span className="font-medium">125 leads</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                    <span>Contacto</span>
                  </div>
                  <span className="font-medium">98 leads (78%)</span>
                </div>
                <Progress value={78} className="h-2 bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span>Propuesta</span>
                  </div>
                  <span className="font-medium">64 leads (51%)</span>
                </div>
                <Progress value={51} className="h-2 bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                    <span>Negociación</span>
                  </div>
                  <span className="font-medium">42 leads (34%)</span>
                </div>
                <Progress value={34} className="h-2 bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span>Cliente</span>
                  </div>
                  <span className="font-medium">28 leads (22%)</span>
                </div>
                <Progress value={22} className="h-2 bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Objetivos Mensuales</CardTitle>
            <CardDescription>Progreso hacia los objetivos del mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Target className="mr-2 h-4 w-4 text-primary" />
                    <span>Nuevos Leads</span>
                  </div>
                  <span className="font-medium">42 / 50</span>
                </div>
                <Progress value={84} className="h-2" />
                <p className="text-xs text-muted-foreground">84% completado</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Target className="mr-2 h-4 w-4 text-primary" />
                    <span>Conversiones</span>
                  </div>
                  <span className="font-medium">12 / 20</span>
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-xs text-muted-foreground">60% completado</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Target className="mr-2 h-4 w-4 text-primary" />
                    <span>Ingresos</span>
                  </div>
                  <span className="font-medium">$48,250 / $60,000</span>
                </div>
                <Progress value={80} className="h-2" />
                <p className="text-xs text-muted-foreground">80% completado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente y leads destacados */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "1",
                  type: "lead",
                  action: "created",
                  title: "Nuevo lead: María García",
                  time: "hace 2 horas",
                  user: "jrodriguez",
                  userInitials: "JR"
                },
                {
                  id: "2",
                  type: "client",
                  action: "converted",
                  title: "Lead convertido a cliente: Grupo Innovación",
                  time: "hace 3 horas",
                  user: "mlopez",
                  userInitials: "ML"
                },
                {
                  id: "3",
                  type: "project",
                  action: "updated",
                  title: "Actualización de proyecto: Sitio Web ACME",
                  time: "hace 5 horas",
                  user: "aruiz",
                  userInitials: "AR"
                },
                {
                  id: "4",
                  type: "task",
                  action: "completed",
                  title: "Tarea completada: Llamada inicial a Inversiones XYZ",
                  time: "hace 1 día",
                  user: "jrodriguez",
                  userInitials: "JR"
                },
                {
                  id: "5",
                  type: "meeting",
                  action: "scheduled",
                  title: "Reunión programada: Presentación a Corporación ABC",
                  time: "hace 1 día",
                  user: "mperez",
                  userInitials: "MP"
                }
              ].map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 border-b border-border/40 pb-4">
                  <Avatar className="mt-1 h-8 w-8 bg-primary/10 text-primary">
                    <AvatarFallback>{activity.userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.title}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>
                        {activity.time} por <span className="font-medium">{activity.user}</span>
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={
                      activity.type === "lead"
                        ? "bg-blue-100 text-blue-800"
                        : activity.type === "client"
                        ? "bg-green-100 text-green-800"
                        : activity.type === "project"
                        ? "bg-amber-100 text-amber-800"
                        : activity.type === "task"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-slate-100 text-slate-800"
                    }
                  >
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Leads Destacados</CardTitle>
            <CardDescription>Oportunidades con mayor potencial</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  id: "1",
                  name: "Corporación ABC",
                  value: "$12,000",
                  stage: "Propuesta",
                  progress: 65,
                  priority: "alta"
                },
                {
                  id: "2",
                  name: "María García",
                  value: "$8,500",
                  stage: "Negociación",
                  progress: 80,
                  priority: "media"
                },
                {
                  id: "3",
                  name: "Tech Solutions",
                  value: "$15,200",
                  stage: "Contacto",
                  progress: 40,
                  priority: "alta"
                },
                {
                  id: "4",
                  name: "Juan Pérez",
                  value: "$5,800",
                  stage: "Propuesta",
                  progress: 60,
                  priority: "baja"
                }
              ].map((lead) => (
                <div key={lead.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                      {lead.name}
                    </Link>
                    <Badge
                      className={
                        lead.priority === "alta"
                          ? "bg-red-100 text-red-800"
                          : lead.priority === "media"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {lead.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{lead.stage}</span>
                    <span className="font-medium">{lead.value}</span>
                  </div>
                  <Progress value={lead.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Probabilidad</span>
                    <span>{lead.progress}%</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Ver todos los leads
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proyectos activos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Proyectos Activos</CardTitle>
          <CardDescription>Estado de los proyectos en curso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                id: "1",
                title: "Rediseño Sitio Web",
                client: "Corporación ABC",
                deadline: "15 Ago, 2023",
                status: "En progreso",
                progress: 65,
                budget: "$12,000",
                spent: "$7,800"
              },
              {
                id: "2",
                title: "Campaña de Marketing",
                client: "Tech Solutions",
                deadline: "30 Sep, 2023",
                status: "Iniciando",
                progress: 20,
                budget: "$8,500",
                spent: "$1,700"
              },
              {
                id: "3",
                title: "App Móvil",
                client: "Innovaciones XYZ",
                deadline: "15 Nov, 2023",
                status: "En progreso",
                progress: 40,
                budget: "$24,000",
                spent: "$9,600"
              }
            ].map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base font-medium">{project.title}</CardTitle>
                  <CardDescription>{project.client}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fecha límite</span>
                    <span className="font-medium">{project.deadline}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estado</span>
                    <Badge
                      className={
                        project.status === "En progreso"
                          ? "bg-blue-100 text-blue-800"
                          : project.status === "Iniciando"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progreso</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm">
                    <span className="text-muted-foreground">Presupuesto</span>
                    <span className="font-medium">{project.budget}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gastado</span>
                    <span className={Number(project.spent.replace(/[^0-9.-]+/g, "")) > Number(project.budget.replace(/[^0-9.-]+/g, "")) * 0.8
                      ? "font-medium text-red-500"
                      : "font-medium"}
                    >
                      {project.spent}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
