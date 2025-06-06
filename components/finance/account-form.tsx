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
import { Building, CreditCard, Wallet } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export default function AccountForm({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Nueva Cuenta</DialogTitle>
          <DialogDescription>
            Agrega una nueva cuenta bancaria para gestionar tus finanzas
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Cuenta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 