import { Employee } from './employee';

export type DocumentType = 
  | 'contract' 
  | 'proposal' 
  | 'invoice' 
  | 'report' 
  | 'specification'
  | 'design'
  | 'image'
  | 'other';

export type DocumentStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'approved' 
  | 'rejected' 
  | 'archived';

export interface DocumentVersion {
  _id?: string;
  version: number;
  url: string;
  size: number;
  uploadedBy: string | Employee;
  uploadedAt: Date;
  notes?: string;
}

export interface Document {
  _id?: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  description?: string;
  projectId?: string;
  taskId?: string;
  clientId?: string;
  tags?: string[];
  currentVersion: number;
  versions: DocumentVersion[];
  createdBy: string | Employee;
  createdAt: Date;
  updatedAt: Date;
  accessControl?: {
    public: boolean;
    restrictedTo?: string[]; // IDs de empleados con acceso
  };
}

export interface DocumentUploadData {
  name: string;
  type: DocumentType;
  description?: string;
  projectId?: string;
  taskId?: string;
  clientId?: string;
  tags?: string[];
  file: File;
  notes?: string;
  isPublic?: boolean;
  restrictedTo?: string[];
} 