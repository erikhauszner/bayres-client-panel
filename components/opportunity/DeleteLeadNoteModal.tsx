'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertTriangle } from 'lucide-react';

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

interface DeleteLeadNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (noteId: string, reason?: string) => Promise<void>;
  note: LeadNote | null;
  isLoading?: boolean;
}

export default function DeleteLeadNoteModal({ isOpen, onClose, onConfirm, note, isLoading = false }: DeleteLeadNoteModalProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = async () => {
    if (!note?._id) return;

    try {
      await onConfirm(note._id, reason.trim() || undefined);
      setReason('');
      onClose();
    } catch (error) {
      console.error('Error al eliminar nota:', error);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!note) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Eliminar Nota del Lead
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. La nota será marcada como eliminada pero se mantendrá en el historial.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Nota a eliminar:</h4>
            <p className="text-sm text-muted-foreground mb-2">
              "{note.content.length > 100 ? `${note.content.substring(0, 100)}...` : note.content}"
            </p>
            <div className="text-xs text-muted-foreground">
              <p>Creada por: {note.user.firstName} {note.user.lastName}</p>
              <p>Fecha: {new Date(note.createdAt).toLocaleString('es-ES')}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Razón de eliminación (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Explica por qué eliminas esta nota..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
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
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar Nota'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 