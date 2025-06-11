"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EmployeeService from "@/lib/services/employeeService"
import RoleService from "@/lib/services/roleService"
import { Employee } from "@/lib/types/employee"
import { toast } from "@/components/ui/use-toast"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import {
  Mail,
  Phone,
  Building,
  Briefcase,
  User,
  Calendar,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Shield,
  ArrowLeft,
  XCircle,
  CheckCircle2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import React from "react"

interface EmployeePageProps {
  params: Promise<{ id: string }>
}

export default function EmployeePage({ params }: EmployeePageProps) {
  const { id } = React.use(params)
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rolePermissions, setRolePermissions] = useState<any>(null)
  const [loadingPermissions, setLoadingPermissions] = useState(false)

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

  useEffect(() => {
    const fetchPermissions = async () => {
      if (employee?.role) {
        try {
          setLoadingPermissions(true)
          
          // Obtener el rol y sus permisos directamente
          const roleData = await RoleService.getRoleById(employee.role)
          
          if (roleData && roleData.permissions) {
            // Si tenemos el rol con sus permisos
            setRolePermissions({
              role: {
                id: roleData._id,
                name: roleData.name,
                description: roleData.description
              },
              permissions: roleData.permissions
            })
          } else {
            // Si no podemos obtener el rol por ID, intentamos obtener permisos
            const permissions = await RoleService.getRolePermissions(employee.role)
            
            if (permissions && permissions.length > 0) {
              setRolePermissions({
                role: {
                  id: typeof employee.role === 'string' ? employee.role : '',
                  name: employee.roleName || getRoleName(employee.role),
                  description: getDefaultRoleDescription(employee.role)
                },
                permissions: permissions
              })
            } else {
              // Solución de respaldo si no podemos obtener los permisos
              setRolePermissions({
                role: {
                  id: typeof employee.role === 'string' ? employee.role : '',
                  name: employee.roleName || getRoleName(employee.role),
                  description: getDefaultRoleDescription(employee.role)
                },
                permissions: []
              })
              
              console.log('No se pudieron obtener los permisos del rol')
            }
          }
        } catch (error) {
          console.error("Error al cargar los permisos:", error)
          
          // Solución de respaldo si hay un error
          setRolePermissions({
            role: {
              id: typeof employee.role === 'string' ? employee.role : '',
              name: employee.roleName || getRoleName(employee.role),
              description: getDefaultRoleDescription(employee.role)
            },
            permissions: []
          })
        } finally {
          setLoadingPermissions(false)
        }
      }
    }

    if (employee) {
      fetchPermissions()
    }
  }, [employee])

  // Función para obtener el nombre del rol
  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "manager":
        return "Gerente";
      case "employee":
        return "Empleado";
      case "appointment_setter":
        return "Agente de citas";
      case "client":
        return "Cliente";
      case "user":
        return "Usuario";
      default:
        return "Rol desconocido";
    }
  }
  
  // Función para obtener la descripción predeterminada del rol
  const getDefaultRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador del sistema con acceso total";
      case "manager":
        return "Gerente con acceso a gestión de empleados y leads";
      case "employee":
        return "Empleado con permisos limitados";
      case "appointment_setter":
        return "Agente de citas con acceso a leads y actividades";
      case "client":
        return "Cliente con acceso limitado a su información";
      case "user":
        return "Usuario estándar";
      default:
        return "Rol del sistema";
    }
  }

  const handleDelete = async () => {
    if (!employee?._id) return

    try {
      await EmployeeService.deleteEmployee(employee._id)
      toast({
        title: "Empleado eliminado",
        description: "El empleado ha sido eliminado exitosamente",
      })
      router.push("/empleados")
    } catch (error) {
      console.error("Error al eliminar el empleado:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el empleado",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async () => {
    if (!employee?._id) return

    try {
      if (employee.isActive) {
        await EmployeeService.deactivateEmployee(employee._id)
      } else {
        await EmployeeService.activateEmployee(employee._id)
      }

      setEmployee((prev: Employee | null) => prev ? { ...prev, isActive: !prev.isActive } : null)
      toast({
        title: "Estado actualizado",
        description: `El empleado ha sido ${employee.isActive ? 'desactivado' : 'activado'} exitosamente`,
      })
    } catch (error) {
      console.error("Error al cambiar el estado del empleado:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del empleado",
        variant: "destructive",
      })
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Cargando empleado...</p>
          </div>
        </div>
      )
    }

    if (error || !employee) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="mb-2 h-8 w-8 text-destructive" />
          <h3 className="mb-1 text-lg font-semibold">Error</h3>
          <p className="mb-4 max-w-sm text-muted-foreground">
            {error || "No se pudo cargar el empleado"}
          </p>
          <Button onClick={() => router.push("/empleados")}>
            Volver a empleados
          </Button>
        </div>
      )
    }

    const getStatusColor = (isActive: boolean) => {
      return isActive 
        ? "bg-green-950/30 text-green-400 border border-green-800/30"
        : "bg-amber-950/30 text-amber-400 border border-amber-800/30"
    }

    const getRoleColor = (role: string) => {
      switch (role) {
        case "admin":
          return "bg-purple-950/30 text-purple-400 border border-purple-800/30"
        case "manager":
          return "bg-blue-950/30 text-blue-400 border border-blue-800/30"
        default:
          return "bg-slate-950/30 text-slate-400 border border-slate-800/30"
      }
    }

    // Agrupar permisos por módulo
    const groupedPermissions: Record<string, any[]> = {}
    
    if (rolePermissions && rolePermissions.permissions) {
      rolePermissions.permissions.forEach((permission: any) => {
        const [module, action] = permission.name.split(':')
        if (!groupedPermissions[module]) {
          groupedPermissions[module] = []
        }
        groupedPermissions[module].push(permission)
      })
    }
    
    // Obtener un nombre legible para la acción
    const getActionName = (action: string) => {
      switch (action) {
        case 'create': return 'Crear'
        case 'read': return 'Ver'
        case 'update': return 'Editar'
        case 'delete': return 'Eliminar'
        case 'manage': return 'Gestionar'
        case 'export': return 'Exportar'
        case 'import': return 'Importar'
        case 'approve': return 'Aprobar'
        case 'reject': return 'Rechazar'
        default: return action
      }
    }
    
    // Obtener un nombre legible para el módulo
    const getModuleName = (module: string) => {
      switch (module) {
        case 'auth': return 'Autenticación'
        case 'employees': return 'Empleados'
        case 'roles': return 'Roles'
        case 'leads': return 'Leads'
        case 'clients': return 'Clientes'
        case 'activities': return 'Actividades'
        case 'tasks': return 'Tareas'
        case 'projects': return 'Proyectos'
        case 'finances': return 'Finanzas'
        case 'notifications': return 'Notificaciones'
        case 'settings': return 'Configuración'
        default: return module
      }
    }

    return (
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Encabezado con acciones */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9"
              onClick={() => router.push("/empleados")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Volver</span>
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9"
              onClick={() => router.push(`/empleados/${employee._id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </Button>
            
            <Button 
              variant={employee?.isActive ? "outline" : "default"} 
              size="sm" 
              className="h-9"
              onClick={handleToggleStatus}
            >
              {employee?.isActive ? (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  <span>Desactivar</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span>Activar</span>
                </>
              )}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-9"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Eliminar</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente al empleado
                    {employee?.firstName} {employee?.lastName} y todos sus datos asociados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          {/* Información básica */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 bg-primary/10">
                  <AvatarFallback className="text-xl sm:text-2xl">
                    {`${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {`${employee.firstName} ${employee.lastName}`}
                  </h2>
                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className={getStatusColor(employee.isActive)}>
                    {employee.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Badge variant="outline" className={getRoleColor(employee.role)}>
                    {employee.roleName || (
                      employee.role === 'admin' ? 'Administrador' : 
                      employee.role === 'manager' ? 'Gerente' : 'Empleado'
                    )}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Creado: {new Date(employee.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {employee.lastLogin && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Último acceso: {new Date(employee.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pestañas con información detallada */}
          <Tabs defaultValue="info" className="w-full">
            <div className="overflow-x-auto pb-1">
              <TabsList className="w-auto inline-flex min-w-max">
                <TabsTrigger value="info" className="text-xs sm:text-sm whitespace-nowrap">Información</TabsTrigger>
                <TabsTrigger value="permissions" className="text-xs sm:text-sm whitespace-nowrap">Permisos</TabsTrigger>
                <TabsTrigger value="activity" className="text-xs sm:text-sm whitespace-nowrap">Actividad</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="info" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Información del Empleado</CardTitle>
                  <CardDescription>
                    Datos personales y profesionales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                  <div className="grid gap-2">
                    <p className="text-sm font-medium">Nombre completo</p>
                    <p className="text-sm text-muted-foreground">
                      {`${employee.firstName} ${employee.lastName}`}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <p className="text-sm font-medium">Correo electrónico</p>
                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                  </div>
                  <div className="grid gap-2">
                    <p className="text-sm font-medium">Departamento</p>
                    <p className="text-sm text-muted-foreground">{employee.department}</p>
                  </div>
                  <div className="grid gap-2">
                    <p className="text-sm font-medium">Posición</p>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                  <div className="grid gap-2">
                    <p className="text-sm font-medium">Fecha de creación</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Permisos del Empleado</CardTitle>
                  <CardDescription>
                    Permisos asignados a través del rol
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {loadingPermissions ? (
                    <div className="flex justify-center p-6">
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : rolePermissions ? (
                    <div className="space-y-6">
                      <div className="rounded-lg border border-border/40 p-4">
                        <div className="mb-4 flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <h3 className="text-base font-medium">
                            Rol: {rolePermissions.role.name}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rolePermissions.role.description}
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        {Object.keys(groupedPermissions).length > 0 ? (
                          Object.entries(groupedPermissions).map(([module, permissions]) => (
                            <div key={module} className="space-y-2">
                              <h4 className="font-medium">
                                {getModuleName(module)}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {permissions.map((permission: any) => (
                                  <Badge key={permission.name} variant="outline" className="bg-primary/5">
                                    {getActionName(permission.name.split(':')[1])}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No hay permisos asociados a este rol.
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => router.push(`/empleados/${employee._id}/permisos`)}
                        className="w-full"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Gestionar permisos
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground">
                      No se pudieron cargar los permisos.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Registro de Actividad</CardTitle>
                  <CardDescription>
                    Últimas acciones y eventos
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <p className="text-sm text-muted-foreground">
                    No hay actividades registradas.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
          {renderContent()}
        </main>
      </div>
    </div>
  )
} 