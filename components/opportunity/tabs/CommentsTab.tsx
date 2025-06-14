'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Trash2 } from 'lucide-react';

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  isVisibleToOriginalAgent: boolean;
  author: {
    _id?: string;
    firstName: string;
    lastName: string;
  };
}

interface CommentsTabProps {
  comments: Comment[];
  hasCommentPermission: boolean;
  newComment: string;
  setNewComment: (value: string) => void;
  addingComment: boolean;
  addComment: () => void;
  formatDateTime: (dateString: string) => string;
  onEditComment?: (comment: Comment) => void;
  onDeleteComment?: (commentId: string) => void;
  currentUserId?: string;
}

export default function CommentsTab({
  comments,
  hasCommentPermission,
  newComment,
  setNewComment,
  addingComment,
  addComment,
  formatDateTime,
  onEditComment,
  onDeleteComment,
  currentUserId
}: CommentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comentarios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasCommentPermission && (
          <div className="space-y-4">
            <Textarea
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button 
                onClick={addComment} 
                disabled={!newComment.trim() || addingComment}
              >
                {addingComment ? 'Enviando...' : 'Agregar comentario'}
              </Button>
            </div>
          </div>
        )}

        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay comentarios aún
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => {
              // Verificar si el usuario actual puede editar/eliminar este comentario
              const canModifyComment = currentUserId && (
                comment.author._id === currentUserId || 
                hasCommentPermission
              );

              return (
                <div key={comment._id} className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {comment.author.firstName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{comment.author.firstName} {comment.author.lastName}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(comment.createdAt)}
                        </div>
                        {canModifyComment && (
                          <div className="flex gap-1">
                            {onEditComment && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-500 dark:hover:bg-blue-950/50"
                                onClick={() => onEditComment(comment)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                            {onDeleteComment && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/50"
                                onClick={() => {
                                  if (window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
                                    onDeleteComment(comment._id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 