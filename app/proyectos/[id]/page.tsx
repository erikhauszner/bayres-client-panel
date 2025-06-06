import { Suspense } from "react"
import { notFound } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import ProjectDetail from "@/components/project-detail"

interface ProjectPageProps {
  params: {
    id: string
  }
}

// Página de detalles de proyecto - Usando la sintaxis recomendada para Next.js App Router
export default function ProjectDetailPage({ params }: ProjectPageProps) {
  // Accedemos directamente al ID, ya que estamos usando una página del lado del cliente
  const projectId = params.id

  // Verificar que el ID existe
  if (!projectId) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<div>Cargando detalles del proyecto...</div>}>
            <ProjectDetail projectId={projectId} />
          </Suspense>
        </main>
      </div>
    </div>
  )
} 