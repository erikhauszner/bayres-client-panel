"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarIcon, Upload } from "lucide-react"
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
import { financeService } from "@/lib/services/financeService"
import { ExpenseCategory } from "@/lib/types/finance"
import { useToast } from "@/components/ui/use-toast"

export default function ExpenseForm({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)) // 15 días después
  const [isPaid, setIsPaid] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const { toast } = useToast()
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    description: '',
    vendor: '',
    amount: '',
    categoryId: '',
    projectId: '',
    taskId: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected' | 'reimbursed',
    receipt: null as File | null
  })
  
  useEffect(() => {
    loadFormData()
  }, [])
  
  const loadFormData = async () => {
    try {
      // Cargar categorías de gastos
      const categoriesData = await financeService.getExpenseCategories()
      setCategories(categoriesData)
      
      // Aquí cargaríamos los proyectos si tuviéramos un servicio para ello
      // const projectsData = await projectService.getAllProjects()
      // setProjects(projectsData)
    } catch (error) {
      console.error("Error al cargar datos del formulario:", error)
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, receipt: e.target.files![0] }))
    }
  }
  
  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Validar datos requeridos
      if (!formData.description || !formData.amount || !formData.categoryId) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos requeridos",
          variant: "destructive"
        })
        return
      }
      
      // Crear objeto de gasto
      const expenseData: any = {
        description: formData.description,
        vendor: formData.vendor || undefined,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId,
        projectId: formData.projectId === 'none' ? "default-project" : formData.projectId || "default-project", // Usar un valor por defecto si no hay proyecto
        taskId: formData.taskId || undefined,
        date: date!,
        status: (isPaid ? 'approved' : 'pending'),
        receipt: formData.receipt,
        createdBy: 'current-user' // Esto se reemplazará en el backend con el ID del usuario autenticado
      }
      
      // Enviar a la API
      const result = await financeService.createExpense(expenseData)
      
      if (result) {
        toast({
          title: "Éxito",
          description: "Gasto creado correctamente"
        })
        
        // Cerrar el diálogo y resetear el formulario
        onOpenChange(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el gasto",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error al crear gasto:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el gasto",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const resetForm = () => {
    setFormData({
      description: '',
      vendor: '',
      amount: '',
      categoryId: '',
      projectId: '',
      taskId: '',
      status: 'pending',
      receipt: null
    })
    setDate(new Date())
    setDueDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))
    setIsPaid(false)
    setIsRecurring(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nuevo Gasto</DialogTitle>
          <DialogDescription>
            Registra un nuevo gasto o factura por pagar
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Concepto</Label>
              <Input 
                id="description" 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Ej. Servicios hosting, nómina, etc." 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendor">Proveedor</Label>
              <Input 
                id="vendor" 
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
                placeholder="Nombre del proveedor" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expense-date">Fecha del Gasto</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <Input 
                  id="amount" 
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00" 
                  className="pl-7" 
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
                  {projects.map(project => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="is-paid" className="font-medium">Pagado</Label>
              <span className="text-sm text-muted-foreground">El gasto ya ha sido pagado</span>
            </div>
            <Switch 
              id="is-paid" 
              checked={isPaid}
              onCheckedChange={setIsPaid}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="receipt">Recibo o comprobante</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="receipt" 
                type="file" 
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button variant="outline" type="button" className="shrink-0">
                <Upload className="h-4 w-4 mr-2" />
                Subir
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar gasto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 