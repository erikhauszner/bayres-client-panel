"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
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
import { CalendarIcon, Calculator } from "lucide-react"
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

export default function NuevaDistribucionPage() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [totalAmount, setTotalAmount] = useState(300000)
  
  // Datos de los socios (igualitarios)
  const partners = [
    { id: "SOC001", name: "Erik D. Hauszner", position: "CEO", participation: 33.33 },
    { id: "SOC002", name: "Rodolfo Gabrielli", position: "CTO", participation: 33.33 },
    { id: "SOC003", name: "Simon Goyenechea", position: "COO", participation: 33.33 }
  ]
  
  // Distribución igual para todos los socios
  const amountPerPartner = totalAmount / 3
  
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
              <h1 className="text-3xl font-bold tracking-tight">Nueva Distribución de Utilidades</h1>
            </div>
            
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Configurar Distribución de Utilidades</CardTitle>
                <CardDescription>
                  Configura y registra una nueva distribución de utilidades entre los socios
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="account">Cuenta Origen</Label>
                    <Select defaultValue="main">
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
                
                <div className="space-y-4 border p-4 rounded-lg">
                  <h3 className="text-base font-medium">Configuración de Distribución</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="total-amount">Monto Total a Distribuir ($)</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                        <Input 
                          id="total-amount" 
                          type="number" 
                          className="pl-7" 
                          value={totalAmount}
                          onChange={(e) => setTotalAmount(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t space-y-2">
                    <div className="flex justify-between">
                      <span>Distribución por socio:</span>
                      <span className="font-medium">${amountPerPartner.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Distribución igualitaria entre los 3 socios</span>
                      <span>33.33% c/u</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-base font-medium">Distribución por Socio</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Socio</TableHead>
                          <TableHead className="text-center">Participación</TableHead>
                          <TableHead className="text-right">Monto a Recibir</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partners.map((partner) => (
                          <TableRow key={partner.id}>
                            <TableCell className="font-medium">{partner.name}</TableCell>
                            <TableCell className="text-center">{partner.participation}%</TableCell>
                            <TableCell className="text-right">
                              ${amountPerPartner.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="generate-payments" className="font-medium">Generar Nómina Automáticamente</Label>
                    <Switch id="generate-payments" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Se generarán automáticamente las transacciones de nómina para cada socio
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Información adicional sobre esta distribución (opcional)" 
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Confirmar Distribución
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 