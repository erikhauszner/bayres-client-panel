"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  CreditCard, 
  Building2, 
  Users, 
  BarChart2,
  Calendar,
  BriefcaseBusiness,
  Calculator,
  Wallet,
  BadgeDollarSign,
  Receipt,
  PieChart,
  Plus,
  ClipboardCheck,
  BadgePlus,
  PlusSquare,
  PlusCircle,
  CheckCircle,
  CheckSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import FinanceDashboard from "@/components/finance/finance-dashboard"
import FinancialAccounts from "@/components/finance/financial-accounts" 
import IncomeManagement from "@/components/finance/collections-management"
import ExpensesManagement from "@/components/finance/expenses-management"
import PayrollManagement from "@/components/finance/payroll-management"
import DividendsManagement from "@/components/finance/dividends-management"
import BudgetsManagement from "@/components/finance/budgets-management"
import FinancialReports from "@/components/finance/financial-reports"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function FinanzasPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Finanzas</h1>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto" asChild>
                  <Link href="/finanzas/exportar">
                    <Calendar className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Exportar Reportes</span>
                  </Link>
                </Button>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-9 w-full sm:w-auto">
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden xs:inline">Nueva Transacción</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Nueva Transacción</DialogTitle>
                      <DialogDescription>
                        Selecciona el tipo de transacción que deseas registrar
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <Button 
                        className="h-24 flex-col"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        asChild
                      >
                        <Link href="/finanzas/nuevo-ingreso">
                          <TrendingUp className="h-8 w-8 mb-2 text-green-500" />
                          <span>Nuevo Ingreso</span>
                        </Link>
                      </Button>
                      <Button 
                        className="h-24 flex-col"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        asChild
                      >
                        <Link href="/finanzas/nuevo-gasto">
                          <TrendingDown className="h-8 w-8 mb-2 text-red-500" />
                          <span>Nuevo Gasto</span>
                        </Link>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="overflow-x-auto pb-2">
                <TabsList className="inline-flex min-w-max w-full md:w-auto">
                  <TabsTrigger value="dashboard" className="flex items-center">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="accounts" className="flex items-center">
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Tesorería</span>
                  </TabsTrigger>
                  <TabsTrigger value="income" className="flex items-center">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    <span>Ingresos</span>
                  </TabsTrigger>
                  <TabsTrigger value="expenses" className="flex items-center">
                    <TrendingDown className="mr-2 h-4 w-4" />
                    <span>Egresos</span>
                  </TabsTrigger>
                  <TabsTrigger value="payroll" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Nómina</span>
                  </TabsTrigger>
                  <TabsTrigger value="dividends" className="flex items-center">
                    <BadgeDollarSign className="mr-2 h-4 w-4" />
                    <span>Dividendos</span>
                  </TabsTrigger>
                  <TabsTrigger value="budgets" className="flex items-center">
                    <Calculator className="mr-2 h-4 w-4" />
                    <span>Presupuestos</span>
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="flex items-center">
                    <PieChart className="mr-2 h-4 w-4" />
                    <span>Reportes</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
                <FinanceDashboard />
              </TabsContent>
              
              <TabsContent value="accounts" className="space-y-4 sm:space-y-6">
                <FinancialAccounts />
              </TabsContent>
              
              <TabsContent value="income" className="space-y-4 sm:space-y-6">
                <IncomeManagement />
              </TabsContent>
              
              <TabsContent value="expenses" className="space-y-4 sm:space-y-6">
                <ExpensesManagement />
              </TabsContent>
              
              <TabsContent value="payroll" className="space-y-4 sm:space-y-6">
                <PayrollManagement />
              </TabsContent>
              
              <TabsContent value="dividends" className="space-y-4 sm:space-y-6">
                <DividendsManagement />
              </TabsContent>
              
              <TabsContent value="budgets" className="space-y-4 sm:space-y-6">
                <BudgetsManagement />
              </TabsContent>
              
              <TabsContent value="reports" className="space-y-4 sm:space-y-6">
                <FinancialReports />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
} 