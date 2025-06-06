import { Employee } from './employee';

export type NotificationType = 
  | 'task_assigned' 
  | 'task_completed' 
  | 'task_due_soon' 
  | 'task_overdue' 
  | 'comment_added' 
  | 'project_updated' 
  | 'project_completed'
  | 'document_uploaded'
  | 'document_updated'
  | 'system';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface NotificationAction {
  label: string;
  url: string;
}

export interface Notification {
  _id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  data?: {
    projectId?: string;
    taskId?: string;
    commentId?: string;
    documentId?: string;
    [key: string]: any;
  };
  metadata?: {
    variant?: "default" | "destructive" | "success" | "warning";
    action?: NotificationAction;
    duration?: number;
    [key: string]: any;
  };
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
  };
  types: {
    [key in NotificationType]: boolean;
  };
  digests: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'never';
  };
} 