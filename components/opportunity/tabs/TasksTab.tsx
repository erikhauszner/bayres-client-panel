'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Trash2, Calendar, User, Clock, CheckCircle2, AlertCircle, Circle, X } from 'lucide-react';

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

interface TasksTabProps {
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: string) => void;
  canEdit: boolean;
  formatDate: (dateString: string) => string;
  formatDateTime: (dateString: string) => string;
}

export default function TasksTab({ 
  tasks, 
  onAddTask, 
  onEditTask, 
  onDeleteTask, 
  onUpdateTaskStatus,
  canEdit, 
  formatDate, 
  formatDateTime 
}: TasksTabProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completada':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'en_progreso':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelada':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completada':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelada':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'alta':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_progreso':
        return 'En Progreso';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'baja':
        return 'Baja';
      case 'media':
        return 'Media';
      case 'alta':
        return 'Alta';
      case 'urgente':
        return 'Urgente';
      default:
        return priority;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completada' || status === 'cancelada') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Tareas ({tasks.length})
        </CardTitle>
        {canEdit && (
          <Button onClick={onAddTask} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Tarea
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay tareas registradas</p>
            {canEdit && (
              <Button onClick={onAddTask} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Crear primera tarea
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`border rounded-lg p-4 ${
                  isOverdue(task.dueDate, task.status) 
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(task.status)}
                      <h4 className="font-medium">{task.title}</h4>
                      {isOverdue(task.dueDate, task.status) && (
                        <Badge variant="destructive" className="text-xs">
                          Vencida
                        </Badge>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusLabel(task.status)}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        Prioridad: {getPriorityLabel(task.priority)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Vence: {formatDate(task.dueDate)}</span>
                      </div>
                      
                      {task.assignedTo && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Asignada a: {task.assignedTo.firstName} {task.assignedTo.lastName}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Creada por: {task.createdBy.firstName} {task.createdBy.lastName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Creada: {formatDateTime(task.createdAt)}</span>
                      </div>
                      
                      {task.completedAt && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Completada: {formatDateTime(task.completedAt)}</span>
                        </div>
                      )}
                      
                      {task.updatedAt && task.updatedBy && (
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          <span>
                            Editada por {task.updatedBy.firstName} {task.updatedBy.lastName} 
                            el {formatDateTime(task.updatedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditTask(task)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {task.status !== 'completada' && (
                          <DropdownMenuItem 
                            onClick={() => onUpdateTaskStatus(task._id, 'completada')}
                            className="text-green-600 dark:text-green-400"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Marcar como Completada
                          </DropdownMenuItem>
                        )}
                        {task.status !== 'cancelada' && (
                          <DropdownMenuItem 
                            onClick={() => onUpdateTaskStatus(task._id, 'cancelada')}
                            className="text-orange-600 dark:text-orange-400"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Marcar como Cancelada
                          </DropdownMenuItem>
                        )}
                        {(task.status === 'completada' || task.status === 'cancelada') && (
                          <DropdownMenuItem 
                            onClick={() => onUpdateTaskStatus(task._id, 'pendiente')}
                            className="text-blue-600 dark:text-blue-400"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Marcar como Pendiente
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDeleteTask(task)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 