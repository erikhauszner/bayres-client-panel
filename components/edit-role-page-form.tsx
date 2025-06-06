"use client"

import { useState, useEffect } from "react"
import { Save, Shield, Check, AlertTriangle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import RoleService from "@/lib/services/roleService"
import PermissionService, { Permission } from "@/lib/services/permissionService"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
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

interface Role {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[] | string;
  estado: boolean;
  isSystem?: boolean;
}

interface EditRoleFormProps {
  roleId: string;
}

export default function EditRoleForm({ roleId }: EditRoleFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState<Role>({
    id: roleId,
    nombre: "",
    descripcion: "",
    permisos: [],
    estado: true,
    isSystem: false
  })
  
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [permissionGroups, setPermissionGroups] = useState<{[key: string]: Permission[]}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar el rol y los permisos desde la API
  useEffect(() => {
    const loadRoleAndPermissions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Cargar el rol
        const role = await RoleService.getRoleById(roleId)
        if (!role) {
          setError('No se encontró el rol solicitado')
          toast({
            title: "Error",
            description: "No se encontró el rol solicitado",
            variant: "destructive"
          })
          return
        }

        // Mapear el rol a nuestro formato
        setFormData({
          id: role._id,
          nombre: role.name,
          descripcion: role.description,
          permisos: role.permissions.map(p => typeof p === 'string' ? p : p.name || p._id),
          estado: role.isActive,
          isSystem: role.isSystem || false
        })
        
        // Cargar los permisos
        const permissionData = await PermissionService.getPermissions()
        if (permissionData.length === 0) {
          setError('No se encontraron permisos en la base de datos')
        }
        
        setPermissions(permissionData)
        
        // Agrupar permisos por módulo
        const grouped = PermissionService.groupPermissionsByModule(permissionData)
        setPermissionGroups(grouped)
      } catch (err) {
        console.error("Error cargando rol y permisos:", err)
        setError('Error al cargar el rol y los permisos. Por favor, inténtalo de nuevo.')
        toast({
          title: "Error",
          description: "No se pudo cargar la información del rol",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
        setLoading(false)
      }
    }
    
    loadRoleAndPermissions()
  }, [roleId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permisos: checked 
        ? [...(Array.isArray(prev.permisos) ? prev.permisos : []), permissionName] 
        : Array.isArray(prev.permisos) ? prev.permisos.filter((name) => name !== permissionName) : []
    }))
  }

  const handleSelectAllInCategory = (module: string, checked: boolean) => {
    const modulePermissions = permissionGroups[module]?.map(p => p.name) || []

    setFormData((prev) => ({
      ...prev,
      permisos: checked
        ? [...new Set([...(Array.isArray(prev.permisos) ? prev.permisos : []), ...modulePermissions])]
        : Array.isArray(prev.permisos) ? prev.permisos.filter((name) => !modulePermissions.includes(name)) : []
    }))
  }

  const isModuleSelected = (module: string) => {
    if (!Array.isArray(formData.permisos)) return false;
    const modulePermissions = permissionGroups[module]?.map(p => p.name) || []
    return modulePermissions.length > 0 && 
           modulePermissions.every((p) => formData.permisos.includes(p))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Asegurarnos de que permisos siempre es un array de strings
    const permisosArray = Array.isArray(formData.permisos) 
      ? formData.permisos 
      : typeof formData.permisos === 'string' && formData.permisos.trim() !== '' 
        ? formData.permisos.split(', ').filter(Boolean)
        : [];
    
    const roleData = {
      name: formData.nombre,
      description: formData.descripcion,
      permissions: permisosArray,
      isActive: formData.estado
    };
    
    try {
      await RoleService.updateRole(roleId, roleData);
      
      toast({
        title: "Rol actualizado",
        description: `El rol ${formData.nombre} ha sido actualizado correctamente.`,
      });
      
      // Redirigir a la página de roles
      router.push('/roles');
    } catch (error: any) {
      console.error('Error al actualizar rol:', error);
      
      // Verificar si el error es una respuesta del servidor con datos adicionales
      if (error?.response?.data) {
        const serverError = error.response.data;
        
        // Si hay permisos faltantes, mostrar un mensaje más específico
        if (serverError.missingPermissions && serverError.missingPermissions.length > 0) {
          setError(`Los siguientes permisos no existen en la base de datos: ${serverError.missingPermissions.join(', ')}`);
          toast({
            title: "Error de permisos",
            description: "Algunos permisos seleccionados no existen en la base de datos. Por favor, revisa los detalles mostrados.",
            variant: "destructive"
          });
        } else {
          // Mostrar mensaje de error del servidor si está disponible
          toast({
            title: "Error",
            description: serverError.message || "No se pudo actualizar el rol. Verifica los datos e intenta de nuevo.",
            variant: "destructive"
          });
        }
      } else {
        // Mensaje de error genérico
        toast({
          title: "Error",
          description: "No se pudo actualizar el rol. Intenta de nuevo.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const success = await RoleService.deleteRole(roleId);
      
      if (success) {
        toast({
          title: "Rol eliminado",
          description: `El rol ha sido eliminado correctamente.`,
          variant: "destructive",
        });
        
        // Redirigir a la página de roles
        router.push('/roles');
      } else {
        throw new Error("No se pudo eliminar el rol");
      }
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el rol. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  // Obtener lista de módulos únicos
  const modules = Object.keys(permissionGroups).sort()

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex h-40 items-center justify-center">
          <p>Cargando información del rol...</p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-6 md:col-span-1">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Shield className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Información del Rol</h3>
                </div>
                <Separator className="bg-border/10" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del rol *</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="netflix-input"
                      placeholder="ej. editor"
                      disabled={formData.isSystem}
                    />
                    <p className="text-xs text-muted-foreground">
                      Identificador único para el rol (sin espacios ni caracteres especiales)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción *</Label>
                    <Textarea
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      required
                      className="netflix-input min-h-[100px]"
                      placeholder="ej. Editor de contenido"
                    />
                    <p className="text-xs text-muted-foreground">
                      Descripción clara del propósito y alcance de este rol
                    </p>
                  </div>
                  {formData.isSystem && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        Este es un rol del sistema. Algunas propiedades no pueden ser modificadas.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-md bg-muted/20 p-4">
                <h4 className="mb-2 font-medium">Resumen de permisos</h4>
                <p className="text-sm text-muted-foreground">
                  {!Array.isArray(formData.permisos) || formData.permisos.length === 0
                    ? "No se han seleccionado permisos"
                    : `${formData.permisos.length} permisos seleccionados`}
                </p>
                {Array.isArray(formData.permisos) && formData.permisos.length > 0 && (
                  <div className="mt-3 flex max-h-[200px] flex-wrap gap-1 overflow-y-auto">
                    {formData.permisos.map((permiso) => (
                      <span
                        key={permiso}
                        className="inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {permiso}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Check className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Permisos</h3>
                </div>
                <Separator className="bg-border/10" />

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {loading ? (
                  <div className="flex h-40 items-center justify-center">
                    <p>Cargando permisos...</p>
                  </div>
                ) : modules.length > 0 ? (
                  <div className="relative">
                    <Tabs defaultValue={modules[0]} className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 md:order-2 md:border-l md:pl-4">
                        <div className="sticky top-0">
                          <h4 className="mb-3 font-medium">Categorías de permisos</h4>
                          <TabsList className="flex flex-col space-y-1 h-auto bg-transparent">
                            {modules.map((module) => (
                              <TabsTrigger
                                key={module}
                                value={module}
                                className="justify-start rounded-md border border-border/20 bg-card/50 px-3 py-2 text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                              >
                                {module.charAt(0).toUpperCase() + module.slice(1)}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-2/3 md:order-1 md:pr-4">
                        {modules.map((module) => (
                          <TabsContent key={module} value={module} className="max-h-[800px] overflow-y-auto">
                            <div className="space-y-6">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`select-all-${module}`}
                                  checked={isModuleSelected(module)}
                                  onCheckedChange={(checked) =>
                                    handleSelectAllInCategory(module, checked === true)
                                  }
                                />
                                <label
                                  htmlFor={`select-all-${module}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Seleccionar todos
                                </label>
                              </div>

                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {permissionGroups[module]?.map((permission) => (
                                  <div
                                    key={permission._id}
                                    className="flex items-start space-x-2 rounded-md border border-border/20 bg-card/50 p-3"
                                  >
                                    <Checkbox
                                      id={permission.name}
                                      checked={Array.isArray(formData.permisos) ? formData.permisos.includes(permission.name) : false}
                                      onCheckedChange={(checked) =>
                                        handlePermissionChange(permission.name, checked === true)
                                      }
                                    />
                                    <div className="grid gap-1.5">
                                      <label
                                        htmlFor={permission.name}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        {permission.description || permission.name}
                                      </label>
                                      <p className="text-xs text-muted-foreground">
                                        {permission.name}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                        ))}
                      </div>
                    </Tabs>
                  </div>
                ) : (
                  <div className="rounded-md border border-border/20 bg-card/50 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No hay permisos disponibles. Por favor, contacta con el administrador.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            {!formData.isSystem && (
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Rol
                </Button>
              </AlertDialogTrigger>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/roles')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-1 bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el rol '{formData.nombre}' y no puede ser deshecha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 