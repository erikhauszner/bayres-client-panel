"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { CalendarIcon, Plus, Trash2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function TransactionForm({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [transactionType, setTransactionType] = useState("income")
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nueva Transacción</DialogTitle>
          <DialogDescription>
            Registra una nueva transacción en el sistema
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Tipo de Transacción</Label>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger id="transaction-type">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Ingreso</SelectItem>
                  <SelectItem value="expense">Egreso</SelectItem>
                  <SelectItem value="transfer">Transferencia entre cuentas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transaction-date">Fecha</Label>
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <Input id="amount" placeholder="0.00" className="pl-7" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="account">Cuenta</Label>
              <Select>
                <SelectTrigger id="account">
                  <SelectValue placeholder="Selecciona una cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Cuenta Principal</SelectItem>
                  <SelectItem value="savings">Cuenta de Ahorro</SelectItem>
                  <SelectItem value="operations">Cuenta Operativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {transactionType === "transfer" && (
            <div className="space-y-2">
              <Label htmlFor="destination-account">Cuenta Destino</Label>
              <Select>
                <SelectTrigger id="destination-account">
                  <SelectValue placeholder="Selecciona una cuenta destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Cuenta Principal</SelectItem>
                  <SelectItem value="savings">Cuenta de Ahorro</SelectItem>
                  <SelectItem value="operations">Cuenta Operativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="concept">Concepto</Label>
            <Input id="concept" placeholder="Ingresa el concepto de la transacción" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {transactionType === "income" ? (
                    <>
                      <SelectItem value="services">Servicios</SelectItem>
                      <SelectItem value="products">Productos</SelectItem>
                      <SelectItem value="consulting">Consultoría</SelectItem>
                      <SelectItem value="other-income">Otros ingresos</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="operations">Operativos</SelectItem>
                      <SelectItem value="payroll">Nómina</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="other-expense">Otros gastos</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project">Proyecto (opcional)</Label>
              <Select>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin proyecto</SelectItem>
                  <SelectItem value="project1">Proyecto A</SelectItem>
                  <SelectItem value="project2">Proyecto B</SelectItem>
                  <SelectItem value="project3">Proyecto C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" placeholder="Notas adicionales (opcional)" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attachment">Comprobante</Label>
            <Input id="attachment" type="file" className="cursor-pointer" />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Transacción</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 