'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Interest {
  _id: string;
  title: string;
  description?: string;
  approximateBudget?: number;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  deletedAt?: string;
  deletedBy?: {
    firstName: string;
    lastName: string;
  };
  deletionReason?: string;
}

interface EditInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateInterest: (interestId: string, interestData: {
    title: string;
    description?: string;
    approximateBudget?: number;
  }) => void;
  interest: Interest | null;
  loading?: boolean;
}

export default function EditInterestModal({
  isOpen,
  onClose,
  onUpdateInterest,
  interest,
  loading = false
}: EditInterestModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [approximateBudget, setApproximateBudget] = useState('');

  // Cargar datos del interés cuando se abre el modal
  useEffect(() => {
    if (interest && isOpen) {
      setTitle(interest.title);
      setDescription(interest.description || '');
      setApproximateBudget(interest.approximateBudget ? interest.approximateBudget.toString() : '');
    }
  }, [interest, isOpen]);

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setDescription('');
      setApproximateBudget('');
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !interest) {
      return;
    }

    const budgetValue = approximateBudget.trim() ? parseFloat(approximateBudget.trim()) : undefined;
    
    onUpdateInterest(interest._id, {
      title: title.trim(),
      description: description.trim() || undefined,
      approximateBudget: budgetValue
    });
  };

  const isFormValid = title.trim();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Interés</DialogTitle>
          <DialogDescription>
            Modifica los detalles del interés del cliente
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
              placeholder="Ej: Desarrollo web, Consultoría, Marketing digital..."
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
              placeholder="Detalles adicionales sobre el interés del cliente..."
              className="w-full min-h-[80px]"
            />
          </div>

          {/* Presupuesto Aproximado */}
          <div className="space-y-2">
            <Label htmlFor="approximateBudget">Presupuesto Aproximado</Label>
            <Input
              id="approximateBudget"
              type="number"
              min="0"
              step="0.01"
              value={approximateBudget}
              onChange={(e) => setApproximateBudget(e.target.value)}
              placeholder="Ej: 5000, 10000..."
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Presupuesto estimado para este servicio o producto (opcional)
            </p>
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