import type { Metadata } from "next"
import EmployeesPanel from "@/components/employees-panel"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"

export const metadata: Metadata = {
  title: "Gestión de Empleados | Bayres CRM",
  description: "Gestiona los empleados del sistema",
}

export default function EmployeesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <EmployeesPanel />
        </main>
      </div>
    </div>
  )
} 