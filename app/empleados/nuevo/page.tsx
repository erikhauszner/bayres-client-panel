"use client"

import EmployeeForm from "@/components/employee-form";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

export default function NewEmployeePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <EmployeeForm isEdit={false} />
        </main>
      </div>
    </div>
  );
} 