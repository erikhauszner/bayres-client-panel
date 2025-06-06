"use client"

import React from "react"
import { useParams } from "next/navigation"
import ClientProfile from "@/components/client-profile"

interface ClientPageProps {
  params: Promise<{ id: string }>
}

export default function ClientPage({ params }: ClientPageProps) {
  const { id } = React.use(params)
  
  return <ClientProfile id={id} />
}
