'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FollowUp {
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
}

interface EditFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateFollowUp: (followUpId: string, followUpData: {
    title: string;
    description?: string;
    scheduledDate: string;
  }) => void;
  followUp: FollowUp | null;
  loading?: boolean;
}

export default function EditFollowUpModal({
  isOpen,
  onClose,
  onUpdateFollowUp,
  followUp,
  loading = false
}: EditFollowUpModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Cargar datos del seguimiento cuando se abre el modal
  useEffect(() => {
    if (followUp && isOpen) {
      setTitle(followUp.title);
      setDescription(followUp.description || '');
      
      const date = new Date(followUp.scheduledDate);
      setScheduledDate(date.toISOString().split('T')[0]);
      setScheduledTime(date.toTimeString().slice(0, 5));
    }
  }, [followUp, isOpen]);

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setDescription('');
      setScheduledDate('');
      setScheduledTime('');
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !scheduledDate || !scheduledTime || !followUp) {
      return;
    }

    const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    onUpdateFollowUp(followUp._id, {
      title: title.trim(),
      description: description.trim() || undefined,
      scheduledDate: dateTime.toISOString()
    });
  };

  const isFormValid = title.trim() && scheduledDate && scheduledTime;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Seguimiento</DialogTitle>
          <DialogDescription>
            Modifica los detalles del seguimiento
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Llamada de seguimiento, Revisión de propuesta..."
              className="w-full"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales sobre el seguimiento..."
              className="w-full min-h-[80px]"
            />
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Fecha *</Label>
            <Input
              id="scheduledDate"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Hora */}
          <div className="space-y-2">
            <Label htmlFor="scheduledTime">Hora *</Label>
            <Input
              id="scheduledTime"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full"
            />
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