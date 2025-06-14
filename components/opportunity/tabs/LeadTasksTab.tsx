'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Task {
  title: string;
  description?: string;
  dueDate: string;
  status: string;
  priority: string;
  completedAt?: string;
  user: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface LeadTasksTabProps {
  tasks: Task[];
  formatDate: (dateString: string) => string;
}

export default function LeadTasksTab({ tasks, formatDate }: LeadTasksTabProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'alta':
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'media':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'baja':
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completada':
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pendiente':
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'atrasada':
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tareas del Lead Original</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay tareas registradas
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="flex border-l-4 border-l-blue-500">
                  <div className="p-4 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <h3 className="font-medium">{task.title}</h3>
                      </div>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Fecha límite:</span> {formatDate(task.dueDate)}
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span> {task.status}
                      </div>
                      <div>
                        <span className="font-medium">Asignada a:</span> {task.user.firstName} {task.user.lastName}
                      </div>
                      {task.completedAt && (
                        <div>
                          <span className="font-medium">Completada:</span> {formatDate(task.completedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 