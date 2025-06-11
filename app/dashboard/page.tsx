import type { Metadata } from "next"
import Dashboard from "@/components/dashboard"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"

export const metadata: Metadata = {
  title: "Panel Principal | Bayres CRM",
  description: "Panel principal del sistema de gestión",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <Dashboard />
        </main>
      </div>
    </div>
  )
} 