"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CalendarIcon, DollarSign, Repeat, AlertCircle, Info, Tag, UserCircle, Building2, Clock, Plus, Trash2, Percent, Loader, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Switch } from "@/components/ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { financeService } from "@/lib/services/financeService"
import { useToast } from "@/components/ui/use-toast"
import { TransactionCategory } from "@/lib/types/finance"

// Datos de ejemplo para el formulario (se usarán solo si falla la carga de datos reales)
const CLIENTS = [
  { id: "CLI001", name: "ABC Solutions", email: "pagos@abcsolutions.com" },
  { id: "CLI002", name: "Corporación XYZ", email: "finanzas@corporacionxyz.com" },
  { id: "CLI003", name: "Tech Avanzada", email: "admin@techavanzada.com" },
  { id: "CLI004", name: "Servicios Integrados", email: "contabilidad@serviciosintegrados.com" },
  { id: "CLI005", name: "Distribuidora Norte", email: "pagos@distribuidoranorte.com" },
]

const SERVICES = [
  { id: "SERV001", name: "Desarrollo web", description: "Desarrollo y mantenimiento de sitio web" },
  { id: "SERV002", name: "SEO", description: "Optimización para motores de búsqueda" },
  { id: "SERV003", name: "Consultoría", description: "Asesoría y consultoría empresarial" },
  { id: "SERV004", name: "Hosting", description: "Servicio de alojamiento web" },
  { id: "SERV005", name: "Licencia software", description: "Licencia de uso de software" },
]

export default function NuevoIngresoRecurrentePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [categories, setCategories] = useState<TransactionCategory[]>([])
  
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [activeTab, setActiveTab] = useState("basic")
  const [showPreview, setShowPreview] = useState(false)
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }])
  const [applyTax, setApplyTax] = useState(false)
  const [taxPercentage, setTaxPercentage] = useState(16)

  // Estados para formulario
  const [formData, setFormData] = useState({
    concept: "",
    amount: "",
    frequency: "monthly",
    customFrequency: {
      value: "1",
      unit: "months"
    },
    startDate: new Date() as Date | null,
    endDate: null as Date | null,
    hasEndDate: false,
    notificationType: "before-days",
    notificationConfig: {
      days: "3",
      isCustom: false
    },
    autoInvoice: true,
    notes: "",
    customNotificationDays: ""
  })

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar clientes
        const clientsData = await financeService.getAllClients();
        
        if (clientsData && clientsData.length > 0) {
          setClients(clientsData);
        } else {
          // Si no hay datos, mostrar un mensaje y usar los datos de ejemplo
          toast({
            title: "Aviso",
            description: "No se pudieron cargar clientes reales. Usando datos de demostración.",
          });
          setClients(CLIENTS);
        }
        
        // Cargar categorías de transacciones de tipo 'income'
        const transactionCategoriesData = await financeService.getTransactionCategories();
        const incomeCategoriesData = transactionCategoriesData.filter(cat => cat.type === 'income');
        console.log('Categorías de ingresos cargadas (recurrente):', incomeCategoriesData);
        setCategories(incomeCategoriesData);
        
        // Si no hay categorías cargadas, mostrar un mensaje
        if (incomeCategoriesData.length === 0) {
          toast({
            title: "Aviso",
            description: "No se encontraron categorías de ingresos. Puedes crearlas en Configuración > Categorías.",
          });
        }
        
      } catch (error) {
        console.error("Error al cargar datos:", error);
        // En caso de error, mostrar mensaje y usar los datos de ejemplo
        toast({
          title: "Error",
          description: "Error al cargar los datos. Usando datos de demostración.",
          variant: "destructive"
        });
        setClients(CLIENTS);
      }
    };
    
    loadData();
  }, [toast]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      // Si estamos cambiando el tipo de notificación a "before-days-custom" y no hay valor para customNotificationDays
      if (field === 'notificationType' && value === 'before-days-custom' && !prev.customNotificationDays) {
        return {
          ...prev,
          [field]: value,
          customNotificationDays: "15" // Valor predeterminado
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }])
    calculateAmountFromItems()
  }
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
    calculateAmountFromItems()
  }
  
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
    calculateAmountFromItems()
  }
  
  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.price), 0)
  }
  
  const calculateTax = () => {
    return applyTax ? calculateSubtotal() * (taxPercentage / 100) : 0
  }
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const calculateAmountFromItems = () => {
    const total = calculateTotal()
    handleInputChange("amount", total.toFixed(2))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    if (!selectedClient) {
      toast({
        title: "Error",
        description: "Debes seleccionar un cliente",
        variant: "destructive"
      })
      return
    }
    
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Debes seleccionar una categoría",
        variant: "destructive"
      })
      return
    }
    
    if (!formData.concept) {
      toast({
        title: "Error",
        description: "Debes ingresar un concepto para el plan recurrente",
        variant: "destructive"
      })
      return
    }
    
    if (items.length === 0 || items.some(item => !item.description || item.quantity <= 0 || item.price <= 0)) {
      toast({
        title: "Error",
        description: "Debes agregar al menos un concepto con descripción, cantidad y precio válidos",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      // Crear el plan recurrente
      const planData: any = {
        clientId: selectedClient,
        clientName: clients.find(c => c.id === selectedClient)?.name || '',
        categoryId: selectedCategory,
        concept: formData.concept,
        amount: parseFloat(formData.amount) || calculateTotal(),
        frequency: formData.frequency,
        customFrequency: formData.frequency === 'custom' ? formData.customFrequency : undefined,
        startDate: formData.startDate,
        endDate: formData.hasEndDate ? formData.endDate : null,
        notificationDays: formData.notificationType === "no-notification" 
          ? 0 
          : formData.notificationType === "before-days-custom" 
            ? parseInt(formData.customNotificationDays || "0") 
            : parseInt(formData.notificationConfig.days),
        autoInvoice: formData.autoInvoice,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.price,
          amount: item.quantity * item.price
        })),
        notes: formData.notes
      }
      
      // Llamar al servicio para crear el plan recurrente
      const result = await financeService.createRecurringPlan(planData)
      
      if (result) {
        setShowPreview(true)
        
        // Mostrar notificación de éxito
        toast({
          title: "Plan recurrente creado",
          description: "El plan de facturación recurrente ha sido creado exitosamente",
        })
        
        // Opcional: redirigir después de un tiempo
        setTimeout(() => {
          router.push('/finanzas')
        }, 3000)
      } else {
        throw new Error("No se pudo crear el plan recurrente")
      }
    } catch (error) {
      console.error("Error al crear plan recurrente:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el plan recurrente",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getNextPaymentDates = () => {
    if (!formData.startDate) return []
    
    // Simulación de fechas futuras basadas en la frecuencia seleccionada
    const dates = []
    let baseDate = new Date(formData.startDate)
    
    for (let i = 0; i < 5; i++) {
      const nextDate = new Date(baseDate)
      
      if (formData.frequency === "weekly") {
        nextDate.setDate(nextDate.getDate() + (7 * i))
      } else if (formData.frequency === "monthly") {
        nextDate.setMonth(nextDate.getMonth() + i)
      } else if (formData.frequency === "quarterly") {
        nextDate.setMonth(nextDate.getMonth() + (3 * i))
      } else if (formData.frequency === "yearly") {
        nextDate.setFullYear(nextDate.getFullYear() + i)
      } else if (formData.frequency === "custom") {
        const value = parseInt(formData.customFrequency.value)
        if (formData.customFrequency.unit === "days") {
          nextDate.setDate(nextDate.getDate() + (value * i))
        } else if (formData.customFrequency.unit === "weeks") {
          nextDate.setDate(nextDate.getDate() + (value * 7 * i))
        } else if (formData.customFrequency.unit === "months") {
          nextDate.setMonth(nextDate.getMonth() + (value * i))
        }
      }
      
      if (i > 0) { // Solo agregamos fechas futuras, no la inicial
        dates.push(format(nextDate, "dd/MM/yyyy"))
      }
    }
    
    return dates
  }
  
  // Obtener el cliente seleccionado
  const client = clients.find(c => c.id === selectedClient)
  
  // Formatear la frecuencia para mostrar
  const getFrequencyText = () => {
    switch(formData.frequency) {
      case "weekly": return "Semanal";
      case "monthly": return "Mensual";
      case "quarterly": return "Trimestral";
      case "yearly": return "Anual";
      case "custom": 
        const unit = formData.customFrequency.unit === "days" ? "días" : 
                    formData.customFrequency.unit === "weeks" ? "semanas" : "meses";
        return `Cada ${formData.customFrequency.value} ${unit}`;
      default: return "Mensual";
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Nuevo Plan de Ingreso Recurrente</h1>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-7">
            <div className="md:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle>Configurar Plan Recurrente</CardTitle>
                  <CardDescription>
                    Crea un plan para facturar periódicamente a tus clientes de forma automática
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Información Básica</TabsTrigger>
                      <TabsTrigger value="schedule">Programación</TabsTrigger>
                      <TabsTrigger value="additional">Opciones Adicionales</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="client">Cliente</Label>
                          <Select 
                            value={selectedClient} 
                            onValueChange={setSelectedClient}
                          >
                            <SelectTrigger id="client" className="w-full">
                              <SelectValue placeholder="Seleccionar cliente" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.length === 0 ? (
                                <SelectItem value="loading" disabled>Cargando clientes...</SelectItem>
                              ) : (
                                clients
                                  .filter(client => client.status === 'active' && client.name && client.name.trim() !== '')
                                  .map(client => (
                                    <SelectItem key={client.id} value={client.id}>
                                      {client.name}
                                    </SelectItem>
                                  ))
                              )}
                              {clients.length > 0 && clients.filter(client => client.status === 'active' && client.name && client.name.trim() !== '').length === 0 && (
                                <SelectItem value="no-clients" disabled>No hay clientes disponibles</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="income-category">Categoría</Label>
                          <Select 
                            value={selectedCategory} 
                            onValueChange={setSelectedCategory}
                          >
                            <SelectTrigger id="income-category" className="w-full">
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.length === 0 ? (
                                <SelectItem value="loading" disabled>Cargando categorías...</SelectItem>
                              ) : (
                                categories.map(category => (
                                  <SelectItem key={category._id} value={category._id || ''}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-4 mt-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Conceptos</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                              <Plus className="h-4 w-4 mr-1" /> Agregar Concepto
                            </Button>
                          </div>
                          
                          {/* Items/conceptos */}
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[50%]">Descripción</TableHead>
                                  <TableHead>Cantidad</TableHead>
                                  <TableHead>Precio</TableHead>
                                  <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {items.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Input 
                                        placeholder="Descripción del servicio o producto" 
                                        value={item.description}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input 
                                        type="number" 
                                        placeholder="Cantidad" 
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                        min={1}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                        <Input 
                                          className="pl-7" 
                                          placeholder="Precio" 
                                          value={item.price || ''}
                                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {index > 0 && (
                                        <Button 
                                          type="button" 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => removeItem(index)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          
                          {/* Totales */}
                          <div className="border-t pt-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Label htmlFor="apply-tax">Aplicar IVA</Label>
                                <Switch 
                                  id="apply-tax" 
                                  checked={applyTax}
                                  onCheckedChange={setApplyTax}
                                />
                              </div>
                              
                              {applyTax && (
                                <div className="flex items-center gap-2">
                                  <Label htmlFor="tax-percentage" className="whitespace-nowrap">Porcentaje IVA:</Label>
                                  <div className="relative w-24">
                                    <Input 
                                      id="tax-percentage"
                                      type="number" 
                                      min={0}
                                      max={100}
                                      value={taxPercentage}
                                      onChange={(e) => setTaxPercentage(Number(e.target.value))}
                                      className="pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                      <Percent className="h-4 w-4 text-muted-foreground" />
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>${calculateSubtotal().toFixed(2)}</span>
                            </div>
                            
                            {applyTax && (
                              <div className="flex justify-between">
                                <span>IVA ({taxPercentage}%):</span>
                                <span>${calculateTax().toFixed(2)}</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between text-lg font-semibold">
                              <span>Total:</span>
                              <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="concept-general">Concepto General</Label>
                          <Input 
                            id="concept-general" 
                            placeholder="Título o descripción general del ingreso" 
                            value={formData.concept}
                            onChange={(e) => handleInputChange("concept", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => setActiveTab("schedule")}
                          disabled={isLoading}
                        >
                          Continuar
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="schedule" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Frecuencia de facturación</Label>
                          <RadioGroup 
                            defaultValue="monthly" 
                            value={formData.frequency}
                            onValueChange={(value) => handleInputChange("frequency", value)}
                            className="space-y-2"
                          >
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                              <div className="flex items-center space-x-2 rounded-md border p-3">
                                <RadioGroupItem value="weekly" id="weekly" />
                                <Label htmlFor="weekly" className="flex items-center">
                                  <Repeat className="mr-2 h-4 w-4" />
                                  Semanal
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 rounded-md border p-3">
                                <RadioGroupItem value="monthly" id="monthly" />
                                <Label htmlFor="monthly" className="flex items-center">
                                  <Repeat className="mr-2 h-4 w-4" />
                                  Mensual
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 rounded-md border p-3">
                                <RadioGroupItem value="quarterly" id="quarterly" />
                                <Label htmlFor="quarterly" className="flex items-center">
                                  <Repeat className="mr-2 h-4 w-4" />
                                  Trimestral
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 rounded-md border p-3">
                                <RadioGroupItem value="yearly" id="yearly" />
                                <Label htmlFor="yearly" className="flex items-center">
                                  <Repeat className="mr-2 h-4 w-4" />
                                  Anual
                                </Label>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                              <RadioGroupItem value="custom" id="custom" />
                              <Label htmlFor="custom" className="flex items-center">
                                <Repeat className="mr-2 h-4 w-4" />
                                Personalizada:
                              </Label>
                              <div className="flex flex-1 items-center space-x-2 ml-2">
                                <span>Cada</span>
                                <Input 
                                  className="w-16" 
                                  value={formData.customFrequency.value}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    customFrequency: {
                                      ...prev.customFrequency,
                                      value: e.target.value
                                    }
                                  }))}
                                  disabled={formData.frequency !== "custom"}
                                />
                                <Select 
                                  value={formData.customFrequency.unit}
                                  onValueChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    customFrequency: {
                                      ...prev.customFrequency,
                                      unit: value
                                    }
                                  }))}
                                  disabled={formData.frequency !== "custom"}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="days">Días</SelectItem>
                                    <SelectItem value="weeks">Semanas</SelectItem>
                                    <SelectItem value="months">Meses</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Fecha de inicio</Label>
                          <div className="grid gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.startDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {formData.startDate ? (
                                    format(formData.startDate, "PPP", { locale: es })
                                  ) : (
                                    <span>Seleccionar fecha</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={formData.startDate || undefined}
                                  onSelect={(date) => handleInputChange("startDate", date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={formData.hasEndDate}
                            onCheckedChange={(checked) => handleInputChange("hasEndDate", checked)}
                          />
                          <Label>Establecer fecha de finalización</Label>
                        </div>
                        
                        {formData.hasEndDate && (
                          <div className="space-y-2">
                            <Label>Fecha de finalización</Label>
                            <div className="grid gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !formData.endDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.endDate ? (
                                      format(formData.endDate, "PPP", { locale: es })
                                    ) : (
                                      <span>Seleccionar fecha</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={formData.endDate || undefined}
                                    onSelect={(date) => handleInputChange("endDate", date)}
                                    initialFocus
                                    disabled={(date) => 
                                      formData.startDate ? date < formData.startDate : false
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab("basic")}
                        >
                          Atrás
                        </Button>
                        <Button 
                          onClick={() => setActiveTab("additional")}
                        >
                          Continuar
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="additional" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="notification-type">Tipo de notificación</Label>
                          <RadioGroup 
                            defaultValue="before-days" 
                            value={formData.notificationType}
                            onValueChange={(value) => handleInputChange("notificationType", value)}
                            className="space-y-2"
                          >
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
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
                          </RadioGroup>
                        </div>
                        
                        {formData.notificationType === "before-days" && (
                          <div className="mt-4 rounded-md border p-4">
                            <div className="space-y-3">
                              <Label>Selecciona cuándo enviar la notificación</Label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <Button
                                  type="button"
                                  variant={formData.notificationConfig.days === "1" ? "default" : "outline"}
                                  className="w-full"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    notificationConfig: {
                                      ...prev.notificationConfig,
                                      days: "1"
                                    }
                                  }))}
                                >
                                  1 día antes
                                </Button>
                                <Button
                                  type="button"
                                  variant={formData.notificationConfig.days === "3" ? "default" : "outline"}
                                  className="w-full"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    notificationConfig: {
                                      ...prev.notificationConfig,
                                      days: "3"
                                    }
                                  }))}
                                >
                                  3 días antes
                                </Button>
                                <Button
                                  type="button"
                                  variant={formData.notificationConfig.days === "5" ? "default" : "outline"}
                                  className="w-full"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    notificationConfig: {
                                      ...prev.notificationConfig,
                                      days: "5"
                                    }
                                  }))}
                                >
                                  5 días antes
                                </Button>
                                <Button
                                  type="button"
                                  variant={formData.notificationConfig.days === "7" ? "default" : "outline"}
                                  className="w-full"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    notificationConfig: {
                                      ...prev.notificationConfig,
                                      days: "7"
                                    }
                                  }))}
                                >
                                  7 días antes
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {formData.notificationType === "before-days-custom" && (
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
                                value={formData.customNotificationDays || ""}
                                onChange={(e) => handleInputChange("customNotificationDays", e.target.value)}
                              />
                              <span className="text-sm text-muted-foreground whitespace-nowrap">días antes</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Especifica cuántos días antes del vencimiento se enviará la notificación</p>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notas adicionales</Label>
                          <Textarea 
                            id="notes" 
                            placeholder="Notas adicionales sobre este plan de facturación"
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab("schedule")}
                        >
                          Atrás
                        </Button>
                        <Button 
                          onClick={handleSubmit}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            "Previsualizar y Guardar"
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Cliente</div>
                    <div className="flex items-center">
                      <UserCircle className="mr-2 h-4 w-4 text-primary" />
                      <span className="font-medium">{client?.name || "No seleccionado"}</span>
                    </div>
                    {client && (
                      <div className="text-xs text-muted-foreground">{client.email}</div>
                    )}
                  </div>
                  
                  {formData.concept && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Concepto</div>
                      <div className="flex items-start">
                        <Tag className="mr-2 h-4 w-4 text-primary mt-0.5" />
                        <span>{formData.concept}</span>
                      </div>
                    </div>
                  )}
                  
                  {calculateTotal() > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Importe</div>
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4 text-primary" />
                        <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  
                  {formData.frequency && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Frecuencia</div>
                      <div className="flex items-center">
                        <Repeat className="mr-2 h-4 w-4 text-primary" />
                        <span>{getFrequencyText()}</span>
                      </div>
                    </div>
                  )}
                  
                  {formData.startDate && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Fecha de inicio</div>
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        <span>{format(formData.startDate, "dd/MM/yyyy")}</span>
                      </div>
                    </div>
                  )}
                  
                  {formData.hasEndDate && formData.endDate && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Fecha de finalización</div>
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 text-destructive" />
                        <span>{format(formData.endDate, "dd/MM/yyyy")}</span>
                      </div>
                    </div>
                  )}
                  
                  {formData.startDate && (
                    <div className="border-t pt-4 mt-4">
                      <div className="text-sm font-medium mb-2">Próximas fechas de facturación</div>
                      <div className="space-y-2">
                        {getNextPaymentDates().map((date, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <Clock className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span>{date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mostrar configuración de notificaciones */}
                  <div className="border-t pt-4 mt-4">
                    <div className="text-sm font-medium mb-2">Notificaciones</div>
                    <div className="flex items-center text-sm">
                      <Bell className="mr-2 h-3 w-3 text-muted-foreground" />
                      {formData.notificationType === "no-notification" ? (
                        <span>Sin notificaciones</span>
                      ) : formData.notificationType === "before-days" ? (
                        <span>{formData.notificationConfig.days} {parseInt(formData.notificationConfig.days) === 1 ? 'día' : 'días'} antes del vencimiento</span>
                      ) : (
                        <span>{formData.customNotificationDays || "15"} {parseInt(formData.customNotificationDays || "15") === 1 ? 'día' : 'días'} antes del vencimiento (personalizado)</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {showPreview && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Previsualización</CardTitle>
                <CardDescription>
                  Así se verá el plan de ingreso recurrente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">Plan de Ingreso Recurrente</h3>
                      <p className="text-muted-foreground">ID: PLA-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</p>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <Repeat className="mr-1 h-3 w-3 inline" />
                      {getFrequencyText()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Cliente</div>
                      <div className="font-medium">{client?.name || ""}</div>
                      <div className="text-sm">{client?.email || ""}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Importe</div>
                      <div className="font-bold text-xl">${calculateTotal().toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Fecha inicio</div>
                      <div>{formData.startDate ? format(formData.startDate, "dd/MM/yyyy") : ""}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Fecha fin</div>
                      <div>{formData.hasEndDate && formData.endDate ? format(formData.endDate, "dd/MM/yyyy") : "Sin fecha de fin"}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Conceptos</h4>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>${item.price.toFixed(2)}</TableCell>
                              <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between border-t pt-4">
                    <span className="font-medium">Total (se facturará {getFrequencyText().toLowerCase()})</span>
                    <span className="font-bold">${calculateTotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Plan creado correctamente</AlertTitle>
                      <AlertDescription>
                        El plan de facturación recurrente ha sido creado exitosamente. Serás redirigido en unos segundos.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
} 