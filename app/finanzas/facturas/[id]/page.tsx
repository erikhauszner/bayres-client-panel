"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Printer, CheckCircle, Calendar, AlertCircle, ExternalLink, Send } from "lucide-react"
import Link from "next/link"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import React from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"

// Datos ficticios para una factura de ejemplo
const FACTURA_EJEMPLO = {
  id: "FAC-2023-0042",
  numero: "FAC-2023-0042",
  cliente: {
    id: "client-001",
    nombre: "Empresa ABC S.A.",
    direccion: "Av. Libertador 1234, Piso 8",
    ciudad: "Buenos Aires",
    codigoPostal: "C1123AAB",
    pais: "Argentina",
    cuit: "30-12345678-9",
    email: "contacto@empresaabc.com",
    telefono: "+54 11 4567-8900",
  },
  fecha: "15/06/2023",
  fechaVencimiento: "15/07/2023",
  estado: "paid",
  metodoPago: "Transferencia Bancaria",
  referenciaPago: "TRF-20230620-001",
  fechaPago: "20/06/2023",
  notasInternas: "Cliente VIP - Proyecto de rediseño sitio web",
  items: [
    {
      id: "item-001",
      descripcion: "Desarrollo Frontend - Responsive Design",
      cantidad: 40,
      unidad: "horas",
      precioUnitario: 80,
      total: 3200,
    },
    {
      id: "item-002",
      descripcion: "Implementación CMS Personalizado",
      cantidad: 20,
      unidad: "horas",
      precioUnitario: 80,
      total: 1600,
    },
  ],
  subtotal: 4800,
  impuestos: [
    {
      nombre: "IVA 21%",
      porcentaje: 21,
      monto: 1008,
    }
  ],
  total: 5808,
};

export default function FacturaDetallePage({ params }: { params: { id: string } }) {
  const [factura, setFactura] = useState(FACTURA_EJEMPLO);
  const [isLoading, setIsLoading] = useState(true);
  
  // En un caso real aquí obtendríamos los datos de la factura desde la API
  useEffect(() => {
    // Simulamos una carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [params.id]);
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-pulse text-center">
                <p className="text-muted-foreground">Cargando factura...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  // Función para formatear números como moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value);
  };
  
  // Estado para mostrar un badge con texto legible
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3 inline" /> Pagada
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <Calendar className="mr-1 h-3 w-3 inline" /> Pendiente
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="mr-1 h-3 w-3 inline" /> Vencida
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col space-y-6 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                  <Link href="/finanzas/facturas">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Factura #{factura.numero}</h1>
                  <p className="text-muted-foreground">Emitida el {factura.fecha}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2">
                  <Send className="h-4 w-4" />
                  Enviar por Email
                </Button>
                <Button variant="outline" className="gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Detalles de Factura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Encabezado con datos generales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Facturado a</h3>
                        <p className="font-semibold">{factura.cliente.nombre}</p>
                        <p>{factura.cliente.direccion}</p>
                        <p>{factura.cliente.ciudad}, {factura.cliente.codigoPostal}</p>
                        <p>{factura.cliente.pais}</p>
                        <p className="mt-2">CUIT: {factura.cliente.cuit}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Número:</span>
                          <span>{factura.numero}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Fecha de emisión:</span>
                          <span>{factura.fecha}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Fecha de vencimiento:</span>
                          <span>{factura.fechaVencimiento}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Estado:</span>
                          <span>{getStatusBadge(factura.estado)}</span>
                        </div>
                        {factura.estado === "paid" && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-muted-foreground">Método de pago:</span>
                              <span>{factura.metodoPago}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-muted-foreground">Referencia:</span>
                              <span>{factura.referenciaPago}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-muted-foreground">Fecha de pago:</span>
                              <span>{factura.fechaPago}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Tabla de items */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Detalle de Servicios</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[400px]">Descripción</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Precio Unitario</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {factura.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.descripcion}</TableCell>
                              <TableCell className="text-right">{item.cantidad} {item.unidad}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.precioUnitario)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={3} className="text-right">Subtotal</TableCell>
                            <TableCell className="text-right">{formatCurrency(factura.subtotal)}</TableCell>
                          </TableRow>
                          {factura.impuestos.map((impuesto, index) => (
                            <TableRow key={`tax-${index}`}>
                              <TableCell colSpan={3} className="text-right">{impuesto.nombre}</TableCell>
                              <TableCell className="text-right">{formatCurrency(impuesto.monto)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(factura.total)}</TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </div>
                    
                    {/* Notas y condiciones */}
                    <div className="border-t pt-6">
                      <h3 className="text-sm font-medium mb-2">Notas</h3>
                      <p className="text-sm text-muted-foreground">{factura.notasInternas}</p>
                      
                      <Separator className="my-4" />
                      
                      <h3 className="text-sm font-medium mb-2">Términos y Condiciones</h3>
                      <p className="text-sm text-muted-foreground">
                        El pago debe realizarse dentro de los 30 días siguientes a la fecha de la factura.
                        Pasado este tiempo se aplicarán intereses de demora según la legislación vigente.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Datos Bancarios</h3>
                        <p className="text-sm">Banco: Banco de la Nación Argentina</p>
                        <p className="text-sm">Titular: Bayres Solutions S.A.</p>
                        <p className="text-sm">CUIT: 30-98765432-1</p>
                        <p className="text-sm">CBU: 0110012330001234567890</p>
                        <p className="text-sm">Alias: BAYRES.SOLUTIONS</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Resumen</h3>
                        <div className="flex justify-between mt-2">
                          <span className="text-sm">Subtotal:</span>
                          <span>{formatCurrency(factura.subtotal)}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm">Impuestos:</span>
                          <span>{formatCurrency(factura.impuestos.reduce((acc, tax) => acc + tax.monto, 0))}</span>
                        </div>
                        <div className="flex justify-between mt-3 font-bold">
                          <span>Total:</span>
                          <span>{formatCurrency(factura.total)}</span>
                        </div>
                      </div>
                      
                      {factura.estado === "paid" ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                          <CheckCircle className="mx-auto h-6 w-6 text-green-500 mb-2" />
                          <p className="text-green-800 font-medium">Pagado el {factura.fechaPago}</p>
                          <p className="text-xs text-green-600 mt-1">
                            Vía {factura.metodoPago}
                          </p>
                        </div>
                      ) : (
                        <Button className="w-full">Registrar Pago</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium">{factura.cliente.nombre}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Cliente desde Enero 2022</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 mt-0.5">📧</div>
                          <div>
                            <p className="text-sm">{factura.cliente.email}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 mt-0.5">📞</div>
                          <div>
                            <p className="text-sm">{factura.cliente.telefono}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <Link href={`/clientes/client-001`}>
                          <ExternalLink className="h-4 w-4" />
                          Ver Perfil de Cliente
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 