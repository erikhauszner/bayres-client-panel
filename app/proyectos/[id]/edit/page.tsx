import { Suspense } from "react"
import { notFound } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import EditProjectForm from "@/components/edit-project-form"

interface EditProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id: projectId } = await params

  if (!projectId) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <Suspense fallback={<div>Cargando formulario de edición...</div>}>
            <EditProjectForm projectId={projectId} />
          </Suspense>
        </main>
      </div>
    </div>
  )
} 