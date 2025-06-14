'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface AddLeadNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (noteData: { content: string }) => Promise<void>;
  isLoading?: boolean;
}

export default function AddLeadNoteModal({ isOpen, onClose, onSubmit, isLoading = false }: AddLeadNoteModalProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    try {
      await onSubmit({ content: content.trim() });
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error al agregar nota:', error);
    }
  };

  const handleClose = () => {
    setContent('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Nota del Lead</DialogTitle>
          <DialogDescription>
            Agrega una nueva nota relacionada con la información del lead original.
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
                  Agregando...
                </>
              ) : (
                'Agregar Nota'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 