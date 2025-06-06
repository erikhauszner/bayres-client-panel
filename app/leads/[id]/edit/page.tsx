"use client"

import React from "react"
import { useParams } from "next/navigation"
import EditLeadForm from "@/components/edit-lead-form"

interface EditLeadPageProps {
  params: Promise<{ id: string }>
}

export default function EditLeadPage({ params }: EditLeadPageProps) {
  const { id } = React.use(params)
  
  return <EditLeadForm id={id} />
} 