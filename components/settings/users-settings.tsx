"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Users, 
  UserPlus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCog, 
  LockKeyhole, 
  Shield, 
  LogOut, 
  Mail,
  User,
  Phone,
  ShieldCheck,
  Building
} from "lucide-react"

// Datos de ejemplo
const mockUsers = [
  { 
    id: 'user-001', 
    name: 'Juan Díaz', 
    email: 'juan.diaz@ejemplo.com', 
    role: 'admin', 
    department: 'Dirección',
    status: 'active',
    lastLogin: '2023-06-15T14:30:00Z'
  },
  { 
    id: 'user-002', 
    name: 'Ana Martínez', 
    email: 'ana.martinez@ejemplo.com', 
    role: 'manager', 
    department: 'Ventas',
    status: 'active',
    lastLogin: '2023-06-16T09:15:00Z'
  },
  { 
    id: 'user-003', 
    name: 'Carlos López', 
    email: 'carlos.lopez@ejemplo.com', 
    role: 'user', 
    department: 'Desarrollo',
    status: 'active',
    lastLogin: '2023-06-14T11:45:00Z'
  },
  { 
    id: 'user-004', 
    name: 'Laura Sánchez', 
    email: 'laura.sanchez@ejemplo.com', 
    role: 'user', 
    department: 'Diseño',
    status: 'inactive',
    lastLogin: '2023-05-20T16:30:00Z'
  }
]

const mockRoles = [
  { 
    id: 'role-001', 
    name: 'Administrador', 
    code: 'admin', 
    description: 'Acceso completo a todas las funciones',
    users: 1
  },
  { 
    id: 'role-002', 
    name: 'Gerente', 
    code: 'manager', 
    description: 'Acceso a gestión de personal y proyectos',
    users: 1
  },
  { 
    id: 'role-003', 
    name: 'Usuario', 
    code: 'user', 
    description: 'Acceso básico al sistema',
    users: 2
  }
]

const mockDepartments = [
  { id: 'dept-001', name: 'Dirección', users: 1 },
  { id: 'dept-002', name: 'Ventas', users: 1 },
  { id: 'dept-003', name: 'Desarrollo', users: 1 },
  { id: 'dept-004', name: 'Diseño', users: 1 }
]

// Componente principal
export default function UsersSettings() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("usuarios")
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState(mockUsers)
  const [roles, setRoles] = useState(mockRoles)
  const [departments, setDepartments] = useState(mockDepartments)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false)
  const [userEditMode, setUserEditMode] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  // Datos de formulario para usuario
  const [userFormData, setUserFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'active'
  })
  
  // Datos de formulario para rol
  const [roleFormData, setRoleFormData] = useState({
    id: '',
    name: '',
    code: '',
    description: '',
    permissions: {
      dashboard: false,
      users: false,
      finance: false,
      projects: false,
      clients: false,
      settings: false
    }
  })
  
  // Datos de formulario para departamento
  const [departmentFormData, setDepartmentFormData] = useState({
    id: '',
    name: '',
    description: ''
  })
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400">
            <ShieldCheck className="mr-1 h-3 w-3 inline" />
            Administrador
          </Badge>
        )
      case 'manager':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400">
            <UserCog className="mr-1 h-3 w-3 inline" />
            Gerente
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
            <User className="mr-1 h-3 w-3 inline" />
            Usuario
          </Badge>
        )
    }
  }
  
  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
          Activo
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
          Inactivo
        </Badge>
      )
    }
  }
  
  const openNewUserDialog = () => {
    setUserEditMode(false)
    setSelectedUser(null)
    setUserFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      status: 'active'
    })
    setIsUserDialogOpen(true)
  }
  
  const openEditUserDialog = (user: any) => {
    setUserEditMode(true)
    setSelectedUser(user)
    setUserFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      department: user.department,
      status: user.status
    })
    setIsUserDialogOpen(true)
  }
  
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleUserSelectChange = (name: string, value: string) => {
    setUserFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSaveUser = () => {
    setIsLoading(true)
    
    // Simulación de guardado
    setTimeout(() => {
      if (userEditMode) {
        // Actualizar usuario existente
        setUsers(users.map(user => 
          user.id === userFormData.id ? 
          { ...user, 
            name: userFormData.name, 
            email: userFormData.email,
            role: userFormData.role,
            department: userFormData.department,
            status: userFormData.status
          } : user
        ))
        
        toast({
          title: "Usuario actualizado",
          description: `El usuario ${userFormData.name} ha sido actualizado`
        })
      } else {
        // Crear nuevo usuario
        const newUser = {
          id: `user-${Date.now()}`,
          name: userFormData.name,
          email: userFormData.email,
          role: userFormData.role,
          department: userFormData.department,
          status: userFormData.status,
          lastLogin: '-'
        }
        
        setUsers([...users, newUser])
        
        toast({
          title: "Usuario creado",
          description: `El usuario ${userFormData.name} ha sido creado`
        })
      }
      
      setIsLoading(false)
      setIsUserDialogOpen(false)
    }, 500)
  }
  
  const handleDeleteUser = (userId: string) => {
    // Simulación de eliminación
    setUsers(users.filter(user => user.id !== userId))
    
    toast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado correctamente"
    })
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline-block">Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline-block">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="departamentos" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline-block">Departamentos</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Pestaña de Usuarios */}
        <TabsContent value="usuarios" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Usuarios del Sistema</h3>
            <Button size="sm" onClick={openNewUserDialog}>
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.lastLogin === '-' ? '-' : new Date(user.lastLogin).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditUserDialog(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <LockKeyhole className="mr-2 h-4 w-4" />
                              <span>Cambiar contraseña</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Cerrar sesión</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Roles */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Roles y Permisos</h3>
            <Button size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Nuevo Rol
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1 py-0.5 text-xs">
                          {role.code}
                        </code>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>{role.users}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Permisos</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Departamentos */}
        <TabsContent value="departamentos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Departamentos</h3>
            <Button size="sm">
              <Building className="h-4 w-4 mr-2" />
              Nuevo Departamento
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{dept.users}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para crear/editar usuario */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {userEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {userEditMode 
                ? 'Modifica los datos del usuario existente' 
                : 'Agrega un nuevo usuario al sistema'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={userFormData.name} 
                  onChange={handleUserFormChange} 
                  placeholder="Nombre y apellidos" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    value={userFormData.email} 
                    onChange={handleUserFormChange} 
                    placeholder="correo@ejemplo.com" 
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={userFormData.phone} 
                    onChange={handleUserFormChange} 
                    placeholder="+34 600 123 456" 
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select 
                  value={userFormData.status} 
                  onValueChange={(value) => handleUserSelectChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select 
                  value={userFormData.role} 
                  onValueChange={(value) => handleUserSelectChange('role', value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Select 
                  value={userFormData.department} 
                  onValueChange={(value) => handleUserSelectChange('department', value)}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Selecciona un departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dirección">Dirección</SelectItem>
                    <SelectItem value="Ventas">Ventas</SelectItem>
                    <SelectItem value="Desarrollo">Desarrollo</SelectItem>
                    <SelectItem value="Diseño">Diseño</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {!userEditMode && (
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <div className="text-sm text-muted-foreground">
                  Se enviará un correo electrónico al usuario con instrucciones para establecer su contraseña.
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser} disabled={isLoading}>
              {isLoading ? 'Guardando...' : (userEditMode ? 'Guardar Cambios' : 'Crear Usuario')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 