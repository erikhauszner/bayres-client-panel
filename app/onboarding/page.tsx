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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { CalendarIcon, Linkedin, Facebook, Instagram, Twitter, Globe } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import EmployeeService from "@/lib/services/employeeService"

const onboardingSchema = z.object({
  // Información personal
  birthDate: z.date().optional(),
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
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  
  // Contacto adicional
  phone: z.string().optional(),
})

type OnboardingFormValues = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const router = useRouter()
  const { employee, getCurrentEmployee } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      // Información personal
      birthDate: undefined,
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
      
      // Contacto adicional
      phone: "",
    },
  })
  
  // Redirigir si el usuario ya tiene completado su perfil
  useEffect(() => {
    console.log('Onboarding - Datos de empleado:', employee);
    console.log('Onboarding - Campo phone:', employee?.phone);
    
    // Verificar que el campo phone existe y no está vacío
    if (employee && employee.phone && employee.phone.trim() !== '') {
      console.log('Redirigiendo al dashboard - usuario ya tiene teléfono');
      router.push('/dashboard');
    }
  }, [employee, router])
  
  const onSubmit = async (data: OnboardingFormValues) => {
    if (!employee?._id) {
      toast({
        title: "Error",
        description: "No se pudo identificar al usuario",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      console.log('Datos a enviar en onboarding:', data);
      
      // Asegurarse de que el teléfono no sea un string vacío
      const phoneValue = data.phone?.trim() === '' ? undefined : data.phone?.trim();
      console.log('Valor de teléfono a guardar:', phoneValue);
      
      // Formatear la fecha de nacimiento si existe
      const formattedData = {
        ...data,
        phone: phoneValue,
        birthDate: data.birthDate ? format(data.birthDate, 'yyyy-MM-dd') : undefined,
      }
      
      console.log('Datos formateados para enviar:', formattedData);
      
      // Usar el nuevo método para actualizar el perfil propio
      const response = await EmployeeService.updateMyProfile(formattedData)
      console.log('Respuesta de actualización:', response);
      
      // Actualizar el empleado en el contexto
      await getCurrentEmployee()
      
      toast({
        title: "Perfil completado",
        description: "La información de tu perfil se ha guardado correctamente",
      })
      
      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la información del perfil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!employee) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Cargando información del usuario...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Completa tu perfil</CardTitle>
              <CardDescription>
                Hola {employee.firstName}! Por favor completa la siguiente información para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Información Personal</h3>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+54 9 11 1234-5678" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Fecha de nacimiento</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: es })
                                    ) : (
                                      <span>Selecciona una fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                  locale={es}
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
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un género" />
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
                      
                      <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de documento</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona el tipo" />
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
                              <Input {...field} placeholder="Ej. 12345678" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <h3 className="text-lg font-medium mt-6">Dirección</h3>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dirección</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Calle y número" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ciudad</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej. Buenos Aires" />
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
                              <Input {...field} placeholder="Ej. CABA" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>País</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej. Argentina" />
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
                              <Input {...field} placeholder="Ej. 1425" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <h3 className="text-lg font-medium mt-6">Redes Sociales</h3>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Linkedin className="h-4 w-4" /> LinkedIn
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Usuario o URL de LinkedIn" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Twitter className="h-4 w-4" /> Twitter
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Usuario o URL de Twitter" />
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
                            <FormLabel className="flex items-center gap-2">
                              <Instagram className="h-4 w-4" /> Instagram
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Usuario o URL de Instagram" />
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
                            <FormLabel className="flex items-center gap-2">
                              <Facebook className="h-4 w-4" /> Facebook
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Usuario o URL de Facebook" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Guardando..." : "Completar perfil"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 