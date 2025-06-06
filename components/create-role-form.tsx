"use client"

import { useState, useEffect } from "react"
import { Save, Check, AlertTriangle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import RoleService from "@/lib/services/roleService"
import PermissionService, { Permission } from "@/lib/services/permissionService"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"

export default function CreateRoleForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    permisos: [] as string[],
  })
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [permissionGroups, setPermissionGroups] = useState<{[key: string]: Permission[]}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPermissions()
  }, [])

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
        ? [...prev.permisos, permissionName] 
        : prev.permisos.filter((name) => name !== permissionName),
    }))
  }

  const handleSelectAllInCategory = (module: string, checked: boolean) => {
    const modulePermissions = permissionGroups[module]?.map(p => p.name) || []

    setFormData((prev) => ({
      ...prev,
      permisos: checked
        ? [...new Set([...prev.permisos, ...modulePermissions])]
        : prev.permisos.filter((name) => !modulePermissions.includes(name)),
    }))
  }

  const isModuleSelected = (module: string) => {
    const modulePermissions = permissionGroups[module]?.map(p => p.name) || []
    return modulePermissions.length > 0 && 
           modulePermissions.every((p) => formData.permisos.includes(p))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const roleData = {
        name: formData.nombre,
        description: formData.descripcion,
        permissions: formData.permisos,
      }
      
      await RoleService.createRole(roleData)
      
      toast({
        title: "Rol creado",
        description: `El rol ${formData.nombre} ha sido creado correctamente.`,
      })
      
      // Redireccionar a la página de roles
      router.push('/roles')
      
    } catch (error: any) {
      console.error('Error al crear rol:', error)
      
      // Verificar si el error es una respuesta del servidor con datos adicionales
      if (error?.response?.data) {
        const serverError = error.response.data;
        
        // Si hay permisos faltantes, mostrar un mensaje más específico
        if (serverError.missingPermissions && serverError.missingPermissions.length > 0) {
          setError(`Los siguientes permisos no existen en la base de datos: ${serverError.missingPermissions.join(', ')}`)
          toast({
            title: "Error de permisos",
            description: "Algunos permisos seleccionados no existen en la base de datos. Por favor, revisa los detalles mostrados.",
            variant: "destructive"
          })
        } else {
          // Mostrar mensaje de error del servidor si está disponible
          toast({
            title: "Error",
            description: serverError.message || "No se pudo crear el rol. Verifica los datos e intenta de nuevo.",
            variant: "destructive"
          })
        }
      } else {
        // Mensaje de error genérico
        toast({
          title: "Error",
          description: "No se pudo crear el rol. Intenta de nuevo.",
          variant: "destructive"
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Obtener lista de módulos únicos
  const modules = Object.keys(permissionGroups).sort()

  return (
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
              </div>
            </div>

            <div className="rounded-md bg-muted/20 p-4">
              <h4 className="mb-2 font-medium">Resumen de permisos</h4>
              <p className="text-sm text-muted-foreground">
                {formData.permisos.length === 0
                  ? "No se han seleccionado permisos"
                  : `${formData.permisos.length} permisos seleccionados`}
              </p>
              {formData.permisos.length > 0 && (
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
                                    checked={formData.permisos.includes(permission.name)}
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

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/roles')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || formData.permisos.length === 0}
            className="gap-1 bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            Guardar Rol
          </Button>
        </div>
      </form>
    </Card>
  )
} 