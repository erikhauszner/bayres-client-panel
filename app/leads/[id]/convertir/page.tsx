"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Sidebar from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Bell } from "lucide-react"
import { leadService } from "@/lib/services/leadService"
import { toast } from "@/components/ui/use-toast"
import ClientForm from "@/components/client-form"
import { AvatarImage } from "@radix-ui/react-avatar"
import Header from "@/components/header"

interface ConvertLeadPageProps {
  params: Promise<{ id: string }>
}

export default function ConvertLeadPage({ params }: ConvertLeadPageProps) {
  const router = useRouter()
  const { id } = React.use(params)
  const [initialData, setInitialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true)
        const lead = await leadService.getLeadById(id)
        // Mapear los datos del lead a los campos del cliente
        setInitialData({
          leadId: id,
          name: `${lead.firstName} ${lead.lastName}`.trim(),
          email: lead.email,
          phone: lead.phone || "",
          type: lead.company ? "business" : "personal",
          businessName: lead.company || "",
          industry: lead.industry || "",
          website: lead.website || "",
          instagram: lead.instagram || "",
          twitter: lead.twitter || "",
          linkedin: lead.linkedin || "",
          facebook: lead.facebook || "",
          address: lead.address || "",
          city: lead.city || "",
          state: lead.state || "",
          country: lead.country || "",
          postalCode: lead.postalCode || "",
          status: "active"
        })
        setError(null)
      } catch (err: any) {
        setError(err.response?.data?.message || "No se pudo cargar la información del lead")
      } finally {
        setLoading(false)
      }
    }
    fetchLead()
  }, [id])

  // Handler para cuando se crea el cliente desde el formulario
  const handleClienteCreado = (clienteId: string) => {
    toast({
      title: "Lead convertido",
      description: "El lead ha sido convertido a cliente exitosamente"
    })
    router.push(`/clientes/${clienteId}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="netflix-scrollbar flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">Convertir Lead a Cliente</h1>
            </div>

            <Card className="netflix-card">
              <div className="p-6">
                {error && (
                  <div className="text-destructive mb-4">{error}</div>
                )}
                {loading ? (
                  <div className="text-muted-foreground">Cargando datos del lead...</div>
                ) : (
                  <ClientForm isEditing={false} initialData={initialData} onClienteCreado={handleClienteCreado} />
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 