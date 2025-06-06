"use client"

import { useState, useEffect } from "react"
import {
  MessageCircle,
  Send,
  Trash2,
  Edit,
  Loader2,
  Clock,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { projectService } from "@/lib/services/projectService"
import { ProjectTaskComment } from "@/lib/types/project"

interface TaskCommentsProps {
  projectId: string;
  taskId: string;
}

export default function TaskComments({ projectId, taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<ProjectTaskComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Cargar comentarios
  useEffect(() => {
    async function loadComments() {
      try {
        setLoading(true)
        setError(null)
        const taskComments = await projectService.getTaskComments(projectId, taskId)
        setComments(taskComments)
      } catch (err) {
        console.error("Error cargando comentarios:", err)
        setError("No se pudieron cargar los comentarios")
        toast.error("Error al cargar los comentarios")
      } finally {
        setLoading(false)
      }
    }

    if (projectId && taskId) {
      loadComments()
    }
  }, [projectId, taskId])

  // Añadir comentario
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) return
    
    try {
      setSubmitting(true)
      const addedComment = await projectService.addTaskComment(projectId, taskId, {
        content: newComment.trim()
      })
      
      setComments([...comments, addedComment])
      setNewComment("")
      toast.success("Comentario añadido")
    } catch (err) {
      console.error("Error añadiendo comentario:", err)
      toast.error("Error al añadir el comentario")
    } finally {
      setSubmitting(false)
    }
  }

  // Iniciar edición de comentario
  const startEditComment = (comment: ProjectTaskComment) => {
    setEditingCommentId(comment._id || null)
    setEditingContent(comment.content)
  }

  // Cancelar edición
  const cancelEdit = () => {
    setEditingCommentId(null)
    setEditingContent("")
  }

  // Guardar cambios de edición
  const saveEditedComment = async (commentId: string) => {
    if (!editingContent.trim()) return
    
    try {
      setSubmitting(true)
      await projectService.updateTaskComment(projectId, taskId, commentId, {
        content: editingContent.trim()
      })
      
      // Actualizar localmente
      const updatedComments = comments.map(comment => 
        comment._id === commentId 
          ? { ...comment, content: editingContent.trim(), updatedAt: new Date() } 
          : comment
      )
      
      setComments(updatedComments)
      setEditingCommentId(null)
      setEditingContent("")
      toast.success("Comentario actualizado")
    } catch (err) {
      console.error("Error actualizando comentario:", err)
      toast.error("Error al actualizar el comentario")
    } finally {
      setSubmitting(false)
    }
  }

  // Eliminar comentario
  const deleteComment = async (commentId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este comentario?")) return
    
    try {
      setSubmitting(true)
      await projectService.deleteTaskComment(projectId, taskId, commentId)
      
      // Eliminar de la lista local
      const filteredComments = comments.filter(comment => comment._id !== commentId)
      setComments(filteredComments)
      toast.success("Comentario eliminado")
    } catch (err) {
      console.error("Error eliminando comentario:", err)
      toast.error("Error al eliminar el comentario")
    } finally {
      setSubmitting(false)
    }
  }

  // Formatear fecha relativa
  const formatRelativeDate = (dateString: Date | string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: es
    })
  }

  if (loading && comments.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="netflix-card">
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => {
              setLoading(true)
              projectService.getTaskComments(projectId, taskId)
                .then(comments => {
                  setComments(comments)
                  setError(null)
                })
                .catch(err => {
                  console.error("Error recargando comentarios:", err)
                  setError("No se pudieron cargar los comentarios")
                })
                .finally(() => setLoading(false))
            }}
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="netflix-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <MessageCircle className="mr-2 h-5 w-5" />
          Comentarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Lista de comentarios */}
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">
              No hay comentarios aún. ¡Sé el primero en comentar!
            </p>
          ) : (
            comments.map(comment => (
              <div key={comment._id} className="rounded-lg border border-border/40 bg-muted/10 p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      {typeof comment.author === 'object' && comment.author?.avatar ? (
                        <AvatarImage src={comment.author.avatar} alt={`${comment.author.firstName} ${comment.author.lastName}`} />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {typeof comment.author === 'string'
                          ? comment.author.substring(0, 2).toUpperCase()
                          : comment.author
                            ? `${comment.author.firstName.charAt(0)}${comment.author.lastName.charAt(0)}`
                            : <User className="h-4 w-4" />
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <p className="font-medium">
                          {typeof comment.author === 'string'
                            ? comment.author
                            : comment.author
                              ? `${comment.author.firstName} ${comment.author.lastName}`
                              : "Usuario desconocido"
                          }
                        </p>
                        <span className="ml-2 flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatRelativeDate(comment.createdAt)}
                        </span>
                      </div>
                      
                      {editingCommentId === comment._id ? (
                        <div className="space-y-2">
                          <Textarea 
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => saveEditedComment(comment._id || '')}
                              disabled={submitting}
                            >
                              {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Guardar"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              disabled={submitting}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">{comment.content}</p>
                      )}
                    </div>
                  </div>
                  
                  {editingCommentId !== comment._id && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => startEditComment(comment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteComment(comment._id || '')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Formulario para añadir comentario */}
        <form onSubmit={handleAddComment} className="mt-4">
          <div className="flex items-start space-x-2">
            <Textarea
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px]"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-10 w-10"
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 