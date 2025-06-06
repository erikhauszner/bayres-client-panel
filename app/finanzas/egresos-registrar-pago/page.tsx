"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CalendarIcon, DollarSign, Briefcase, Building, Tags, Trash, Loader, Bell, Clock, ReceiptText } from "lucide-react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { financeService } from "@/lib/services/financeService"
import { ExpenseCategory } from "@/lib/types/finance"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function EgresosRegistrarPagoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)) // 15 días después
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [clients, setClients] = useState<any[]>([])
  
  // Estado para notificaciones
  const [notificationType, setNotificationType] = useState("before-days")
  const [notificationConfig, setNotificationConfig] = useState({
    days: "3",
    isCustom: false
  })
  const [customNotificationDays, setCustomNotificationDays] = useState("")
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    projectId: 'none',
    clientId: 'none',
    notes: '',
  })
  
  useEffect(() => {
    loadFormData()
  }, [])
  
  const loadFormData = async () => {
    try {
      // Cargar categorías de gastos
      const categoriesData = await financeService.getExpenseCategories()
      setCategories(categoriesData)
      
      // Cargar clientes
      const clientsData = await financeService.getAllClients();
      if (clientsData && clientsData.length > 0) {
        setClients(clientsData);
      } else {
        toast({
          title: "Aviso",
          description: "No se pudieron cargar los clientes activos",
        });
      }
    } catch (error) {
      console.error("Error al cargar datos del formulario:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar todos los datos necesarios",
        variant: "destructive"
      })
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  // Calcular el total
  const calculateTotal = () => {
    return parseFloat(formData.amount.replace(/[^\d.-]/g, '')) || 0
  }
  
  // Obtener el título según tipo de gasto
  const getExpenseTypeTitle = () => {
    switch (formData.categoryId) {
      case "operational": return "Gasto Operativo";
      case "administrative": return "Gasto Administrativo";
      case "capital": return "Gasto de Capital";
      case "financial": return "Gasto Financiero";
      case "tax": return "Impuestos";
      default: return "Nuevo Egreso";
    }
  }
  
  // Obtener el ícono según tipo de gasto
  const getExpenseTypeIcon = () => {
    switch (formData.categoryId) {
      case "operational": 
        return <Briefcase className="h-5 w-5 mr-2" />;
      case "administrative": 
        return <Building className="h-5 w-5 mr-2" />;
      case "capital": 
        return <DollarSign className="h-5 w-5 mr-2" />;
      case "financial": 
        return <ReceiptText className="h-5 w-5 mr-2" />;
      case "tax": 
        return <Tags className="h-5 w-5 mr-2" />;
      default: 
        return <DollarSign className="h-5 w-5 mr-2" />;
    }
  }
  
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Validar datos requeridos
      if (!formData.description || !formData.amount || !formData.categoryId) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos requeridos",
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }
      
      // Crear objeto de gasto
      const expenseData: any = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId,
        projectId: formData.projectId === 'none' ? "default-project" : formData.projectId,
        date: new Date(),
        dueDate: dueDate,
        status: 'pending',
        createdBy: 'current-user', // Esto se reemplazará en el backend con el ID del usuario autenticado
        notes: formData.notes || undefined,
        notificationDays: notificationType === "no-notification" 
          ? 0 
          : notificationType === "before-days-custom" 
            ? parseInt(customNotificationDays || "0") 
            : parseInt(notificationConfig.days)
      }
      
      // Enviar a la API
      const result = await financeService.createExpense(expenseData)
      
      if (result) {
        toast({
          title: "Éxito",
          description: "Egreso registrado correctamente"
        })
        
        // Regresar a la página de egresos
        router.push('/finanzas?tab=expenses')
      } else {
        toast({
          title: "Error",
          description: "No se pudo registrar el egreso",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error al crear egreso:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar el egreso",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Renderizar formulario según tipo de gasto
  const renderExpenseTypeForm = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoría</Label>
          <Select 
            value={formData.categoryId} 
            onValueChange={(value) => handleSelectChange('categoryId', value)}
          >
            <SelectTrigger id="categoryId">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category._id} value={category._id || ''}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Concepto</Label>
          <Input 
            id="description" 
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Ej. Servicios hosting, alquiler, etc." 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <Input 
                id="amount" 
                name="amount"
                placeholder="0.00" 
                className="pl-7" 
                value={formData.amount}
                onChange={handleInputChange}
                type="number"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expense-due-date">Fecha de Vencimiento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Cliente (Opcional)</Label>
            <Select 
              value={formData.clientId} 
              onValueChange={(value) => handleSelectChange('clientId', value)}
            >
              <SelectTrigger id="clientId">
                <SelectValue placeholder="Asociar a un cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin cliente</SelectItem>
                {clients.length > 0 ? (
                  clients
                    .filter(client => client.status === 'active' || client.status === undefined)
                    .map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                ) : (
                  <SelectItem value="loading" disabled>Cargando clientes...</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="projectId">Proyecto (Opcional)</Label>
            <Select 
              value={formData.projectId} 
              onValueChange={(value) => handleSelectChange('projectId', value)}
            >
              <SelectTrigger id="projectId">
                <SelectValue placeholder="Asignar a un proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin proyecto</SelectItem>
                <SelectItem value="project1">Desarrollo Web</SelectItem>
                <SelectItem value="project2">Campaña de Marketing</SelectItem>
                <SelectItem value="project3">Consultoría IT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col space-y-6 p-8">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Registrar Egreso</h1>
            </div>
            
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <div>
                  <CardTitle>Registrar Egreso</CardTitle>
                  <CardDescription>
                    Registra un nuevo egreso pendiente de pago
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="border-t border-b py-6">
                  <ScrollArea className="h-auto max-h-[400px]">
                    {renderExpenseTypeForm()}
                  </ScrollArea>
                </div>
                
                {formData.amount && (
                  <div className="border-t border-b py-4">
                    <h3 className="text-sm font-medium mb-2">Resumen del Egreso</h3>
                    <div className="bg-muted/30 rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm">Monto total:</p>
                          <p className="text-sm mt-2">Fecha de vencimiento:</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${calculateTotal().toFixed(2)}
                          </p>
                          <p className="text-sm mt-2">
                            {dueDate ? format(dueDate, "PPP", { locale: es }) : "No especificada"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea 
                    id="notes" 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Notas adicionales sobre este egreso (opcional)" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notifications">Notificaciones</Label>
                  <RadioGroup 
                    defaultValue="before-days" 
                    value={notificationType}
                    onValueChange={(value) => {
                      setNotificationType(value);
                      if (value === "before-days-custom" && !customNotificationDays) {
                        setCustomNotificationDays("15");
                      }
                    }}
                    className="space-y-2"
                  >
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="before-days" id="before-days" />
                        <Label htmlFor="before-days" className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Días antes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="before-days-custom" id="before-days-custom" />
                        <Label htmlFor="before-days-custom" className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Días personalizados
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="no-notification" id="no-notification" />
                        <Label htmlFor="no-notification" className="flex items-center">
                          <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
                          Sin notificación
                        </Label>
                      </div>
                    </div>
                    
                    {notificationType === "before-days" && (
                      <div className="mt-4 rounded-md border p-4">
                        <div className="space-y-3">
                          <Label>Selecciona cuándo enviar la notificación</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <Button
                              type="button"
                              variant={notificationConfig.days === "1" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => setNotificationConfig({
                                ...notificationConfig,
                                days: "1"
                              })}
                            >
                              1 día antes
                            </Button>
                            <Button
                              type="button"
                              variant={notificationConfig.days === "3" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => setNotificationConfig({
                                ...notificationConfig,
                                days: "3"
                              })}
                            >
                              3 días antes
                            </Button>
                            <Button
                              type="button"
                              variant={notificationConfig.days === "5" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => setNotificationConfig({
                                ...notificationConfig,
                                days: "5"
                              })}
                            >
                              5 días antes
                            </Button>
                            <Button
                              type="button"
                              variant={notificationConfig.days === "7" ? "default" : "outline"}
                              className="w-full"
                              onClick={() => setNotificationConfig({
                                ...notificationConfig,
                                days: "7"
                              })}
                            >
                              7 días antes
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </RadioGroup>
                  
                  {notificationType === "before-days-custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-notification-days">Días personalizados</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="custom-notification-days"
                          type="number" 
                          min="1"
                          max="90"
                          placeholder="Número de días antes"
                          className="w-full"
                          value={customNotificationDays}
                          onChange={(e) => setCustomNotificationDays(e.target.value)}
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">días antes</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Especifica cuántos días antes del vencimiento se enviará la notificación</p>
                    </div>
                  )}
                </div>
                
                <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800/40">
                  <CalendarIcon className="h-4 w-4" />
                  <AlertTitle>Egreso Pendiente</AlertTitle>
                  <AlertDescription>
                    Este egreso quedará registrado como pendiente hasta que se confirme el pago.
                  </AlertDescription>
                </Alert>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="default" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registrando...' : 'Registrar Egreso'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 