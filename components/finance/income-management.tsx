"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Eye,
  Download,
  Plus,
  MoreHorizontal,
  FileText,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  ClockIcon,
  Send,
  RefreshCw,
  DollarSign
} from "lucide-react"
import Link from "next/link"

// Datos de ejemplo
const INVOICES = [
  {
    id: "FAC-2023-0042",
    client: "Empresa ABC S.A.",
    amount: "$4,800.00",
    date: "15/06/2023",
    dueDate: "15/07/2023",
    status: "paid",
    paymentDate: "20/06/2023",
    items: [
      { description: "Desarrollo de landing page", qty: 1, unitPrice: "$3,000.00", total: "$3,000.00" },
      { description: "Diseño de logotipo", qty: 1, unitPrice: "$1,000.00", total: "$1,000.00" },
      { description: "Configuración de hosting y dominio", qty: 1, unitPrice: "$800.00", total: "$800.00" }
    ]
  },
  {
    id: "FAC-2023-0041",
    client: "Desarrollos XYZ",
    amount: "$3,200.00",
    date: "10/06/2023",
    dueDate: "10/07/2023",
    status: "paid",
    paymentDate: "25/06/2023"
  },
  {
    id: "FAC-2023-0040",
    client: "Consultora Innovación",
    amount: "$7,500.00",
    date: "05/06/2023",
    dueDate: "05/07/2023",
    status: "pending"
  },
  {
    id: "FAC-2023-0039",
    client: "Digital Solutions",
    amount: "$2,840.00",
    date: "02/06/2023",
    dueDate: "02/07/2023",
    status: "pending"
  },
  {
    id: "FAC-2023-0038",
    client: "Tech Avanzada",
    amount: "$5,120.00",
    date: "28/05/2023",
    dueDate: "28/06/2023",
    status: "overdue"
  },
  {
    id: "FAC-2023-0037",
    client: "Empresa ABC S.A.",
    amount: "$2,100.00",
    date: "20/05/2023",
    dueDate: "20/06/2023",
    status: "paid",
    paymentDate: "15/06/2023"
  }
];

const CLIENTS = [
  { id: "CLI001", name: "Empresa ABC S.A.", pendingAmount: "$0.00", paidAmount: "$6,900.00" },
  { id: "CLI002", name: "Desarrollos XYZ", pendingAmount: "$0.00", paidAmount: "$3,200.00" },
  { id: "CLI003", name: "Consultora Innovación", pendingAmount: "$7,500.00", paidAmount: "$4,200.00" },
  { id: "CLI004", name: "Digital Solutions", pendingAmount: "$2,840.00", paidAmount: "$12,450.00" },
  { id: "CLI005", name: "Tech Avanzada", pendingAmount: "$5,120.00", paidAmount: "$8,750.00" }
];

export default function IncomeManagement() {
  const [activeTab, setActiveTab] = useState("invoices")
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)

  const viewInvoiceDetails = (invoice: any) => {
    setSelectedInvoice(invoice)
    setInvoiceDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Ingresos</h2>
          <p className="text-muted-foreground">
            Administra tus facturas, cobros y fuentes de ingresos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar</span>
          </Button>
          <Button size="sm" className="h-9" asChild>
            <Link href="/finanzas/nuevo-ingreso">
              <Plus className="mr-2 h-4 w-4" />
              <span>Nuevo Ingreso</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales (Año)</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$129,240.00</div>
            <p className="text-xs text-muted-foreground pt-1">
              Objetivo anual: $180,000.00 (72%)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Facturas Emitidas</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground pt-1">
              En los últimos 30 días: 8
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
            <ClockIcon className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,460.00</div>
            <p className="text-xs text-muted-foreground pt-1">
              4 facturas por cobrar
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,120.00</div>
            <p className="text-xs text-muted-foreground pt-1">
              1 factura vencida
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Facturas</TabsTrigger>
          <TabsTrigger value="clients">Por Cliente</TabsTrigger>
          <TabsTrigger value="recurring">Ingresos Recurrentes</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de Facturas */}
        <TabsContent value="invoices" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar factura o cliente..."
                    className="pl-9"
                  />
                </div>
                
                <div>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="paid">Pagadas</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="overdue">Vencidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select defaultValue="30days">
                    <SelectTrigger>
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">Últimos 30 días</SelectItem>
                      <SelectItem value="90days">Últimos 3 meses</SelectItem>
                      <SelectItem value="year">Este año</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="icon" className="mr-2">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="mr-2">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Actualizar</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabla de facturas */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INVOICES.map(invoice => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell className="text-right font-medium">{invoice.amount}</TableCell>
                      <TableCell>
                        <Badge className={
                          invoice.status === "paid" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          invoice.status === "pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" :
                          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }>
                          {invoice.status === "paid" ? (
                            <CheckCircle className="mr-1 h-3 w-3 inline" />
                          ) : invoice.status === "pending" ? (
                            <Calendar className="mr-1 h-3 w-3 inline" />
                          ) : (
                            <AlertCircle className="mr-1 h-3 w-3 inline" />
                          )}
                          {invoice.status === "paid" ? "Pagada" : 
                           invoice.status === "pending" ? "Pendiente" : "Vencida"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewInvoiceDetails(invoice)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Ver factura</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              <span>Descargar PDF</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              <span>Enviar por email</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Link href="/finanzas/nuevo-pago" className="flex items-center w-full">
                                <DollarSign className="mr-2 h-4 w-4" />
                                <span>Registrar pago</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <AlertCircle className="mr-2 h-4 w-4" />
                              <span>Marcar como vencida</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando 6 de 42 facturas
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
        
        {/* Pestaña de Clientes */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Cliente</CardTitle>
              <CardDescription>
                Resumen de facturación por cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Pendiente</TableHead>
                    <TableHead className="text-right">Pagado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CLIENTS.map(client => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="text-right font-medium text-amber-600">{client.pendingAmount}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">{client.paidAmount}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${(parseFloat(client.pendingAmount.replace(/[^\d.-]/g, '')) + 
                          parseFloat(client.paidAmount.replace(/[^\d.-]/g, ''))).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8">
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold">Totales</TableCell>
                  <TableCell className="text-right font-bold text-amber-600">
                    ${CLIENTS.reduce((sum, client) => sum + parseFloat(client.pendingAmount.replace(/[^\d.-]/g, '')), 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    ${CLIENTS.reduce((sum, client) => sum + parseFloat(client.paidAmount.replace(/[^\d.-]/g, '')), 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${CLIENTS.reduce((sum, client) => 
                      sum + parseFloat(client.pendingAmount.replace(/[^\d.-]/g, '')) + 
                      parseFloat(client.paidAmount.replace(/[^\d.-]/g, '')), 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Ingresos Recurrentes */}
        <TabsContent value="recurring" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ingresos Recurrentes</CardTitle>
                <CardDescription>
                  Facturación programada y pagos periódicos
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                <span>Nuevo recurrente</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">Mantenimiento Sitio Web - Empresa ABC S.A.</span>
                      <span className="text-sm text-muted-foreground">Facturación mensual · $1,200.00</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Activo</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Próxima factura: 15/07/2023</span>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </div>
                </div>
                
                <div className="border-t" />
                
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">Hosting y Dominio - Tech Solutions</span>
                      <span className="text-sm text-muted-foreground">Facturación anual · $3,600.00</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Activo</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Próxima factura: 10/01/2024</span>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </div>
                </div>
                
                <div className="border-t" />
                
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">Soporte Técnico - Digital Solutions</span>
                      <span className="text-sm text-muted-foreground">Facturación trimestral · $2,400.00</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Activo</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Próxima factura: 30/08/2023</span>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog de detalle de factura */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Factura {selectedInvoice?.id}</DialogTitle>
            <DialogDescription>
              Detalles de la factura
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Cliente</h4>
                  <p className="text-sm">{selectedInvoice.client}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Estado</h4>
                  <Badge className={
                    selectedInvoice.status === "paid" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                    selectedInvoice.status === "pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" :
                    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }>
                    {selectedInvoice.status === "paid" ? "Pagada" : 
                     selectedInvoice.status === "pending" ? "Pendiente" : "Vencida"}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Fecha de emisión</h4>
                  <p className="text-sm">{selectedInvoice.date}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Fecha de vencimiento</h4>
                  <p className="text-sm">{selectedInvoice.dueDate}</p>
                </div>
                {selectedInvoice.status === "paid" && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Fecha de pago</h4>
                      <p className="text-sm">{selectedInvoice.paymentDate}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Método de pago</h4>
                      <p className="text-sm">Transferencia bancaria</p>
                    </div>
                  </>
                )}
              </div>
              
              {selectedInvoice.items && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Detalle</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Cant.</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.qty}</TableCell>
                          <TableCell className="text-right">{item.unitPrice}</TableCell>
                          <TableCell className="text-right">{item.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="flex justify-between border-t pt-4">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-xl">{selectedInvoice.amount}</span>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
              Cerrar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                <span>Descargar PDF</span>
              </Button>
              {selectedInvoice?.status !== "paid" && (
                <Button asChild>
                  <Link href="/finanzas/nuevo-pago">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Registrar Pago</span>
                  </Link>
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 