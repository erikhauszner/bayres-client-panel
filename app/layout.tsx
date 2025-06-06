import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import WebSocketListener from "@/components/websocket-listener"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Panel de Gestión de Leads | Bayres CRM",
  description: "Gestiona tus leads y oportunidades de negocio de manera eficiente",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} h-full`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
            {/* Usando WebSockets para notificaciones en tiempo real */}
            <WebSocketListener />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
