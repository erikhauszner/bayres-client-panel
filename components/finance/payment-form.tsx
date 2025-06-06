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
import { CalendarIcon, Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

export default function PaymentForm({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [paymentType, setPaymentType] = useState("invoice")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Datos de ejemplo para facturas pendientes
  const pendingInvoices = [
    { id: "FAC-2023-0040", client: "Consultora Innovación", dueDate: "05/07/2023", amount: "$7,500.00", selected: false },
    { id: "FAC-2023-0039", client: "Digital Solutions", dueDate: "02/07/2023", amount: "$2,840.00", selected: false },
    { id: "FAC-2023-0038", client: "Tech Avanzada", dueDate: "28/06/2023", amount: "$5,120.00", selected: true }
  ]
  
  // Datos de ejemplo para gastos pendientes
  const pendingExpenses = [
    { id: "EGR-2023-0058", provider: "Adobe Inc.", concept: "Renovación licencias software", dueDate: "22/07/2023", amount: "$2,450.00", selected: false },
    { id: "EGR-2023-0057", provider: "Inmobiliaria Centro", concept: "Alquiler oficina", dueDate: "01/07/2023", amount: "$3,500.00", selected: true },
    { id: "EGR-2023-0054", provider: "Suministros Express", concept: "Material de oficina", dueDate: "20/06/2023", amount: "$120.00", selected: false }
  ]
  
  // Calcular el total seleccionado
  const calculateTotal = () => {
    let total = 0
    
    if (paymentType === "invoice") {
      total = pendingInvoices
        .filter(invoice => invoice.selected)
        .reduce((sum, invoice) => sum + parseFloat(invoice.amount.replace(/[^\d.-]/g, '')), 0)
    } else {
      total = pendingExpenses
        .filter(expense => expense.selected)
        .reduce((sum, expense) => sum + parseFloat(expense.amount.replace(/[^\d.-]/g, '')), 0)
    }
    
    return total.toFixed(2)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Nuevo Pago</DialogTitle>
          <DialogDescription>
            Registra un nuevo pago de factura o gasto
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-type">Tipo de Pago</Label>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger id="payment-type">
                  <SelectValue placeholder="Selecciona el tipo de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Cobro de Factura</SelectItem>
                  <SelectItem value="expense">Pago de Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-date">Fecha de Pago</Label>
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
          </div>
          
          <div className="space-y-2">
            <Label>{paymentType === "invoice" ? "Buscar Factura" : "Buscar Gasto"}</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={paymentType === "invoice" ? "Buscar factura por número o cliente..." : "Buscar gasto por número o proveedor..."}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]"></TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>{paymentType === "invoice" ? "Cliente" : "Proveedor/Concepto"}</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentType === "invoice" ? (
                  pendingInvoices.map((invoice, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Checkbox checked={invoice.selected} />
                      </TableCell>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell className="text-right">{invoice.amount}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  pendingExpenses.map((expense, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Checkbox checked={expense.selected} />
                      </TableCell>
                      <TableCell className="font-medium">{expense.id}</TableCell>
                      <TableCell>
                        <div>{expense.provider}</div>
                        <div className="text-xs text-muted-foreground">{expense.concept}</div>
                      </TableCell>
                      <TableCell>{expense.dueDate}</TableCell>
                      <TableCell className="text-right">{expense.amount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Método de Pago</Label>
              <Select>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Selecciona el método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                  <SelectItem value="credit">Tarjeta de Crédito</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-account">Cuenta</Label>
              <Select>
                <SelectTrigger id="payment-account">
                  <SelectValue placeholder="Selecciona la cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Cuenta Principal</SelectItem>
                  <SelectItem value="savings">Cuenta de Ahorro</SelectItem>
                  <SelectItem value="operations">Cuenta Operativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reference">Referencia de Pago</Label>
            <Input id="reference" placeholder="Número de transferencia, cheque, etc." />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" placeholder="Notas adicionales sobre este pago (opcional)" />
          </div>
          
          <div className="border-t pt-4 mt-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total a pagar:</span>
              <span className="text-primary">${calculateTotal()}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {paymentType === "invoice" 
                ? `Seleccionado: ${pendingInvoices.filter(i => i.selected).length} de ${pendingInvoices.length} facturas` 
                : `Seleccionado: ${pendingExpenses.filter(e => e.selected).length} de ${pendingExpenses.length} gastos`}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit">
            <Check className="mr-2 h-4 w-4" />
            <span>Confirmar Pago</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 