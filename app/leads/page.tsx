import LeadsPanel from "@/components/leads-panel"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"

export default function LeadsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <LeadsPanel />
        </main>
      </div>
    </div>
  )
}
