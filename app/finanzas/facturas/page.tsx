"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, AlertCircle, FileText, Search, Plus, Filter, MoreVertical, Download, Printer, Eye } from "lucide-react"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"

// Datos ficticios para las facturas
const FACTURAS_MOCK = [
  { id: "FAC-2023-0042", client: "Empresa ABC S.A.", amount: "$4,800.00", date: "15/06/2023", status: "paid", cliente_id: "client-001" },
  { id: "FAC-2023-0041", client: "Desarrollos XYZ", amount: "$3,200.00", date: "10/06/2023", status: "paid", cliente_id: "client-002" },
  { id: "FAC-2023-0040", client: "Consultora Innovación", amount: "$7,500.00", date: "05/06/2023", status: "pending", cliente_id: "client-003" },
  { id: "FAC-2023-0039", client: "Digital Solutions", amount: "$2,840.00", date: "02/06/2023", status: "pending", cliente_id: "client-004" },
  { id: "FAC-2023-0038", client: "Tech Avanzada", amount: "$5,120.00", date: "28/05/2023", status: "overdue", cliente_id: "client-005" },
  { id: "FAC-2023-0037", client: "Empresa ABC S.A.", amount: "$2,100.00", date: "20/05/2023", status: "paid", cliente_id: "client-001" },
  { id: "FAC-2023-0036", client: "Soluciones Creativas", amount: "$8,350.00", date: "15/05/2023", status: "paid", cliente_id: "client-006" },
  { id: "FAC-2023-0035", client: "Desarrollos XYZ", amount: "$3,900.00", date: "10/05/2023", status: "overdue", cliente_id: "client-002" },
  { id: "FAC-2023-0034", client: "Innovatech", amount: "$6,450.00", date: "05/05/2023", status: "pending", cliente_id: "client-007" },
  { id: "FAC-2023-0033", client: "Web Services Pro", amount: "$4,200.00", date: "01/05/2023", status: "paid", cliente_id: "client-008" },
];

export default function FacturasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Filtrar facturas según búsqueda y filtro de estado
  const filteredFacturas = FACTURAS_MOCK.filter(factura => {
    const matchesSearch = 
      factura.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      factura.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col space-y-6 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
                <p className="text-muted-foreground">Gestiona todas tus facturas en un solo lugar</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Factura
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por número o cliente..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
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
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filtros
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFacturas.map((factura) => (
                      <TableRow key={factura.id}>
                        <TableCell className="font-medium">{factura.id}</TableCell>
                        <TableCell>{factura.client}</TableCell>
                        <TableCell>{factura.date}</TableCell>
                        <TableCell className="text-right">{factura.amount}</TableCell>
                        <TableCell>
                          <Badge className={
                            factura.status === "paid" ? "bg-green-100 text-green-800" :
                            factura.status === "pending" ? "bg-amber-100 text-amber-800" :
                            "bg-red-100 text-red-800"
                          }>
                            {factura.status === "paid" ? (
                              <CheckCircle className="mr-1 h-3 w-3 inline" />
                            ) : factura.status === "pending" ? (
                              <Calendar className="mr-1 h-3 w-3 inline" />
                            ) : (
                              <AlertCircle className="mr-1 h-3 w-3 inline" />
                            )}
                            {factura.status === "paid" ? "Pagada" : 
                             factura.status === "pending" ? "Pendiente" : "Vencida"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                Ver detalle
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Download className="h-4 w-4" />
                                Descargar PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Printer className="h-4 w-4" />
                                Imprimir
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-destructive">
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>2</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 