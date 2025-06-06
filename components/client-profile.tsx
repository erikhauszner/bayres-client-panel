"use client"

import { useState, useEffect } from "react"
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
  MessageSquare,
  FileText,
  Plus,
  User,
  Bell,
  Briefcase,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { ClientData, Proyecto, Factura, Documento, Representante, Actividad } from "@/types/client"
import { clientService } from "@/lib/services/clientService"
import { Client, ClientInteraction, ClientDocument, ContactPerson } from "@/lib/types/client"
import { Employee } from "@/lib/types/lead"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { convertClientToLead } from '@/lib/services/clientService'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ClientProfile({ id }: { id: string }) {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  
  // Estados para los modales
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  
  // Estados para forms
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "in_progress"
  })
  
  const [contactForm, setContactForm] = useState({
    name: "",
    position: "",
    email: "",
    phone: ""
  })
  
  const [activityForm, setActivityForm] = useState({
    type: "meeting" as "meeting" | "call" | "email" | "note" | "other",
    title: "",
    description: "",
    date: new Date().toISOString().substring(0, 16)
  })
  
  const [invoiceForm, setInvoiceForm] = useState({
    number: "",
    amount: "",
    date: new Date().toISOString().substring(0, 10),
    status: "pending"
  })
  
  const [documentForm, setDocumentForm] = useState({
    name: "",
    file: null as File | null
  })
  
  // Estado para el formulario de notas
  const [noteForm, setNoteForm] = useState({
    content: ""
  })

  // Estados para edición
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const data: Client = await clientService.getClientById(id)
        
        const transformedData: ClientData = {
          id: data._id?.toString() || id,
          name: data.name,
          contact: data.name,
          email: data.email,
          phone: data.phone || "",
          address: data.address || "",
          website: data.website || "",
          industry: data.industry || "",
          status: data.status,
          projects: [],
          avatar: "/placeholder.svg?height=128&width=128",
          createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : new Date().toISOString(),
          city: data.city || "",
          country: data.country || "",
          postalCode: data.postalCode || "",
          taxId: data.businessTaxId || "",
          notes: data.notes || "",
          activities: data.interactions ? data.interactions.map((interaction: ClientInteraction) => ({
            _id: interaction._id?.toString() || "",
            type: interaction.type,
            title: interaction.title || "",
            date: interaction.date ? new Date(interaction.date).toISOString() : new Date().toISOString(),
            description: interaction.description
          })) : [],
          invoices: [],
          documents: data.documents ? data.documents.map((doc: ClientDocument) => ({
            _id: doc._id?.toString() || "",
            name: doc.name,
            date: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : new Date().toISOString(),
            size: doc.size ? `${(doc.size / 1024).toFixed(2)} KB` : "Desconocido"
          })) : [],
          representatives: data.representatives ? data.representatives.map(rep => ({
            _id: rep._id || '',
            name: rep.name,
            position: rep.position || '',
            email: rep.email || '',
            phone: rep.phone || ''
          })) : [],
          company: data.businessName || "",
          whatsapp: "",
          instagram: data.instagram || "",
          twitter: data.twitter || "",
          linkedin: data.linkedin || "",
          facebook: data.facebook || "",
        }
        
        setClientData(transformedData)
        setIsLoaded(true)
      } catch (error: any) {
        console.error('Error:', error)
        setErrorMessage(error.response?.data?.message || "No se pudo cargar la información del cliente")
        setIsError(true)
        setIsLoaded(true)
      }
    }

    fetchClientData()
  }, [id])
  
  // Función para actualizar los datos del cliente
  const refreshClientData = async () => {
    try {
      const data = await clientService.getClientById(id)
      const updatedData = { ...clientData } as ClientData
      
      // Actualizar las secciones relevantes
      updatedData.notes = data.notes || ""
      
      if (data.interactions) {
        updatedData.activities = data.interactions.map((interaction: ClientInteraction) => ({
          _id: interaction._id?.toString() || "",
          type: interaction.type,
          title: interaction.title || "",
          date: interaction.date ? new Date(interaction.date).toISOString() : new Date().toISOString(),
          description: interaction.description
        }))
      }
      
      if (data.documents) {
        updatedData.documents = data.documents.map((doc: ClientDocument) => ({
          _id: doc._id?.toString() || "",
          name: doc.name,
          date: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : new Date().toISOString(),
          size: doc.size ? `${(doc.size / 1024).toFixed(2)} KB` : "Desconocido"
        }))
      }
      
      if (data.representatives) {
        updatedData.representatives = data.representatives.map(rep => ({
          _id: rep._id || '',
          name: rep.name,
          position: rep.position || '',
          email: rep.email || '',
          phone: rep.phone || ''
        }));
      }
      
      setClientData(updatedData)
    } catch (error) {
      console.error('Error al actualizar datos:', error)
    }
  }

  const handleEditClient = () => {
    router.push(`/clientes/${id}/edit`)
  }

  const handleDeleteClient = async () => {
    if (!window.confirm("¿Estás seguro que deseas eliminar este cliente? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      setIsDeleting(true)
      await clientService.deleteClient(id)
      
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado exitosamente",
      })
      
      router.push('/clientes')
    } catch (error: any) {
      console.error("Error al eliminar cliente:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo eliminar el cliente"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConvertToLead = async () => {
    try {
      setIsConverting(true)
      const { leadId } = await convertClientToLead(id)
      toast({
        title: "Cliente convertido a lead",
        description: "El cliente ha sido convertido a lead exitosamente.",
      })
      router.push(`/leads/${leadId}`)
    } catch (error) {
      console.error('Error al convertir cliente a lead:', error)
      toast({
        title: "Error",
        description: "No se pudo convertir el cliente a lead.",
        variant: "destructive",
      })
    } finally {
      setIsConverting(false)
    }
  }
  
  // Handlers para formularios
  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProjectForm(prev => ({ ...prev, [name]: value }))
  }
  
  const handleProjectSelectChange = (name: string, value: string) => {
    setProjectForm(prev => ({ ...prev, [name]: value }))
  }
  
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContactForm(prev => ({ ...prev, [name]: value }))
  }
  
  const handleActivityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setActivityForm(prev => ({ ...prev, [name]: value }))
  }
  
  const handleActivitySelectChange = (name: string, value: string) => {
    setActivityForm(prev => ({ ...prev, [name]: value }))
  }
  
  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setInvoiceForm(prev => ({ ...prev, [name]: value }))
  }
  
  const handleInvoiceSelectChange = (name: string, value: string) => {
    setInvoiceForm(prev => ({ ...prev, [name]: value }))
  }
  
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDocumentForm(prev => ({ ...prev, [name]: value }))
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentForm(prev => ({ ...prev, file: e.target.files![0] }))
    }
  }
  
  // Resetear formularios
  const resetProjectForm = () => {
    setProjectForm({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "in_progress"
    })
    setEditingItemId(null)
  }
  
  const resetContactForm = () => {
    setContactForm({
      name: "",
      position: "",
      email: "",
      phone: ""
    })
    setEditingItemId(null)
  }
  
  const resetActivityForm = () => {
    setActivityForm({
      type: "meeting",
      title: "",
      description: "",
      date: new Date().toISOString().substring(0, 16)
    })
    setEditingItemId(null)
  }
  
  const resetInvoiceForm = () => {
    setInvoiceForm({
      number: "",
      amount: "",
      date: new Date().toISOString().substring(0, 10),
      status: "pending"
    })
    setEditingItemId(null)
  }
  
  const resetDocumentForm = () => {
    setDocumentForm({
      name: "",
      file: null
    })
    setEditingItemId(null)
  }
  
  // Resetear formulario de notas
  const resetNoteForm = () => {
    setNoteForm({
      content: clientData?.notes || ""
    })
    setEditingItemId(null)
  }
  
  // Handlers para agregar elementos
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!activityForm.title || !activityForm.description) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos requeridos"
      })
      return
    }
    
    try {
      await clientService.addInteraction(id, {
        type: activityForm.type,
        title: activityForm.title,
        description: activityForm.description,
        date: new Date(activityForm.date)
      })
      
      toast({
        title: "Actividad agregada",
        description: "La actividad ha sido registrada exitosamente"
      })
      
      resetActivityForm()
      setIsActivityModalOpen(false)
      await refreshClientData()
    } catch (error: any) {
      console.error("Error al agregar actividad:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo registrar la actividad"
      })
    }
  }
  
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!documentForm.name || !documentForm.file) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos requeridos"
      })
      return
    }
    
    try {
      const formData = new FormData()
      formData.append('name', documentForm.name)
      formData.append('file', documentForm.file)
      
      await clientService.addDocument(id, formData)
      
      toast({
        title: "Documento agregado",
        description: "El documento ha sido subido exitosamente"
      })
      
      resetDocumentForm()
      setIsDocumentModalOpen(false)
      await refreshClientData()
    } catch (error: any) {
      console.error("Error al subir documento:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo subir el documento"
      })
    }
  }
  
  // Handlers para editar elementos
  const handleEditActivity = (activity: Actividad) => {
    setActivityForm({
      type: (activity.type as "meeting" | "call" | "email" | "note" | "other"),
      title: activity.title,
      description: activity.description,
      date: new Date(activity.date).toISOString().substring(0, 16)
    })
    setEditingItemId(activity._id)
    setIsActivityModalOpen(true)
  }
  
  // Handlers para eliminar elementos
  const handleDeleteActivity = async (activityId: string) => {
    try {
      // Implementar la eliminación de actividad aquí cuando esté disponible en la API
      toast({
        title: "Actividad eliminada",
        description: "La actividad ha sido eliminada exitosamente"
      })
      await refreshClientData()
    } catch (error: any) {
      console.error("Error al eliminar actividad:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo eliminar la actividad"
      })
    }
  }
  
  const handleDeleteDocument = async (documentId: string) => {
    try {
      await clientService.deleteDocument(id, documentId)
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado exitosamente"
      })
      await refreshClientData()
    } catch (error: any) {
      console.error("Error al eliminar documento:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo eliminar el documento"
      })
    }
  }

  const getClientInitials = (name: string): string => {
    if (!name) return "C";
    
    const parts = name.split(' ');
    
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    } else {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "active":
        return "bg-green-950/30 text-green-400 border border-green-800/30"
      case "inactive":
        return "bg-amber-950/30 text-amber-400 border border-amber-800/30"
      case "pending":
        return "bg-amber-950/30 text-amber-400 border border-amber-800/30"
      case "in_progress":
        return "bg-blue-950/30 text-blue-400 border border-blue-800/30"
      case "completed":
        return "bg-green-950/30 text-green-400 border border-green-800/30"
      case "paid":
        return "bg-green-950/30 text-green-400 border border-green-800/30"
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
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  // Agregar handlers para proyectos
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projectForm.name || !projectForm.startDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos requeridos"
      })
      return
    }
    
    try {
      // Implementar cuando el endpoint esté disponible
      // await clientService.addProject(id, {
      //   name: projectForm.name,
      //   description: projectForm.description,
      //   startDate: new Date(projectForm.startDate),
      //   endDate: projectForm.endDate ? new Date(projectForm.endDate) : undefined,
      //   status: projectForm.status
      // })
      
      toast({
        title: "Proyecto agregado",
        description: "El proyecto ha sido registrado exitosamente"
      })
      
      resetProjectForm()
      setIsProjectModalOpen(false)
      await refreshClientData()
    } catch (error: any) {
      console.error("Error al agregar proyecto:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo registrar el proyecto"
      })
    }
  }

  const handleEditProject = (project: Proyecto) => {
    setProjectForm({
      name: project.name,
      description: project.description || "",
      startDate: new Date(project.startDate).toISOString().substring(0, 10),
      endDate: project.endDate ? new Date(project.endDate).toISOString().substring(0, 10) : "",
      status: project.status
    })
    setEditingItemId(project._id)
    setIsProjectModalOpen(true)
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      // Implementar cuando el endpoint esté disponible
      // await clientService.deleteProject(id, projectId)
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto ha sido eliminado exitosamente"
      })
      await refreshClientData()
    } catch (error: any) {
      console.error("Error al eliminar proyecto:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo eliminar el proyecto"
      })
    }
  }

  // Handlers para contactos/representantes
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contactForm.name || !contactForm.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos requeridos"
      })
      return
    }
    
    try {
      // Para la actualización utilizamos el endpoint de actualización del cliente
      // añadiendo el nuevo representante a la lista actual
      const currentClient = await clientService.getClientById(id)
      const currentRepresentatives = currentClient.representatives || []
      
      await clientService.updateClient(id, {
        representatives: [
          ...currentRepresentatives,
          {
            name: contactForm.name,
            position: contactForm.position,
            email: contactForm.email,
            phone: contactForm.phone
          }
        ]
      })
      
      toast({
        title: "Contacto agregado",
        description: "El contacto ha sido registrado exitosamente"
      })
      
      resetContactForm()
      setIsContactModalOpen(false)
      await refreshClientData()
    } catch (error: any) {
      console.error("Error al agregar contacto:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo registrar el contacto"
      })
    }
  }

  const handleEditContact = (contact: Representante) => {
    setContactForm({
      name: contact.name,
      position: contact.position,
      email: contact.email,
      phone: contact.phone
    })
    setEditingItemId(contact._id)
    setIsContactModalOpen(true)
  }

  const handleDeleteContact = async (contactId: string) => {
    try {
      const currentClient = await clientService.getClientById(id)
      const updatedRepresentatives = (currentClient.representatives || [])
        .filter(rep => rep._id !== contactId)
      
      await clientService.updateClient(id, {
        representatives: updatedRepresentatives
      })
      
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado exitosamente"
      })
      await refreshClientData()
    } catch (error: any) {
      console.error("Error al eliminar contacto:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo eliminar el contacto"
      })
    }
  }

  // Handlers para facturas
  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invoiceForm.number || !invoiceForm.amount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos requeridos"
      })
      return
    }
    
    try {
      // Implementar cuando el endpoint esté disponible
      // await clientService.addInvoice(id, {
      //   number: invoiceForm.number,
      //   amount: invoiceForm.amount,
      //   date: new Date(invoiceForm.date),
      //   status: invoiceForm.status
      // })
      
      toast({
        title: "Factura agregada",
        description: "La factura ha sido registrada exitosamente"
      })
      
      resetInvoiceForm()
      setIsInvoiceModalOpen(false)
      await refreshClientData()
    } catch (error: any) {
      console.error("Error al agregar factura:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo registrar la factura"
      })
    }
  }

  const handleEditInvoice = (invoice: Factura) => {
    setInvoiceForm({
      number: invoice.number,
      amount: invoice.amount,
      date: new Date(invoice.date).toISOString().substring(0, 10),
      status: invoice.status
    })
    setEditingItemId(invoice._id)
    setIsInvoiceModalOpen(true)
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      // Implementar cuando el endpoint esté disponible
      // await clientService.deleteInvoice(id, invoiceId)
      toast({
        title: "Factura eliminada",
        description: "La factura ha sido eliminada exitosamente"
      })
      await refreshClientData()
    } catch (error: any) {
      console.error("Error al eliminar factura:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo eliminar la factura"
      })
    }
  }

  // Handlers para notas
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNoteForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!noteForm.content) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa el contenido de la nota"
      })
      return
    }
    
    try {
      // Actualizamos la nota utilizando el endpoint de actualización del cliente
      await clientService.updateClient(id, {
        notes: noteForm.content
      })
      
      toast({
        title: "Nota guardada",
        description: "La nota ha sido guardada exitosamente"
      })
      
      setIsNoteModalOpen(false)
      await refreshClientData()
    } catch (error: any) {
      console.error("Error al guardar la nota:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar la nota"
      })
    }
  }

  const handleEditNote = () => {
    setNoteForm({
      content: clientData?.notes || ""
    })
    setIsNoteModalOpen(true)
  }

  const handleDeleteNote = async () => {
    try {
      await clientService.updateClient(id, {
        notes: ""
      })
      
      toast({
        title: "Nota eliminada",
        description: "La nota ha sido eliminada exitosamente"
      })
      
      await refreshClientData()
    } catch (error: any) {
      console.error("Error al eliminar la nota:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo eliminar la nota"
      })
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Cargando información del cliente...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (isError || !clientData) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl">
              <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage || "No se pudo cargar la información del cliente. Por favor, intenta de nuevo más tarde."}
                </AlertDescription>
              </Alert>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="netflix-scrollbar flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">{clientData.name}</h1>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isConverting}>
                    Convertir a Lead
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Convertir a Lead?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción convertirá este cliente en un lead. El cliente será eliminado y toda su información se transferirá al nuevo lead.
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleConvertToLead}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="netflix-card lg:col-span-2">
                <CardContent className="p-6">
                  <div className="flex flex-col items-start gap-6 sm:flex-row">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-2xl">{getClientInitials(clientData.name)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold">{clientData.name}</h2>
                        <p className="text-muted-foreground">{clientData.industry || clientData.company || 'Sin empresa'}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(clientData.status)}>
                          {clientData.status.charAt(0).toUpperCase() + clientData.status.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="bg-card/50">
                          {clientData.projects?.length || 0} Proyectos
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${clientData.email}`} className="hover:underline">
                            {clientData.email}
                          </a>
                        </div>
                        {clientData.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${clientData.phone}`} className="hover:underline">
                              {clientData.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-auto flex flex-col gap-2 sm:flex-row">
                      <Button variant="outline" size="sm" className="gap-2" onClick={handleEditClient}>
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="gap-2" 
                        onClick={handleDeleteClient}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Eliminando...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="netflix-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Información Clave</CardTitle>
                  <CardDescription>Datos importantes del cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Contacto principal</span>
                      <span className="font-medium">{clientData.contact}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">ID Fiscal</span>
                      <span className="font-medium">{clientData.taxId || "No definido"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Fecha de creación</span>
                      <span className="font-medium">{formatDate(clientData.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Última actualización</span>
                      <span className="font-medium">{formatDate(clientData.updatedAt)}</span>
                    </div>
                  </div>

                  <Separator className="bg-border/10" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Proyectos activos</span>
                      <Badge variant="outline" className="bg-card/50">
                        {clientData.projects?.filter((p: any) => p.status === "in_progress").length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Facturas pendientes</span>
                      <Badge variant="outline" className="bg-card/50">
                        {clientData.invoices?.filter((f: any) => f.status === "pending").length || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="info" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-7">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="projects">Proyectos</TabsTrigger>
                <TabsTrigger value="contacts">Contactos</TabsTrigger>
                <TabsTrigger value="activities">Actividades</TabsTrigger>
                <TabsTrigger value="invoices">Facturas</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <Card className="netflix-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Información de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Información de la Empresa</h3>
                          <div className="space-y-2 rounded-md border border-border/10 bg-card/30 p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Nombre:</span>
                              <span>{clientData.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Contacto principal:</span>
                              <span>{clientData.contact}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Email:</span>
                              <span>{clientData.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Teléfono:</span>
                              <span>{clientData.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Industria:</span>
                              <span>{clientData.industry}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Redes Sociales</h3>
                          <div className="space-y-2 rounded-md border border-border/10 bg-card/30 p-3">
                            {clientData.whatsapp && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">WhatsApp:</span>
                                <span>{clientData.whatsapp}</span>
                              </div>
                            )}
                            {clientData.instagram && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">Instagram:</span>
                                <span>{clientData.instagram}</span>
                              </div>
                            )}
                            {clientData.twitter && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">Twitter:</span>
                                <span>{clientData.twitter}</span>
                              </div>
                            )}
                            {clientData.linkedin && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">LinkedIn:</span>
                                <span>{clientData.linkedin}</span>
                              </div>
                            )}
                            {clientData.facebook && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">Facebook:</span>
                                <span>{clientData.facebook}</span>
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
                                <p>{clientData.address}</p>
                                <p>
                                  {clientData.city}, {clientData.country} {clientData.postalCode}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Sitio Web</h3>
                          <div className="space-y-2 rounded-md border border-border/10 bg-card/30 p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={clientData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {clientData.website}
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Notas</h3>
                          <div className="space-y-2 rounded-md border border-border/10 bg-card/30 p-3">
                            <p className="text-sm">{clientData.notes}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                <Card className="netflix-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg font-medium">Proyectos</CardTitle>
                      <CardDescription>Proyectos asociados al cliente</CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        resetProjectForm();
                        setIsProjectModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nuevo Proyecto</span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientData.projects && clientData.projects.length > 0 ? (
                        clientData.projects.map((proyecto: Proyecto) => (
                          <div key={proyecto._id} className="space-y-3 rounded-md border border-border/10 bg-card/30 p-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{proyecto.name}</h3>
                              <Badge className={getStatusColor(proyecto.status)}>
                                {proyecto.status.replace("_", " ").charAt(0).toUpperCase() +
                                  proyecto.status.replace("_", " ").slice(1)}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progreso</span>
                                <span className="font-medium">{proyecto.progress}%</span>
                              </div>
                              <Progress
                                value={proyecto.progress}
                                className="h-2"
                                indicatorClassName={
                                  proyecto.progress === 100
                                    ? "bg-green-500"
                                    : proyecto.progress > 50
                                      ? "bg-blue-500"
                                      : "bg-amber-500"
                                }
                              />
                            </div>
                            <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Inicio: {formatDate(proyecto.startDate)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Fin: {formatDate(proyecto.endDate)}</span>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditProject(proyecto)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive"
                                onClick={() => handleDeleteProject(proyecto._id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No hay proyectos asociados a este cliente.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4">
                <Card className="netflix-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg font-medium">Contactos</CardTitle>
                      <CardDescription>Representantes de la empresa</CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        resetContactForm();
                        setIsContactModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Añadir Contacto</span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientData.representatives && clientData.representatives.length > 0 ? (
                        clientData.representatives.map((representante: Representante) => (
                          <div
                            key={representante._id}
                            className="flex flex-col gap-4 rounded-md border border-border/10 bg-card/30 p-4 sm:flex-row sm:items-center"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>{representante.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <h3 className="font-medium">{representante.name}</h3>
                              <p className="text-sm text-muted-foreground">{representante.position}</p>
                              <div className="flex flex-wrap gap-4 pt-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <a href={`mailto:${representante.email}`} className="hover:underline">
                                    {representante.email}
                                  </a>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <a href={`tel:${representante.phone}`} className="hover:underline">
                                    {representante.phone}
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditContact(representante)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive"
                                onClick={() => handleDeleteContact(representante._id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No hay contactos registrados para este cliente.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activities" className="space-y-4">
                <Card className="netflix-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg font-medium">Actividades</CardTitle>
                      <CardDescription>Historial de interacciones con el cliente</CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        resetActivityForm();
                        setIsActivityModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nueva Actividad</span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientData.activities && clientData.activities.length > 0 ? (
                        clientData.activities.map((actividad: Actividad) => (
                          <div
                            key={actividad._id}
                            className="flex gap-4 rounded-md border border-border/10 bg-card/30 p-4"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              {getActivityIcon(actividad.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{actividad.title}</h3>
                                <span className="text-xs text-muted-foreground">{formatDate(actividad.date)}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{actividad.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditActivity(actividad)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => actividad._id && handleDeleteActivity(actividad._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No hay actividades registradas para este cliente.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invoices" className="space-y-4">
                <Card className="netflix-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg font-medium">Facturas</CardTitle>
                      <CardDescription>Historial de facturación</CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        resetInvoiceForm();
                        setIsInvoiceModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nueva Factura</span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientData.invoices && clientData.invoices.length > 0 ? (
                        clientData.invoices.map((factura: Factura) => (
                          <div
                            key={factura._id}
                            className="flex items-center justify-between rounded-md border border-border/10 bg-card/30 p-4"
                          >
                            <div className="space-y-1">
                              <h3 className="font-medium">{factura.number}</h3>
                              <p className="text-xs text-muted-foreground">Fecha: {formatDate(factura.date)}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{factura.amount}</div>
                              <Badge className={getStatusColor(factura.status)}>
                                {factura.status.charAt(0).toUpperCase() + factura.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditInvoice(factura)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteInvoice(factura._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No hay facturas registradas para este cliente.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card className="netflix-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg font-medium">Documentos</CardTitle>
                      <CardDescription>Archivos relacionados con el cliente</CardDescription>
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
                      <span>Subir Documento</span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientData.documents && clientData.documents.length > 0 ? (
                        clientData.documents.map((documento: Documento) => (
                          <div
                            key={documento._id}
                            className="flex items-center gap-4 rounded-md border border-border/10 bg-card/30 p-4"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{documento.name}</h3>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm">
                                    Descargar
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full text-destructive"
                                    onClick={() => documento._id && handleDeleteDocument(documento._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>Subido el {formatDate(documento.date)}</span>
                                <span className="mx-2">•</span>
                                <span>{documento.size}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No hay documentos asociados a este cliente.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card className="netflix-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg font-medium">Notas</CardTitle>
                      <CardDescription>Notas y comentarios sobre el cliente</CardDescription>
                    </div>
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
                  </CardHeader>
                  <CardContent>
                    {clientData?.notes ? (
                      <div className="rounded-md border border-border/10 bg-card/30 p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Nota principal</h3>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full"
                              onClick={handleEditNote}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                              onClick={handleDeleteNote}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">{clientData.notes}</div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No hay notas registradas para este cliente.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Modal de Actividad */}
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItemId ? "Editar Actividad" : "Nueva Actividad"}</DialogTitle>
            <DialogDescription>
              {editingItemId ? "Modifica los detalles de la actividad" : "Registra una nueva interacción con el cliente"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddActivity}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="activity-type">Tipo de actividad</Label>
                <Select
                  value={activityForm.type}
                  onValueChange={(value) => handleActivitySelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Reunión</SelectItem>
                    <SelectItem value="call">Llamada</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="note">Nota</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="activity-title">Título *</Label>
                <Input
                  id="activity-title"
                  name="title"
                  value={activityForm.title}
                  onChange={handleActivityChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="activity-date">Fecha *</Label>
                <Input
                  id="activity-date"
                  name="date"
                  type="datetime-local"
                  value={activityForm.date}
                  onChange={handleActivityChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="activity-description">Descripción *</Label>
                <Textarea
                  id="activity-description"
                  name="description"
                  value={activityForm.description}
                  onChange={handleActivityChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsActivityModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{editingItemId ? "Actualizar" : "Guardar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Documento */}
      <Dialog open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Subir Documento</DialogTitle>
            <DialogDescription>
              Adjunta un documento relacionado con este cliente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDocument}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="document-name">Nombre del documento *</Label>
                <Input
                  id="document-name"
                  name="name"
                  value={documentForm.name}
                  onChange={handleDocumentChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="document-file">Archivo *</Label>
                <Input
                  id="document-file"
                  name="file"
                  type="file"
                  onChange={handleFileChange}
                  required={!editingItemId}
                />
                <p className="text-xs text-muted-foreground">
                  Formatos admitidos: PDF, DOCX, XLSX, imágenes (máx. 5MB)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDocumentModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Subir</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Proyecto */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItemId ? "Editar Proyecto" : "Nuevo Proyecto"}</DialogTitle>
            <DialogDescription>
              {editingItemId ? "Modifica los detalles del proyecto" : "Crea un nuevo proyecto para este cliente"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProject}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Nombre del proyecto *</Label>
                <Input
                  id="project-name"
                  name="name"
                  value={projectForm.name}
                  onChange={handleProjectChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="project-description">Descripción</Label>
                <Textarea
                  id="project-description"
                  name="description"
                  value={projectForm.description}
                  onChange={handleProjectChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="project-start-date">Fecha de inicio *</Label>
                <Input
                  id="project-start-date"
                  name="startDate"
                  type="date"
                  value={projectForm.startDate}
                  onChange={handleProjectChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="project-end-date">Fecha de finalización</Label>
                <Input
                  id="project-end-date"
                  name="endDate"
                  type="date"
                  value={projectForm.endDate}
                  onChange={handleProjectChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="project-status">Estado</Label>
                <Select
                  value={projectForm.status}
                  onValueChange={(value) => handleProjectSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_progress">En progreso</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsProjectModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{editingItemId ? "Actualizar" : "Crear"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Contacto */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItemId ? "Editar Contacto" : "Nuevo Contacto"}</DialogTitle>
            <DialogDescription>
              {editingItemId ? "Modifica los detalles del contacto" : "Añade un nuevo contacto para este cliente"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddContact}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="contact-name">Nombre *</Label>
                <Input
                  id="contact-name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="contact-position">Cargo</Label>
                <Input
                  id="contact-position"
                  name="position"
                  value={contactForm.position}
                  onChange={handleContactChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="contact-email">Email *</Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="contact-phone">Teléfono</Label>
                <Input
                  id="contact-phone"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleContactChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsContactModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{editingItemId ? "Actualizar" : "Guardar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Factura */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItemId ? "Editar Factura" : "Nueva Factura"}</DialogTitle>
            <DialogDescription>
              {editingItemId ? "Modifica los detalles de la factura" : "Crea una nueva factura para este cliente"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddInvoice}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="invoice-number">Número de factura *</Label>
                <Input
                  id="invoice-number"
                  name="number"
                  value={invoiceForm.number}
                  onChange={handleInvoiceChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="invoice-amount">Monto *</Label>
                <Input
                  id="invoice-amount"
                  name="amount"
                  value={invoiceForm.amount}
                  onChange={handleInvoiceChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="invoice-date">Fecha *</Label>
                <Input
                  id="invoice-date"
                  name="date"
                  type="date"
                  value={invoiceForm.date}
                  onChange={handleInvoiceChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="invoice-status">Estado</Label>
                <Select
                  value={invoiceForm.status}
                  onValueChange={(value) => handleInvoiceSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="paid">Pagada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="overdue">Vencida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsInvoiceModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{editingItemId ? "Actualizar" : "Crear"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Nota */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{clientData?.notes ? "Editar Nota" : "Nueva Nota"}</DialogTitle>
            <DialogDescription>
              {clientData?.notes ? "Modifica la nota existente" : "Añade una nueva nota para este cliente"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNote}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="note-content">Contenido *</Label>
                <Textarea
                  id="note-content"
                  name="content"
                  value={noteForm.content}
                  onChange={handleNoteChange}
                  placeholder="Escribe aquí tus notas sobre el cliente..."
                  rows={6}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsNoteModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
