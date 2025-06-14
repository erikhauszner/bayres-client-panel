'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

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

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string) => Promise<void>;
  task: Task | null;
  isLoading?: boolean;
}

export default function DeleteTaskModal({
  isOpen,
  onClose,
  onConfirm,
  task,
  isLoading = false
}: DeleteTaskModalProps) {
  const handleConfirm = async () => {
    if (!task) return;
    
    try {
      await onConfirm(task._id);
      onClose();
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Eliminar Tarea
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. La tarea será eliminada permanentemente.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium mb-2">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {task.description}
              </p>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {task.assignedTo && (
                <p>Asignada a: {task.assignedTo.firstName} {task.assignedTo.lastName}</p>
              )}
              <p>Creada por: {task.createdBy.firstName} {task.createdBy.lastName}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar Tarea'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 