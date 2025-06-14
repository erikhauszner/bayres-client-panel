'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

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

interface DeleteInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteInterest: (interestId: string, reason?: string) => void;
  interest: Interest | null;
  loading?: boolean;
}

export default function DeleteInterestModal({
  isOpen,
  onClose,
  onDeleteInterest,
  interest,
  loading = false
}: DeleteInterestModalProps) {
  const [reason, setReason] = useState('');

  const handleClose = () => {
    if (!loading) {
      setReason('');
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!interest) {
      return;
    }

    onDeleteInterest(interest._id, reason.trim() || undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Interés
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar este interés?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Información del interés */}
          {interest && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{interest.title}</h4>
              {interest.description && (
                <p className="text-sm text-gray-600 mt-1">{interest.description}</p>
              )}
              {interest.approximateBudget && (
                <p className="text-sm text-green-600 mt-1 font-medium">
                  Presupuesto: ${interest.approximateBudget.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Creado por {interest.createdBy.firstName} {interest.createdBy.lastName}
              </p>
            </div>
          )}

          {/* Razón de eliminación */}
          <div className="space-y-2">
            <Label htmlFor="reason">Razón de eliminación (opcional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explica por qué se elimina este interés..."
              className="w-full min-h-[80px]"
            />
            <p className="text-xs text-gray-500">
              Esta información se guardará en el historial de actividades
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive"
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar Interés'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 