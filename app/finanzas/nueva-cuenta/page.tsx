"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Building, CreditCard, Wallet } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export default function NuevaCuentaPage() {
  const router = useRouter()
  
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
              <h1 className="text-3xl font-bold tracking-tight">Nueva Cuenta</h1>
            </div>
            
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>Registrar Cuenta Bancaria</CardTitle>
                <CardDescription>
                  Agrega una nueva cuenta bancaria para gestionar tus finanzas
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Nombre de la Cuenta</Label>
                  <Input id="account-name" placeholder="Ej. Cuenta Operativa Principal" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-type">Tipo de Cuenta</Label>
                    <Select>
                      <SelectTrigger id="account-type">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Cuenta Corriente</SelectItem>
                        <SelectItem value="savings">Cuenta de Ahorro</SelectItem>
                        <SelectItem value="credit">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="investment">Inversión</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Selecciona la moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD - Dólar Estadounidense</SelectItem>
                        <SelectItem value="eur">EUR - Euro</SelectItem>
                        <SelectItem value="mxn">MXN - Peso Mexicano</SelectItem>
                        <SelectItem value="ars">ARS - Peso Argentino</SelectItem>
                        <SelectItem value="cop">COP - Peso Colombiano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank">Banco</Label>
                    <Input id="bank" placeholder="Nombre del banco" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="initial-balance">Saldo Inicial</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                      <Input id="initial-balance" placeholder="0.00" className="pl-7" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-number">Número de Cuenta</Label>
                    <Input id="account-number" placeholder="••••••••••••1234" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="account-holder">Titular de la Cuenta</Label>
                    <Input id="account-holder" placeholder="Nombre del titular" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="is-default" className="font-medium">Cuenta Principal</Label>
                    <span className="text-sm text-muted-foreground">Establecer como cuenta principal para transacciones</span>
                  </div>
                  <Switch id="is-default" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="is-active" className="font-medium">Estado Activo</Label>
                    <span className="text-sm text-muted-foreground">Las cuentas inactivas no se muestran en las transacciones</span>
                  </div>
                  <Switch id="is-active" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea id="notes" placeholder="Notas adicionales sobre esta cuenta (opcional)" />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cuenta</Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 