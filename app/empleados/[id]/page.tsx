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
    
    if (rolePermissions?.permissions) {
      rolePermissions.permissions.forEach((permission: any) => {
        // Asegurarnos de que el permiso tiene un módulo válido
        const module = permission.module || (
          typeof permission === 'string' && permission.includes(':') 
            ? permission.split(':')[0] 
            : 'general'
        )
        
        if (!groupedPermissions[module]) {
          groupedPermissions[module] = []
        }
        
        // Asegurarse de que no añadimos duplicados
        const permExists = groupedPermissions[module].some(p => 
          (p.id && p.id === permission.id) || 
          (p.action && p.action === permission.action)
        )
        
        if (!permExists) {
          groupedPermissions[module].push(permission)
        }
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
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Detalle del Empleado</h1>
            <p className="text-muted-foreground">
              Información detallada del empleado
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/empleados/${employee._id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant={employee.isActive ? "destructive" : "default"}
              onClick={handleToggleStatus}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              {employee.isActive ? "Desactivar" : "Activar"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente el empleado
                    y todos sus datos asociados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 bg-primary/10">
                  <AvatarFallback className="text-2xl">
                    {`${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">
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
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.email}</span>
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="permissions">Permisos</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Empleado</CardTitle>
                  <CardDescription>
                    Datos personales y profesionales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  {employee.phone && (
                    <div className="grid gap-2">
                      <p className="text-sm font-medium">Teléfono</p>
                      <p className="text-sm text-muted-foreground">{employee.phone}</p>
                    </div>
                  )}
                  
                  {/* Información personal */}
                  {(employee.birthDate || employee.gender || employee.documentId || employee.documentType) && (
                    <>
                      <div className="mt-6 mb-2">
                        <h3 className="font-medium text-sm">Información Personal</h3>
                        <div className="h-px bg-border mt-2"></div>
                      </div>
                      
                      {employee.birthDate && (
                        <div className="grid gap-2">
                          <p className="text-sm font-medium">Fecha de nacimiento</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(employee.birthDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      
                      {employee.gender && (
                        <div className="grid gap-2">
                          <p className="text-sm font-medium">Género</p>
                          <p className="text-sm text-muted-foreground">
                            {employee.gender === 'masculino' ? 'Masculino' : 
                             employee.gender === 'femenino' ? 'Femenino' : 
                             employee.gender === 'otro' ? 'Otro' : 
                             employee.gender === 'prefiero_no_decir' ? 'Prefiero no decir' : 
                             employee.gender}
                          </p>
                        </div>
                      )}
                      
                      {(employee.documentType || employee.documentId) && (
                        <div className="grid gap-2">
                          <p className="text-sm font-medium">Documento</p>
                          <p className="text-sm text-muted-foreground">
                            {employee.documentType && (
                              <span className="capitalize">
                                {employee.documentType === 'dni' ? 'DNI' : 
                                 employee.documentType === 'pasaporte' ? 'Pasaporte' : 
                                 employee.documentType === 'cuit' ? 'CUIT' : 
                                 employee.documentType === 'cuil' ? 'CUIL' : 
                                 employee.documentType}
                              </span>
                            )}
                            {employee.documentType && employee.documentId ? ': ' : ''}
                            {employee.documentId}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Información geográfica */}
                  {(employee.address || employee.city || employee.state || employee.country || employee.postalCode) && (
                    <>
                      <div className="mt-6 mb-2">
                        <h3 className="font-medium text-sm">Ubicación</h3>
                        <div className="h-px bg-border mt-2"></div>
                      </div>
                      
                      {employee.address && (
                        <div className="grid gap-2">
                          <p className="text-sm font-medium">Dirección</p>
                          <p className="text-sm text-muted-foreground">{employee.address}</p>
                        </div>
                      )}
                      
                      {(employee.city || employee.state) && (
                        <div className="grid gap-2">
                          <p className="text-sm font-medium">Ciudad/Provincia</p>
                          <p className="text-sm text-muted-foreground">
                            {[employee.city, employee.state].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}
                      
                      {(employee.country || employee.postalCode) && (
                        <div className="grid gap-2">
                          <p className="text-sm font-medium">País/Código Postal</p>
                          <p className="text-sm text-muted-foreground">
                            {employee.country}
                            {employee.country && employee.postalCode ? ', ' : ''}
                            {employee.postalCode && `CP: ${employee.postalCode}`}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Redes sociales */}
                  {(employee.linkedin || employee.twitter || employee.facebook || employee.instagram || employee.website) && (
                    <>
                      <div className="mt-6 mb-2">
                        <h3 className="font-medium text-sm">Redes Sociales</h3>
                        <div className="h-px bg-border mt-2"></div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-3">
                        {employee.linkedin && (
                          <a href={employee.linkedin} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5]/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                            LinkedIn
                          </a>
                        )}
                        
                        {employee.twitter && (
                          <a href={employee.twitter} target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                            Twitter
                          </a>
                        )}
                        
                        {employee.facebook && (
                          <a href={employee.facebook} target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                            Facebook
                          </a>
                        )}
                        
                        {employee.instagram && (
                          <a href={employee.instagram} target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F]/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                            Instagram
                          </a>
                        )}
                        
                        {employee.website && (
                          <a href={employee.website} target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            Sitio Web
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Permisos del Sistema</CardTitle>
                  <CardDescription>
                    Accesos y privilegios asignados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loadingPermissions ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-sm text-muted-foreground">Cargando permisos...</p>
                      </div>
                    </div>
                  ) : rolePermissions ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-medium">Rol asignado</h3>
                        </div>
                        <div className="rounded-md border p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{rolePermissions.role?.name || employee.roleName || getRoleName(employee.role)}</p>
                              <p className="text-sm text-muted-foreground">{rolePermissions.role?.description || getDefaultRoleDescription(employee.role)}</p>
                            </div>
                            <Badge variant="outline" className={getRoleColor(employee.role)}>
                              {employee.roleName || getRoleName(employee.role)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Lista de permisos</h3>
                        <div className="rounded-md border">
                          {Object.keys(groupedPermissions).length > 0 ? (
                            <div className="divide-y">
                              {Object.entries(groupedPermissions).map(([module, permissions]) => (
                                <div key={module} className="p-4">
                                  <h4 className="mb-2 font-medium capitalize">{getModuleName(module)}</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {permissions.map((permission, index) => {
                                      // Determinar qué mostrar basado en la estructura del permiso
                                      const actionText = permission.action 
                                        ? getActionName(permission.action)
                                        : (typeof permission === 'string' && permission.includes(':') 
                                            ? getActionName(permission.split(':')[1]) 
                                            : 'Acceso');
                                      
                                      return (
                                        <Badge 
                                          key={permission.id || permission._id || `${module}-${index}`} 
                                          variant="outline" 
                                          className="bg-sky-950/30 text-sky-400 border border-sky-800/30"
                                        >
                                          {actionText}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No hay permisos asociados a este rol.
                            </div>
                          )}
                        </div>
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
                <CardHeader>
                  <CardTitle>Registro de Actividad</CardTitle>
                  <CardDescription>
                    Últimas acciones y eventos
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  )
} 