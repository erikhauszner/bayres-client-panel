"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, X, Shield, Check, Trash2, Edit, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import PermissionService, { Permission } from "@/lib/services/permissionService"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Role {
  id: number | string;
  nombre: string;
  descripcion: string;
  permisos: string[] | string;
  estado: boolean;
  color?: string;
  isSystem?: boolean;
}

interface EditRoleFormProps {
  role: Role;
  onUpdate: (updatedRole: Role) => void;
  onDelete: (id: number | string) => void;
}

export default function EditRoleForm({ role, onUpdate, onDelete }: EditRoleFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<Role>({
    id: role.id,
    nombre: role.nombre,
    descripcion: role.descripcion,
    permisos: Array.isArray(role.permisos) ? role.permisos : [],
    estado: role.estado,
    isSystem: role.isSystem || false
  })

  const [permissions, setPermissions] = useState<Permission[]>([])
  const [permissionGroups, setPermissionGroups] = useState<{[key: string]: Permission[]}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Convertir los permisos de string a array si vienen como string
  useEffect(() => {
    if (typeof role.permisos === 'string') {
      const permissionsArray = role.permisos.split(', ').filter((p: string) => p !== "Sin permisos");
      setFormData(prev => ({
        ...prev,
        permisos: permissionsArray
      }));
    }
  }, [role.permisos]);

  // Cargar los permisos desde la API cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      loadPermissions()
    }
  }, [isOpen])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      setError(null)
      const permissionData = await PermissionService.getPermissions()
      
      if (permissionData.length === 0) {
        setError('No se encontraron permisos en la base de datos')
      }
      
      setPermissions(permissionData)
      
      // Agrupar permisos por módulo
      const grouped = PermissionService.groupPermissionsByModule(permissionData)
      setPermissionGroups(grouped)
    } catch (err) {
      console.error("Error cargando permisos:", err)
      setError('Error al cargar los permisos. Por favor, inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

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
    // Asegurarnos de que permisos siempre es un array de strings
    const permisosArray = Array.isArray(formData.permisos) 
      ? formData.permisos 
      : typeof formData.permisos === 'string' && formData.permisos.trim() !== '' 
        ? formData.permisos.split(', ').filter(Boolean)
        : [];
    
    const updatedRole = {
      ...formData,
      permisos: permisosArray
    };
    
    try {
      await onUpdate(updatedRole);
      setIsOpen(false);
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
    }
  }

  const handleDelete = () => {
    onDelete(role.id);
    setIsDeleteDialogOpen(false);
    setIsOpen(false);
    toast({
      title: "Rol eliminado",
      description: `El rol ${role.nombre} ha sido eliminado correctamente.`,
      variant: "destructive",
    });
  }

  // Obtener lista de módulos únicos
  const modules = Object.keys(permissionGroups).sort()

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="netflix-scrollbar max-h-[90vh] max-w-8xl overflow-y-auto bg-gradient-to-b from-background to-background/95 p-0 backdrop-blur-md">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/10 bg-background/80 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Volver</span>
                </Button>
              </DialogClose>
              <DialogTitle className="text-xl font-bold">Editar Rol</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {!formData.isSystem && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Eliminar</span>
                </Button>
              )}
              <DialogClose asChild>
              </DialogClose>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
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
                    <Tabs defaultValue={modules[0]} className="w-full">
                      {/* Dividir los módulos en tres filas */}
                      <div className="space-y-2">
                        {/* Primera fila de pestañas */}
                        <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {modules.slice(0, Math.ceil(modules.length / 3)).map((module) => (
                            <TabsTrigger
                              key={module}
                              value={module}
                              className="px-4 py-2"
                            >
                              {module.charAt(0).toUpperCase() + module.slice(1)}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {/* Segunda fila de pestañas */}
                        <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {modules.slice(Math.ceil(modules.length / 3), Math.ceil(modules.length * 2 / 3)).map((module) => (
                            <TabsTrigger
                              key={module}
                              value={module}
                              className="px-4 py-2"
                            >
                              {module.charAt(0).toUpperCase() + module.slice(1)}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {/* Tercera fila de pestañas */}
                        <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {modules.slice(Math.ceil(modules.length * 2 / 3)).map((module) => (
                            <TabsTrigger
                              key={module}
                              value={module}
                              className="px-4 py-2"
                            >
                              {module.charAt(0).toUpperCase() + module.slice(1)}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>

                      {modules.map((module) => (
                        <TabsContent
                          key={module}
                          value={module}
                          className="max-h-[400px] overflow-y-auto pt-4"
                        >
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

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
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
                    </Tabs>
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

            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-primary text-primary-foreground">
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 