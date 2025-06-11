"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import { ApiTester } from '@/components/ui/api-tester'

export default function ApiTestPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col space-y-6 p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Prueba de API</h1>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Herramienta de Prueba</CardTitle>
                  <CardDescription>
                    Utiliza esta herramienta para probar las rutas de API y depurar problemas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ApiTester />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Instrucciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">¿Cómo usar?</h3>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Elige el método HTTP (GET, POST, PUT, DELETE)</li>
                      <li>Ingresa la ruta relativa (sin el prefijo /api)</li>
                      <li>Si usas POST o PUT, proporciona un payload JSON válido</li>
                      <li>Haz clic en "Enviar solicitud" para realizar la petición</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Rutas de Prueba</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">employees/status/current</code> - Estado del empleado actual</li>
                      <li><code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">employees/status/all</code> - Estado de todos los empleados</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 