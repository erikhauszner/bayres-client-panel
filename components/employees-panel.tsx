"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, MoreVertical, Filter, Clock, Users, UserPlus, List, Grid, Edit, Trash2, CheckCircle2, XCircle, Phone, Building, Shield, Eye, User, Plus, Key, FileText, Loader2, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { toast } from "sonner"
import EmployeeService from "@/lib/services/employeeService"
import { Employee } from "@/lib/types/employee"

export default function EmployeesPanel() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchEmployees()
  }, [searchTerm])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await EmployeeService.getEmployees({
        search: searchTerm,
        page: 1,
        limit: 100
      })
      setEmployees(response.data)
      setTotalEmployees(response.total)
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast.error("Error al cargar los empleados")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este empleado?")) return

    try {
      await EmployeeService.deleteEmployee(id)
      toast.success("Empleado eliminado correctamente")
      fetchEmployees()
    } catch (error) {
      console.error("Error deleting employee:", error)
      toast.error("Error al eliminar el empleado")
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await EmployeeService.deactivateEmployee(id)
        toast.success("Empleado desactivado correctamente")
      } else {
        await EmployeeService.activateEmployee(id)
        toast.success("Empleado activado correctamente")
      }
      fetchEmployees()
    } catch (error) {
      console.error("Error toggling employee status:", error)
      toast.error("Error al cambiar el estado del empleado")
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getRoleColor = (role: string | undefined | null | {_id: string, name: string}) => {
    let normalizedRole = '';
    
    if (role && typeof role === 'object' && 'name' in role) {
      normalizedRole = role.name.toLowerCase();
    } else {
      normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
    }
    
    const colors: { [key: string]: string } = {
      admin: "bg-purple-100 text-purple-800",
      manager: "bg-blue-100 text-blue-800",
      employee: "bg-gray-100 text-gray-800",
      user: "bg-teal-100 text-teal-800",
      appointment_setter: "bg-amber-100 text-amber-800",
      client: "bg-orange-100 text-orange-800"
    }
    return colors[normalizedRole] || "bg-gray-100 text-gray-800"
  }

  const getRoleName = (role: string | undefined | null | {_id: string, name: string}) => {
    if (role && typeof role === 'object' && 'name' in role) {
      return role.name;
    }

    const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
    
    const roleNames: { [key: string]: string } = {
      admin: "Administrador",
      manager: "Gerente",
      employee: "Empleado",
      user: "Usuario",
      appointment_setter: "Agente de citas",
      client: "Cliente"
    }
    return roleNames[normalizedRole] || (role || "Desconocido")
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Empleados</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gestiona el equipo y sus roles en el sistema</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={() => router.push('/docs?section=users')}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Documentación</span>
          </Button>
          <Button 
            size="sm" 
            className="h-9 bg-primary hover:bg-primary/90"
            onClick={() => router.push('/empleados/nuevo')}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Nuevo Empleado</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="netflix-card">
          <CardContent className="pt-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Empleados</p>
                <p className="text-xl sm:text-2xl font-bold">{totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="netflix-card">
          <CardContent className="pt-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Empleados Activos</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {(employees || []).filter(e => e?.isActive).length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="netflix-card">
          <CardContent className="pt-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Empleados Inactivos</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {(employees || []).filter(e => !e?.isActive).length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="netflix-card overflow-visible">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar empleados..."
                className="w-full bg-background pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                <span>Filtros</span>
              </Button>
              <div className="flex rounded-md border border-border/30 bg-card/50">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-none rounded-l-md"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                  <span className="sr-only">Vista de cuadrícula</span>
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-none rounded-r-md"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                  <span className="sr-only">Vista de lista</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de empleados */}
      {loading ? (
        <div className="text-center py-8">
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Cargando empleados...</p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(employees || []).map((employee) => (
            <Card key={employee._id} className="netflix-card overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-border/10 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className={`h-9 w-9 sm:h-10 sm:w-10 ${getRoleColor(employee.role)} text-white`}>
                      <AvatarFallback className="text-xs sm:text-sm">{employee.firstName.charAt(0) + employee.lastName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{employee.firstName} {employee.lastName}</h3>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-none">{employee.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/empleados/${employee._id}`)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/empleados/${employee._id}/password`)}>
                        <Key className="w-4 h-4 mr-2" />
                        Contraseña
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">Editar</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        {employee.isActive ? "Desactivar" : "Activar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => handleDelete(employee._id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm">{employee.department || "Sin departamento"}</span>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(employee.isActive)}`}>
                      {employee.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm">{employee.position || "Sin posición"}</span>
                    </div>
                    <Badge className={`text-xs ${getRoleColor(employee.role)}`}>
                      {getRoleName(employee.role)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm">{employee.phone || "Sin teléfono"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-card/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Empleado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Departamento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Posición</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(employees || []).map((employee) => (
                <tr key={employee._id} className="border-b border-border/10 transition-colors hover:bg-muted/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-8 w-8 sm:h-10 sm:w-10 ${getRoleColor(employee.role)} text-white`}>
                        <AvatarFallback className="text-xs sm:text-sm">{employee.firstName.charAt(0)}{employee.lastName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm sm:text-base">{employee.firstName} {employee.lastName}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-none">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm">{employee.department || "—"}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm">{employee.position || "—"}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Badge className={`${getRoleColor(employee.role)}`}>
                      {getRoleName(employee.role)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`${getStatusColor(employee.isActive)}`}>
                      {employee.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/empleados/${employee._id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/empleados/${employee._id}/password`)}>
                          <Key className="w-4 h-4 mr-2" />
                          Contraseña
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/empleados/${employee._id}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleToggleStatus(employee._id, employee.isActive)}
                        >
                          {employee.isActive ? (
                            <>
                              <XCircle className="w-4 h-4 mr-2 text-red-500" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive"
                          onClick={() => handleDelete(employee._id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

