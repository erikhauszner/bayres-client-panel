"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Sidebar from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ClientForm from "@/components/client-form"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Bell } from "lucide-react"
import { AvatarImage } from "@radix-ui/react-avatar"
import Header from "@/components/header"

export default function NewClientPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="netflix-scrollbar flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">Crear Nuevo Cliente</h1>
            </div>

            <Card className="netflix-card">
              <ClientForm isEditing={false} />
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 