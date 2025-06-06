import type { Metadata } from "next"
import EditRoleForm from "@/components/edit-role-page-form"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Editar Rol | Bayres CRM",
  description: "Edita un rol existente en el sistema",
}

interface EditRolePageProps {
  params: {
    id: string;
  };
}

export default async function EditRolePage(props: EditRolePageProps) {
  // Esperamos a que los parámetros estén disponibles
  const params = await Promise.resolve(props.params);
  const roleId = params.id;
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center gap-2">
              <Link href="/roles">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Volver</span>
                </Button>
              </Link>
              <h1 className="text-2xl font-bold tracking-tight">Editar Rol</h1>
            </div>
            <EditRoleForm roleId={roleId} />
          </div>
        </main>
      </div>
    </div>
  )
} 