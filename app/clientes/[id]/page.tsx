"use client"

import React from "react"
import { useParams } from "next/navigation"
import ClientProfile from "@/components/client-profile"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

interface ClientPageProps {
  params: Promise<{ id: string }>
}

export default function ClientPage({ params }: ClientPageProps) {
  const { id } = React.use(params)
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <ClientProfile id={id} />
        </main>
      </div>
    </div>
  )
}
