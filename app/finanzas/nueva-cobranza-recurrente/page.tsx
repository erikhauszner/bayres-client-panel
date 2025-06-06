"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CalendarIcon, DollarSign, Repeat, AlertCircle, Info, Tag, UserCircle, Building2, Clock } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"
import { financeService } from "@/lib/services/financeService"

// Datos de ejemplo para el formulario
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
  const [date, setDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [hasEndDate, setHasEndDate] = useState(false)
  const [selectedClient, setSelectedClient] = useState("")
  const [activeTab, setActiveTab] = useState("basic")
  const [showPreview, setShowPreview] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const { toast } = useToast()

  // Estados para formulario
  const [formData, setFormData] = useState({
    concept: "",
    amount: "",
    frequency: "monthly",
    customFrequency: {
      value: "1",
      unit: "months"
    },
    startDate: null as Date | null,
    endDate: null as Date | null,
    hasEndDate: false,
    notificationDays: "3",
    autoInvoice: true,
    notes: ""
  })

  // Cargar datos de clientes
  useEffect(() => {
    const loadClients = async () => {
      try {
        // Usar getAllClients para obtener todos los clientes
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
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        // En caso de error, mostrar mensaje y usar los datos de ejemplo
        toast({
          title: "Error",
          description: "Error al cargar los clientes. Usando datos de demostración.",
          variant: "destructive"
        });
        setClients(CLIENTS);
      }
    };
    
    loadClients();
  }, [toast]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar los datos al servidor
    setShowPreview(true)
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
  const client = CLIENTS.find(c => c.id === selectedClient)
  
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
                                  .filter(client => client.name && client.name.trim() !== '')
                                  .map((client: any) => (
                                    <SelectItem key={client.id} value={client.id}>
                                      {client.name}
                                    </SelectItem>
                                  ))
                              )}
                              {clients.length > 0 && clients.filter(client => client.name && client.name.trim() !== '').length === 0 && (
                                <SelectItem value="no-clients" disabled>No hay clientes disponibles</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="concept">Concepto</Label>
                          <Select 
                            onValueChange={(value) => {
                              const service = SERVICES.find(s => s.id === value)
                              if (service) {
                                handleInputChange("concept", service.description)
                              }
                            }}
                          >
                            <SelectTrigger id="concept">
                              <SelectValue placeholder="Seleccionar concepto" />
                            </SelectTrigger>
                            <SelectContent>
                              {SERVICES.map(service => (
                                <SelectItem key={service.id} value={service.id}>
                                  {service.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="concept-description">Descripción del servicio</Label>
                          <Textarea 
                            id="concept-description" 
                            placeholder="Descripción del servicio"
                            value={formData.concept}
                            onChange={(e) => handleInputChange("concept", e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="amount">Importe</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="amount" 
                              type="text" 
                              placeholder="0.00" 
                              className="pl-9"
                              value={formData.amount}
                              onChange={(e) => handleInputChange("amount", e.target.value)} 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => setActiveTab("schedule")}
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
                            className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4"
                          >
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
                          </RadioGroup>
                        </div>
                        
                        <div className="flex items-center space-x-2 rounded-md border p-3">
                          <RadioGroupItem 
                            value="custom" 
                            id="custom" 
                            checked={formData.frequency === "custom"}
                            onClick={() => handleInputChange("frequency", "custom")}
                          />
                          <Label htmlFor="custom" className="flex items-center">
                            <Repeat className="mr-2 h-4 w-4" />
                            Personalizada: Cada
                          </Label>
                          <div className="flex flex-1 items-center space-x-2">
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
                        
                        <div className="space-y-2">
                          <Label>Fecha de inicio</Label>
                          <div className="grid gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
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
                                    className="w-full justify-start text-left font-normal"
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
                          <Label htmlFor="notification-days">Días de anticipación para notificación</Label>
                          <Select 
                            value={formData.notificationDays}
                            onValueChange={(value) => handleInputChange("notificationDays", value)}
                          >
                            <SelectTrigger id="notification-days">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 día antes</SelectItem>
                              <SelectItem value="3">3 días antes</SelectItem>
                              <SelectItem value="5">5 días antes</SelectItem>
                              <SelectItem value="7">7 días antes</SelectItem>
                              <SelectItem value="0">Sin notificación</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={formData.autoInvoice}
                            onCheckedChange={(checked) => handleInputChange("autoInvoice", checked)}
                          />
                          <Label>Generar factura automáticamente</Label>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notas adicionales</Label>
                          <Textarea 
                            id="notes" 
                            placeholder="Notas adicionales sobre este plan de cobro"
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Información</AlertTitle>
                        <AlertDescription>
                          Este plan de cobro recurrente generará facturas automáticamente según la programación establecida.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab("schedule")}
                        >
                          Atrás
                        </Button>
                        <Button 
                          onClick={handleSubmit}
                        >
                          Previsualizar y Guardar
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
                  
                  {formData.amount && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Importe</div>
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4 text-primary" />
                        <span className="font-medium">${formData.amount}</span>
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
                      <div className="text-sm font-medium mb-2">Próximas fechas de cobro</div>
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
                </CardContent>
              </Card>
            </div>
          </div>
          
          {showPreview && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Previsualización</CardTitle>
                <CardDescription>
                  Así se verá el plan de cobro recurrente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">Plan de Cobro Recurrente</h3>
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
                      <div className="font-bold text-xl">${formData.amount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Concepto</div>
                      <div>{formData.concept}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Estado</div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Activo
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Fecha de inicio</div>
                      <div>{formData.startDate ? format(formData.startDate, "dd/MM/yyyy") : ""}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Próxima factura</div>
                      <div>{getNextPaymentDates()[0] || ""}</div>
                    </div>
                  </div>
                  
                  {formData.notes && (
                    <div className="border-t pt-4">
                      <div className="text-sm text-muted-foreground">Notas</div>
                      <div className="text-sm">{formData.notes}</div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Volver a editar
                </Button>
                <Button onClick={() => router.push("/finanzas")}>
                  Guardar Plan
                </Button>
              </CardFooter>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
} 