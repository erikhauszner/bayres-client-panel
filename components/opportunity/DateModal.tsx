'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

interface DateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: string, note?: string) => void;
  type: 'expected' | 'deadline';
  currentDate?: string;
  loading: boolean;
}

export default function DateModal({
  isOpen,
  onClose,
  onSave,
  type,
  currentDate,
  loading
}: DateModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (currentDate) {
      // Convertir la fecha a formato YYYY-MM-DD para el input
      const date = new Date(currentDate);
      setSelectedDate(date.toISOString().split('T')[0]);
    } else {
      setSelectedDate('');
    }
    setNote('');
  }, [currentDate, isOpen]);

  const handleSubmit = () => {
    if (!selectedDate) return;
    
    onSave(selectedDate, note.trim() || undefined);
    handleClose();
  };

  const handleClose = () => {
    setSelectedDate('');
    setNote('');
    onClose();
  };

  const isEditing = !!currentDate;
  const isFormValid = selectedDate;

  const getTitle = () => {
    if (type === 'expected') {
      return isEditing ? 'Modificar Fecha Esperada' : 'Asignar Fecha Esperada';
    } else {
      return isEditing ? 'Modificar Fecha Límite' : 'Asignar Fecha Límite';
    }
  };

  const getIcon = () => {
    return type === 'expected' ? (
      <Calendar className="h-5 w-5 text-orange-600" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-red-600" />
    );
  };

  const getDescription = () => {
    if (type === 'expected') {
      return 'Establece la fecha en la que esperas cerrar esta oportunidad.';
    } else {
      return 'Establece la fecha límite para el cierre de esta oportunidad.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {getDescription()}
          </p>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha {type === 'deadline' ? 'límite' : 'esperada'} *
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full"
            />
          </div>

          {/* Nota opcional */}
          <div className="space-y-2">
            <Label htmlFor="note">Nota (opcional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Agrega una nota sobre esta fecha..."
              className="w-full min-h-[80px]"
            />
          </div>

          {currentDate && (
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Fecha actual:</strong> {new Date(currentDate).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || loading}
            className={type === 'expected' 
              ? 'bg-orange-600 hover:bg-orange-700' 
              : 'bg-red-600 hover:bg-red-700'
            }
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Asignar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 