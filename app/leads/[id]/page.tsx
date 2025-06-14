"use client"

import React from "react"
import { useParams } from "next/navigation"
import LeadProfile from "@/components/lead-profile"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

interface LeadPageProps {
  params: Promise<{ id: string }>
}

export default function LeadPage({ params }: LeadPageProps) {
  const { id } = React.use(params)
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <LeadProfile id={id} />
        </main>
      </div>
    </div>
  )
}
