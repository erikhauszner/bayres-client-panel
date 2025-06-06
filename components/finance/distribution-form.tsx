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
import { CalendarIcon, Calculator, Percent } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

export default function DistributionForm({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [period, setPeriod] = useState("q2-2023")
  const [totalProfit, setTotalProfit] = useState(200000)
  const [retentionPercent, setRetentionPercent] = useState(20)
  const [reinvestmentPercent, setReinvestmentPercent] = useState(20)
  
  // Datos de ejemplo para los socios
  const partners = [
    { id: "SOC001", name: "Eduardo Martínez", position: "CEO", participation: 40 },
    { id: "SOC002", name: "Carolina Ramírez", position: "COO", participation: 30 },
    { id: "SOC003", name: "Felipe Soto", position: "CTO", participation: 20 },
    { id: "SOC004", name: "Lucía Herrera", position: "CFO", participation: 10 }
  ]
  
  // Cálculo de valores
  const retentionAmount = (totalProfit * retentionPercent) / 100
  const reinvestmentAmount = (totalProfit * reinvestmentPercent) / 100
  const distributionAmount = totalProfit - retentionAmount - reinvestmentAmount
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Nueva Distribución de Utilidades</DialogTitle>
          <DialogDescription>
            Configura y registra una nueva distribución de utilidades entre los socios
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="period">
                  <SelectValue placeholder="Selecciona el período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1-2023">Q1 2023</SelectItem>
                  <SelectItem value="q2-2023">Q2 2023</SelectItem>
                  <SelectItem value="q3-2023">Q3 2023</SelectItem>
                  <SelectItem value="q4-2023">Q4 2023</SelectItem>
                  <SelectItem value="annual-2023">Anual 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="distribution-date">Fecha de Distribución</Label>
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
              <Label htmlFor="total-profit">Utilidad Total ($)</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <Input 
                  id="total-profit" 
                  type="number" 
                  className="pl-7" 
                  value={totalProfit}
                  onChange={(e) => setTotalProfit(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4 border p-4 rounded-lg">
            <h3 className="text-base font-medium">Configuración de Distribución</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="retention-slider">Retención de Capital ({retentionPercent}%)</Label>
                  <span className="text-muted-foreground text-sm">${retentionAmount.toFixed(2)}</span>
                </div>
                <Slider
                  id="retention-slider"
                  defaultValue={[retentionPercent]}
                  max={50}
                  step={1}
                  onValueChange={(value) => setRetentionPercent(value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="reinvestment-slider">Reinversión ({reinvestmentPercent}%)</Label>
                  <span className="text-muted-foreground text-sm">${reinvestmentAmount.toFixed(2)}</span>
                </div>
                <Slider
                  id="reinvestment-slider"
                  defaultValue={[reinvestmentPercent]}
                  max={50}
                  step={1}
                  onValueChange={(value) => setReinvestmentPercent(value[0])}
                />
              </div>
            </div>
            
            <div className="pt-2 border-t space-y-2">
              <div className="flex justify-between">
                <span>Monto a distribuir:</span>
                <span className="font-medium">${distributionAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Porcentaje de distribución:</span>
                <span>{100 - retentionPercent - reinvestmentPercent}%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-base font-medium">Distribución por Socio</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Socio</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-center">Participación</TableHead>
                  <TableHead className="text-right">Monto a Recibir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>{partner.position}</TableCell>
                    <TableCell className="text-center">{partner.participation}%</TableCell>
                    <TableCell className="text-right">
                      ${((distributionAmount * partner.participation) / 100).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Método de Pago</Label>
              <Select defaultValue="transfer">
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Selecciona el método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="account">Cuenta Origen</Label>
              <Select>
                <SelectTrigger id="account">
                  <SelectValue placeholder="Selecciona la cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Cuenta Principal</SelectItem>
                  <SelectItem value="operations">Cuenta Operativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="generate-payments" className="font-medium">Generar Pagos Automáticamente</Label>
              <Switch id="generate-payments" defaultChecked />
            </div>
            <p className="text-sm text-muted-foreground">
              Se generarán automáticamente las transacciones de pago para cada socio
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea 
              id="notes" 
              placeholder="Información adicional sobre esta distribución (opcional)" 
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Calculator className="mr-2 h-4 w-4" />
              <span>Recalcular</span>
            </Button>
            <Button type="submit">
              Confirmar Distribución
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 