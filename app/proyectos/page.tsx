import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import ProjectsDashboard from "@/components/projects-dashboard"

export default function ProjectsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <ProjectsDashboard />
        </main>
      </div>
    </div>
  )
}
