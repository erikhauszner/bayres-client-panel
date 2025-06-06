"use client"

import React from "react"
import EmployeeForm from "@/components/employee-form"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { useParams } from "next/navigation"

interface EditEmployeePageProps {
  params: Promise<{ id: string }>
}

export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = React.use(params)
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <EmployeeForm employeeId={id} isEdit={true} />
        </main>
      </div>
    </div>
  )
} 