import { redirect } from "next/navigation"
import type { Metadata } from "next"
import Dashboard from "@/components/dashboard"

export const metadata: Metadata = {
  title: "Dashboard | Bayres CRM",
  description: "Panel de control principal del sistema Bayres CRM",
}

export default function Home() {
  // Redirigir a la página de login o dashboard según estado de autenticación
  redirect("/login")
  return null
}
