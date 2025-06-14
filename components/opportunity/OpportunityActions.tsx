'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, User, Target, Calendar, AlertTriangle, Sparkles, UserPlus, Users, CheckCircle, Phone, CalendarPlus, Clock, Settings, Plus, Percent } from 'lucide-react';

interface OpportunityActionsProps {
  hasUpdatePermission: boolean;
  hasDeletePermission: boolean;
  hasAssignPermission: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAssignSalesAgent?: () => void;
  onAddCollaborator?: () => void;
  onConfirmAgenda?: () => void;
  onScheduleCall?: () => void;
  onSetExpectedDate?: () => void;
  onSetDeadlineDate?: () => void;
  onEditExpectedDate?: () => void;
  onEditDeadlineDate?: () => void;
  onChangeStatus?: () => void;
  onCreateFollowUp?: () => void;
  onAddInterest?: () => void;
  onEditProbability?: () => void;
  estimatedValue?: number;
  probability: number;
  expectedCloseDate?: string;
  deadlineDate?: string;
  currentStage: string;
  originalAgent: {
    firstName: string;
    lastName: string;
    email: string;
  };
  salesAgent?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  collaborators?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  transferredAt: string;
  createdAt: string;
  formatCurrency: (amount?: number) => string;
  formatDate: (dateString?: string) => string;
}

export default function OpportunityActions({
  hasUpdatePermission,
  hasDeletePermission,
  hasAssignPermission,
  onEdit,
  onDelete,
  onAssignSalesAgent,
  onAddCollaborator,
  onConfirmAgenda,
  onScheduleCall,
  onSetExpectedDate,
  onSetDeadlineDate,
  onEditExpectedDate,
  onEditDeadlineDate,
  onChangeStatus,
  onCreateFollowUp,
  onAddInterest,
  onEditProbability,
  estimatedValue,
  probability,
  expectedCloseDate,
  deadlineDate,
  currentStage,
  originalAgent,
  salesAgent,
  collaborators = [],
  transferredAt,
  createdAt,
  formatCurrency,
  formatDate
}: OpportunityActionsProps) {
  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Acciones */}
      {(hasUpdatePermission || hasDeletePermission || (hasAssignPermission && !salesAgent) || (hasAssignPermission && salesAgent)) && (
        <Card className="overflow-hidden border shadow-sm">
          <CardHeader className="bg-muted/50 px-4 py-3">
            <CardTitle className="text-base font-medium">Acciones</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {hasUpdatePermission && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start" onClick={onEdit}>
                <Edit className="h-4 w-4 text-primary" />
                <span>Editar detalles</span>
              </Button>
            )}
            
            {hasUpdatePermission && onChangeStatus && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-950/50" onClick={onChangeStatus}>
                <Settings className="h-4 w-4" />
                <span>Cambiar Estado</span>
              </Button>
            )}
            
            {hasUpdatePermission && onCreateFollowUp && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-500 dark:hover:text-teal-400 dark:hover:bg-teal-950/50" onClick={onCreateFollowUp}>
                <Plus className="h-4 w-4" />
                <span>Crear Seguimiento</span>
              </Button>
            )}
            
            {hasUpdatePermission && onAddInterest && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:text-pink-500 dark:hover:text-pink-400 dark:hover:bg-pink-950/50" onClick={onAddInterest}>
                <Sparkles className="h-4 w-4" />
                <span>Agregar Intereses</span>
              </Button>
            )}
            
            {hasUpdatePermission && onEditProbability && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50" onClick={onEditProbability}>
                <Percent className="h-4 w-4" />
                <span>Modificar Probabilidad</span>
              </Button>
            )}
            
            {hasAssignPermission && !salesAgent && onAssignSalesAgent && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:text-green-400 dark:hover:bg-green-950/50" onClick={onAssignSalesAgent}>
                <UserPlus className="h-4 w-4" />
                <span>Asignar empleado</span>
              </Button>
            )}
            
            {hasAssignPermission && salesAgent && onAddCollaborator && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-500 dark:hover:text-blue-400 dark:hover:bg-blue-950/50" onClick={onAddCollaborator}>
                <Users className="h-4 w-4" />
                <span>Agregar colaborador</span>
              </Button>
            )}
            
            {/* Confirmar Agenda - Solo si la etapa es "Agenda Pendiente" */}
            {hasUpdatePermission && currentStage === 'Agenda Pendiente' && onConfirmAgenda && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-500 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/50" onClick={onConfirmAgenda}>
                <CheckCircle className="h-4 w-4" />
                <span>Confirmar Agenda</span>
              </Button>
            )}
            
            {/* Agendar Llamada - Solo si la etapa es "Oportunidad Confirmada" */}
            {hasUpdatePermission && currentStage === 'Oportunidad Confirmada' && onScheduleCall && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-500 dark:hover:text-purple-400 dark:hover:bg-purple-950/50" onClick={onScheduleCall}>
                <Phone className="h-4 w-4" />
                <span>Agendar Llamada</span>
              </Button>
            )}
            
            {/* Asignar/Modificar Fecha Esperada */}
            {hasUpdatePermission && !expectedCloseDate && onSetExpectedDate && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-500 dark:hover:text-orange-400 dark:hover:bg-orange-950/50" onClick={onSetExpectedDate}>
                <CalendarPlus className="h-4 w-4" />
                <span>Asignar Fecha Esperada</span>
              </Button>
            )}
            
            {hasUpdatePermission && expectedCloseDate && onEditExpectedDate && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-500 dark:hover:text-orange-400 dark:hover:bg-orange-950/50" onClick={onEditExpectedDate}>
                <Calendar className="h-4 w-4" />
                <span>Modificar Fecha Esperada</span>
              </Button>
            )}
            
            {/* Asignar/Modificar Fecha Límite */}
            {hasUpdatePermission && !deadlineDate && onSetDeadlineDate && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:text-red-400 dark:hover:bg-red-950/50" onClick={onSetDeadlineDate}>
                <Clock className="h-4 w-4" />
                <span>Asignar Fecha Límite</span>
              </Button>
            )}
            
            {hasUpdatePermission && deadlineDate && onEditDeadlineDate && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:text-red-400 dark:hover:bg-red-950/50" onClick={onEditDeadlineDate}>
                <AlertTriangle className="h-4 w-4" />
                <span>Modificar Fecha Límite</span>
              </Button>
            )}
            
            {hasDeletePermission && (
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                <span>Eliminar oportunidad</span>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipo */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="bg-muted/50 px-4 py-3">
          <CardTitle className="text-base font-medium">Equipo</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-medium">{originalAgent.firstName} {originalAgent.lastName}</p>
              <p className="text-xs text-muted-foreground">{originalAgent.email}</p>
              <p className="text-xs mt-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full inline-block">
                Comisionista Original
              </p>
            </div>
          </div>
          
          {salesAgent ? (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Target className="h-4 w-4 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium">{salesAgent.firstName} {salesAgent.lastName}</p>
                <p className="text-xs text-muted-foreground">{salesAgent.email}</p>
                <p className="text-xs mt-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full inline-block">
                  Vendedor Asignado
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sin vendedor asignado</p>
                <p className="text-xs mt-1 bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full inline-block">
                  Pendiente de asignación
                </p>
              </div>
            </div>
          )}
          
          {/* Colaboradores */}
          {collaborators && collaborators.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Colaboradores</p>
                {collaborators.map((collaborator) => (
                  <div key={collaborator._id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{collaborator.firstName} {collaborator.lastName}</p>
                      <p className="text-xs text-muted-foreground">{collaborator.email}</p>
                      <p className="text-xs mt-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full inline-block">
                        Colaborador
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Fechas Importantes */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="bg-muted/50 px-4 py-3">
          <CardTitle className="text-base font-medium">Fechas Importantes</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Creado el</p>
                <p className="text-sm">{formatDate(createdAt)}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Transferido el</p>
                <p className="text-sm">{formatDate(transferredAt)}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha esperada</p>
                <p className="text-sm">{formatDate(expectedCloseDate)}</p>
              </div>
            </div>
            
            {deadlineDate && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha límite</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{formatDate(deadlineDate)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 