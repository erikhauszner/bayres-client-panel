"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { financeService } from "@/lib/services/financeService"
import { ExpenseCategory, TransactionCategory, TransactionType } from "@/lib/types/finance"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Check, Edit, MoreHorizontal, Plus, Trash2, TrendingDown, TrendingUp, ArrowLeftRight, UserPlus, Activity, Building2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import api from "@/lib/api"
import { Badge } from "@/components/ui/badge"

// Interfaces para las nuevas categorías
interface LeadOriginCategory {
  _id?: string
  name: string
  description?: string
}

interface LeadStageCategory {
  _id?: string
  name: string
  description?: string
  isSystem?: boolean
}

interface DepartmentCategory {
  _id?: string
  name: string
  description?: string
}

export default function CategoriesSettings() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("gastos")
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
  const [transactionCategories, setTransactionCategories] = useState<TransactionCategory[]>([])
  const [leadOriginCategories, setLeadOriginCategories] = useState<LeadOriginCategory[]>([])
  const [leadStageCategories, setLeadStageCategories] = useState<LeadStageCategory[]>([])
  const [departmentCategories, setDepartmentCategories] = useState<DepartmentCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | TransactionCategory | LeadOriginCategory | LeadStageCategory | DepartmentCategory | null>(null)
  const [editMode, setEditMode] = useState(false)
  
  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<{
    category: ExpenseCategory | TransactionCategory | LeadOriginCategory | LeadStageCategory | DepartmentCategory,
    categoryType: 'expense' | 'transaction' | 'leadOrigin' | 'leadStage' | 'department'
  } | null>(null)
  
  // Formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'expense' as 'expense' | 'income' | 'transfer' | 'leadOrigin' | 'leadStage' | 'department',
    color: '#4CAF50'
  })
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    setIsLoading(true)
    try {
      const expenseCategoriesData = await financeService.getExpenseCategories()
      setExpenseCategories(expenseCategoriesData)
      
      const transactionCategoriesData = await financeService.getTransactionCategories()
      setTransactionCategories(transactionCategoriesData)

      // Cargar datos de orígenes de leads
      try {
        const leadOriginData = await api.get('/leads/categories/origins')
        setLeadOriginCategories(leadOriginData.data || [])
      } catch (error) {
        console.error("Error al cargar orígenes de leads:", error)
      }

      // Cargar datos de etapas de leads
      try {
        const leadStageData = await api.get('/leads/categories/stages')
        setLeadStageCategories(leadStageData.data || [])
      } catch (error) {
        console.error("Error al cargar etapas de leads:", error)
      }

      // Cargar datos de departamentos
      try {
        const departmentData = await api.get('/departments')
        setDepartmentCategories(departmentData.data || [])
      } catch (error) {
        console.error("Error al cargar departamentos:", error)
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const openNewCategoryDialog = (categoryType: 'expense' | 'income' | 'transfer' | 'leadOrigin' | 'leadStage' | 'department') => {
    setSelectedCategory(null)
    setEditMode(false)
    setFormData({
      name: '',
      description: '',
      type: categoryType,
      color: categoryType === 'expense' ? '#F44336' : '#4CAF50'
    })
    setIsDialogOpen(true)
  }
  
  const openEditCategoryDialog = (
    category: ExpenseCategory | TransactionCategory | LeadOriginCategory | LeadStageCategory | DepartmentCategory, 
    categoryType: 'expense' | 'transaction' | 'leadOrigin' | 'leadStage' | 'department' = 'expense'
  ) => {
    setSelectedCategory(category)
    setEditMode(true)
    
    if (categoryType === 'transaction') {
      const transCategory = category as TransactionCategory
      setFormData({
        name: transCategory.name,
        description: transCategory.description || '',
        type: transCategory.type,
        color: transCategory.color || '#4CAF50'
      })
    } else if (categoryType === 'leadOrigin' || categoryType === 'leadStage' || categoryType === 'department') {
      setFormData({
        name: category.name,
        description: category.description || '',
        type: categoryType,
        color: '#4CAF50'
      })
    } else {
      const expCategory = category as ExpenseCategory
      setFormData({
        name: expCategory.name,
        description: expCategory.description || '',
        type: 'expense',
        color: '#F44336'
      })
    }
    
    setIsDialogOpen(true)
  }
  
  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "El nombre de la categoría es obligatorio",
          variant: "destructive"
        })
        return
      }
      
      let result = null;
      
      // Manejo de categorías según su tipo
      if (formData.type === 'expense') {
        if (editMode && selectedCategory) {
          const expCat = selectedCategory as ExpenseCategory
          result = await financeService.updateExpenseCategory(expCat._id!, {
            name: formData.name,
            description: formData.description
          })
        } else {
          result = await financeService.createExpenseCategory({
            name: formData.name,
            description: formData.description
          })
        }
      } else if (formData.type === 'income' || formData.type === 'transfer') {
        if (editMode && selectedCategory) {
          const transCat = selectedCategory as TransactionCategory
          result = await financeService.updateTransactionCategory(transCat._id!, {
            name: formData.name,
            description: formData.description,
            type: formData.type as TransactionType,
            color: formData.color
          })
        } else {
          result = await financeService.createTransactionCategory({
            name: formData.name,
            description: formData.description,
            type: formData.type as TransactionType,
            color: formData.color
          })
        }
      } else if (formData.type === 'leadOrigin') {
        // Manejo para orígenes de leads
        if (editMode && selectedCategory) {
          const originCat = selectedCategory as LeadOriginCategory
          result = await api.put(`/leads/categories/origins/${originCat._id}`, {
            name: formData.name,
            description: formData.description
          })
        } else {
          result = await api.post('/leads/categories/origins', {
            name: formData.name,
            description: formData.description
          })
        }
      } else if (formData.type === 'leadStage') {
        // Manejo para etapas de leads
        if (editMode && selectedCategory) {
          const stageCat = selectedCategory as LeadStageCategory
          result = await api.put(`/leads/categories/stages/${stageCat._id}`, {
            name: formData.name,
            description: formData.description
          })
        } else {
          result = await api.post('/leads/categories/stages', {
            name: formData.name,
            description: formData.description
          })
        }
      } else if (formData.type === 'department') {
        // Manejo para departamentos
        if (editMode && selectedCategory) {
          const deptCat = selectedCategory as DepartmentCategory
          result = await api.put(`/departments/${deptCat._id}`, {
            name: formData.name,
            description: formData.description
          })
        } else {
          result = await api.post('/departments', {
            name: formData.name,
            description: formData.description
          })
        }
      }
      
      if (result) {
        toast({
          title: editMode ? "Categoría actualizada" : "Categoría creada",
          description: `La categoría ha sido ${editMode ? 'actualizada' : 'creada'} con éxito`
        })
        
        setIsDialogOpen(false)
        loadData()
      }
    } catch (error) {
      console.error("Error al guardar categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la categoría",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const confirmDeleteCategory = (
    category: ExpenseCategory | TransactionCategory | LeadOriginCategory | LeadStageCategory | DepartmentCategory, 
    categoryType: 'expense' | 'transaction' | 'leadOrigin' | 'leadStage' | 'department' = 'expense'
  ) => {
    // Verificar si es una etapa del sistema
    if (categoryType === 'leadStage' && (category as LeadStageCategory).isSystem) {
      toast({
        title: "No permitido",
        description: "No se pueden eliminar las etapas del sistema",
        variant: "destructive"
      });
      return;
    }
    
    setCategoryToDelete({ category, categoryType });
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    const { category, categoryType } = categoryToDelete;
    
    try {
      setIsLoading(true);
      
      let success = false;
      
      if (categoryType === 'transaction') {
        // Eliminar categoría de transacción
        const transCat = category as TransactionCategory;
        
        if (!transCat._id) {
          throw new Error("ID de categoría no disponible");
        }
        
        success = await financeService.deleteTransactionCategory(transCat._id);
      } else if (categoryType === 'expense') {
        // Eliminar categoría de gasto
        const expenseCat = category as ExpenseCategory;
        
        if (!expenseCat._id) {
          throw new Error("ID de categoría no disponible");
        }
        
        success = await financeService.deleteExpenseCategory(expenseCat._id);
      } else if (categoryType === 'leadOrigin') {
        // Eliminar origen de lead
        const originCat = category as LeadOriginCategory;
        if (!originCat._id) {
          throw new Error("ID de categoría no disponible");
        }
        const response = await api.delete(`/leads/categories/origins/${originCat._id}`);
        success = response.status === 200;
      } else if (categoryType === 'leadStage') {
        // Eliminar etapa de lead
        const stageCat = category as LeadStageCategory;
        if (!stageCat._id) {
          throw new Error("ID de categoría no disponible");
        }
        const response = await api.delete(`/leads/categories/stages/${stageCat._id}`);
        success = response.status === 200;
      } else if (categoryType === 'department') {
        // Eliminar departamento
        const deptCat = category as DepartmentCategory;
        if (!deptCat._id) {
          throw new Error("ID de categoría no disponible");
        }
        const response = await api.delete(`/departments/${deptCat._id}`);
        success = response.status === 200;
      }
      
      if (success) {
        toast({
          title: "Categoría eliminada",
          description: `La categoría ${category.name} ha sido eliminada`
        });
        
        // Recargar datos
        await loadData();
      } else {
        throw new Error("No se pudo eliminar la categoría");
      }
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  }
  
  const getCategoryIcon = (type: string) => {
    switch(type) {
      case 'expense': return <TrendingDown className="h-4 w-4 text-destructive" />
      case 'income': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'transfer': return <ArrowLeftRight className="h-4 w-4 text-blue-500" />
      case 'leadOrigin': return <UserPlus className="h-4 w-4 text-purple-500" />
      case 'leadStage': return <Activity className="h-4 w-4 text-orange-500" />
      case 'department': return <Building2 className="h-4 w-4 text-cyan-500" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="gastos">Categorías de Egresos</TabsTrigger>
          <TabsTrigger value="ingresos">Categorías de Ingresos</TabsTrigger>
          <TabsTrigger value="origenLeads">Origen Leads</TabsTrigger>
          <TabsTrigger value="etapaLeads">Etapa Leads</TabsTrigger>
          <TabsTrigger value="departamentos">Departamentos</TabsTrigger>
        </TabsList>
        
        {/* Categorías de Egresos */}
        <TabsContent value="gastos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Categorías de Egresos</h3>
            <Button size="sm" onClick={() => openNewCategoryDialog('expense')}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        Cargando categorías...
                      </TableCell>
                    </TableRow>
                  ) : expenseCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No hay categorías de egresos definidas
                      </TableCell>
                    </TableRow>
                  ) :
                    expenseCategories.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditCategoryDialog(category, 'expense')}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => confirmDeleteCategory(category, 'expense')}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
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
          <div className="text-sm text-muted-foreground">
            <p>Las categorías de egresos te permiten clasificar los gastos por tipo.</p>
          </div>
        </TabsContent>
        
        {/* Categorías de Ingresos */}
        <TabsContent value="ingresos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Categorías de Ingresos</h3>
            <Button size="sm" onClick={() => openNewCategoryDialog('income')}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Cargando categorías...
                      </TableCell>
                    </TableRow>
                  ) : transactionCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No hay categorías de ingresos definidas
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactionCategories.filter(cat => cat.type === (activeTab === "gastos" ? "expense" : "income")).map((category) => (
                      <TableRow key={category._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {getCategoryIcon(category.type)}
                            <span className="ml-2">{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditCategoryDialog(category, 'transaction')}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => confirmDeleteCategory(category, 'transaction')}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="text-sm text-muted-foreground">
            <p>Las categorías de ingresos y transacciones te permiten clasificar los flujos de efectivo.</p>
          </div>
        </TabsContent>

        {/* Origen Leads */}
        <TabsContent value="origenLeads" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Categorías de Origen de Leads</h3>
            <Button size="sm" onClick={() => openNewCategoryDialog('leadOrigin')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Origen
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        Cargando orígenes...
                      </TableCell>
                    </TableRow>
                  ) : leadOriginCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No hay orígenes de leads definidos
                      </TableCell>
                    </TableRow>
                  ) : (
                    leadOriginCategories.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <UserPlus className="h-4 w-4 text-purple-500 mr-2" />
                            <span>{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditCategoryDialog(category, 'leadOrigin')}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => confirmDeleteCategory(category, 'leadOrigin')}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="text-sm text-muted-foreground">
            <p>Las categorías de origen de leads te permiten clasificar de dónde provienen tus prospectos.</p>
          </div>
        </TabsContent>

        {/* Etapa Leads */}
        <TabsContent value="etapaLeads" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Categorías de Etapas de Leads</h3>
            <Button size="sm" onClick={() => openNewCategoryDialog('leadStage')}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Etapa
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        Cargando etapas...
                      </TableCell>
                    </TableRow>
                  ) : leadStageCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No hay etapas de leads definidas
                      </TableCell>
                    </TableRow>
                  ) : (
                    leadStageCategories.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 text-orange-500 mr-2" />
                            <span>{category.name}</span>
                            {category.isSystem && (
                              <Badge variant="outline" className="ml-2 bg-blue-950/30 text-blue-400 border-blue-800/30 text-xs">
                                Sistema
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditCategoryDialog(category, 'leadStage')}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => confirmDeleteCategory(category, 'leadStage')}
                                disabled={category.isSystem}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {category.isSystem ? 'No se puede eliminar' : 'Eliminar'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="text-sm text-muted-foreground">
            <p>Las categorías de etapas de leads te permiten clasificar en qué fase del proceso de venta se encuentran tus prospectos.</p>
          </div>
        </TabsContent>

        {/* Departamentos */}
        <TabsContent value="departamentos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Categorías de Departamentos</h3>
            <Button size="sm" onClick={() => openNewCategoryDialog('department')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Departamento
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        Cargando departamentos...
                      </TableCell>
                    </TableRow>
                  ) : departmentCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No hay departamentos definidos
                      </TableCell>
                    </TableRow>
                  ) : (
                    departmentCategories.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-cyan-500 mr-2" />
                            <span>{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditCategoryDialog(category, 'department')}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => confirmDeleteCategory(category, 'department')}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="text-sm text-muted-foreground">
            <p>Las categorías de departamentos te permiten organizar tu empresa en áreas funcionales.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para crear/editar categorías */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? "Editar" : "Crear"} Categoría</DialogTitle>
            <DialogDescription>
              {editMode 
                ? "Modifica los detalles de la categoría seleccionada" 
                : "Completa los detalles para crear una nueva categoría"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="Nombre de la categoría" 
              />
            </div>
            
            {editMode && activeTab === "ingresos" && (
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de transacción</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectChange('type', value)}
                  disabled={editMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                        <span>Ingreso</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="expense">
                      <div className="flex items-center">
                        <TrendingDown className="h-4 w-4 text-destructive mr-2" />
                        <span>Egreso</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="transfer">
                      <div className="flex items-center">
                        <ArrowLeftRight className="h-4 w-4 text-blue-500 mr-2" />
                        <span>Transferencia</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Describe el propósito de esta categoría" 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Guardando..." : editMode ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar categoría */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          {categoryToDelete && (
            <div className="py-4">
              <p className="text-center font-semibold text-lg">
                {categoryToDelete.category.name}
              </p>
              {categoryToDelete.category.description && (
                <p className="text-center text-muted-foreground">
                  {categoryToDelete.category.description}
                </p>
              )}
            </div>
          )}
          
          <DialogFooter className="flex flex-row justify-between sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteCategory}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Eliminando...
                </span>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 