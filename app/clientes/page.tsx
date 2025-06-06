import type { Metadata } from "next"
import ClientsPanel from "@/components/clients-panel"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"

export const metadata: Metadata = {
  title: "Gestión de Clientes | Bayres CRM",
  description: "Gestiona los clientes y sus datos",
}

export default function ClientsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <ClientsPanel />
        </main>
      </div>
    </div>
  )
}
