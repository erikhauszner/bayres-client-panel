"use client"

import { useState, useEffect } from "react"
import { Search, FileText, Edit, Trash2, Info, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import NewRoleForm from "@/components/new-role-form"
import EditRoleForm from "@/components/edit-role-form"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import RoleService, { Role as ServerRole } from "@/lib/services/roleService"
import Link from "next/link"

interface Role {
  id: number | string;
  nombre: string;
  descripcion: string;
  permisos: string[] | string;
  estado: boolean;
  color?: string;
  isSystem?: boolean;
}

// Función para convertir el modelo del servidor al modelo de cliente
const mapServerRoleToClientRole = (serverRole: ServerRole): Role => {
  return {
    id: serverRole._id,
    nombre: serverRole.name,
    descripcion: serverRole.description,
    permisos: serverRole.permissions.map(p => typeof p === 'string' ? p : p.name || p._id),
    estado: serverRole.isActive,
    isSystem: serverRole.isSystem,
    color: getRandomColor(serverRole.name)
  };
};

// Función para convertir el modelo de cliente al modelo del servidor
const mapClientRoleToServerRole = (clientRole: Role) => {
  // Asegurarnos de que los permisos siempre sea un array de strings
  let permissions: string[] = [];
  
  if (Array.isArray(clientRole.permisos)) {
    permissions = clientRole.permisos;
  } else if (typeof clientRole.permisos === 'string' && clientRole.permisos.trim() !== '') {
    permissions = clientRole.permisos.split(', ').filter(Boolean);
  }
  
  return {
    name: clientRole.nombre,
    description: clientRole.descripcion,
    permissions: permissions,
    isActive: clientRole.estado
  };
};

// Función para generar un color aleatorio pero consistente para cada rol
const getRandomColor = (name: string) => {
  const colors = [
    "bg-primary",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500"
  ];
  
  // Usar el nombre como semilla para generar un índice consistente
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  
  const colorIndex = sum % colors.length;
  return colors[colorIndex];
};

export default function RolesPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const router = useRouter()
  const { toast } = useToast()

  // Cargar roles desde el servidor
  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const serverRoles = await RoleService.getRoles();
      const mappedRoles = serverRoles.map(mapServerRoleToClientRole);
      setRoles(mappedRoles);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error cargando roles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los roles. Intenta de nuevo más tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const filteredRoles = roles.filter(
    (role) =>
      role.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateRole = async (updatedRole: Role) => {
    try {
      console.log("Actualizando rol:", updatedRole)
      
      // Convertir del modelo cliente al del servidor
      const serverRole = mapClientRoleToServerRole(updatedRole)
      
      // Actualizar en el servidor
      const response = await RoleService.updateRole(String(updatedRole.id), serverRole)
      
      // Actualizar en el estado local
      setRoles(prev => 
        prev.map(role => 
          role.id === updatedRole.id ? updatedRole : role
        )
      )
      
      toast({
        title: "Rol actualizado",
        description: `El rol ${updatedRole.nombre} ha sido actualizado correctamente.`,
      })
    } catch (error: any) {
      console.error("Error updating role:", error)
      
      // Verificar si el error es una respuesta del servidor con datos adicionales
      if (error?.response?.data) {
        const serverError = error.response.data;
        
        // Si hay permisos faltantes, mostrar un mensaje más específico
        if (serverError.missingPermissions && serverError.missingPermissions.length > 0) {
          toast({
            title: "Error de permisos",
            description: `Algunos permisos seleccionados no existen en la base de datos: ${serverError.missingPermissions.join(', ')}`,
            variant: "destructive"
          });
        } else {
          // Mostrar mensaje de error del servidor si está disponible
          toast({
            title: "Error",
            description: serverError.message || "No se pudo actualizar el rol",
            variant: "destructive"
          });
        }
      } else {
        // Mensaje de error genérico
        toast({
          title: "Error",
          description: "Error actualizando rol",
          variant: "destructive"
        });
      }
      
      throw error; // Re-lanzar el error para que el componente que llamó pueda manejarlo
    }
  }

  const handleDeleteRole = async (id: number | string) => {
    try {
      // Enviar solicitud de eliminación al servidor
      const success = await RoleService.deleteRole(String(id));
      
      if (success) {
        // Actualizar state local
        setRoles(roles.filter(role => role.id !== id));
        
        toast({
          title: "Rol eliminado",
          description: "El rol ha sido eliminado correctamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error eliminando rol:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el rol. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  };

  const toggleRoleStatus = async (id: number | string) => {
    try {
      // Enviar solicitud para cambiar estado
      const updatedRole = await RoleService.toggleRoleStatus(String(id));
      
      if (updatedRole) {
        // Actualizar state local
        setRoles((prevRoles) => prevRoles.map((role) => 
          role.id === id ? { ...role, estado: !role.estado } : role
        ));
      }
    } catch (error) {
      console.error('Error cambiando estado del rol:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del rol. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  };

  const truncateText = (text: string | string[], maxLength = 100) => {
    if (text === "Sin permisos") return text
    
    if (Array.isArray(text)) {
      const joinedText = text.join(", ");
      return joinedText.length > maxLength ? `${joinedText.substring(0, maxLength)}...` : joinedText
    }
    
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Roles</h1>
          <p className="text-muted-foreground">Administra los roles y permisos del sistema</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={() => router.push('/docs?section=roles')}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Documentación</span>
          </Button>
          <Link href="/roles/nuevo">
            <Button size="sm" className="h-9 bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              <span>Nuevo Rol</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="netflix-card overflow-visible">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar roles..."
                className="w-full bg-background pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9"
              onClick={loadRoles}
            >
              Recargar roles
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de roles */}
      <Card className="netflix-card">
        <div className="netflix-scrollbar overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/20 hover:bg-muted/5">
                <TableHead className="w-[180px]">Nombre</TableHead>
                <TableHead className="w-[200px]">Descripción</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead className="w-[100px] text-center">Estado</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Cargando roles...
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    No se encontraron roles
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id} className="border-b border-border/10 transition-colors hover:bg-muted/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className={`h-8 w-8 ${role.color || 'bg-primary'} text-white`}>
                          <AvatarFallback>{role.nombre.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{role.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>{role.descripcion}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="line-clamp-1 text-sm text-muted-foreground">
                          {!Array.isArray(role.permisos) || role.permisos.length === 0
                            ? "Sin permisos"
                            : truncateText(role.permisos)}
                        </span>
                        {Array.isArray(role.permisos) && role.permisos.length > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                                  <Info className="h-3.5 w-3.5" />
                                  <span className="sr-only">Ver todos los permisos</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-xl">
                                <div className="space-y-2 p-2">
                                  <h4 className="font-medium">Permisos de {role.descripcion}</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {Array.isArray(role.permisos) 
                                      ? role.permisos.map((permiso, index) => (
                                        <span
                                          key={index}
                                          className="inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium"
                                        >
                                          {permiso}
                                        </span>
                                      ))
                                      : typeof role.permisos === 'string' 
                                        ? (role.permisos as string).split(", ").map((permiso: string, index: number) => (
                                          <span
                                            key={index}
                                            className="inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium"
                                          >
                                            {permiso}
                                          </span>
                                        ))
                                        : null
                                    }
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={role.estado}
                        onCheckedChange={() => toggleRoleStatus(role.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/roles/${role.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full text-destructive"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
