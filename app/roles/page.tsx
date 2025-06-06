import type { Metadata } from "next"
import RolesPanel from "@/components/roles-panel"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"

export const metadata: Metadata = {
  title: "Gestión de Roles | Bayres CRM",
  description: "Gestiona los roles y permisos del sistema",
}

export default function RolesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <RolesPanel />
        </main>
      </div>
    </div>
  )
}
