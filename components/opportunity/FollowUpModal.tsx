'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFollowUp: (followUpData: {
    title: string;
    description?: string;
    scheduledDate: string;
  }) => void;
  loading?: boolean;
}

export default function FollowUpModal({
  isOpen,
  onClose,
  onCreateFollowUp,
  loading = false
}: FollowUpModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

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
    if (!title.trim() || !scheduledDate || !scheduledTime) {
      return;
    }

    const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    onCreateFollowUp({
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
          <DialogTitle>Crear Seguimiento</DialogTitle>
          <DialogDescription>
            Programa un seguimiento para esta oportunidad
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
            {loading ? 'Creando...' : 'Crear Seguimiento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 