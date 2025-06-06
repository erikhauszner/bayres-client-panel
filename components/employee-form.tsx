"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import EmployeeService from "@/lib/services/employeeService"
import RoleService, { Role } from "@/lib/services/roleService"
import { Employee, EmployeeCreateData } from "@/lib/types/employee"
import { toast } from "@/components/ui/use-toast"
import { CalendarIcon, Linkedin, Facebook, Instagram, Twitter, Globe } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const employeeFormSchema = z.object({
  // Información básica
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  role: z.string().min(1, "Debe seleccionar un rol"),
  department: z.enum(["ventas", "desarrollo", "diseño", "marketing", "soporte", "administración"]),
  position: z.string().min(2, "El cargo debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
  
  // Información personal
  birthDate: z.string().optional(),
  gender: z.enum(["masculino", "femenino", "otro", "prefiero_no_decir"]).optional(),
  documentId: z.string().optional(),
  documentType: z.enum(["dni", "pasaporte", "cuit", "cuil", "otro"]).optional(),
  
  // Información geográfica
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  
  // Redes sociales
  linkedin: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  twitter: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  facebook: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  instagram: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  website: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
})

type EmployeeFormValues = z.infer<typeof employeeFormSchema>

interface EmployeeFormProps {
  employeeId?: string;
  isEdit?: boolean;
}

export default function EmployeeForm({ employeeId, isEdit = false }: EmployeeFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [currentTab, setCurrentTab] = useState("basic")
  const [roles, setRoles] = useState<Role[]>([])

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      // Información básica
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "",
      department: "administración",
      position: "",
      phone: "",
      isActive: true,
      
      // Información personal
      birthDate: "",
      gender: undefined,
      documentId: "",
      documentType: undefined,
      
      // Información geográfica
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      
      // Redes sociales
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
      website: "",
    },
  })

  useEffect(() => {
    const fetchEmployee = async () => {
      if (isEdit && employeeId) {
        try {
          const data = await EmployeeService.getEmployee(employeeId)
          setEmployee(data)
          
          form.reset({
            // Información básica
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role, // El servidor debe enviar el ID correcto
            department: data.department as "ventas" | "desarrollo" | "diseño" | "marketing" | "soporte" | "administración",
            position: data.position || "",
            phone: data.phone || "",
            isActive: data.isActive,
            
            // Información personal
            birthDate: data.birthDate || "",
            gender: data.gender as any,
            documentId: data.documentId || "",
            documentType: data.documentType as any,
            
            // Información geográfica
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            country: data.country || "",
            postalCode: data.postalCode || "",
            
            // Redes sociales
            linkedin: data.linkedin || "",
            twitter: data.twitter || "",
            facebook: data.facebook || "",
            instagram: data.instagram || "",
            website: data.website || "",
          })
        } catch (error) {
          console.error("Error al cargar el empleado:", error)
          toast({
            title: "Error",
            description: "No se pudo cargar el empleado",
            variant: "destructive",
          })
          router.push("/empleados")
        }
      }
    }

    fetchEmployee()
  }, [isEdit, employeeId, form, router])

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await RoleService.getActiveRoles()
        setRoles(data)
      } catch (error) {
        console.error("Error al cargar los roles:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar los roles",
          variant: "destructive",
        })
      }
    }

    fetchRoles()
  }, [])

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      setIsLoading(true)
      if (isEdit && employeeId) {
        await EmployeeService.updateEmployee(employeeId, data)
        toast({
          title: "Empleado actualizado",
          description: "El empleado ha sido actualizado exitosamente",
        })
      } else {
        const employeeData: EmployeeCreateData = {
          ...data,
          password: data.password || '' // Aseguramos que password no sea undefined
        }
        await EmployeeService.createEmployee(employeeData)
        toast({
          title: "Empleado creado",
          description: "El empleado ha sido creado exitosamente",
        })
      }
      router.push("/empleados")
    } catch (error: any) {
      console.error("Error al guardar el empleado:", error)
      
      // Extraer mensaje de error detallado si está disponible
      let errorMessage = "No se pudo guardar el empleado";
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Si hay un mensaje específico, usarlo
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Si hay errores de validación, mostrarlos
        if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          errorMessage = `Errores de validación: ${validationErrors}`;
          
          // También marcar los campos con error en el formulario
          Object.keys(errorData.errors).forEach(field => {
            if (form.getFieldState(field as any)) {
              form.setError(field as any, { 
                type: 'server', 
                message: errorData.errors[field] as string 
              });
            }
          });
        }
        
        // Si es un error de campo único, mostrar el campo específico
        if (errorData.field) {
          errorMessage = `Error: ${errorData.message}`;
          
          // Marcar el campo con error
          if (form.getFieldState(errorData.field as any)) {
            form.setError(errorData.field as any, { 
              type: 'server', 
              message: errorData.message 
            });
          }
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Editar Empleado" : "Nuevo Empleado"}
        </h1>
        <p className="text-muted-foreground">
          {isEdit
            ? "Actualiza la información del empleado"
            : "Completa el formulario para crear un nuevo empleado"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Empleado</CardTitle>
          <CardDescription>
            Ingresa los datos del empleado. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="location">Ubicación</TabsTrigger>
                  <TabsTrigger value="social">Redes Sociales</TabsTrigger>
                </TabsList>
                
                {/* Información básica */}
                <TabsContent value="basic" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido *</FormLabel>
                      <FormControl>
                        <Input placeholder="Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="juan@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEdit && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role._id} value={role._id}>
                              {role.name} - {role.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ventas">Ventas</SelectItem>
                          <SelectItem value="desarrollo">Desarrollo</SelectItem>
                          <SelectItem value="diseño">Diseño</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="soporte">Soporte</SelectItem>
                          <SelectItem value="administración">Administración</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Desarrollador Frontend" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormDescription>
                      Opcional: Ingresa el número de teléfono con código de país
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

                </TabsContent>
                
                {/* Información personal */}
                <TabsContent value="personal" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de nacimiento</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "PPP", { locale: es })
                                  ) : (
                                    <span>Seleccionar fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Género</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar género" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="femenino">Femenino</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                              <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de documento</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dni">DNI</SelectItem>
                              <SelectItem value="pasaporte">Pasaporte</SelectItem>
                              <SelectItem value="cuit">CUIT</SelectItem>
                              <SelectItem value="cuil">CUIL</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="documentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de documento</FormLabel>
                          <FormControl>
                            <Input placeholder="12345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                {/* Información geográfica */}
                <TabsContent value="location" className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input placeholder="Calle y número" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input placeholder="Ciudad" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provincia/Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="Provincia o Estado" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <FormControl>
                            <Input placeholder="País" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Postal</FormLabel>
                          <FormControl>
                            <Input placeholder="Código Postal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                {/* Redes sociales */}
                <TabsContent value="social" className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Linkedin className="h-5 w-5 text-[#0077b5]" />
                            <Input placeholder="https://linkedin.com/in/usuario" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          URL completo de tu perfil de LinkedIn
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter / X</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                            <Input placeholder="https://twitter.com/usuario" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Facebook className="h-5 w-5 text-[#1877F2]" />
                            <Input placeholder="https://facebook.com/usuario" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Instagram className="h-5 w-5 text-[#E4405F]" />
                            <Input placeholder="https://instagram.com/usuario" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sitio Web</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Globe className="h-5 w-5 text-gray-500" />
                            <Input placeholder="https://tudominio.com" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
              
              {/* Sistema de navegación entre pestañas */}
              <div className="flex justify-between pt-6 border-t border-border/40 mt-6">
                {currentTab !== "basic" && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      if (currentTab === "personal") setCurrentTab("basic");
                      else if (currentTab === "location") setCurrentTab("personal");
                      else if (currentTab === "social") setCurrentTab("location");
                    }}
                  >
                    Anterior
                  </Button>
                )}
                {currentTab === "basic" && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => router.push("/empleados")}
                  >
                    Cancelar
                  </Button>
                )}
                
                <div className="flex space-x-2">
                  {currentTab !== "basic" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/empleados")}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                  )}
                  
                  {currentTab !== "social" ? (
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault(); // Prevenir cualquier envío del formulario
                        if (currentTab === "basic") setCurrentTab("personal");
                        else if (currentTab === "personal") setCurrentTab("location");
                        else if (currentTab === "location") setCurrentTab("social");
                      }}
                    >
                      Siguiente
                    </Button>
                  ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
                </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 