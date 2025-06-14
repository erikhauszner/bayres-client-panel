'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  completedAt?: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt?: string;
  updatedBy?: {
    firstName: string;
    lastName: string;
  };
}

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, taskData: {
    title: string;
    description?: string;
    dueDate: string;
    priority: string;
    assignedTo?: string;
    status: string;
  }) => Promise<void>;
  task: Task | null;
  employees: Employee[];
  isLoading?: boolean;
}

export default function EditTaskModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  employees,
  isLoading = false
}: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'media',
    assignedTo: 'none',
    status: 'pendiente'
  });
  const [dueDate, setDueDate] = useState<Date>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        assignedTo: task.assignedTo?._id || 'none',
        status: task.status
      });
      setDueDate(new Date(task.dueDate));
      setErrors({});
    } else if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'media',
        assignedTo: 'none',
        status: 'pendiente'
      });
      setDueDate(undefined);
      setErrors({});
    }
  }, [isOpen, task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!dueDate) {
      newErrors.dueDate = 'La fecha de vencimiento es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !task) return;

    try {
      await onSubmit(task._id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        dueDate: dueDate!.toISOString(),
        priority: formData.priority,
        assignedTo: formData.assignedTo === 'none' ? undefined : formData.assignedTo || undefined,
        status: formData.status
      });
      onClose();
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Tarea</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la tarea y su asignación.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ej: Preparar propuesta comercial"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe los detalles de la tarea..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Vencimiento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !dueDate ? 'text-muted-foreground' : ''
                    } ${errors.dueDate ? 'border-red-500' : ''}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Asignar a</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => handleInputChange('assignedTo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName} ({employee.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 