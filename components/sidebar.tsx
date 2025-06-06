"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, UserCircle, Briefcase, Settings, Menu, X, ChevronRight, BookOpen, DollarSign, Activity, UserCheck, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/auth-context"

// Mapeo de rutas a permisos
const routePermissions: Record<string, string> = {
  "/dashboard": "dashboard:view_tab",
  "/leads": "leads:view_tab",
  "/clientes": "clients:view_tab",
  "/proyectos": "projects:view_tab",
  "/finanzas": "finances:view_tab",
  "/admin/app": "apps:view_tab",
  "/empleados": "employees:view_tab",
  "/admin/leads": "leads:view_admin_tab",
  "/monitoreo": "metrics:view_tab",
  "/roles": "roles:view_tab",
  "/docs": "docs:view_tab",
  "/configuracion": "settings:view_tab",
}

interface NavItemProps {
  icon: React.ReactNode
  title: string
  href: string
  collapsed?: boolean
  permission?: string
}

function NavItem({ icon, title, href, collapsed, permission }: NavItemProps) {
  const pathname = usePathname()
  const { employee } = useAuth()
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(path) || false
  }

  // Verificar si el usuario tiene el permiso requerido
  const hasPermission = () => {
    // Si no se requiere permiso específico o el usuario es admin, mostrar la pestaña
    if (!permission || employee?.role === 'admin') return true
    
    // Verificar si el usuario tiene el permiso requerido
    return employee?.permissions?.includes(permission) || false
  }

  // Si el usuario no tiene permiso, no mostrar la pestaña
  if (!hasPermission()) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
              isActive(href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            {icon}
            {!collapsed && <span>{title}</span>}
            {isActive(href) && !collapsed && (
              <ChevronRight className="ml-auto h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </Link>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{title}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  )
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { employee } = useAuth()

  return (
    <>
      {/* Botón móvil para abrir sidebar */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-20 z-40 rounded-full shadow-md md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 transform flex-col border-r border-border/10 bg-card/30 backdrop-blur-md transition-all duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          collapsed && "md:w-16",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/10 px-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground mr-2">
              B
            </div>
            {!collapsed && <span className="font-bold text-lg">Bayres</span>}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        <div className="netflix-scrollbar flex-1 overflow-y-auto py-4">
          <div className="space-y-4 px-3 py-2">
            <div className="space-y-1">
              <NavItem
                href="/dashboard"
                icon={<LayoutDashboard className="h-4 w-4" />}
                title="Dashboard"
                collapsed={collapsed}
                permission="dashboard:view_tab"
              />
              <NavItem 
                href="/leads" 
                icon={<UserCircle className="h-4 w-4" />} 
                title="Leads" 
                collapsed={collapsed} 
                permission="leads:view_tab"
              />
              <NavItem 
                href="/clientes" 
                icon={<Users className="h-4 w-4" />} 
                title="Clientes" 
                collapsed={collapsed}
                permission="clients:view_tab"
              />
              <NavItem
                href="/proyectos"
                icon={<Briefcase className="h-4 w-4" />}
                title="Proyectos"
                collapsed={collapsed}
                permission="projects:view_tab"
              />
              <NavItem
                href="/finanzas"
                icon={<DollarSign className="h-4 w-4" />}
                title="Finanzas"
                collapsed={collapsed}
                permission="finances:view_tab"
              />
              <NavItem 
                href="/admin/app" 
                icon={<Smartphone className="h-4 w-4" />} 
                title="Apps" 
                collapsed={collapsed}
                permission="apps:view_tab"
              />
            </div>
          </div>
          <div className="px-3 py-2">
            {!collapsed && (
              <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-tight text-muted-foreground">
                Administración
              </h2>
            )}
            <div className="space-y-1">
              <NavItem 
                href="/empleados" 
                icon={<Users className="h-4 w-4" />} 
                title="Empleados" 
                collapsed={collapsed}
                permission="employees:view_tab"
              />
              <NavItem 
                href="/admin/leads" 
                icon={<UserCheck className="h-4 w-4" />} 
                title="Adm. Leads" 
                collapsed={collapsed}
                permission="leads:view_admin_tab"
              />
              <NavItem
                href="/monitoreo"
                icon={<Activity className="h-4 w-4" />}
                title="Monitoreo"
                collapsed={collapsed}
                permission="metrics:view_tab"
              />
              <NavItem 
                href="/roles" 
                icon={<UserCheck className="h-4 w-4" />} 
                title="Roles" 
                collapsed={collapsed}
                permission="roles:view_tab"
              />
              <NavItem
                href="/docs"
                icon={<BookOpen className="h-4 w-4" />}
                title="Documentación"
                collapsed={collapsed}
                permission="docs:view_tab"
              />
              <NavItem 
                href="/configuracion" 
                icon={<Settings className="h-4 w-4" />} 
                title="Configuración" 
                collapsed={collapsed}
                permission="settings:view_tab"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
