"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Download, 
  Plus, 
  RefreshCw, 
  Search, 
  Building, 
  ArrowUpRight, 
  ArrowDownLeft,
  Wallet,
  Filter,
  MoreHorizontal
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

// Datos de ejemplo
const ACCOUNTS = [
  {
    id: "ACC001",
    name: "Cuenta Operativa Principal",
    bank: "Banco Nacional",
    type: "Cuenta Corriente",
    balance: "$42,350.80",
    currency: "USD",
    accountNumber: "****4582",
    lastUpdate: "Hoy, 10:25 AM",
    status: "active"
  },
  {
    id: "ACC002",
    name: "Cuenta Reservas",
    bank: "Banco Internacional",
    type: "Cuenta de Ahorros",
    balance: "$18,723.65",
    currency: "USD",
    accountNumber: "****7891",
    lastUpdate: "Ayer, 18:30 PM",
    status: "active"
  },
  {
    id: "ACC003",
    name: "Cuenta Impuestos",
    bank: "Banco Nacional",
    type: "Cuenta de Ahorros",
    balance: "$2,846.00",
    currency: "USD",
    accountNumber: "****6214",
    lastUpdate: "21/06/2023",
    status: "active"
  }
];

const TRANSACTIONS = [
  {
    id: "TRX00123",
    date: "22/06/2023",
    description: "Transferencia de ABC Corp",
    account: "Cuenta Operativa Principal",
    amount: "+$12,500.00",
    type: "income",
    category: "Pago de cliente",
    reference: "Factura #FAC-2023-0042"
  },
  {
    id: "TRX00122",
    date: "21/06/2023",
    description: "Transferencia a Cuenta Impuestos",
    account: "Cuenta Operativa Principal",
    amount: "-$2,500.00",
    type: "transfer",
    category: "Transferencia interna",
    reference: "Reserva impuestos"
  },
  {
    id: "TRX00121",
    date: "20/06/2023",
    description: "Pago Software CRM",
    account: "Cuenta Operativa Principal",
    amount: "-$199.00",
    type: "expense",
    category: "Software",
    reference: "Suscripción mensual"
  },
  {
    id: "TRX00120",
    date: "18/06/2023",
    description: "Pago nómina",
    account: "Cuenta Operativa Principal",
    amount: "-$8,450.00",
    type: "expense",
    category: "Nómina",
    reference: "Quincena"
  },
  {
    id: "TRX00119",
    date: "15/06/2023",
    description: "Transferencia de XYZ Inc",
    account: "Cuenta Operativa Principal",
    amount: "+$7,800.00",
    type: "income",
    category: "Pago de cliente",
    reference: "Factura #FAC-2023-0038"
  }
];

export default function FinancialAccounts() {
  const [activeTab, setActiveTab] = useState("accounts")
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tesorería y Cuentas</h2>
          <p className="text-muted-foreground">
            Gestiona tus cuentas bancarias, saldos y movimientos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar</span>
          </Button>
          <Button size="sm" className="h-9" asChild>
            <Link href="/finanzas/nueva-cuenta">
              <Plus className="mr-2 h-4 w-4" />
              <span>Nueva Cuenta</span>
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Cuentas Bancarias</TabsTrigger>
          <TabsTrigger value="transactions">Movimientos</TabsTrigger>
          <TabsTrigger value="transfers">Transferencias</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de Cuentas */}
        <TabsContent value="accounts" className="space-y-4">
          {/* Resumen de Saldos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$63,920.45</div>
                <div className="text-xs text-muted-foreground pt-1">
                  Saldo consolidado en todas las cuentas
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Ver Detalle</span>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Movimientos (7 días)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Ingresos</p>
                    <p className="text-base font-medium text-green-600">+$20,300.00</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Egresos</p>
                    <p className="text-base font-medium text-red-600">-$11,149.00</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  <ArrowUpRight className="mr-2 h-4 w-4 text-green-500" />
                  <ArrowDownLeft className="mr-2 h-4 w-4 text-red-500" />
                  <span>Ver Movimientos</span>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cuentas Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <div className="text-xs text-muted-foreground pt-1">
                  En 2 bancos diferentes
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  <Building className="mr-2 h-4 w-4" />
                  <span>Ver Bancos</span>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Próximos Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <div className="text-xs text-muted-foreground pt-1">
                  Total: $14,820.00
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Programar Pagos</span>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Lista de Cuentas */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold tracking-tight">Listado de Cuentas</h3>
              <div className="flex items-center gap-4">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar cuenta..."
                    className="w-full sm:w-[200px] pl-9"
                  />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Banco</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead>Última Actualización</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ACCOUNTS.map(account => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          {account.name}
                          <div className="text-xs text-muted-foreground mt-1">
                            {account.accountNumber}
                          </div>
                        </TableCell>
                        <TableCell>{account.bank}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell className="text-right font-medium">{account.balance}</TableCell>
                        <TableCell>{account.lastUpdate}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                              <DropdownMenuItem>Ver Movimientos</DropdownMenuItem>
                              <DropdownMenuItem>Transferir</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Pestaña de Movimientos */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Filtros de Movimientos */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar movimiento..."
                    className="pl-9"
                  />
                </div>
                
                <div>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="income">Ingresos</SelectItem>
                      <SelectItem value="expense">Egresos</SelectItem>
                      <SelectItem value="transfer">Transferencias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las cuentas</SelectItem>
                      {ACCOUNTS.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select defaultValue="7days">
                    <SelectTrigger>
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Últimos 7 días</SelectItem>
                      <SelectItem value="30days">Últimos 30 días</SelectItem>
                      <SelectItem value="90days">Últimos 3 meses</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="mr-2">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Actualizar</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Exportar</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Lista de Movimientos */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TRANSACTIONS.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {transaction.date}
                        <div className="text-xs text-muted-foreground mt-1">
                          #{transaction.id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {transaction.reference}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.account}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          transaction.type === 'income' ? 'bg-green-50 text-green-700' :
                          transaction.type === 'expense' ? 'bg-red-50 text-red-700' :
                          'bg-blue-50 text-blue-700'
                        }>
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.type === 'income' ? 'text-green-600' :
                        transaction.type === 'expense' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {transaction.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando 5 de 243 transacciones
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm">
                  Siguiente
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Transferencias */}
        <TabsContent value="transfers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Formulario de Transferencia */}
            <Card>
              <CardHeader>
                <CardTitle>Nueva Transferencia</CardTitle>
                <CardDescription>
                  Realiza transferencias entre tus cuentas bancarias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cuenta Origen</label>
                    <Select defaultValue="ACC001">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNTS.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} ({account.balance})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cuenta Destino</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNTS.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monto</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                      <Input type="text" placeholder="0.00" className="pl-7" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <Input type="text" placeholder="Ej: Transferencia para pagos" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha</label>
                    <Input type="date" />
                  </div>
                  
                  <Button className="w-full mt-4">Realizar Transferencia</Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Historial de Transferencias */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Historial de Transferencias</CardTitle>
                  <CardDescription>
                    Últimas transferencias entre cuentas
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  <span>Exportar</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { 
                      id: "TRF001", 
                      date: "21/06/2023", 
                      from: "Cuenta Operativa Principal", 
                      to: "Cuenta Impuestos", 
                      amount: "$2,500.00", 
                      description: "Reserva impuestos" 
                    },
                    { 
                      id: "TRF002", 
                      date: "10/06/2023", 
                      from: "Cuenta Operativa Principal", 
                      to: "Cuenta Reservas", 
                      amount: "$5,000.00", 
                      description: "Reserva mensual" 
                    },
                    { 
                      id: "TRF003", 
                      date: "05/06/2023", 
                      from: "Cuenta Reservas", 
                      to: "Cuenta Operativa Principal", 
                      amount: "$1,800.00", 
                      description: "Fondos para gastos" 
                    }
                  ].map((transfer) => (
                    <div key={transfer.id} className="flex flex-col space-y-2 border-b pb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{transfer.date}</span>
                        <Badge variant="outline">{transfer.id}</Badge>
                      </div>
                      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
                        <div className="text-sm">{transfer.from}</div>
                        <ArrowUpRight className="h-4 w-4 text-blue-500" />
                        <div className="text-sm font-medium">{transfer.to}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {transfer.description}
                        </span>
                        <span className="font-semibold">{transfer.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 