'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  X, 
  Calendar, 
  User, 
  Target,
  Edit
} from 'lucide-react';

interface FollowUp {
  _id?: string;
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

interface FollowUpTabProps {
  followUps: FollowUp[];
  formatDateTime: (dateString: string) => string;
  onMarkFollowUpCompleted?: (followUpId: string) => void;
  onMarkFollowUpCancelled?: (followUpId: string) => void;
  onEditFollowUp?: (followUp: FollowUp) => void;
  hasUpdatePermission: boolean;
}

export default function FollowUpTab({ 
  followUps = [],
  formatDateTime, 
  onMarkFollowUpCompleted,
  onMarkFollowUpCancelled,
  onEditFollowUp,
  hasUpdatePermission 
}: FollowUpTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'completado':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'cancelado':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Clock className="h-3 w-3" />;
      case 'completado':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelado':
        return <X className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  // Ordenar seguimientos por estado (pendientes primero) y luego por fecha
  const sortedFollowUps = followUps.sort((a, b) => {
    // Primero por estado (pendientes primero)
    const aIsPending = a.status === 'pendiente';
    const bIsPending = b.status === 'pendiente';
    
    if (aIsPending !== bIsPending) {
      return aIsPending ? -1 : 1;
    }
    
    // Luego por fecha (más próximas primero)
    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
  });

  if (followUps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seguimiento</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay seguimientos</h3>
          <p className="text-muted-foreground">
            Los seguimientos programados para este lead aparecerán aquí.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seguimiento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedFollowUps.map((followUp) => (
        <Card key={followUp._id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">{followUp.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getStatusColor(followUp.status)}>
                      {getStatusIcon(followUp.status)}
                      <span className="ml-1 capitalize">{followUp.status}</span>
                    </Badge>
                  </div>
                </div>
              </div>
              
              {hasUpdatePermission && followUp.status === 'pendiente' && (
                <div className="flex gap-2">
                  {/* Botón de editar */}
                  {onEditFollowUp && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-500 dark:hover:bg-blue-950/50"
                      onClick={() => onEditFollowUp(followUp)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onMarkFollowUpCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-950/50"
                      onClick={() => followUp._id && onMarkFollowUpCompleted(followUp._id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {onMarkFollowUpCancelled && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/50"
                      onClick={() => followUp._id && onMarkFollowUpCancelled(followUp._id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-3">
            {followUp.description && (
              <p className="text-sm text-muted-foreground">{followUp.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDateTime(followUp.scheduledDate)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Creado por {followUp.createdBy.firstName} {followUp.createdBy.lastName}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      </CardContent>
    </Card>
  );
} 