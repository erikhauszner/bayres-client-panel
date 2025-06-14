'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface LeadNote {
  _id?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user: {
    firstName: string;
    lastName: string;
  };
  updatedBy?: {
    firstName: string;
    lastName: string;
  };
  deletedAt?: string;
  deletedBy?: {
    firstName: string;
    lastName: string;
  };
  deletionReason?: string;
}

interface EditLeadNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (noteId: string, noteData: { content: string }) => Promise<void>;
  note: LeadNote | null;
  isLoading?: boolean;
}

export default function EditLeadNoteModal({ isOpen, onClose, onSubmit, note, isLoading = false }: EditLeadNoteModalProps) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (note) {
      setContent(note.content);
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !note?._id) return;

    try {
      await onSubmit(note._id, { content: content.trim() });
      onClose();
    } catch (error) {
      console.error('Error al editar nota:', error);
    }
  };

  const handleClose = () => {
    setContent('');
    onClose();
  };

  if (!note) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Nota del Lead</DialogTitle>
          <DialogDescription>
            Modifica el contenido de la nota del lead.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Contenido de la Nota *</Label>
            <Textarea
              id="content"
              placeholder="Escribe el contenido de la nota..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Creada por: {note.user.firstName} {note.user.lastName}</p>
            <p>Fecha de creación: {new Date(note.createdAt).toLocaleString('es-ES')}</p>
            {note.updatedAt && note.updatedBy && (
              <p>Última edición: {new Date(note.updatedAt).toLocaleString('es-ES')} por {note.updatedBy.firstName} {note.updatedBy.lastName}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !content.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 