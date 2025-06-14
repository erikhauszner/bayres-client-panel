'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Phone } from 'lucide-react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department?: string;
  isActive: boolean;
}

interface ScheduleCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (callData: {
    title: string;
    description?: string;
    medium: string;
    scheduledDate: string;
    participants: string[];
  }) => void;
  employees: Employee[];
  loading: boolean;
}

export default function ScheduleCallModal({
  isOpen,
  onClose,
  onSchedule,
  employees,
  loading
}: ScheduleCallModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [medium, setMedium] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!title.trim() || !medium.trim() || !scheduledDate || !scheduledTime || selectedParticipants.length === 0) {
      return;
    }

    const dateTime = `${scheduledDate}T${scheduledTime}:00`;
    
    onSchedule({
      title: title.trim(),
      description: description.trim() || undefined,
      medium,
      scheduledDate: dateTime,
      participants: selectedParticipants
    });

    // Limpiar formulario
    setTitle('');
    setDescription('');
    setMedium('');
    setScheduledDate('');
    setScheduledTime('');
    setSelectedParticipants([]);
  };

  const handleParticipantToggle = (employeeId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setMedium('');
    setScheduledDate('');
    setScheduledTime('');
    setSelectedParticipants([]);
    onClose();
  };

  const isFormValid = title.trim() && medium.trim() && scheduledDate && scheduledTime && selectedParticipants.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-purple-600" />
            Agendar Llamada
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título de la llamada *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Llamada de seguimiento comercial"
              className="w-full"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brevemente el propósito de la llamada..."
              className="w-full min-h-[80px]"
            />
          </div>

          {/* Medio */}
          <div className="space-y-2">
            <Label htmlFor="medium">Medio de comunicación *</Label>
            <Input
              id="medium"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="Ej: Teléfono, WhatsApp, Zoom, Teams, etc."
              className="w-full"
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha *
              </Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora *
              </Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          {/* Participantes */}
          <div className="space-y-2">
            <Label>Participantes * (selecciona al menos uno)</Label>
            <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2">
              {employees.filter(emp => emp.isActive).map((employee) => (
                <div key={employee._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={employee._id}
                    checked={selectedParticipants.includes(employee._id)}
                    onCheckedChange={() => handleParticipantToggle(employee._id)}
                  />
                  <Label htmlFor={employee._id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {employee.department && `${employee.department} - `}{employee.position}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {employee.email}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            {selectedParticipants.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedParticipants.length} participante(s) seleccionado(s)
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Agendando...' : 'Agendar Llamada'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 