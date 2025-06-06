"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  MapPin,
  Globe,
  Calendar,
  Clock,
  BarChart3,
  MessageSquare,
  FileText,
  Plus,
  User,
  Check,
  Bell,
  AlertCircle,
  Loader2,
  Save,
  X,
  Upload,
  File,
  Building2,
  Image,
  FileJson,
  FileSpreadsheet,
  FileArchive,
  Presentation,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { Lead, LeadInteraction, LeadTask, LeadDocument } from "@/lib/types/lead"
import { leadService } from "@/lib/services/leadService"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { clientService } from '../lib/services/clientService'
import { DropdownMenuItem, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AvatarImage } from "@radix-ui/react-avatar"
import useHasPermission from "@/hooks/useHasPermission"
import api from '../lib/api'
import { CLIENT_URL } from '@/lib/config';

// Interfaces adicionales
interface LeadStageCategory {
  _id: string
  name: string
  description?: string
}

export default function LeadProfile({ id }: { id: string }) {
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Permisos para botones de acciones
  const canAssignLeads = useHasPermission("leads:assign")
  const canApproveLeads = useHasPermission("leads:approve")
  const canRejectLeads = useHasPermission("leads:reject")
  const canEditStage = useHasPermission("leads:edit_stage")
  const canEditAppSettersStage = useHasPermission("leads:stage_edit_appsetters")
  
  // Permisos para pestañas
  const canViewInfoTab = useHasPermission("leads:view_info_tab")
  const canViewActivitiesTab = useHasPermission("leads:view_activities_tab")
  const canViewTasksTab = useHasPermission("leads:view_tasks_tab")
  const canViewDocumentsTab = useHasPermission("leads:view_documents_tab")
  const canViewNotesTab = useHasPermission("leads:view_notes_tab")
  
  // Permisos para botones de actividades
  const canAddActivity = useHasPermission("leads:new_activity")
  const canEditActivity = useHasPermission("leads:edit_activity")
  const canDeleteActivity = useHasPermission("leads:delete_activity")
  
  // Permisos para botones de tareas
  const canAddTask = useHasPermission("leads:new_task")
  const canEditTask = useHasPermission("leads:edit_task")
  const canDeleteTask = useHasPermission("leads:delete_task")
  
  // Permisos para botones de notas
  const canAddNote = useHasPermission("leads:new_note")
  const canEditNote = useHasPermission("leads:edit_note")
  const canDeleteNote = useHasPermission("leads:delete_note")
  
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState<string>("info")
  
  // Configurar la pestaña activa inicial basada en permisos
  useEffect(() => {
    if (canViewInfoTab) setActiveTab("info")
    else if (canViewActivitiesTab) setActiveTab("activities")
    else if (canViewTasksTab) setActiveTab("tasks")
    else if (canViewDocumentsTab) setActiveTab("documents")
    else if (canViewNotesTab) setActiveTab("notes")
  }, [canViewInfoTab, canViewActivitiesTab, canViewTasksTab, canViewDocumentsTab, canViewNotesTab])
  
  // Estados para el modal de interacción
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false)
  const [interactionLoading, setInteractionLoading] = useState(false)
  const [interactionError, setInteractionError] = useState<string | null>(null)
  const [currentInteraction, setCurrentInteraction] = useState<LeadInteraction | null>(null)
  const [interactionForm, setInteractionForm] = useState({
    type: "note",
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Estados para el modal de tareas
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskLoading, setTaskLoading] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [currentTask, setCurrentTask] = useState<LeadTask | null>(null)
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    status: "pending",
    priority: "media"
  })

  // Estados para el modal de documentos
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [documentLoading, setDocumentLoading] = useState(false)
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [currentDocument, setCurrentDocument] = useState<LeadDocument | null>(null)
  const [documentForm, setDocumentForm] = useState({
    name: "",
    description: "",
    tags: "",
    fileUrl: "",
    fileType: "application/pdf"
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Estados para el modal de notas
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [noteLoading, setNoteLoading] = useState(false)
  const [noteError, setNoteError] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState("")
  const [isEditingNote, setIsEditingNote] = useState(false)

  const [leadStageCategories, setLeadStageCategories] = useState<LeadStageCategory[]>([])
  const [isStageModalOpen, setIsStageModalOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<string>("")
  const [stageLoading, setStageLoading] = useState(false)
  
  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        setLoading(true)
        const data = await leadService.getLeadById(id)
        setLead(data)
        setError(null)
      } catch (err: any) {
        console.error(`Error fetching lead with ID ${id}:`, err)
        setError(err.response?.data?.message || "No se pudo cargar la información del lead")
      } finally {
        setLoading(false)
      }
    }

    const fetchLeadStages = async () => {
      try {
        const response = await api.get('/leads/categories/stages')
        setLeadStageCategories(response.data || [])
      } catch (error) {
        console.error('Error al cargar las etapas de leads:', error)
      }
    }

    if (id) {
      fetchLeadData()
      fetchLeadStages()
    }
  }, [id])

  const refreshLeadData = async () => {
    try {
      setLoading(true)
      const data = await leadService.getLeadById(id)
      setLead(data)
      setError(null)
    } catch (err: any) {
      console.error(`Error refreshing lead data:`, err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la información del lead"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInteractionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setInteractionForm(prev => ({ ...prev, [name]: value }))
  }

  const handleInteractionSelectChange = (name: string, value: string) => {
    setInteractionForm(prev => ({ ...prev, [name]: value }))
  }

  const resetInteractionForm = () => {
    setInteractionForm({
      type: "note",
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
    setCurrentInteraction(null)
    setInteractionError(null)
  }

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault()
    setInteractionError(null)
    setInteractionLoading(true)

    try {
      if (currentInteraction?._id) {
        // Actualizar interacción existente
        await leadService.updateInteraction(id, currentInteraction._id, {
          type: interactionForm.type as any,
          title: interactionForm.title,
          description: interactionForm.description,
          date: new Date(interactionForm.date)
        })
        toast({
          title: "Interacción actualizada",
          description: "La interacción ha sido actualizada exitosamente"
        })
      } else {
        // Crear nueva interacción
        await leadService.addInteraction(id, {
          type: interactionForm.type as any,
          title: interactionForm.title,
          description: interactionForm.description,
          date: new Date(interactionForm.date),
          user: ""  // Se completará en el backend con el usuario actual
        })
        toast({
          title: "Interacción añadida",
          description: "La interacción ha sido añadida exitosamente"
        })
      }

      // Cerrar modal y recargar datos
      setIsInteractionModalOpen(false)
      resetInteractionForm()
      await refreshLeadData()
    } catch (err: any) {
      console.error("Error con la interacción:", err)
      setInteractionError(err.response?.data?.message || "No se pudo procesar la interacción")
    } finally {
      setInteractionLoading(false)
    }
  }

  const handleEditInteraction = (interaction: LeadInteraction) => {
    setCurrentInteraction(interaction)
    setInteractionForm({
      type: interaction.type,
      title: interaction.title || "",
      description: interaction.description,
      date: new Date(interaction.date).toISOString().split("T")[0],
    })
    setIsInteractionModalOpen(true)
  }

  const handleDeleteInteraction = async (interactionId: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta interacción?")) {
      try {
        await leadService.deleteInteraction(id, interactionId)
        toast({
          title: "Interacción eliminada",
          description: "La interacción ha sido eliminada exitosamente"
        })
        await refreshLeadData()
      } catch (err: any) {
        console.error("Error al eliminar interacción:", err)
        toast({
          variant: "destructive",
          title: "Error",
          description: err.response?.data?.message || "No se pudo eliminar la interacción"
        })
      }
    }
  }

  // Handlers para el formulario de tareas
  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTaskForm(prev => ({ ...prev, [name]: value }))
  }

  const handleTaskSelectChange = (name: string, value: string) => {
    setTaskForm(prev => ({ ...prev, [name]: value }))
  }

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      status: "pending",
      priority: "media"
    })
    setCurrentTask(null)
    setTaskError(null)
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setTaskError(null)
    setTaskLoading(true)

    try {
      if (currentTask?._id) {
        // Actualizar tarea existente
        await leadService.updateTask(id, currentTask._id, {
          title: taskForm.title,
          description: taskForm.description,
          dueDate: new Date(taskForm.dueDate),
          status: taskForm.status,
          priority: taskForm.priority
        })
        toast({
          title: "Tarea actualizada",
          description: "La tarea ha sido actualizada exitosamente"
        })
      } else {
        // Crear nueva tarea
        await leadService.addTask(id, {
          title: taskForm.title,
          description: taskForm.description,
          dueDate: new Date(taskForm.dueDate),
          status: taskForm.status,
          priority: taskForm.priority,
          user: ""  // Se completará en el backend con el usuario actual
        })
        toast({
          title: "Tarea añadida",
          description: "La tarea ha sido añadida exitosamente"
        })
      }

      // Cerrar modal y recargar datos
      setIsTaskModalOpen(false)
      resetTaskForm()
      await refreshLeadData()
    } catch (err: any) {
      console.error("Error con la tarea:", err)
      setTaskError(err.response?.data?.message || "No se pudo procesar la tarea")
    } finally {
      setTaskLoading(false)
    }
  }

  const handleEditTask = (task: LeadTask) => {
    setCurrentTask(task)
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      status: task.status || "pending",
      priority: task.priority || "media"
    })
    setIsTaskModalOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta tarea?")) {
      try {
        await leadService.deleteTask(id, taskId)
        toast({
          title: "Tarea eliminada",
          description: "La tarea ha sido eliminada exitosamente"
        })
        await refreshLeadData()
      } catch (err: any) {
        console.error("Error al eliminar tarea:", err)
        toast({
          variant: "destructive",
          title: "Error",
          description: err.response?.data?.message || "No se pudo eliminar la tarea"
        })
      }
    }
  }

  // Handlers para el formulario de documentos
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDocumentForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const resetDocumentForm = () => {
    setDocumentForm({
      name: "",
      description: "",
      tags: "",
      fileUrl: "",
      fileType: "application/pdf"
    })
    setSelectedFile(null)
    setCurrentDocument(null)
    setDocumentError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    setDocumentError(null)
    setDocumentLoading(true)

    try {
      if (currentDocument?._id) {
        // Actualizar documento existente
        await leadService.updateDocument(id, currentDocument._id, {
          name: documentForm.name,
          description: documentForm.description,
          tags: documentForm.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
          fileUrl: documentForm.fileUrl,
          fileType: documentForm.fileType
        })
        toast({
          title: "Documento actualizado",
          description: "El documento ha sido actualizado exitosamente"
        })
      } else {
        // Obtener qué pestaña está activa (file o link)
        const activeTab = document.querySelector('[role="tablist"] [data-state="active"]')?.getAttribute('value') || 'file';
        
        if (activeTab === 'file') {
          // Subir archivo a la plataforma
          if (!selectedFile) {
            setDocumentError("Por favor, selecciona un archivo")
            setDocumentLoading(false)
            return
          }
          
          const formData = new FormData()
          formData.append("file", selectedFile)
          formData.append("name", documentForm.name || selectedFile.name)
          formData.append("description", documentForm.description || "")
          formData.append("fileType", documentForm.fileType || "")
          formData.append("isExternalLink", "false")
          
          if (documentForm.tags) {
            documentForm.tags.split(",").forEach(tag => {
              formData.append("tags[]", tag.trim())
            })
          }
          
          await leadService.uploadDocument(id, formData)
          toast({
            title: "Documento subido",
            description: "El archivo ha sido subido exitosamente a la plataforma"
          })
        } else {
          // Añadir enlace a documento externo
          if (!documentForm.fileUrl || documentForm.fileUrl.trim() === '') {
            setDocumentError("Por favor, ingresa un enlace al documento")
            setDocumentLoading(false)
            return
          }
          
          const documentData = {
            name: documentForm.name,
            description: documentForm.description,
            fileUrl: documentForm.fileUrl,
            fileType: documentForm.fileType || "application/octet-stream",
            tags: documentForm.tags ? documentForm.tags.split(",").map(tag => tag.trim()).filter(tag => tag) : [],
            isExternalLink: true
          }
          
          await leadService.uploadDocument(id, documentData)
          toast({
            title: "Documento añadido",
            description: "El enlace al documento externo ha sido añadido exitosamente"
          })
        }
      }

      // Cerrar modal y recargar datos
      setIsDocumentModalOpen(false)
      resetDocumentForm()
      await refreshLeadData()
    } catch (err: any) {
      console.error("Error con el documento:", err)
      setDocumentError(err.response?.data?.message || "No se pudo procesar el documento")
    } finally {
      setDocumentLoading(false)
    }
  }

  const handleEditDocument = (document: LeadDocument) => {
    setCurrentDocument(document)
    setDocumentForm({
      name: document.name || "",
      description: document.description || "",
      tags: document.tags ? document.tags.join(", ") : "",
      fileUrl: document.fileUrl || "",
      fileType: document.fileType || "application/pdf"
    })
    setIsDocumentModalOpen(true)
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este documento?")) {
      try {
        await leadService.deleteDocument(id, documentId)
        toast({
          title: "Documento eliminado",
          description: "El documento ha sido eliminado exitosamente"
        })
        await refreshLeadData()
      } catch (err: any) {
        console.error("Error al eliminar documento:", err)
        toast({
          variant: "destructive",
          title: "Error",
          description: err.response?.data?.message || "No se pudo eliminar el documento"
        })
      }
    }
  }

  // Handlers para el formulario de notas
  const resetNoteForm = () => {
    setNoteContent("")
    setNoteError(null)
    setIsEditingNote(false)
  }

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault()
    setNoteError(null)
    setNoteLoading(true)

    try {
      if (isEditingNote) {
        // Actualizar nota existente
        await leadService.updateNote(id, noteContent)
        toast({
          title: "Nota actualizada",
          description: "La nota ha sido actualizada exitosamente"
        })
      } else {
        // Crear nueva nota
        await leadService.addNote(id, noteContent)
        toast({
          title: "Nota añadida",
          description: "La nota ha sido añadida exitosamente"
        })
      }

      // Cerrar modal y recargar datos
      setIsNoteModalOpen(false)
      resetNoteForm()
      await refreshLeadData()
    } catch (err: any) {
      console.error("Error con la nota:", err)
      setNoteError(err.response?.data?.message || "No se pudo procesar la nota")
    } finally {
      setNoteLoading(false)
    }
  }

  const handleEditNote = () => {
    if (lead?.notes) {
      setNoteContent(lead.notes)
      setIsEditingNote(true)
      setIsNoteModalOpen(true)
    }
  }

  const handleDeleteNote = async () => {
    if (window.confirm("¿Estás seguro de eliminar esta nota?")) {
      try {
        await leadService.deleteNote(id)
        toast({
          title: "Nota eliminada",
          description: "La nota ha sido eliminada exitosamente"
        })
        await refreshLeadData()
      } catch (err: any) {
        console.error("Error al eliminar nota:", err)
        toast({
          variant: "destructive",
          title: "Error",
          description: err.response?.data?.message || "No se pudo eliminar la nota"
        })
      }
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType.split('/')[0]) {
      case 'image':
        return <Image className="h-4 w-4" />
      case 'application':
        if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />
        if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-4 w-4" />
        if (fileType.includes('excel') || fileType.includes('sheet')) return <FileSpreadsheet className="h-4 w-4" />
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return <Presentation className="h-4 w-4" />
        if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return <FileArchive className="h-4 w-4" />
        if (fileType.includes('json')) return <FileJson className="h-4 w-4" />
        return <File className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-950/30 text-red-400 border border-red-800/30"
      case "media":
        return "bg-amber-950/30 text-amber-400 border border-amber-800/30"
      case "baja":
        return "bg-emerald-950/30 text-emerald-400 border border-emerald-800/30"
      default:
        return "bg-slate-950/30 text-slate-400 border border-slate-800/30"
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "nuevo":
        return "bg-blue-950/30 text-blue-400 border border-blue-800/30"
      case "aprobado":
        return "bg-green-950/30 text-green-400 border border-green-800/30"
      case "rechazado":
        return "bg-red-950/30 text-red-400 border border-red-800/30"
      case "asignado":
        return "bg-purple-950/30 text-purple-400 border border-purple-800/30"
      case "convertido":
        return "bg-amber-950/30 text-amber-400 border border-amber-800/30"
      default:
        return "bg-slate-950/30 text-slate-400 border border-slate-800/30"
    }
  }

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "call":
        return <Phone className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "note":
        return <FileText className="h-4 w-4" />
      case "status_change":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Fecha no disponible"
    
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  const getTaskStatusColor = (estado: string) => {
    switch (estado) {
      case "pending":
        return "bg-blue-950/30 text-blue-400 border border-blue-800/30"
      case "in_progress":
        return "bg-amber-950/30 text-amber-400 border border-amber-800/30"
      case "completed":
        return "bg-green-950/30 text-green-400 border border-green-800/30"
      case "cancelled":
        return "bg-red-950/30 text-red-400 border border-red-800/30"
      default:
        return "bg-slate-950/30 text-slate-400 border border-slate-800/30"
    }
  }

  const handleConvertToPersonalClient = async () => {
    if (!lead?._id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se puede convertir un lead sin ID"
      });
      return;
    }

    router.push(`/leads/${lead._id}/convertir`);
  };

  const handleConvertToBusinessClient = async () => {
    if (!lead?._id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se puede convertir un lead sin ID"
      });
      return;
    }

    router.push(`/leads/${lead._id}/convertir`);
  };

  const handleOpenDocument = (url: string) => {
    // Si la URL ya es completa (comienza con http o https), usarla directamente
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank');
    } else {
      // Usar la URL configurada del cliente 
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : CLIENT_URL;
      
      // Asegurarse de que la URL del documento no tenga prefijo /api
      const documentUrl = url.startsWith('/api/') 
        ? url.replace('/api/', '/') 
        : url;
      
      console.log(`Abriendo documento: ${baseUrl}${documentUrl}`);
      window.open(`${baseUrl}${documentUrl}`, '_blank');
    }
  };

  const handleStageChange = (value: string) => {
    setSelectedStage(value)
  }

  const handleUpdateStage = async () => {
    if (!selectedStage) return
    
    setStageLoading(true)
    try {
      await leadService.updateLeadStage(id, selectedStage)
      toast({
        title: "Etapa actualizada",
        description: "La etapa del lead ha sido actualizada exitosamente"
      })
      await refreshLeadData()
      setIsStageModalOpen(false)
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "No se pudo actualizar la etapa del lead"
      })
    } finally {
      setStageLoading(false)
    }
  }

  const handleLeadContacted = async () => {
    if (!lead?._id) return;
    
    try {
      await leadService.updateLeadStage(id, "Contactado");
      toast({
        title: "Estado actualizado",
        description: "El lead ha sido marcado como contactado"
      });
      await refreshLeadData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "No se pudo actualizar el estado del lead"
      });
    }
  };

  const handleAgendaPendiente = async () => {
    if (!lead?._id) return;
    
    try {
      await leadService.updateLeadStage(id, "Pendiente Seguimiento");
      toast({
        title: "Estado actualizado",
        description: "El lead ha sido marcado como pendiente de seguimiento"
      });
      await refreshLeadData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "No se pudo actualizar el estado del lead"
      });
    }
  };

  // Mostrar un estado de carga
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando información del lead...</p>
      </div>
    )
  }

  // Mostrar un mensaje de error
  if (error || !lead) {
    return (
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "No se pudo cargar la información del lead. Por favor, intenta de nuevo más tarde."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Encabezado con botón de volver */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Perfil de Lead</h1>
      </div>

      {/* Estructura principal en dos columnas en pantallas grandes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Columna izquierda - Información y métricas */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tarjeta de información principal del lead */}
          <Card className="netflix-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-start gap-6 sm:flex-row">
                <Avatar className="h-24 w-24">
                  <AvatarFallback>{lead.firstName.charAt(0)}{lead.lastName?.charAt(0) || ''}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{lead.firstName} {lead.lastName}</h2>
                    <p className="text-muted-foreground">{lead.company || 'Sin empresa'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getPriorityColor(lead.priority || 'media')}>
                      Prioridad: {lead.priority === "alta" ? "Alta" : lead.priority === "baja" ? "Baja" : "Media"}
                    </Badge>
                    <Badge variant="outline" className="bg-card/50">
                      Etapa: {lead.currentStage || "No definida"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {lead.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${lead.email}`} className="hover:underline">
                          Email: {lead.email}
                        </a>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          WhatsApp
                        </a>
                      </div>
                    )}
                    {lead.linkedin && (
                      <div className="flex items-center gap-2 text-sm">
                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                        <a href={lead.linkedin.startsWith('http') ? lead.linkedin : `https://${lead.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          LinkedIn: {lead.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/(in\/)?/i, '')}
                        </a>
                      </div>
                    )}
                    {lead.instagram && (
                      <div className="flex items-center gap-2 text-sm">
                        <Instagram className="h-4 w-4 text-muted-foreground" />
                        <a href={lead.instagram.startsWith('http') ? lead.instagram : `https://instagram.com/${lead.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Instagram
                        </a>
                      </div>
                    )}
                    {lead.twitter && (
                      <div className="flex items-center gap-2 text-sm">
                        <Twitter className="h-4 w-4 text-muted-foreground" />
                        <a href={lead.twitter.startsWith('http') ? lead.twitter : `https://twitter.com/${lead.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Twitter
                        </a>
                      </div>
                    )}
                    {lead.facebook && (
                      <div className="flex items-center gap-2 text-sm">
                        <Facebook className="h-4 w-4 text-muted-foreground" />
                        <a href={lead.facebook.startsWith('http') ? lead.facebook : `https://facebook.com/${lead.facebook}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Facebook
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta de métricas */}
          <Card className="netflix-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Métricas</CardTitle>
              <CardDescription>Información clave del lead</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fecha de creación</span>
                  <span className="font-medium">{lead.createdAt ? formatDate(lead.createdAt) : "No disponible"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Última actividad</span>
                  <span className="font-medium">{lead.lastActivity ? formatDate(lead.lastActivity) : "Sin actividad"}</span>
                </div>
              </div>

              <Separator className="bg-border/10" />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Origen</span>
                  <Badge variant="outline" className="bg-card/50">
                    {lead.source === "sitio_web" ? "Sitio Web" : 
                     lead.source === "referido" ? "Referido" : 
                     lead.source === "redes_sociales" ? "Redes Sociales" : 
                     lead.source === "evento" ? "Evento" : 
                     lead.source === "anuncio" ? "Anuncio" : 
                     lead.source === "otro" ? "Otro" :
                     lead.source === "manual" ? "Manual" :
                     lead.source === "conversión de cliente" ? "Conversión de Cliente" :
                     lead.source || "Desconocido"}
                  </Badge>
                </div>
                {lead.tags && lead.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    <span className="text-sm text-muted-foreground">Etiquetas:</span>
                    {lead.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-card/50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Acciones */}
        <div className="lg:col-span-1">
          <Card className="netflix-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Acciones</CardTitle>
              <CardDescription>Operaciones disponibles para este lead</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="gap-2 w-full justify-between" onClick={() => router.push(`/leads/${id}/edit`)}>
                <span>Editar</span>
                <Edit className="h-4 w-4" />
              </Button>
              
              {canEditStage && (
                <Button variant="outline" size="sm" className="gap-2 w-full justify-between" onClick={() => {
                  setSelectedStage(lead.currentStage || "")
                  setIsStageModalOpen(true)
                }}>
                  <span>Modificar Etapa</span>
                  <BarChart3 className="h-4 w-4" />
                </Button>
              )}
              
              <Button variant="destructive" size="sm" className="gap-2 w-full justify-between" onClick={() => {
                if (window.confirm("¿Estás seguro de eliminar este lead?")) {
                  leadService.deleteLead(id).then(() => {
                    toast({
                      title: "Lead eliminado",
                      description: "El lead ha sido eliminado exitosamente"
                    });
                    router.push('/leads');
                  }).catch(err => {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: err.response?.data?.message || "No se pudo eliminar el lead"
                    });
                  });
                }
              }}>
                <span>Eliminar</span>
                <Trash2 className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 w-full justify-between">
                    <span>Convertir a Cliente</span>
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleConvertToPersonalClient}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Convertir a Cliente Personal</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleConvertToBusinessClient}>
                    <Building2 className="mr-2 h-4 w-4" />
                    <span>Convertir a Cliente Empresa</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Botón Asignar Lead - Solo visible si el usuario tiene permiso y el lead no está asignado */}
              {canAssignLeads && lead?.isApproved && !lead?.assignedTo && (
                <Button variant="default" size="sm" className="gap-2 w-full justify-between" onClick={async () => {
                  try {
                    const employeeId = prompt("Ingrese el ID del empleado a asignar:");
                    if (employeeId) {
                      await leadService.assignLead(id, employeeId);
                      toast({
                        title: "Lead asignado",
                        description: "El lead ha sido asignado exitosamente"
                      });
                      refreshLeadData();
                    }
                  } catch (err: any) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: err.response?.data?.message || "No se pudo asignar el lead"
                    });
                  }
                }}>
                  <span>Asignar Lead</span>
                  <User className="h-4 w-4" />
                </Button>
              )}
              
              {/* Botón Desasignar Lead - Solo visible si el usuario tiene permiso y el lead está asignado */}
              {canAssignLeads && lead?.assignedTo && (
                <Button variant="outline" size="sm" className="gap-2 w-full justify-between" onClick={async () => {
                  try {
                    if (window.confirm("¿Está seguro que desea desasignar este lead?")) {
                      await leadService.unassignLead(id);
                      toast({
                        title: "Lead desasignado",
                        description: "El lead ha sido desasignado exitosamente"
                      });
                      refreshLeadData();
                    }
                  } catch (err: any) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: err.response?.data?.message || "No se pudo desasignar el lead"
                    });
                  }
                }}>
                  <span>Desasignar Lead</span>
                  <User className="h-4 w-4 text-red-500" />
                </Button>
              )}
              
              {/* Botón Aprobar Lead - Solo visible si el usuario tiene permiso y el lead no está aprobado */}
              {canApproveLeads && (!lead?.isApproved || lead?.status === "rechazado") && lead?.status !== "nuevo" && (
                <Button variant="default" size="sm" className="gap-2 w-full justify-between" onClick={async () => {
                  try {
                    await leadService.approveLead(id);
                    toast({
                      title: "Lead aprobado",
                      description: "El lead ha sido aprobado exitosamente"
                    });
                    refreshLeadData();
                  } catch (err: any) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: err.response?.data?.message || "No se pudo aprobar el lead"
                    });
                  }
                }}>
                  <span>Aprobar Lead</span>
                  <Check className="h-4 w-4" />
                </Button>
              )}
              
              {/* Botón Desaprobar Lead - Solo visible si el usuario tiene permiso y el lead está aprobado */}
              {canRejectLeads && lead?.isApproved && (
                <Button variant="destructive" size="sm" className="gap-2 w-full justify-between" onClick={() => {
                  const reason = prompt("Por favor, ingrese la razón para desaprobar este lead:");
                  if (reason) {
                    leadService.rejectLead(id, reason).then(() => {
                      toast({
                        title: "Lead desaprobado",
                        description: "El lead ha sido desaprobado exitosamente"
                      });
                      refreshLeadData();
                    }).catch(err => {
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: err.response?.data?.message || "No se pudo desaprobar el lead"
                      });
                    });
                  }
                }}>
                  <span>Desaprobar Lead</span>
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              {/* Botones específicos para leads nuevos */}
              {lead?.status === "nuevo" && canApproveLeads && (
                <Button variant="default" size="sm" className="gap-2 w-full justify-between" onClick={async () => {
                  try {
                    await leadService.approveLead(id);
                    toast({
                      title: "Lead aprobado",
                      description: "El lead ha sido aprobado exitosamente"
                    });
                    refreshLeadData();
                  } catch (err: any) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: err.response?.data?.message || "No se pudo aprobar el lead"
                    });
                  }
                }}>
                  <span>Aprobar Lead</span>
                  <Check className="h-4 w-4" />
                </Button>
              )}
              
              {lead?.status === "nuevo" && canRejectLeads && (
                <Button variant="destructive" size="sm" className="gap-2 w-full justify-between" onClick={() => {
                  // Crear modal para ingresar razón de rechazo y luego llamar a rejectLead
                  const reason = prompt("Por favor, ingresa la razón para desaprobar este lead:");
                  if (reason) {
                    leadService.rejectLead(id, reason).then(() => {
                      toast({
                        title: "Lead desaprobado",
                        description: "El lead ha sido desaprobado exitosamente"
                      });
                      refreshLeadData();
                    }).catch(err => {
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: err.response?.data?.message || "No se pudo desaprobar el lead"
                      });
                    });
                  }
                }}>
                  <span>Desaprobar Lead</span>
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Botón de Acciones para AppSetters - Solo visible si tiene permiso */}
              {canEditAppSettersStage && lead?.currentStage === "Nuevo" && (
                <Button variant="default" size="sm" className="gap-2 w-full justify-between" onClick={handleLeadContacted}>
                  <span>Lead Contactado</span>
                  <Check className="h-4 w-4" />
                </Button>
              )}
              
              {/* Botón de Agenda Pendiente - Solo visible si tiene permiso y el lead está en etapa correcta */}
              {canEditAppSettersStage && (lead?.currentStage === "Contactado" || lead?.currentStage === "Pendiente Seguimiento") && (
                <Button variant="outline" size="sm" className="gap-2 w-full justify-between" onClick={handleAgendaPendiente}>
                  <span>Agenda Pendiente</span>
                  <Calendar className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pestañas de información - Solo mostrar si al menos hay una pestaña visible */}
      {(canViewInfoTab || canViewActivitiesTab || canViewTasksTab || canViewDocumentsTab || canViewNotesTab) && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {canViewInfoTab && (
              <TabsTrigger value="info">Información</TabsTrigger>
            )}
            {canViewActivitiesTab && (
              <TabsTrigger value="activities">Actividades</TabsTrigger>
            )}
            {canViewTasksTab && (
              <TabsTrigger value="tasks">Tareas</TabsTrigger>
            )}
            {canViewDocumentsTab && (
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            )}
            {canViewNotesTab && (
              <TabsTrigger value="notes">Notas</TabsTrigger>
            )}
          </TabsList>

          {/* Pestaña de Información */}
          {canViewInfoTab && (
            <TabsContent value="info" className="space-y-4">
              <Card className="netflix-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Información Personal</h3>
                        <div className="space-y-2 rounded-md border border-border/10 bg-card/30 p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Nombre:</span>
                            <span>{lead.firstName} {lead.lastName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Email:</span>
                            <span>{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Teléfono:</span>
                              <span>{lead.phone}</span>
                            </div>
                          )}
                          {lead.company && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Empresa:</span>
                              <span>{lead.company}</span>
                            </div>
                          )}
                          {lead.position && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Cargo:</span>
                              <span>{lead.position}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Redes Sociales</h3>
                        <div className="space-y-2 rounded-md border border-border/10 bg-card/30 p-3">
                          {lead.whatsapp && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">WhatsApp:</span>
                              <span>{lead.whatsapp}</span>
                            </div>
                          )}
                          {lead.instagram && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Instagram:</span>
                              <span>{lead.instagram}</span>
                            </div>
                          )}
                          {lead.twitter && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Twitter:</span>
                              <span>{lead.twitter}</span>
                            </div>
                          )}
                          {lead.linkedin && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">LinkedIn:</span>
                              <span>{lead.linkedin}</span>
                            </div>
                          )}
                          {lead.facebook && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Facebook:</span>
                              <span>{lead.facebook}</span>
                            </div>
                          )}
                          {!lead.whatsapp && !lead.instagram && !lead.twitter && !lead.linkedin && !lead.facebook && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>No hay redes sociales registradas</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Ubicación</h3>
                        <div className="space-y-2 rounded-md border border-border/10 bg-card/30 p-3">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="font-medium">Dirección:</span>
                              {lead.address || lead.city || lead.state || lead.country ? (
                                <>
                                  {lead.address && <p>{lead.address}</p>}
                                  <p>
                                    {lead.city && `${lead.city}, `}
                                    {lead.state && `${lead.state}, `}
                                    {lead.country || ''}
                                    {lead.postalCode && ` ${lead.postalCode}`}
                                  </p>
                                </>
                              ) : (
                                <p className="text-muted-foreground">No hay información de ubicación</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {lead.website && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Sitio Web</h3>
                          <div className="space-y-2 rounded-md border border-border/10 bg-card/30 p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={lead.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {lead.website}
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Información Adicional</h3>
                        <div className="space-y-2 rounded-md border border-border/10 bg-card/30 p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Etapa:</span>
                            <span>
                              {lead.currentStage || "No definida"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Fecha de creación:</span>
                            <span>{lead.createdAt ? formatDate(lead.createdAt) : "No disponible"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Origen:</span>
                            <span>
                              {lead.source === "sitio_web" ? "Sitio Web" : 
                               lead.source === "referido" ? "Referido" : 
                               lead.source === "redes_sociales" ? "Redes Sociales" : 
                               lead.source === "evento" ? "Evento" : 
                               lead.source === "anuncio" ? "Anuncio" : 
                               lead.source === "otro" ? "Otro" :
                               lead.source === "manual" ? "Manual" :
                               lead.source === "conversión de cliente" ? "Conversión de Cliente" :
                               lead.source || "Desconocido"}
                            </span>
                          </div>
                          {lead.industry && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Industria:</span>
                              <span>{lead.industry}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Pestaña de Actividades */}
          {canViewActivitiesTab && (
            <TabsContent value="activities" className="space-y-4">
              <Card className="netflix-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg font-medium">Actividades</CardTitle>
                    <CardDescription>Historial de interacciones con el lead</CardDescription>
                  </div>
                  {canAddActivity && (
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        resetInteractionForm();
                        setIsInteractionModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nueva Actividad</span>
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {lead?.interactionHistory && lead.interactionHistory.length > 0 ? (
                    <div className="space-y-4">
                      {lead.interactionHistory.map((interaction: LeadInteraction, index: number) => (
                        <div
                          key={interaction._id || index}
                          className="flex gap-4 rounded-md border border-border/10 bg-card/30 p-4"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            {getActivityIcon(interaction.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{interaction.title || "Interacción"}</h3>
                              <span className="text-xs text-muted-foreground">{formatDate(interaction.date)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{interaction.description}</p>
                            
                            {/* Botones de acción */}
                            <div className="mt-2 flex justify-end gap-2">
                              {canEditActivity && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditInteraction(interaction)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              )}
                              {canDeleteActivity && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  onClick={() => interaction._id && handleDeleteInteraction(interaction._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Eliminar</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay interacciones registradas para este lead.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Pestaña de Tareas */}
          {canViewTasksTab && (
            <TabsContent value="tasks" className="space-y-4">
              <Card className="netflix-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg font-medium">Tareas</CardTitle>
                    <CardDescription>Tareas pendientes y completadas</CardDescription>
                  </div>
                  {canAddTask && (
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        resetTaskForm();
                        setIsTaskModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nueva Tarea</span>
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {lead?.tasks && lead.tasks.length > 0 ? (
                    <div className="space-y-4">
                      {lead.tasks.map((task, index: number) => (
                        <div
                          key={task._id || index}
                          className="flex gap-4 rounded-md border border-border/10 bg-card/30 p-4"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{task.title}</h3>
                              <Badge className={getTaskStatusColor(task.status)}>
                                {task.status === "pending" && "Pendiente"}
                                {task.status === "in_progress" && "En Progreso"}
                                {task.status === "completed" && "Completada"}
                                {task.status === "cancelled" && "Cancelada"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                            <div className="flex justify-between items-center">
                              <Badge className={getPriorityColor(task.priority || 'media')}>
                                Prioridad: {task.priority === "alta" ? "Alta" : task.priority === "baja" ? "Baja" : "Media"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">Vence: {formatDate(task.dueDate)}</span>
                            </div>
                            
                            {/* Botones de acción */}
                            <div className="mt-2 flex justify-end gap-2">
                              {canEditTask && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    // Convertir el tipo de task para que coincida con el esperado por handleEditTask
                                    const convertedTask = {
                                      ...task,
                                      user: typeof task.user === 'object' ? task.user._id || '' : task.user
                                    };
                                    handleEditTask(convertedTask);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              )}
                              {canDeleteTask && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  onClick={() => task._id && handleDeleteTask(task._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Eliminar</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay tareas registradas para este lead.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Pestaña de Documentos */}
          {canViewDocumentsTab && (
            <TabsContent value="documents" className="space-y-4">
              <Card className="netflix-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg font-medium">Documentos</CardTitle>
                    <CardDescription>Archivos subidos o enlaces a documentos externos</CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    className="gap-2"
                    onClick={() => {
                      resetDocumentForm();
                      setIsDocumentModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Añadir Documento</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  {lead?.documents && lead.documents.length > 0 ? (
                    <div className="space-y-4">
                      {lead.documents.map((document, index) => (
                        <div
                          key={document._id || index}
                          className="flex gap-4 rounded-md border border-border/10 bg-card/30 p-4"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                            {getFileIcon(document.fileType)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{document.name}</h3>
                              <span className="text-xs text-muted-foreground">Subido: {formatDate(document.uploadDate)}</span>
                            </div>
                            {document.description && (
                              <p className="text-sm text-muted-foreground">{document.description}</p>
                            )}
                            <div className="flex justify-between items-center pt-1">
                              <div className="flex flex-wrap gap-1">
                                {document.isExternalLink && (
                                  <Badge variant="outline" className="bg-blue-950/30 text-blue-400 border-blue-800/30 text-xs">
                                    Enlace externo
                                  </Badge>
                                )}
                                {!document.isExternalLink && (
                                  <Badge variant="outline" className="bg-green-950/30 text-green-400 border-green-800/30 text-xs">
                                    Archivo subido
                                  </Badge>
                                )}
                                {document.tags && document.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="bg-card/50 text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              {document.fileSize && document.fileSize > 0 && (
                                <span className="text-xs text-muted-foreground">{formatFileSize(document.fileSize)}</span>
                              )}
                            </div>
                            {/* Botones de acción */}
                            <div className="mt-2 flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 p-0 px-2"
                                onClick={() => handleOpenDocument(document.fileUrl)}
                              >
                                <File className="h-4 w-4 mr-1" />
                                <span>Ver</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  // Convertir el tipo de document para que coincida con el esperado
                                  const convertedDocument = {
                                    ...document,
                                    user: typeof document.user === 'object' ? document.user._id || '' : document.user
                                  };
                                  handleEditDocument(convertedDocument);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => document._id && handleDeleteDocument(document._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay documentos adjuntos para este lead.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Pestaña de Notas */}
          {canViewNotesTab && (
            <TabsContent value="notes" className="space-y-4">
              <Card className="netflix-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg font-medium">Notas</CardTitle>
                    <CardDescription>Notas y comentarios sobre el lead</CardDescription>
                  </div>
                  {canAddNote && (
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        resetNoteForm();
                        setIsNoteModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Añadir Nota</span>
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {lead.notes ? (
                    <div className="rounded-md border border-border/10 bg-card/30 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Nota principal</h3>
                        <div className="flex gap-2">
                          {canEditNote && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full"
                              onClick={handleEditNote}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          )}
                          {canDeleteNote && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                              onClick={handleDeleteNote}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">{lead.notes}</div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay notas registradas para este lead.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Modal para añadir/editar interacciones */}
      <Dialog open={isInteractionModalOpen} onOpenChange={(open) => {
        setIsInteractionModalOpen(open)
        if (!open) resetInteractionForm()
      }}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-between">
            <DialogTitle>{currentInteraction ? "Editar Interacción" : "Nueva Interacción"}</DialogTitle>
            <DialogClose asChild>
            </DialogClose>
          </div>

          {interactionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{interactionError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddInteraction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={interactionForm.type} 
                onValueChange={(value) => handleInteractionSelectChange("type", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Nota</SelectItem>
                  <SelectItem value="call">Llamada</SelectItem>
                  <SelectItem value="meeting">Reunión</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="task">Tarea</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={interactionForm.title}
                onChange={handleInteractionChange}
                placeholder="Ej: Llamada inicial de presentación"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                name="description"
                value={interactionForm.description}
                onChange={handleInteractionChange}
                placeholder="Detalles sobre la interacción..."
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={interactionForm.date}
                onChange={handleInteractionChange}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={interactionLoading}
              >
                {interactionLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Guardar</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para añadir/editar tareas */}
      <Dialog open={isTaskModalOpen} onOpenChange={(open) => {
        setIsTaskModalOpen(open)
        if (!open) resetTaskForm()
      }}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-between">
            <DialogTitle>{currentTask ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
            <DialogClose asChild>
            </DialogClose>
          </div>

          {taskError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{taskError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                name="title"
                value={taskForm.title}
                onChange={handleTaskChange}
                placeholder="Ej: Llamar al cliente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={taskForm.description}
                onChange={handleTaskChange}
                placeholder="Detalles sobre la tarea..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Fecha de vencimiento *</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={taskForm.dueDate}
                onChange={handleTaskChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select 
                  value={taskForm.status} 
                  onValueChange={(value) => handleTaskSelectChange("status", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad *</Label>
                <Select 
                  value={taskForm.priority} 
                  onValueChange={(value) => handleTaskSelectChange("priority", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={taskLoading}
              >
                {taskLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Guardar</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para subir/editar documentos */}
      <Dialog open={isDocumentModalOpen} onOpenChange={(open) => {
        setIsDocumentModalOpen(open)
        if (!open) resetDocumentForm()
      }}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-between">
            <DialogTitle>{currentDocument ? "Editar Documento" : "Añadir Documento"}</DialogTitle>
            <DialogClose asChild>
            </DialogClose>
          </div>

          {documentError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{documentError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleUploadDocument} className="space-y-4">
            {!currentDocument && (
              <>
                <div className="space-y-2">
                  <Label>¿Cómo quieres añadir el documento?</Label>
                  <Select 
                    defaultValue="file" 
                    onValueChange={(value) => {
                      // Actualizar estado según la opción seleccionada
                      if (value === 'file') {
                        setDocumentForm(prev => ({...prev, fileUrl: ''}));
                      } else {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="file">Subir archivo a la plataforma</SelectItem>
                      <SelectItem value="link">Proporcionar enlace donde está subido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Tabs defaultValue="file" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">Subir Archivo</TabsTrigger>
                    <TabsTrigger value="link">Usar Enlace</TabsTrigger>
                  </TabsList>
                  <TabsContent value="file" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="file">Archivo *</Label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card/30 border-border/20 hover:bg-card/50">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Haz clic para seleccionar</span> o arrastra y suelta
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              PDF, Word, Excel, PowerPoint, imágenes, etc.
                            </p>
                          </div>
                          <input 
                            id="file" 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      {selectedFile && (
                        <div className="text-sm text-muted-foreground mt-2 flex items-center">
                          <File className="h-4 w-4 mr-2" />
                          <span>{selectedFile.name}</span>
                          <span className="ml-2 text-xs">({formatFileSize(selectedFile.size)})</span>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="link" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="fileUrl">Enlace al documento *</Label>
                      <Input
                        id="fileUrl"
                        name="fileUrl"
                        placeholder="https://drive.google.com/file/d/..."
                        onChange={(e) => setDocumentForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                        value={documentForm.fileUrl || ""}
                      />
                      <p className="text-xs text-muted-foreground">Añade un enlace donde ya está subido el documento (Google Drive, Dropbox, OneDrive, etc.)</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre del documento *</Label>
              <Input
                id="name"
                name="name"
                value={documentForm.name}
                onChange={handleDocumentChange}
                placeholder="Ej: Contrato de servicio"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={documentForm.description}
                onChange={handleDocumentChange}
                placeholder="Breve descripción del documento..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileType">Tipo de documento</Label>
              <Select 
                value={documentForm.fileType || "application/pdf"} 
                onValueChange={(value) => setDocumentForm(prev => ({ ...prev, fileType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application/pdf">PDF</SelectItem>
                  <SelectItem value="application/msword">Word</SelectItem>
                  <SelectItem value="application/vnd.ms-excel">Excel</SelectItem>
                  <SelectItem value="application/vnd.ms-powerpoint">PowerPoint</SelectItem>
                  <SelectItem value="image/jpeg">Imagen</SelectItem>
                  <SelectItem value="text/plain">Texto</SelectItem>
                  <SelectItem value="application/octet-stream">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
              <Input
                id="tags"
                name="tags"
                value={documentForm.tags}
                onChange={handleDocumentChange}
                placeholder="Ej: contrato, legal, firmado"
              />
              <p className="text-xs text-muted-foreground">Las etiquetas ayudan a categorizar y encontrar documentos fácilmente</p>
            </div>

            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={documentLoading}
              >
                {documentLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {currentDocument ? "Actualizando..." : "Guardando..."}</>
                ) : (
                  <>{currentDocument ? <Save className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} {currentDocument ? "Guardar" : "Guardar"}</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para añadir/editar notas */}
      <Dialog open={isNoteModalOpen} onOpenChange={(open) => {
        setIsNoteModalOpen(open)
        if (!open) resetNoteForm()
      }}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-between">
            <DialogTitle>{isEditingNote ? "Editar Nota" : "Nueva Nota"}</DialogTitle>
            <DialogClose asChild>
            </DialogClose>
          </div>

          {noteError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{noteError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSaveNote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note">Contenido de la nota *</Label>
              <Textarea
                id="note"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Escribe tus notas aquí..."
                rows={6}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={noteLoading}
              >
                {noteLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Guardar</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para cambiar etapa del lead */}
      <Dialog open={isStageModalOpen} onOpenChange={setIsStageModalOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Modificar Etapa del Lead</DialogTitle>
          <div className="py-4">
            <div className="space-y-4">
              <div className="mb-4 border-b pb-2">
                <span className="text-sm text-muted-foreground">Etapa actual:</span>
                <p className="text-base font-medium">{lead?.currentStage || "No definida"}</p>
                {lead?.currentStage && leadStageCategories.find(s => s.name === lead.currentStage)?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {leadStageCategories.find(s => s.name === lead.currentStage)?.description}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Seleccione una nueva etapa</Label>
                <Select value={selectedStage} onValueChange={handleStageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadStageCategories.map((stage) => (
                      <SelectItem key={stage._id} value={stage.name}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStage && leadStageCategories.find(s => s.name === selectedStage)?.description && (
                  <p className="text-sm text-muted-foreground">
                    {leadStageCategories.find(s => s.name === selectedStage)?.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStageModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateStage} 
              disabled={!selectedStage || stageLoading}
            >
              {stageLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...</>
              ) : (
                <>Guardar</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
