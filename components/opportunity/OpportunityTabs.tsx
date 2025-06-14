'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OpportunityInfoTab from './tabs/OpportunityInfoTab';
import LeadInfoTab from './tabs/LeadInfoTab';
import CommentsTab from './tabs/CommentsTab';
import LeadNotesTab from './tabs/LeadNotesTab';
import LeadTasksTab from './tabs/LeadTasksTab';
import LeadDocumentsTab from './tabs/LeadDocumentsTab';
import FollowUpTab from './tabs/FollowUpTab';
import InterestsTab from './tabs/InterestsTab';
import TasksTab from './tabs/TasksTab';

interface OpportunityTabsProps {
  opportunity: any; // Usaremos any por ahora para simplificar
  hasCommentPermission: boolean;
  hasUpdatePermission: boolean;
  newComment: string;
  setNewComment: (value: string) => void;
  addingComment: boolean;
  addComment: () => void;
  formatCurrency: (amount?: number) => string;
  formatDate: (dateString?: string) => string;
  formatDateTime: (dateString: string) => string;
  onUpdateFollowUpStatus?: (followUpId: string, status: 'completado' | 'cancelado') => void;
  onEditFollowUp?: (followUp: {
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
  }) => void;
  onEditComment?: (comment: {
    _id: string;
    content: string;
    isVisibleToOriginalAgent: boolean;
    author: {
      _id?: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }) => void;
  onDeleteComment?: (commentId: string) => void;
  currentUserId?: string;
  onAddInterest?: () => void;
  onEditInterest?: (interest: {
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
  }) => void;
  onDeleteInterest?: (interest: {
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
  }) => void;
  onAddLeadNote?: () => void;
  onEditLeadNote?: (note: any) => void;
  onDeleteLeadNote?: (note: any) => void;
  onAddTask?: () => void;
  onEditTask?: (task: any) => void;
  onDeleteTask?: (task: any) => void;
  onUpdateTaskStatus?: (taskId: string, status: string) => void;
}

export default function OpportunityTabs({
  opportunity,
  hasCommentPermission,
  hasUpdatePermission,
  newComment,
  setNewComment,
  addingComment,
  addComment,
  formatCurrency,
  formatDate,
  formatDateTime,
  onUpdateFollowUpStatus,
  onEditFollowUp,
  onEditComment,
  onDeleteComment,
  currentUserId,
  onAddInterest,
  onEditInterest,
  onDeleteInterest,
  onAddLeadNote,
  onEditLeadNote,
  onDeleteLeadNote,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onUpdateTaskStatus
}: OpportunityTabsProps) {
  return (
    <Tabs defaultValue="info" className="w-full">
      <div className="overflow-x-auto pb-1">
        <TabsList className="w-auto inline-flex min-w-max">
          <TabsTrigger value="info" className="text-xs sm:text-sm whitespace-nowrap">Información</TabsTrigger>
          <TabsTrigger value="leadinfo" className="text-xs sm:text-sm whitespace-nowrap">Información del Lead</TabsTrigger>
          <TabsTrigger value="followup" className="text-xs sm:text-sm whitespace-nowrap">Seguimiento ({(opportunity.scheduledCalls?.length || 0) + (opportunity.followUps?.length || 0)})</TabsTrigger>
          <TabsTrigger value="interests" className="text-xs sm:text-sm whitespace-nowrap">Intereses ({opportunity.interests?.filter((i: any) => !i.deletedAt).length || 0})</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs sm:text-sm whitespace-nowrap">Tareas ({opportunity.tasks?.length || 0})</TabsTrigger>
          <TabsTrigger value="comments" className="text-xs sm:text-sm whitespace-nowrap">Comentarios ({opportunity.comments.length})</TabsTrigger>
          {opportunity.leadSnapshot.notes && opportunity.leadSnapshot.notes.length > 0 && (
            <TabsTrigger value="leadnotes" className="text-xs sm:text-sm whitespace-nowrap">
              Notas del Lead ({opportunity.leadSnapshot.notes.filter((note: any) => !note.deletedAt).length})
            </TabsTrigger>
          )}
          {opportunity.leadSnapshot.tasks && opportunity.leadSnapshot.tasks.length > 0 && (
            <TabsTrigger value="leadtasks" className="text-xs sm:text-sm whitespace-nowrap">Tareas del Lead ({opportunity.leadSnapshot.tasks.length})</TabsTrigger>
          )}
          {opportunity.leadSnapshot.documents && opportunity.leadSnapshot.documents.length > 0 && (
            <TabsTrigger value="leaddocs" className="text-xs sm:text-sm whitespace-nowrap">Documentos del Lead ({opportunity.leadSnapshot.documents.length})</TabsTrigger>
          )}
        </TabsList>
      </div>
      
      <TabsContent value="info" className="space-y-4">
        <OpportunityInfoTab 
          opportunity={opportunity}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      </TabsContent>

      <TabsContent value="leadinfo" className="space-y-4">
        <LeadInfoTab 
          leadSnapshot={opportunity.leadSnapshot}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      </TabsContent>

      <TabsContent value="followup" className="space-y-4">
        <FollowUpTab
          scheduledCalls={opportunity.scheduledCalls || []}
          followUps={opportunity.followUps || []}
          formatDateTime={formatDateTime}
          hasUpdatePermission={hasUpdatePermission}
          onMarkFollowUpCompleted={onUpdateFollowUpStatus ? (id) => onUpdateFollowUpStatus(id, 'completado') : undefined}
          onMarkFollowUpCancelled={onUpdateFollowUpStatus ? (id) => onUpdateFollowUpStatus(id, 'cancelado') : undefined}
          onEditFollowUp={onEditFollowUp}
        />
      </TabsContent>

      <TabsContent value="interests" className="space-y-4">
        <InterestsTab
          interests={opportunity.interests || []}
          onAddInterest={onAddInterest || (() => {})}
          onEditInterest={onEditInterest || (() => {})}
          onDeleteInterest={onDeleteInterest || (() => {})}
          canEdit={hasUpdatePermission}
        />
      </TabsContent>

      <TabsContent value="tasks" className="space-y-4">
        <TasksTab
          tasks={opportunity.tasks || []}
          onAddTask={onAddTask || (() => {})}
          onEditTask={onEditTask || (() => {})}
          onDeleteTask={onDeleteTask || (() => {})}
          onUpdateTaskStatus={onUpdateTaskStatus || (() => {})}
          canEdit={hasUpdatePermission}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
        />
      </TabsContent>
      
      <TabsContent value="comments" className="space-y-4">
        <CommentsTab
          comments={opportunity.comments}
          hasCommentPermission={hasCommentPermission}
          newComment={newComment}
          setNewComment={setNewComment}
          addingComment={addingComment}
          addComment={addComment}
          formatDateTime={formatDateTime}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
          currentUserId={currentUserId}
        />
      </TabsContent>
      


      {opportunity.leadSnapshot.notes && opportunity.leadSnapshot.notes.length > 0 && (
        <TabsContent value="leadnotes" className="space-y-4">
          <LeadNotesTab
            notes={opportunity.leadSnapshot.notes}
            formatDateTime={formatDateTime}
            onAddNote={onAddLeadNote || (() => {})}
            onEditNote={onEditLeadNote || (() => {})}
            onDeleteNote={onDeleteLeadNote || (() => {})}
            canManageNotes={hasUpdatePermission}
          />
        </TabsContent>
      )}

      {opportunity.leadSnapshot.tasks && opportunity.leadSnapshot.tasks.length > 0 && (
        <TabsContent value="leadtasks" className="space-y-4">
          <LeadTasksTab
            tasks={opportunity.leadSnapshot.tasks}
            formatDate={formatDate}
          />
        </TabsContent>
      )}

      {opportunity.leadSnapshot.documents && opportunity.leadSnapshot.documents.length > 0 && (
        <TabsContent value="leaddocs" className="space-y-4">
          <LeadDocumentsTab
            documents={opportunity.leadSnapshot.documents}
            formatDate={formatDate}
          />
        </TabsContent>
      )}
    </Tabs>
  );
} 