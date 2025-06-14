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
  MessageCircle,
  Target,
  Star,
  Activity,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Users,
  CalendarPlus,
  Eye,
  CheckCircle2,
  Circle,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { Lead, LeadInteraction, LeadTask, LeadDocument, Employee } from "@/lib/types/lead"
import { leadService } from "@/lib/services/leadService"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { clientService } from '../lib/services/clientService'
import { DropdownMenuItem, DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AvatarImage } from "@radix-ui/react-avatar"
import useHasPermission from "@/hooks/useHasPermission"
import api from '../lib/api'
import { CLIENT_URL } from '@/lib/config';
import FollowUpModal from './FollowUpModal';
import EditFollowUpModal from './EditFollowUpModal';
import FollowUpTab from './FollowUpTab';

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
  const canEditLead = useHasPermission("leads:update")
  const canDeleteLead = useHasPermission("leads:delete")
  const canConvertLead = useHasPermission("leads:convert_to_client")
  const canUnassignLead = useHasPermission("leads:unassign")
  
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
  
  // Permiso para agendar seguimiento
  const canScheduleFollowUp = useHasPermission("leads:follow_up")
  
  // Permiso para anular lead
  const canAnnulLead = useHasPermission("leads:annul_lead")
  
  // Permiso para convertir a oportunidad
  const canConvertToOpportunity = useHasPermission("opportunities:transfer")
  
  // Permisos específicos para botones de cambio de stage
  const canMarkContacted = useHasPermission("leads:mark_contacted")
  const canScheduleFollowUpStage = useHasPermission("leads:schedule_follow_up")
  const canSetAgendaPending = useHasPermission("leads:set_agenda_pending")
  const canMoveToOpportunities = useHasPermission("leads:move_to_opportunities")
  
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState<string>("info")
  
  // Configurar la pestaña activa inicial basada en permisos
  useEffect(() => {
    if (canViewInfoTab) setActiveTab("info")
    else setActiveTab("followup")
  }, [canViewInfoTab])
  
  // Estados para controlar los modales y formularios
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [isStageModalOpen, setIsStageModalOpen] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)
  const [isAnnulModalOpen, setIsAnnulModalOpen] = useState(false)
  
  // Estados para el modal de interacción
  const [interactionLoading, setInteractionLoading] = useState(false)
  const [interactionError, setInteractionError] = useState<string | null>(null)
  const [currentInteraction, setCurrentInteraction] = useState<LeadInteraction | null>(null)
  const [interactionForm, setInteractionForm] = useState({
    type: "note" as const,
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Estados para el modal de tareas
  const [taskLoading, setTaskLoading] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [currentTask, setCurrentTask] = useState<LeadTask | null>(null)
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    status: "pending",
    priority: "media",
    assignedTo: "none"
  })
  
  // Estados para empleados
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)

  // Estados para el modal de documentos
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
  const [noteLoading, setNoteLoading] = useState(false)
  const [noteError, setNoteError] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState("")
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)

  const [leadStageCategories, setLeadStageCategories] = useState<LeadStageCategory[]>([])
  const [selectedStage, setSelectedStage] = useState<string>("")
  const [stageLoading, setStageLoading] = useState(false)
  
  // Estados para el modal de seguimiento
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [followUpError, setFollowUpError] = useState<string | null>(null)
  const [followUpForm, setFollowUpForm] = useState({
    date: "",
    time: "",
    note: ""
  })

  // Estados para el modal de anulación
  const [annulLoading, setAnnulLoading] = useState(false)
  const [annulError, setAnnulError] = useState<string | null>(null)
  const [annulReason, setAnnulReason] = useState("")

  // Estados para el nuevo sistema de seguimiento
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [showEditFollowUpModal, setShowEditFollowUpModal] = useState(false)
  const [creatingFollowUp, setCreatingFollowUp] = useState(false)
  const [updatingFollowUp, setUpdatingFollowUp] = useState(false)
  const [editingFollowUp, setEditingFollowUp] = useState<{
    _id: string;
    title: string;
    description?: string;
    scheduledDate: string;
    status: 'pendiente' | 'completado' | 'cancelado';
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  } | null>(null)

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

  useEffect(() => {
    if (isTaskModalOpen) {
      fetchEmployees()
    }
  }, [isTaskModalOpen])

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

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true)
      const response = await api.get('/employees')
      setEmployees(response.data.data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoadingEmployees(false)
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
    setInteractionLoading(true)
    setInteractionError(null)

    try {
      const interactionData = {
        ...interactionForm,
        type: interactionForm.type as "note" | "meeting" | "task" | "status_change" | "status" | "call" | "video" | "in-person" | "email" | "other" | "aprobacion" | "rechazo",
        user: 'current-user', // Se debe obtener del contexto de usuario
        date: new Date(interactionForm.date)
      }

      if (currentInteraction && currentInteraction._id) {
        await leadService.updateInteraction(id, currentInteraction._id, interactionData)
        toast({
          title: "Éxito",
          description: "Interacción actualizada correctamente"
        })
      } else {
        await leadService.addInteraction(id, interactionData)
        toast({
          title: "Éxito",
          description: "Interacción añadida correctamente"
        })
      }
      
      setIsInteractionModalOpen(false)
      resetInteractionForm()
      await refreshLeadData()
    } catch (error: any) {
      console.error('Error al guardar interacción:', error)
      setInteractionError(error.response?.data?.message || "Error al guardar la interacción")
    } finally {
      setInteractionLoading(false)
    }
  }

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
      priority: "media",
      assignedTo: "none"
    })
    setCurrentTask(null)
    setTaskError(null)
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setTaskLoading(true)
    setTaskError(null)

    try {
      // Preparar datos con assignedTo correctamente formateado
      const taskData = {
        ...taskForm,
        assignedTo: taskForm.assignedTo === "none" ? null : taskForm.assignedTo
      }

      if (currentTask && currentTask._id) {
        await leadService.updateTask(id, currentTask._id, taskData)
        toast({
          title: "Éxito",
          description: "Tarea actualizada correctamente"
        })
      } else {
        await leadService.addTask(id, taskData)
        toast({
          title: "Éxito",
          description: "Tarea añadida correctamente"
        })
      }
      
      setIsTaskModalOpen(false)
      resetTaskForm()
      await refreshLeadData()
    } catch (error: any) {
      console.error('Error al guardar tarea:', error)
      setTaskError(error.response?.data?.message || "Error al guardar la tarea")
    } finally {
      setTaskLoading(false)
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDocumentForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFile(file || null)
  }

  const resetDocumentForm = () => {
    setDocumentForm({
      name: "",
      description: "",
      tags: "",
      fileUrl: "",
      fileType: "application/pdf"
    })
    setCurrentDocument(null)
    setDocumentError(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    setDocumentLoading(true)
    setDocumentError(null)

    try {
      let documentData = { ...documentForm }

      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        
        const uploadResponse = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        
        documentData.fileUrl = uploadResponse.data.fileUrl
        documentData.fileType = selectedFile.type
      }

      if (currentDocument && currentDocument._id) {
        await leadService.updateDocument(id, currentDocument._id, documentData)
        toast({
          title: "Éxito",
          description: "Documento actualizado correctamente"
        })
      } else {
        await leadService.uploadDocument(id, documentData)
        toast({
          title: "Éxito",
          description: "Documento subido correctamente"
        })
      }
      
      setIsDocumentModalOpen(false)
      resetDocumentForm()
      await refreshLeadData()
    } catch (error: any) {
      console.error('Error al subir documento:', error)
      setDocumentError(error.response?.data?.message || "Error al subir el documento")
    } finally {
      setDocumentLoading(false)
    }
  }

  const resetNoteForm = () => {
    setNoteContent("")
    setIsEditingNote(false)
    setCurrentNoteId(null)
    setNoteError(null)
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await leadService.deleteNote(id, noteId)
      toast({
        title: "Éxito",
        description: "Nota eliminada correctamente"
      })
      await refreshLeadData()
    } catch (error: any) {
      console.error('Error al eliminar nota:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Error al eliminar la nota"
      })
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await leadService.updateTaskStatus(id, taskId, status)
      const statusLabels: { [key: string]: string } = {
        'pendiente': 'pendiente',
        'completada': 'completada',
        'cancelada': 'cancelada'
      }
      toast({
        title: "Éxito",
        description: `Tarea marcada como ${statusLabels[status]}`
      })
      await refreshLeadData()
    } catch (error: any) {
      console.error('Error al actualizar estado de tarea:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Error al actualizar el estado de la tarea"
      })
    }
  }

  const handleEditTask = (task: any) => {
    setCurrentTask(task)
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      status: task.status || "pending",
      priority: task.priority || "media",
      assignedTo: task.assignedTo?._id || task.assignedTo || "none"
    })
    setIsTaskModalOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return
    }
    
    try {
      await leadService.deleteTask(id, taskId)
      toast({
        title: "Éxito",
        description: "Tarea eliminada correctamente"
      })
      await refreshLeadData()
    } catch (error: any) {
      console.error('Error al eliminar tarea:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Error al eliminar la tarea"
      })
    }
  }

  const handleAssignTask = async (task: any) => {
    const currentAssignedTo = task.assignedTo?._id || task.assignedTo || "none"
    
    // Cargar empleados si no están cargados
    if (employees.length === 0) {
      await fetchEmployees()
    }
    
    // Mostrar modal de selección de empleado
    setCurrentTask(task)
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      status: task.status || "pending",
      priority: task.priority || "media",
      assignedTo: currentAssignedTo
    })
    setIsTaskModalOpen(true)
  }

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault()
    setNoteLoading(true)
    setNoteError(null)

    try {
      if (isEditingNote && currentNoteId) {
        await leadService.updateNote(id, currentNoteId, noteContent)
        toast({
          title: "Éxito",
          description: "Nota actualizada correctamente"
        })
      } else {
        await leadService.addNote(id, noteContent)
        toast({
          title: "Éxito",
          description: "Nota añadida correctamente"
        })
      }
      
      setIsNoteModalOpen(false)
      resetNoteForm()
      await refreshLeadData()
    } catch (error: any) {
      console.error('Error al guardar nota:', error)
      setNoteError(error.response?.data?.message || "Error al guardar la nota")
    } finally {
      setNoteLoading(false)
    }
  }

  const handleFollowUpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFollowUpForm(prev => ({ ...prev, [name]: value }))
  }

  const resetFollowUpForm = () => {
    setFollowUpForm({
      date: "",
      time: "",
      note: ""
    })
    setFollowUpError(null)
  }

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setFollowUpLoading(true)
    setFollowUpError(null)

    try {
      // Crear una interacción de seguimiento
      const followUpInteraction = {
        type: "task" as const,
        title: "Seguimiento programado",
        description: followUpForm.note,
        date: new Date(`${followUpForm.date}T${followUpForm.time}`),
        user: 'current-user'
      }
      
      await leadService.addInteraction(id, followUpInteraction)
      
      // Si el lead está en "Contactado", cambiar automáticamente a "Pendiente Seguimiento"
      if (lead && lead.currentStage === 'Contactado') {
        await api.put(`/leads/${id}/schedule-follow-up-stage`)
      }
      
      toast({
        title: "Éxito",
        description: "Seguimiento programado correctamente y etapa actualizada"
      })
      
      setIsFollowUpModalOpen(false)
      resetFollowUpForm()
      await refreshLeadData()
    } catch (error: any) {
      console.error('Error al programar seguimiento:', error)
      setFollowUpError(error.response?.data?.message || "Error al programar el seguimiento")
    } finally {
      setFollowUpLoading(false)
    }
  }

  const resetAnnulForm = () => {
    setAnnulReason("")
    setAnnulError(null)
  }

  const handleAnnulLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setAnnulLoading(true)
    setAnnulError(null)

    try {
      await leadService.annulLead(id, annulReason)
      toast({
        title: "Éxito",
        description: "Lead anulado correctamente"
      })
      
      setIsAnnulModalOpen(false)
      resetAnnulForm()
      router.push('/leads')
    } catch (error: any) {
      console.error('Error al anular lead:', error)
      setAnnulError(error.response?.data?.message || "Error al anular el lead")
    } finally {
      setAnnulLoading(false)
    }
  }

  const handleConvertToOpportunity = async () => {
    try {
      // Usar el endpoint correcto de la API
      const response = await api.post('/opportunities/transfer-from-lead', {
        leadId: id
      })
      toast({
        title: "Éxito",
        description: "Lead convertido a oportunidad exitosamente"
      })
      
      if (response.data.opportunity?._id) {
        router.push(`/oportunidades/${response.data.opportunity._id}`)
      } else {
        router.push('/oportunidades')
      }
    } catch (error: any) {
      console.error('Error al convertir lead a oportunidad:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Error al convertir el lead a oportunidad"
      })
    }
  }

  const handleStageChange = (value: string) => {
    setSelectedStage(value)
  }

  const handleUpdateStage = async () => {
    if (!selectedStage) return
    
    setStageLoading(true)
    try {
      await leadService.updateLeadStage(id, selectedStage)
      toast({
        title: "Éxito",
        description: "Etapa actualizada correctamente"
      })
      
      setIsStageModalOpen(false)
      setSelectedStage("")
      await refreshLeadData()
    } catch (error: any) {
      console.error('Error al actualizar etapa:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Error al actualizar la etapa"
      })
    } finally {
      setStageLoading(false)
    }
  }

  // Funciones para los botones específicos de cambio de stage
  const handleMarkAsContacted = async () => {
    try {
      await api.put(`/leads/${id}/mark-contacted`)
      toast({
        title: "Éxito",
        description: "Lead marcado como contactado"
      })
      await refreshLeadData()
    } catch (error: any) {
      console.error('Error al marcar como contactado:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Error al marcar como contactado"
      })
    }
  }

  const handleScheduleFollowUpStage = async () => {
    try {
      await api.put(`/leads/${id}/schedule-follow-up-stage`)
      toast({
        title: "Éxito",
        description: "Lead movido a pendiente seguimiento"
      })
      await refreshLeadData()
    } catch (error: any) {
      console.error('Error al agendar seguimiento:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Error al agendar seguimiento"
      })
    }
  }

  const handleSetAgendaPending = async () => {
    try {
      await api.put(`/leads/${id}/set-agenda-pending`)
      toast({
        title: "Éxito",
        description: "Lead movido a agenda pendiente"
      })
      await refreshLeadData()
    } catch (error: any) {
      console.error('Error al mover a agenda pendiente:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Error al mover a agenda pendiente"
      })
    }
  }

  const handleUnassignLead = async () => {
    try {
      const response = await api.patch(`/api/leads/${id}/unassign`)
      if (response.data.success) {
        toast({
          title: "Éxito",
          description: "Lead desasignado correctamente",
        })
        await refreshLeadData()
      }
    } catch (error) {
      console.error('Error al desasignar lead:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al desasignar el lead",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (size: number) => {
    if (size === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX');
  };

  const formatDateTimeSafe = (date: string | Date | undefined) => {
    if (!date) return 'No especificada';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleString('es-MX');
    } catch {
      return 'Fecha inválida';
    }
  };

  // Funciones para el sistema de seguimiento
  const handleCreateFollowUp = async (followUpData: {
    title: string;
    description?: string;
    scheduledDate: string;
  }) => {
    try {
      setCreatingFollowUp(true);
      
      const response = await api.post(`/leads/${id}/follow-ups`, followUpData);
      
      if (response.status === 200) {
        toast({
          title: "Éxito",
          description: "Seguimiento creado exitosamente"
        });
        setShowFollowUpModal(false);
        await refreshLeadData(); // Recargar el lead
      }
    } catch (error) {
      console.error('Error al crear seguimiento:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al crear el seguimiento"
      });
    } finally {
      setCreatingFollowUp(false);
    }
  };

  const handleUpdateFollowUpStatus = async (followUpId: string, status: 'completado' | 'cancelado') => {
    try {
      const response = await api.put(`/leads/${id}/follow-ups/${followUpId}/status`, { status });
      
      if (response.status === 200) {
        toast({
          title: "Éxito",
          description: `Seguimiento marcado como ${status === 'completado' ? 'completado' : 'cancelado'}`
        });
        await refreshLeadData(); // Recargar el lead
      }
    } catch (error) {
      console.error('Error al actualizar seguimiento:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar el seguimiento"
      });
    }
  };

  const handleEditFollowUp = (followUp: {
    _id?: string;
    title: string;
    description?: string;
    scheduledDate: string;
    status: 'pendiente' | 'completado' | 'cancelado';
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }) => {
    if (followUp._id) {
      setEditingFollowUp(followUp as {
        _id: string;
        title: string;
        description?: string;
        scheduledDate: string;
        status: 'pendiente' | 'completado' | 'cancelado';
        createdBy: {
          firstName: string;
          lastName: string;
        };
        createdAt: string;
      });
      setShowEditFollowUpModal(true);
    }
  };

  const handleUpdateFollowUp = async (followUpId: string, followUpData: {
    title: string;
    description?: string;
    scheduledDate: string;
  }) => {
    try {
      setUpdatingFollowUp(true);
      const response = await api.put(`/leads/${id}/follow-ups/${followUpId}`, followUpData);
      
      if (response.status === 200) {
        toast({
          title: "Éxito",
          description: "Seguimiento actualizado exitosamente"
        });
        setShowEditFollowUpModal(false);
        setEditingFollowUp(null);
        await refreshLeadData(); // Recargar el lead
      }
    } catch (error) {
      console.error('Error al actualizar seguimiento:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar el seguimiento"
      });
    } finally {
      setUpdatingFollowUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Cargando información del lead...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : lead ? (
          <div className="space-y-6">

            {/* Cards de métricas en una sola fila */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Origen</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-200">{lead.source || 'No definido'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200 dark:border-amber-800">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Prioridad</p>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-200">{lead.priority || 'Media'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Asignado a</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-200">
                      {lead.assignedTo ? 
                        (typeof lead.assignedTo === 'string' ? lead.assignedTo : `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`) 
                        : 'Sin asignar'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/50 dark:to-cyan-900/50 border-cyan-200 dark:border-cyan-800">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-cyan-200 dark:bg-cyan-800 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100">Etapa Actual</p>
                    <p className="text-lg font-bold text-cyan-700 dark:text-cyan-200">{lead.currentStage || 'Sin definir'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contenido principal con tabs */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3 space-y-6">
                {/* Información del lead */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center text-primary font-bold text-xl">
                        {lead.firstName.charAt(0)}{lead.lastName?.charAt(0) || ''}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-2xl font-bold">{lead.firstName} {lead.lastName}</h2>
                          {lead.company && (
                            <span className="text-muted-foreground">• {lead.company}</span>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">
                          Creado: {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'No disponible'}
                        </p>
                        
                        {/* Enlaces de contacto y redes sociales */}
                        <div className="flex flex-wrap gap-3">
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
                            >
                              <Mail className="h-4 w-4" />
                              Email
                            </a>
                          )}
                          
                          {lead.phone && (
                            <>
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">
                                <Phone className="h-4 w-4" />
                                {lead.phone}
                              </span>
                              <a
                                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm"
                              >
                                <MessageCircle className="h-4 w-4" />
                                WhatsApp
                              </a>
                            </>
                          )}
                          
                          {lead.linkedin && (
                            <a
                              href={lead.linkedin.startsWith('http') ? lead.linkedin : `https://${lead.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
                            >
                              <Linkedin className="h-4 w-4" />
                              LinkedIn
                            </a>
                          )}
                          
                          {lead.instagram && (
                            <a
                              href={lead.instagram.startsWith('http') ? lead.instagram : `https://instagram.com/${lead.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors text-sm"
                            >
                              <Instagram className="h-4 w-4" />
                              Instagram
                            </a>
                          )}
                          
                          {lead.twitter && (
                            <a
                              href={lead.twitter.startsWith('http') ? lead.twitter : `https://twitter.com/${lead.twitter.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors text-sm"
                            >
                              <Twitter className="h-4 w-4" />
                              Twitter
                            </a>
                          )}
                          
                          {lead.facebook && (
                            <a
                              href={lead.facebook.startsWith('http') ? lead.facebook : `https://facebook.com/${lead.facebook}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
                            >
                              <Facebook className="h-4 w-4" />
                              Facebook
                            </a>
                          )}
                          
                          {lead.website && (
                            <a
                              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                            >
                              <Globe className="h-4 w-4" />
                              Sitio web
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    {canViewInfoTab && <TabsTrigger value="info">Información</TabsTrigger>}
                    <TabsTrigger value="followup">Seguimientos</TabsTrigger>
                    {canViewTasksTab && <TabsTrigger value="tasks">Tareas</TabsTrigger>}
                    {canViewDocumentsTab && <TabsTrigger value="documents">Documentos</TabsTrigger>}
                    {canViewNotesTab && <TabsTrigger value="notes">Notas</TabsTrigger>}
                  </TabsList>

                  {canViewInfoTab && (
                    <TabsContent value="info" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Información del Lead</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Nombre completo</Label>
                              <p className="text-sm text-muted-foreground">{lead.firstName} {lead.lastName}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Email</Label>
                              <p className="text-sm text-muted-foreground">{lead.email || 'No proporcionado'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Teléfono</Label>
                              <p className="text-sm text-muted-foreground">{lead.phone || 'No proporcionado'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Empresa</Label>
                              <p className="text-sm text-muted-foreground">{lead.company || 'No proporcionado'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Origen</Label>
                              <p className="text-sm text-muted-foreground">{lead.source || 'No definido'}</p>
                            </div>

                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}

                  <TabsContent value="followup" className="space-y-4">
                    <FollowUpTab
                      followUps={lead.followUps || []}
                      formatDateTime={formatDateTime}
                      hasUpdatePermission={canEditLead || false}
                      onMarkFollowUpCompleted={(id) => handleUpdateFollowUpStatus(id, 'completado')}
                      onMarkFollowUpCancelled={(id) => handleUpdateFollowUpStatus(id, 'cancelado')}
                      onEditFollowUp={handleEditFollowUp}
                    />
                  </TabsContent>

                  {canViewTasksTab && (
                    <TabsContent value="tasks" className="space-y-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle>Tareas</CardTitle>
                          {canAddTask && (
                            <Button 
                              size="sm"
                              onClick={() => setIsTaskModalOpen(true)}
                            >
                              <CheckSquare className="mr-2 h-4 w-4" />
                              Crear Tarea
                            </Button>
                          )}
                        </CardHeader>
                        <CardContent>
                          {lead.tasks && lead.tasks.length > 0 ? (
                            <div className="space-y-4">
                              {lead.tasks.map((task) => {
                                const getStatusIcon = (status: string) => {
                                  switch (status) {
                                    case 'completed':
                                      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
                                    case 'in_progress':
                                      return <Clock className="h-4 w-4 text-blue-600" />;
                                    case 'cancelled':
                                      return <AlertCircle className="h-4 w-4 text-red-600" />;
                                    default:
                                      return <Circle className="h-4 w-4 text-gray-400" />;
                                  }
                                };

                                const getStatusColor = (status: string) => {
                                  switch (status) {
                                    case 'completed':
                                      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
                                    case 'in_progress':
                                      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
                                    case 'cancelled':
                                      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
                                    default:
                                      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
                                  }
                                };

                                const getPriorityColor = (priority: string) => {
                                  switch (priority) {
                                    case 'urgente':
                                      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
                                    case 'alta':
                                      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
                                    case 'media':
                                      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
                                    default:
                                      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
                                  }
                                };

                                const getStatusLabel = (status: string) => {
                                  switch (status) {
                                    case 'pending':
                                      return 'Pendiente';
                                    case 'in_progress':
                                      return 'En Progreso';
                                    case 'completed':
                                      return 'Completada';
                                    case 'cancelled':
                                      return 'Cancelada';
                                    default:
                                      return status;
                                  }
                                };

                                const getPriorityLabel = (priority: string) => {
                                  switch (priority) {
                                    case 'baja':
                                      return 'Baja';
                                    case 'media':
                                      return 'Media';
                                    case 'alta':
                                      return 'Alta';
                                    case 'urgente':
                                      return 'Urgente';
                                    default:
                                      return priority;
                                  }
                                };

                                const isOverdue = (dueDate: string | Date, status: string) => {
                                  if (status === 'completada' || status === 'cancelada') return false;
                                  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
                                  return dateObj < new Date();
                                };

                                return (
                                  <div
                                    key={task._id}
                                    className={`border rounded-lg p-4 ${
                                      task.status === 'completada'
                                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                                        : task.status === 'cancelada'
                                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                                        : isOverdue(task.dueDate, task.status) 
                                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' 
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          {getStatusIcon(task.status)}
                                          <h4 className="font-medium">{task.title}</h4>
                                          {isOverdue(task.dueDate, task.status) && (
                                            <Badge variant="destructive" className="text-xs">
                                              Vencida
                                            </Badge>
                                          )}
                                        </div>
                                        
                                        {task.description && (
                                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {task.description}
                                          </p>
                                        )}
                                        
                                        <div className="flex flex-wrap gap-2 mb-3">
                                          <Badge className={getStatusColor(task.status)}>
                                            {getStatusLabel(task.status)}
                                          </Badge>
                                          <Badge className={getPriorityColor(task.priority)}>
                                            Prioridad: {getPriorityLabel(task.priority)}
                                          </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Vence: {formatDateTimeSafe(task.dueDate)}</span>
                                          </div>
                                          
                                          <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>
                                              Creada por: {typeof task.user === 'object' && task.user 
                                                ? `${task.user.firstName} ${task.user.lastName}`
                                                : 'Usuario'
                                              }
                                            </span>
                                          </div>
                                          
                                          {task.assignedTo && (
                                            <div className="flex items-center gap-2">
                                              <Users className="h-4 w-4" />
                                              <span>
                                                Asignada a: {typeof task.assignedTo === 'object' && task.assignedTo
                                                  ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                                                  : 'Empleado'
                                                }
                                              </span>
                                            </div>
                                          )}
                                          
                                          <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>Creada: {formatDateTimeSafe(task.createdAt)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {canAddTask && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                              <MoreVertical className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                                                                     <DropdownMenuContent align="end">
                                             <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                               <Edit className="h-4 w-4 mr-2" />
                                               Editar
                                             </DropdownMenuItem>
                                             <DropdownMenuItem onClick={() => handleAssignTask(task)}>
                                               <Users className="h-4 w-4 mr-2" />
                                               Asignar/Reasignar
                                             </DropdownMenuItem>
                                             <DropdownMenuSeparator />
                                             {task.status !== 'completada' && (
                                               <DropdownMenuItem 
                                                 onClick={() => handleUpdateTaskStatus(task._id!, 'completada')}
                                                 className="text-green-600 dark:text-green-400"
                                               >
                                                 <CheckCircle2 className="h-4 w-4 mr-2" />
                                                 Marcar como Completada
                                               </DropdownMenuItem>
                                             )}
                                             {task.status !== 'cancelada' && (
                                               <DropdownMenuItem 
                                                 onClick={() => handleUpdateTaskStatus(task._id!, 'cancelada')}
                                                 className="text-orange-600 dark:text-orange-400"
                                               >
                                                 <X className="h-4 w-4 mr-2" />
                                                 Marcar como Cancelada
                                               </DropdownMenuItem>
                                             )}
                                             {(task.status === 'completada' || task.status === 'cancelada') && (
                                               <DropdownMenuItem 
                                                 onClick={() => handleUpdateTaskStatus(task._id!, 'pendiente')}
                                                 className="text-blue-600 dark:text-blue-400"
                                               >
                                                 <Clock className="h-4 w-4 mr-2" />
                                                 Marcar como Pendiente
                                               </DropdownMenuItem>
                                             )}
                                             <DropdownMenuSeparator />
                                             <DropdownMenuItem 
                                               onClick={() => handleDeleteTask(task._id!)}
                                               className="text-red-600 dark:text-red-400"
                                             >
                                               <Trash2 className="h-4 w-4 mr-2" />
                                               Eliminar
                                             </DropdownMenuItem>
                                           </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No hay tareas registradas</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}

                  {canViewDocumentsTab && (
                    <TabsContent value="documents" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Documentos</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-muted-foreground">
                            No hay documentos registrados para este lead.
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}

                  {canViewNotesTab && (
                    <TabsContent value="notes" className="space-y-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle>Notas</CardTitle>
                          {canAddNote && (
                            <Button 
                              size="sm"
                              onClick={() => setIsNoteModalOpen(true)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Agregar Nota
                            </Button>
                          )}
                        </CardHeader>
                        <CardContent>
                          {lead.notes && lead.notes.length > 0 ? (
                            <div className="space-y-6">
                              {lead.notes.map((note, index) => {
                                const getUserInitials = (note: any): string => {
                                  if (!note.user) return 'U';
                                  
                                  const firstName = note.user.firstName || '';
                                  const lastName = note.user.lastName || '';
                                  
                                  if (firstName && firstName.length > 0) {
                                    return firstName.charAt(0).toUpperCase();
                                  } else if (lastName && lastName.length > 0) {
                                    return lastName.charAt(0).toUpperCase();
                                  }
                                  
                                  return 'U';
                                };
                                
                                const getUserFullName = (note: any): string => {
                                  if (!note.user) return 'Usuario desconocido';
                                  
                                  const firstName = note.user.firstName || '';
                                  const lastName = note.user.lastName || '';
                                  
                                  if (firstName || lastName) {
                                    return `${firstName} ${lastName}`.trim();
                                  }
                                  
                                  return 'Usuario desconocido';
                                };

                                return (
                                  <div key={note._id || index} className="flex gap-4">
                                    <Avatar className="h-10 w-10">
                                      {typeof note.user === 'object' && (note.user as any)?.avatar && (
                                        <AvatarImage src={(note.user as any).avatar} alt={getUserFullName(note)} />
                                      )}
                                      <AvatarFallback>
                                        {getUserInitials(note)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="font-medium text-gray-900 dark:text-gray-100">
                                            {getUserFullName(note)}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDateTimeSafe(note.createdAt)}
                                          </div>
                                          {canEditNote && note._id && (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                  <MoreVertical className="h-4 w-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => {
                                                  setNoteContent(note.content);
                                                  setCurrentNoteId(note._id || '');
                                                  setIsEditingNote(true);
                                                  setIsNoteModalOpen(true);
                                                }}>
                                                  <Edit className="h-4 w-4 mr-2" />
                                                  Editar
                                                </DropdownMenuItem>
                                                                                                 <DropdownMenuItem 
                                                   onClick={() => {
                                                     if (note._id && confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
                                                       handleDeleteNote(note._id);
                                                     }
                                                   }}
                                                   className="text-destructive"
                                                 >
                                                   <Trash2 className="h-4 w-4 mr-2" />
                                                   Eliminar
                                                 </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                                        {note.content}
                                      </p>

                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              No hay notas registradas
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                </Tabs>
              </div>

              {/* Panel lateral de acciones */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {canEditLead && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => router.push(`/leads/${id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Lead
                      </Button>
                    )}

                    {canEditStage && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setIsStageModalOpen(true)}
                      >
                        <Activity className="mr-2 h-4 w-4" />
                        Cambiar Etapa
                      </Button>
                    )}

                    {canUnassignLead && lead.assignedTo && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-500 dark:hover:bg-orange-950/50"
                        onClick={handleUnassignLead}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Desasignar Lead
                      </Button>
                    )}

                    {/* Botones específicos de cambio de stage */}
                    {canMarkContacted && lead.currentStage === 'Nuevo' && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-500 dark:hover:bg-blue-950/50"
                        onClick={handleMarkAsContacted}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Lead Contactado
                      </Button>
                    )}

                    {canScheduleFollowUpStage && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-950/50"
                        onClick={() => setShowFollowUpModal(true)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Crear Seguimiento
                      </Button>
                    )}

                    {canSetAgendaPending && ['Pendiente Seguimiento', 'Contactado'].includes(lead.currentStage) && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-500 dark:hover:bg-purple-950/50"
                        onClick={handleSetAgendaPending}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Agenda Pendiente
                      </Button>
                    )}

                    {canMoveToOpportunities && lead.currentStage === 'Agenda Pendiente' && lead.canMoveToSales && !lead.movedToOpportunities && (
                      <Button 
                        variant="default" 
                        className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={handleConvertToOpportunity}
                      >
                        <Target className="mr-2 h-4 w-4" />
                        Marcar Oportunidad
                      </Button>
                    )}

                    {/* Mensaje informativo cuando el lead ya fue convertido */}
                    {canMoveToOpportunities && lead.currentStage === 'Agenda Pendiente' && lead.movedToOpportunities && (
                      <div className="w-full p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                          <Target className="h-4 w-4" />
                          <span className="text-sm font-medium">Lead ya convertido</span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Este lead ya fue convertido a oportunidad anteriormente.
                        </p>
                        {lead.opportunityId && (
                          <Button 
                            variant="link" 
                            size="sm"
                            className="h-auto p-0 text-blue-600 dark:text-blue-400 text-xs"
                            onClick={() => router.push(`/oportunidades/${lead.opportunityId}`)}
                          >
                            Ver oportunidad →
                          </Button>
                        )}
                      </div>
                    )}

                    {canAnnulLead && lead.status !== 'anulado' && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/50"
                        onClick={() => setIsAnnulModalOpen(true)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Anular Lead
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : null}

        {/* Modal para cambiar etapa */}
        <Dialog open={isStageModalOpen} onOpenChange={setIsStageModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Cambiar Etapa del Lead</DialogTitle>
            <div className="space-y-4">
              <div>
                <Label htmlFor="stage">Nueva Etapa</Label>
                <Select value={selectedStage} onValueChange={handleStageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadStageCategories.map((stage) => (
                      <SelectItem key={stage._id} value={stage.name}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStageModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateStage} disabled={stageLoading}>
                {stageLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Actualizar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal para programar seguimiento */}
        <Dialog open={isFollowUpModalOpen} onOpenChange={setIsFollowUpModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Programar Seguimiento</DialogTitle>
            <form onSubmit={handleScheduleFollowUp} className="space-y-4">
              {followUpError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{followUpError}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="followup-date">Fecha</Label>
                <Input
                  id="followup-date"
                  type="date"
                  value={followUpForm.date}
                  onChange={handleFollowUpChange}
                  name="date"
                  required
                />
              </div>
              <div>
                <Label htmlFor="followup-time">Hora</Label>
                <Input
                  id="followup-time"
                  type="time"
                  value={followUpForm.time}
                  onChange={handleFollowUpChange}
                  name="time"
                  required
                />
              </div>
              <div>
                <Label htmlFor="followup-note">Nota</Label>
                <Textarea
                  id="followup-note"
                  value={followUpForm.note}
                  onChange={handleFollowUpChange}
                  name="note"
                  placeholder="Descripción del seguimiento..."
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFollowUpModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={followUpLoading}>
                  {followUpLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Programar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal para agregar actividad */}
        <Dialog open={isInteractionModalOpen} onOpenChange={setIsInteractionModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Agregar Actividad</DialogTitle>
            <form onSubmit={handleAddInteraction} className="space-y-4">
              {interactionError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{interactionError}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="interaction-type">Tipo</Label>
                <Select value={interactionForm.type} onValueChange={(value) => handleInteractionSelectChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Llamada</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Reunión</SelectItem>
                    <SelectItem value="note">Nota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="interaction-title">Título</Label>
                <Input
                  id="interaction-title"
                  value={interactionForm.title}
                  onChange={handleInteractionChange}
                  name="title"
                  placeholder="Título de la actividad"
                  required
                />
              </div>
              <div>
                <Label htmlFor="interaction-description">Descripción</Label>
                <Textarea
                  id="interaction-description"
                  value={interactionForm.description}
                  onChange={handleInteractionChange}
                  name="description"
                  placeholder="Descripción de la actividad..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="interaction-date">Fecha</Label>
                <Input
                  id="interaction-date"
                  type="date"
                  value={interactionForm.date}
                  onChange={handleInteractionChange}
                  name="date"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsInteractionModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={interactionLoading}>
                  {interactionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Agregar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal para crear tarea */}
        <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>{currentTask ? 'Editar Tarea' : 'Crear Tarea'}</DialogTitle>
            <form onSubmit={handleAddTask} className="space-y-4">
              {taskError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{taskError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="task-title">Título</Label>
                <Input
                  id="task-title"
                  value={taskForm.title}
                  onChange={handleTaskChange}
                  name="title"
                  placeholder="Título de la tarea"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description">Descripción</Label>
                <Textarea
                  id="task-description"
                  value={taskForm.description}
                  onChange={handleTaskChange}
                  name="description"
                  placeholder="Descripción de la tarea..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-dueDate">Fecha límite</Label>
                <Input
                  id="task-dueDate"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={handleTaskChange}
                  name="dueDate"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority">Prioridad</Label>
                <Select value={taskForm.priority} onValueChange={(value) => handleTaskSelectChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-assignedTo">Asignar a</Label>
                <Select value={taskForm.assignedTo} onValueChange={(value) => handleTaskSelectChange('assignedTo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {employees.map(employee => (
                      <SelectItem key={employee._id} value={employee._id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={taskLoading}>
                  {taskLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {currentTask ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal para agregar nota */}
        <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>{isEditingNote ? 'Editar Nota' : 'Agregar Nota'}</DialogTitle>
            <form onSubmit={handleSaveNote} className="space-y-4">
              {noteError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{noteError}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="note-content">Contenido</Label>
                <Textarea
                  id="note-content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Escribe tu nota aquí..."
                  rows={5}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNoteModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={noteLoading}>
                  {noteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isEditingNote ? 'Actualizar' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal para anular lead */}
        <Dialog open={isAnnulModalOpen} onOpenChange={setIsAnnulModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Anular Lead</DialogTitle>
            <form onSubmit={handleAnnulLead} className="space-y-4">
              {annulError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{annulError}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="annul-reason">Motivo de anulación</Label>
                <Textarea
                  id="annul-reason"
                  value={annulReason}
                  onChange={(e) => setAnnulReason(e.target.value)}
                  placeholder="Explica el motivo de la anulación..."
                  rows={3}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAnnulModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="destructive" disabled={annulLoading}>
                  {annulLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Anular Lead
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal para crear seguimiento */}
        <FollowUpModal
          isOpen={showFollowUpModal}
          onClose={() => setShowFollowUpModal(false)}
          onCreateFollowUp={handleCreateFollowUp}
          loading={creatingFollowUp}
        />

        {/* Modal para editar seguimiento */}
        <EditFollowUpModal
          isOpen={showEditFollowUpModal}
          onClose={() => {
            setShowEditFollowUpModal(false);
            setEditingFollowUp(null);
          }}
          onUpdateFollowUp={handleUpdateFollowUp}
          followUp={editingFollowUp}
          loading={updatingFollowUp}
        />
      </div>
    </div>
  )
} 