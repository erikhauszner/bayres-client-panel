import type { Metadata } from "next"
import EmployeesPanel from "@/components/employees-panel"

export const metadata: Metadata = {
  title: "Empleados | Panel de Control",
  description: "Gestiona los empleados del sistema",
}

export default function EmployeesPage() {
  return <EmployeesPanel />
}
