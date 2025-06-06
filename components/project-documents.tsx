"use client"

import { useState, useEffect } from "react"
import {
  FileUp,
  FilePlus,
  FileText,
  FileImage,
  File,
  Trash2,
  Download,
  History,
  Tag,
  Copy,
  Clock,
  MoreVertical,
  Search,
  Filter,
  Eye,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { documentService } from "@/lib/services/documentService"
import { Document, DocumentType, DocumentStatus, DocumentVersion } from "@/lib/types/document"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectDocumentsProps {
  projectId: string;
}

export default function ProjectDocuments({ projectId }: ProjectDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [newDocumentData, setNewDocumentData] = useState({
    name: "",
    type: "other" as DocumentType,
    description: "",
    tags: "",
  })
  const [newVersionNotes, setNewVersionNotes] = useState("")

  // Cargar documentos al montar el componente
  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true)
        const docs = await documentService.getDocuments({ projectId })
        setDocuments(docs)
        setFilteredDocuments(docs)
      } catch (error) {
        console.error("Error cargando documentos:", error)
        toast.error("Error al cargar los documentos")
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      loadDocuments()
    }
  }, [projectId])

  // Filtrar documentos cuando cambian los filtros o el término de búsqueda
  useEffect(() => {
    let filtered = [...documents]
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(search) || 
        doc.description?.toLowerCase().includes(search) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(search))
      )
    }
    
    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(doc => doc.status === statusFilter)
    }
    
    // Filtrar por tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter(doc => doc.type === typeFilter)
    }
    
    setFilteredDocuments(filtered)
  }, [documents, searchTerm, statusFilter, typeFilter])

  // Cargar versiones cuando se selecciona un documento
  useEffect(() => {
    async function loadVersions() {
      if (!selectedDocument?._id) return
      
      try {
        const versions = await documentService.getDocumentVersions(selectedDocument._id)
        setDocumentVersions(versions)
      } catch (error) {
        console.error("Error cargando versiones:", error)
        toast.error("Error al cargar las versiones del documento")
      }
    }

    if (selectedDocument) {
      loadVersions()
    } else {
      setDocumentVersions([])
    }
  }, [selectedDocument])

  // Manejar la carga de documentos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFileToUpload(file)
      
      // Llenar el nombre automáticamente si está vacío
      if (!newDocumentData.name) {
        setNewDocumentData({
          ...newDocumentData,
          name: file.name.split(".")[0], // Nombre sin extensión
        })
      }
    }
  }

  // Subir un nuevo documento
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fileToUpload) {
      toast.error("Por favor selecciona un archivo")
      return
    }
    
    try {
      setUploading(true)
      
      // Preparar datos del documento
      const tags = newDocumentData.tags
        ? newDocumentData.tags.split(",").map(tag => tag.trim())
        : []
      
      const documentData = {
        ...newDocumentData,
        projectId,
        tags,
        file: fileToUpload,
      }
      
      // Subir documento
      const uploadedDoc = await documentService.uploadDocument(documentData)
      
      if (uploadedDoc) {
        setDocuments([...documents, uploadedDoc])
        toast.success("Documento subido correctamente")
        
        // Resetear formulario
        setNewDocumentData({
          name: "",
          type: "other" as DocumentType,
          description: "",
          tags: "",
        })
        setFileToUpload(null)
        
        // Cerrar modal (se hace con DialogClose en el botón del formulario)
      } else {
        toast.error("Error al subir el documento")
      }
    } catch (error) {
      console.error("Error subiendo documento:", error)
      toast.error("Error al subir el documento")
    } finally {
      setUploading(false)
    }
  }

  // Subir nueva versión de un documento
  const handleUploadNewVersion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDocument?._id || !fileToUpload) {
      toast.error("Selecciona un documento y un archivo")
      return
    }
    
    try {
      setUploading(true)
      
      // Subir nueva versión
      const newVersion = await documentService.uploadNewVersion(
        selectedDocument._id,
        fileToUpload,
        newVersionNotes
      )
      
      if (newVersion) {
        // Actualizar documento seleccionado
        const updatedDoc = {
          ...selectedDocument,
          currentVersion: newVersion.version,
          versions: [...selectedDocument.versions, newVersion],
          updatedAt: new Date(),
        }
        
        // Actualizar lista de documentos
        setDocuments(documents.map(doc => 
          doc._id === selectedDocument._id ? updatedDoc : doc
        ))
        
        // Actualizar documento seleccionado
        setSelectedDocument(updatedDoc)
        
        // Actualizar versiones
        setDocumentVersions([...documentVersions, newVersion])
        
        toast.success(`Versión ${newVersion.version} subida correctamente`)
        
        // Resetear formulario
        setFileToUpload(null)
        setNewVersionNotes("")
        
        // Cerrar modal (se hace con DialogClose en el botón del formulario)
      } else {
        toast.error("Error al subir la nueva versión")
      }
    } catch (error) {
      console.error("Error subiendo nueva versión:", error)
      toast.error("Error al subir la nueva versión")
    } finally {
      setUploading(false)
    }
  }

  // Revertir a una versión anterior
  const handleRevertToVersion = async (versionNumber: number) => {
    if (!selectedDocument?._id) return
    
    try {
      if (!confirm(`¿Estás seguro de que deseas revertir a la versión ${versionNumber}?`)) {
        return
      }
      
      const updatedDoc = await documentService.revertToVersion(
        selectedDocument._id,
        versionNumber
      )
      
      if (updatedDoc) {
        // Actualizar lista de documentos
        setDocuments(documents.map(doc => 
          doc._id === selectedDocument._id ? updatedDoc : doc
        ))
        
        // Actualizar documento seleccionado
        setSelectedDocument(updatedDoc)
        
        toast.success(`Revertido a la versión ${versionNumber}`)
      } else {
        toast.error(`Error al revertir a la versión ${versionNumber}`)
      }
    } catch (error) {
      console.error("Error revirtiendo versión:", error)
      toast.error("Error al revertir a la versión anterior")
    }
  }

  // Eliminar documento
  const handleDeleteDocument = async (documentId: string) => {
    try {
      if (!confirm("¿Estás seguro de que deseas eliminar este documento?")) {
        return
      }
      
      const success = await documentService.deleteDocument(documentId)
      
      if (success) {
        // Actualizar lista de documentos
        setDocuments(documents.filter(doc => doc._id !== documentId))
        
        // Si el documento eliminado es el seleccionado, deseleccionarlo
        if (selectedDocument?._id === documentId) {
          setSelectedDocument(null)
        }
        
        toast.success("Documento eliminado correctamente")
      } else {
        toast.error("Error al eliminar el documento")
      }
    } catch (error) {
      console.error("Error eliminando documento:", error)
      toast.error("Error al eliminar el documento")
    }
  }

  // Actualizar estado de un documento
  const handleUpdateStatus = async (documentId: string, newStatus: DocumentStatus) => {
    try {
      const updatedDoc = await documentService.updateDocument(documentId, {
        status: newStatus,
      })
      
      if (updatedDoc) {
        // Actualizar lista de documentos
        setDocuments(documents.map(doc => 
          doc._id === documentId ? updatedDoc : doc
        ))
        
        // Actualizar documento seleccionado si es el mismo
        if (selectedDocument?._id === documentId) {
          setSelectedDocument(updatedDoc)
        }
        
        toast.success("Estado actualizado correctamente")
      } else {
        toast.error("Error al actualizar el estado")
      }
    } catch (error) {
      console.error("Error actualizando estado:", error)
      toast.error("Error al actualizar el estado")
    }
  }

  // Formatear fecha relativa
  const formatRelativeDate = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es,
    })
  }

  // Obtener ícono según tipo de documento
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImage className="h-5 w-5" />
      case 'contract':
      case 'proposal':
      case 'report':
      case 'specification':
        return <FileText className="h-5 w-5" />
      default:
        return <File className="h-5 w-5" />
    }
  }

  // Obtener color de badge según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
      case 'pending_review':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
      case 'rejected':
        return "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
      case 'archived':
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
    }
  }

  // Obtener texto según estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return "Borrador"
      case 'pending_review':
        return "Pendiente de revisión"
      case 'approved':
        return "Aprobado"
      case 'rejected':
        return "Rechazado"
      case 'archived':
        return "Archivado"
      default:
        return status
    }
  }

  // Obtener texto según tipo
  const getTypeText = (type: string) => {
    switch (type) {
      case 'contract':
        return "Contrato"
      case 'proposal':
        return "Propuesta"
      case 'invoice':
        return "Factura"
      case 'report':
        return "Informe"
      case 'specification':
        return "Especificación"
      case 'design':
        return "Diseño"
      case 'image':
        return "Imagen"
      default:
        return "Otro"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Barra de herramientas */}
      <div className="mb-4 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>Tipo: {typeFilter === "all" ? "Todos" : getTypeText(typeFilter)}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="contract">Contratos</SelectItem>
              <SelectItem value="proposal">Propuestas</SelectItem>
              <SelectItem value="invoice">Facturas</SelectItem>
              <SelectItem value="report">Informes</SelectItem>
              <SelectItem value="specification">Especificaciones</SelectItem>
              <SelectItem value="design">Diseños</SelectItem>
              <SelectItem value="image">Imágenes</SelectItem>
              <SelectItem value="other">Otros</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>Estado: {statusFilter === "all" ? "Todos" : getStatusText(statusFilter)}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
              <SelectItem value="pending_review">Pendientes de revisión</SelectItem>
              <SelectItem value="approved">Aprobados</SelectItem>
              <SelectItem value="rejected">Rechazados</SelectItem>
              <SelectItem value="archived">Archivados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <FilePlus className="mr-2 h-4 w-4" />
              Nuevo documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir nuevo documento</DialogTitle>
              <DialogDescription>
                Completa los detalles y sube el archivo para crear un nuevo documento en este proyecto.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUploadDocument}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="file">Archivo</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={newDocumentData.name}
                    onChange={(e) => setNewDocumentData({ ...newDocumentData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={newDocumentData.type}
                    onValueChange={(value) => setNewDocumentData({ ...newDocumentData, type: value as DocumentType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contrato</SelectItem>
                      <SelectItem value="proposal">Propuesta</SelectItem>
                      <SelectItem value="invoice">Factura</SelectItem>
                      <SelectItem value="report">Informe</SelectItem>
                      <SelectItem value="specification">Especificación</SelectItem>
                      <SelectItem value="design">Diseño</SelectItem>
                      <SelectItem value="image">Imagen</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newDocumentData.description}
                    onChange={(e) => setNewDocumentData({ ...newDocumentData, description: e.target.value })}
                    placeholder="Describe el propósito de este documento..."
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="tags">
                    Etiquetas <span className="text-xs text-muted-foreground">(separadas por comas)</span>
                  </Label>
                  <Input
                    id="tags"
                    value={newDocumentData.tags}
                    onChange={(e) => setNewDocumentData({ ...newDocumentData, tags: e.target.value })}
                    placeholder="contrato, cliente, diseño..."
                  />
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Subiendo...
                      </div>
                    ) : (
                      <>
                        <FileUp className="mr-2 h-4 w-4" />
                        Subir documento
                      </>
                    )}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Lista de documentos */}
      {filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <File className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No hay documentos</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {documents.length > 0
              ? "No se encontraron documentos que coincidan con los filtros."
              : "Este proyecto aún no tiene documentos. ¡Sube el primero!"}
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <FilePlus className="mr-2 h-4 w-4" />
                Nuevo documento
              </Button>
            </DialogTrigger>
            {/* El contenido del diálogo es igual al anterior */}
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Card key={doc._id} className="cursor-pointer hover:bg-muted/50">
              <CardContent className="p-0">
                <div
                  className="flex p-4"
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-md border">
                    {getDocumentIcon(doc.type)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-medium">{doc.name}</h3>
                    <div className="mt-1 flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatRelativeDate(doc.updatedAt)}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className={getStatusColor(doc.status)}>
                        {getStatusText(doc.status)}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeText(doc.type)}
                      </Badge>
                      {doc.tags && doc.tags.length > 0 && (
                        <Badge variant="outline" className="flex items-center">
                          <Tag className="mr-1 h-3 w-3" />
                          {doc.tags.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedDocument(doc)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => window.open(doc.versions.find(v => v.version === doc.currentVersion)?.url, '_blank')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleUpdateStatus(doc._id || '', 'draft')}
                        disabled={doc.status === 'draft'}
                      >
                        <span className="mr-2">📝</span>
                        Marcar como borrador
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleUpdateStatus(doc._id || '', 'pending_review')}
                        disabled={doc.status === 'pending_review'}
                      >
                        <span className="mr-2">⏳</span>
                        Enviar a revisión
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleUpdateStatus(doc._id || '', 'approved')}
                        disabled={doc.status === 'approved'}
                      >
                        <span className="mr-2">✅</span>
                        Aprobar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleUpdateStatus(doc._id || '', 'rejected')}
                        disabled={doc.status === 'rejected'}
                      >
                        <span className="mr-2">❌</span>
                        Rechazar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleUpdateStatus(doc._id || '', 'archived')}
                        disabled={doc.status === 'archived'}
                      >
                        <span className="mr-2">🗄️</span>
                        Archivar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={() => handleDeleteDocument(doc._id || '')}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Modal de detalle de documento */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {getDocumentIcon(selectedDocument.type)}
                <span className="ml-2">{selectedDocument.name}</span>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="versions">Versiones</TabsTrigger>
                <TabsTrigger value="newVersion">Nueva versión</TabsTrigger>
              </TabsList>
              
              {/* Pestaña de detalles */}
              <TabsContent value="details">
                <div className="space-y-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={getStatusColor(selectedDocument.status)}>
                      {getStatusText(selectedDocument.status)}
                    </Badge>
                    <Badge variant="outline">
                      {getTypeText(selectedDocument.type)}
                    </Badge>
                    <Badge variant="outline">
                      Versión {selectedDocument.currentVersion}
                    </Badge>
                  </div>
                  
                  {selectedDocument.description && (
                    <div>
                      <h4 className="mb-2 font-medium">Descripción</h4>
                      <p className="text-sm text-muted-foreground">{selectedDocument.description}</p>
                    </div>
                  )}
                  
                  {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium">Etiquetas</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedDocument.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="mb-2 font-medium">Creado</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeDate(selectedDocument.createdAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {typeof selectedDocument.createdBy === 'string'
                          ? selectedDocument.createdBy
                          : `${selectedDocument.createdBy.firstName} ${selectedDocument.createdBy.lastName}`}
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium">Última actualización</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeDate(selectedDocument.updatedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => window.open(
                        selectedDocument.versions.find(v => v.version === selectedDocument.currentVersion)?.url,
                        '_blank'
                      )}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                    
                    <div className="space-x-2">
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleDeleteDocument(selectedDocument._id || '')
                          setSelectedDocument(null)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Pestaña de versiones */}
              <TabsContent value="versions">
                <div className="space-y-4 py-4">
                  <h4 className="font-medium">Historial de versiones</h4>
                  
                  {documentVersions.length === 0 ? (
                    <div className="rounded-md bg-muted p-4 text-center">
                      <p className="text-sm text-muted-foreground">Cargando versiones...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documentVersions
                        .sort((a, b) => b.version - a.version)
                        .map((version) => (
                          <div
                            key={version._id}
                            className={`
                              flex items-start justify-between rounded-md border p-3
                              ${version.version === selectedDocument.currentVersion
                                ? 'border-primary bg-primary/5'
                                : ''
                              }
                            `}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                <History className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <h5 className="font-medium">
                                    Versión {version.version}
                                  </h5>
                                  {version.version === selectedDocument.currentVersion && (
                                    <Badge className="ml-2">Actual</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {formatRelativeDate(version.uploadedAt)}
                                </p>
                                {version.notes && (
                                  <p className="mt-2 text-sm">{version.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(version.url, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {version.version !== selectedDocument.currentVersion && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRevertToVersion(version.version)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Pestaña de nueva versión */}
              <TabsContent value="newVersion">
                <form onSubmit={handleUploadNewVersion} className="space-y-4 py-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="newVersionFile">Archivo</Label>
                      <Input
                        id="newVersionFile"
                        type="file"
                        onChange={handleFileChange}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="newVersionNotes">Notas de la versión</Label>
                      <Textarea
                        id="newVersionNotes"
                        value={newVersionNotes}
                        onChange={(e) => setNewVersionNotes(e.target.value)}
                        placeholder="Describe los cambios en esta versión..."
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? (
                        <div className="flex items-center">
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Subiendo...
                        </div>
                      ) : (
                        <>
                          <FileUp className="mr-2 h-4 w-4" />
                          Subir versión
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 