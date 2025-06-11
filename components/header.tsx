"use client"

import { useRouter } from "next/navigation"
import { Settings, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import NotificationsDropdown from "@/components/notifications-dropdown"

export function Header() {
  const router = useRouter()
  const { employee, logout } = useAuth()

  const handleLogout = () => {
    console.log("Cerrando sesión desde Header...")
    logout()
  }

  // Obtener las iniciales del empleado para el avatar
  const getInitials = () => {
    if (employee?.firstName && employee?.lastName) {
      return employee.firstName.charAt(0) + employee.lastName.charAt(0)
    }
    return "U"
  }

  // Determinar el color de fondo basado en el rol (similar a roles-panel)
  const getRoleColor = () => {
    if (!employee?.role) return "bg-primary"

    // Asegurar que employee.role sea un string
    const normalizedRole = typeof employee.role === 'string' ? employee.role.toLowerCase() : String(employee.role).toLowerCase();
    
    const roleColors: { [key: string]: string } = {
      admin: "bg-red-500",
      manager: "bg-purple-500",
      employee: "bg-emerald-500",
      client: "bg-blue-500",
      appointment_setter: "bg-amber-500"
    }

    return roleColors[normalizedRole] || "bg-primary"
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between border-b border-border/10 bg-background/80 px-3 sm:px-4 lg:px-6 backdrop-blur-md">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          B
        </div>
        <h1 className="text-base sm:text-xl font-bold">Bayres Panel</h1>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationsDropdown />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full">
              <Avatar className={`h-7 w-7 sm:h-8 sm:w-8 cursor-pointer ${getRoleColor()} text-white`}>
                <AvatarFallback className="text-xs sm:text-sm">{getInitials()}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Abrir menú de perfil</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 sm:w-56">
            <DropdownMenuItem className="cursor-pointer text-xs sm:text-sm" onClick={() => router.push("/configuracion")}>
              <Settings className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-500 text-xs sm:text-sm" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Header 