'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Comment {
  _id: string;
  content: string;
  isVisibleToOriginalAgent: boolean;
  author: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface EditCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateComment: (commentId: string, commentData: {
    content: string;
    isVisibleToOriginalAgent: boolean;
  }) => void;
  comment: Comment | null;
  loading?: boolean;
}

export default function EditCommentModal({
  isOpen,
  onClose,
  onUpdateComment,
  comment,
  loading = false
}: EditCommentModalProps) {
  const [content, setContent] = useState('');
  const [isVisibleToOriginalAgent, setIsVisibleToOriginalAgent] = useState(true);

  // Cargar datos del comentario cuando se abre el modal
  useEffect(() => {
    if (comment && isOpen) {
      setContent(comment.content);
      setIsVisibleToOriginalAgent(comment.isVisibleToOriginalAgent);
    }
  }, [comment, isOpen]);

  const handleClose = () => {
    if (!loading) {
      setContent('');
      setIsVisibleToOriginalAgent(true);
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!content.trim() || !comment) {
      return;
    }

    onUpdateComment(comment._id, {
      content: content.trim(),
      isVisibleToOriginalAgent
    });
  };

  const isFormValid = content.trim();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Comentario</DialogTitle>
          <DialogDescription>
            Modifica el contenido y la visibilidad del comentario
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Contenido */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el contenido del comentario..."
              className="w-full min-h-[100px]"
            />
          </div>

          {/* Visibilidad */}
          <div className="flex items-center space-x-2">
            <Switch
              id="visibility"
              checked={isVisibleToOriginalAgent}
              onCheckedChange={setIsVisibleToOriginalAgent}
            />
            <Label htmlFor="visibility">
              {isVisibleToOriginalAgent ? 'Comentario público' : 'Comentario interno'}
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 