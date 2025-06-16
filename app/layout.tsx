import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import WebSocketListener from "@/components/websocket-listener"
import AuthGuard from "@/components/AuthGuard"
import ActivityTrackerProvider from "@/components/ActivityTrackerProvider"
import { Toaster as SonnerToaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BayresHub - Panel de Control",
  description: "Sistema de gestión empresarial",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Función global para probar notificaciones externas
              window.testExternalNotification = function(title = "🧪 Prueba de Notificación Externa", message = "Esta es una notificación de prueba desde la consola") {
                console.log('🧪 Iniciando prueba de notificación externa desde consola...');
                
                // Acceder al servicio de notificaciones
                if (typeof window !== 'undefined' && window.notificationService) {
                  window.notificationService.testExternalNotification(title, message);
                } else {
                  // Crear y mostrar directamente con sonner como backup
                  if (typeof window.sonner !== 'undefined') {
                    window.sonner.success(title, {
                      description: message,
                      duration: 8000,
                      position: "bottom-right"
                    });
                  } else {
                    console.error('❌ Sistema de notificaciones no disponible');
                  }
                }
              };
              
              // Función para simular notificación de leads
              window.testLeadsNotification = function() {
                window.testExternalNotification("⚡ Obteniendo Leads", "Se inició la obtención de leads desde el sistema externo");
              };
              
              console.log('✅ Funciones de prueba de notificaciones cargadas:');
              console.log('   - testExternalNotification(title?, message?)');
              console.log('   - testLeadsNotification()');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} h-full`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
            <Toaster />
            <SonnerToaster 
              position="bottom-right" 
              richColors 
              closeButton 
              duration={5000}
            />
            {/* Usando WebSockets para notificaciones en tiempo real */}
            <WebSocketListener />
            {/* Sistema de rastreo de actividad automático */}
            <ActivityTrackerProvider />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
