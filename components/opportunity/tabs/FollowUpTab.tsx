'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Calendar, Users, Clock, CheckCircle, X, User, Target, Edit } from 'lucide-react';

interface ScheduledCall {
  _id: string;
  title: string;
  description?: string;
  medium: string;
  scheduledDate: string;
  participants: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  status: 'programada' | 'completada' | 'cancelada';
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface FollowUp {
  _id: string;
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
  scheduledCalls: ScheduledCall[];
  followUps?: FollowUp[];
  formatDateTime: (dateString: string) => string;
  onMarkCompleted?: (callId: string) => void;
  onMarkCancelled?: (callId: string) => void;
  onMarkFollowUpCompleted?: (followUpId: string) => void;
  onMarkFollowUpCancelled?: (followUpId: string) => void;
  onEditFollowUp?: (followUp: FollowUp) => void;
  hasUpdatePermission: boolean;
}

export default function FollowUpTab({ 
  scheduledCalls, 
  followUps = [],
  formatDateTime, 
  onMarkCompleted, 
  onMarkCancelled,
  onMarkFollowUpCompleted,
  onMarkFollowUpCancelled,
  onEditFollowUp,
  hasUpdatePermission 
}: FollowUpTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'programada':
      case 'pendiente':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'completada':
      case 'completado':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'cancelada':
      case 'cancelado':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'programada':
      case 'pendiente':
        return <Clock className="h-3 w-3" />;
      case 'completada':
      case 'completado':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelada':
      case 'cancelado':
        return <X className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getMediumIcon = (medium: string) => {
    switch (medium.toLowerCase()) {
      case 'telefono':
        return <Phone className="h-4 w-4" />;
      case 'whatsapp':
        return <Phone className="h-4 w-4 text-green-600" />;
      case 'zoom':
      case 'teams':
      case 'meet':
      case 'skype':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'presencial':
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  // Combinar llamadas y seguimientos
  const allItems = [
    ...scheduledCalls.map(call => ({ ...call, type: 'call' as const })),
    ...followUps.map(followUp => ({ ...followUp, type: 'followup' as const }))
  ];

  const sortedItems = allItems.sort((a, b) => {
    // Primero por estado (pendientes/programadas primero)
    const aIsPending = a.status === 'programada' || a.status === 'pendiente';
    const bIsPending = b.status === 'programada' || b.status === 'pendiente';
    
    if (aIsPending !== bIsPending) {
      return aIsPending ? -1 : 1;
    }
    
    // Luego por fecha (más próximas primero)
    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
  });

  if (scheduledCalls.length === 0 && followUps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seguimiento</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay seguimientos</h3>
          <p className="text-muted-foreground">
            Las llamadas agendadas y seguimientos para esta oportunidad aparecerán aquí.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Seguimiento</h3>
        <p className="text-sm text-muted-foreground">
          Llamadas agendadas y seguimientos programados
        </p>
      </div>
      {sortedItems.map((item) => (
        <Card key={item._id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  {item.type === 'call' ? getMediumIcon((item as any).medium) : <Target className="h-4 w-4" />}
                </div>
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1 capitalize">{item.status}</span>
                    </Badge>
                    <Badge variant="outline">
                      {item.type === 'call' ? (item as any).medium : 'Seguimiento'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {hasUpdatePermission && (item.status === 'programada' || item.status === 'pendiente') && (
                <div className="flex gap-2">
                  {/* Botón de editar solo para seguimientos */}
                  {item.type === 'followup' && onEditFollowUp && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-500 dark:hover:bg-blue-950/50"
                      onClick={() => onEditFollowUp(item as FollowUp)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {((item.type === 'call' && onMarkCompleted) || (item.type === 'followup' && onMarkFollowUpCompleted)) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-950/50"
                      onClick={() => {
                        if (item.type === 'call' && onMarkCompleted) {
                          onMarkCompleted(item._id);
                        } else if (item.type === 'followup' && onMarkFollowUpCompleted) {
                          onMarkFollowUpCompleted(item._id);
                        }
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {((item.type === 'call' && onMarkCancelled) || (item.type === 'followup' && onMarkFollowUpCancelled)) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/50"
                      onClick={() => {
                        if (item.type === 'call' && onMarkCancelled) {
                          onMarkCancelled(item._id);
                        } else if (item.type === 'followup' && onMarkFollowUpCancelled) {
                          onMarkFollowUpCancelled(item._id);
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-3">
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDateTime(item.scheduledDate)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Creado por {item.createdBy.firstName} {item.createdBy.lastName}</span>
              </div>
            </div>
            
            {item.type === 'call' && (item as any).participants && (item as any).participants.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Participantes:</p>
                <div className="flex flex-wrap gap-2">
                  {(item as any).participants.map((participant: any) => (
                    <Badge key={participant._id} variant="secondary" className="text-xs">
                      {participant.firstName} {participant.lastName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 