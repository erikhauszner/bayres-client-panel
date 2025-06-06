"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader, Bell, Clock } from "lucide-react"
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
import { CalendarIcon, Plus, Trash2, Percent } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { financeService } from "@/lib/services/financeService"
import { useToast } from "@/components/ui/use-toast"
import { TransactionCategory } from "@/lib/types/finance"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NuevoIngresoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<TransactionCategory[]>([])

  const [clientId, setClientId] = useState("")
  const [issueDate, setIssueDate] = useState<Date | undefined>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30 días después
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }])
  const [applyTax, setApplyTax] = useState(false)
  const [taxPercentage, setTaxPercentage] = useState(16)
  const [generalConcept, setGeneralConcept] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [notes, setNotes] = useState("")
  
  // Estado para notificaciones
  const [notificationType, setNotificationType] = useState("before-days")
  const [notificationConfig, setNotificationConfig] = useState({
    days: "3",
    isCustom: false
  })
  const [customNotificationDays, setCustomNotificationDays] = useState("")
  
  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar clientes
        const clientsData = await financeService.getAllClients();
        setClients(clientsData);
        
        // Cargar categorías de transacciones de tipo 'income'
        const transactionCategoriesData = await financeService.getTransactionCategories();
        const incomeCategoriesData = transactionCategoriesData.filter(cat => cat.type === 'income');
        console.log('Categorías de ingresos cargadas:', incomeCategoriesData);
        setCategories(incomeCategoriesData);
        
        // Si no hay clientes cargados, mostrar un mensaje
        if (clientsData.length === 0) {
          toast({
            title: "Aviso",
            description: "No se encontraron clientes. Puede que necesites crear algunos primero.",
          });
        }
        
        // Si no hay categorías cargadas, mostrar un mensaje
        if (incomeCategoriesData.length === 0) {
          toast({
            title: "Aviso",
            description: "No se encontraron categorías de ingresos. Puedes crearlas en Configuración > Categorías.",
          });
        }
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios",
          variant: "destructive"
        });
      }
    }
    
    loadInitialData();
  }, [toast]);
  
  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }])
  }
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }
  
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
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
  
  const handleSubmit = async () => {
    // Validar datos
    if (!clientId) {
      toast({
        title: "Error",
        description: "Debes seleccionar un cliente",
        variant: "destructive"
      })
      return
    }
    
    if (!categoryId) {
      toast({
        title: "Error",
        description: "Debes seleccionar una categoría",
        variant: "destructive"
      })
      return
    }
    
    if (!issueDate || !dueDate) {
      toast({
        title: "Error",
        description: "Las fechas de emisión y vencimiento son obligatorias",
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
      
      // Crear estructura de datos para la factura
      const invoiceData: any = {
        number: `FAC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        clientId,
        categoryId,
        status: 'draft' as 'draft' | 'paid' | 'sent' | 'overdue' | 'cancelled',
        issueDate,
        dueDate,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.price,
          amount: item.quantity * item.price
        })),
        subtotal: calculateSubtotal(),
        taxRate: applyTax ? taxPercentage : 0,
        taxAmount: calculateTax(),
        total: calculateTotal(),
        paid: 0, // Agregado para satisfacer el tipo
        balance: calculateTotal(), // Agregado para satisfacer el tipo
        notificationDays: notificationType === "no-notification" 
          ? 0 
          : notificationType === "before-days-custom" 
            ? parseInt(customNotificationDays || "0") 
            : parseInt(notificationConfig.days),
        notes,
        createdBy: "current-user", // Idealmente este valor vendría del contexto de autenticación
      }
      
      // Enviar al servidor
      const result = await financeService.createInvoice(invoiceData)
      
      if (result) {
        toast({
          title: "Éxito",
          description: "El ingreso ha sido registrado correctamente",
        })
        
        // Redirigir a la página de ingresos
        router.push('/finanzas')
      } else {
        throw new Error("No se pudo crear el ingreso")
      }
    } catch (error) {
      console.error("Error al crear ingreso:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el ingreso",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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
              <h1 className="text-3xl font-bold tracking-tight">Nuevo Ingreso</h1>
            </div>
            
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Registrar Ingreso</CardTitle>
                <CardDescription>
                  Ingresa los detalles para registrar un nuevo ingreso en el sistema
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select value={clientId} onValueChange={setClientId}>
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Selecciona un cliente" />
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
                    <Label htmlFor="issue-date">Fecha de Emisión</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !issueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {issueDate ? format(issueDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={issueDate}
                          onSelect={setIssueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Fecha de Vencimiento</Label>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="income-category">Categoría</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger id="income-category">
                        <SelectValue placeholder="Selecciona una categoría" />
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
                    value={generalConcept}
                    onChange={(e) => setGeneralConcept(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Información adicional (condiciones de pago, instrucciones, etc.)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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
                  <AlertTitle>Ingreso Pendiente</AlertTitle>
                  <AlertDescription>
                    Este ingreso quedará registrado como pendiente hasta que se confirme el pago recibido.
                  </AlertDescription>
                </Alert>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Registrar Ingreso"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 