import { Employee } from './employee';
import { Client } from './client';

export interface Project {
  _id?: string;
  name: string;
  description?: string;
  client: Client | string;
  startDate: string | Date;
  endDate: string | Date;
  status: 'pending' | 'planning' | 'active' | 'in_progress' | 'paused' | 'completed' | 'canceled';
  budget?: number;
  progress?: number;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: Employee[] | string[];
  manager?: Employee | string;
  documents?: ProjectDocument[];
  tasks?: ProjectTask[];
  createdBy?: Employee | string;
  createdAt?: Date;
  updatedAt?: Date;
  spent?: number;
  totalHours?: number;
  workedHours?: number;
}

export interface ProjectDocument {
  _id?: string;
  name: string;
  type: string;
  url: string;
  size?: number;
  uploadedBy?: Employee | string;
  uploadedAt?: Date;
}

export interface ProjectTask {
  _id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  startDate?: string | Date;
  dueDate?: string | Date;
  completedAt?: Date;
  assignedTo?: Employee | string;
  project?: Project | string;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  dependencies?: string[];
  createdBy?: Employee | string;
  isActive?: boolean;
  budget?: number;
  partialBudget?: number;
  spent?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectTaskComment {
  _id?: string;
  content: string;
  author: Employee | string;
  createdAt: Date;
}

export interface ProjectCreateData {
  name: string;
  description?: string;
  client: string;
  startDate: string | Date;
  endDate: string | Date;
  status: string;
  budget?: number;
  manager?: string;
  assignedTo?: string[];
}

export interface ProjectUpdateData {
  name?: string;
  description?: string;
  client?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: string;
  budget?: number;
  progress?: number;
  priority?: string;
  manager?: string;
  assignedTo?: string[];
}

export interface ProjectFilters {
  status?: string;
  client?: string;
  priority?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ProjectResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
} 