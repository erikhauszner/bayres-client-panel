"use client"

import { useState } from "react"
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
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"

export default function IncomeForm({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [issueDate, setIssueDate] = useState<Date | undefined>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30 días después
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }])
  const [generateInvoice, setGenerateInvoice] = useState(true)
  
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
    return calculateSubtotal() * 0.16 // Ejemplo con 16% de IVA
  }
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Nuevo Ingreso</DialogTitle>
          <DialogDescription>
            Registra un nuevo ingreso en el sistema
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client1">ABC Solutions</SelectItem>
                  <SelectItem value="client2">Corporación XYZ</SelectItem>
                  <SelectItem value="client3">Servicios Integrados</SelectItem>
                  <SelectItem value="client4">Tech Avanzada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project">Proyecto (Opcional)</Label>
              <Select>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Selecciona un proyecto" />
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
          
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="income-account">Cuenta Destino</Label>
              <Select>
                <SelectTrigger id="income-account">
                  <SelectValue placeholder="Cuenta donde se recibirá el pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Cuenta Principal</SelectItem>
                  <SelectItem value="savings">Cuenta de Ahorro</SelectItem>
                  <SelectItem value="operations">Cuenta Operativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-method">Método de Pago</Label>
              <Select>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                  <SelectItem value="credit">Tarjeta de Crédito</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
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
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <Input 
                      placeholder="Descripción del servicio o producto" 
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      placeholder="Cantidad" 
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      min={1}
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                      <Input 
                        className="pl-7" 
                        placeholder="Precio" 
                        value={item.price || ''}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
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
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totales */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (16%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea 
              id="notes" 
              placeholder="Información adicional (condiciones de pago, instrucciones, etc.)" 
            />
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              id="generate-invoice" 
              checked={generateInvoice}
              onCheckedChange={(checked) => setGenerateInvoice(checked as boolean)}
            />
            <Label htmlFor="generate-invoice">Generar factura</Label>
          </div>
          
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit">Registrar Ingreso</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 