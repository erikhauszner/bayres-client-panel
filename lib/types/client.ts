import { Employee } from './lead';

export interface ContactPerson {
  _id?: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
}

export interface Client {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  
  // Información de empresa (si aplica)
  type: 'personal' | 'business';
  businessName?: string;
  businessTaxId?: string;
  industry?: string;
  
  // Información de contacto adicional
  website?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  
  // Campos de sistema
  status: 'active' | 'inactive';
  assignedTo?: Employee | string;
  createdBy?: Employee | string;
  createdAt?: Date;
  updatedAt?: Date;
  notes?: string;
  
  // Relaciones
  projects?: string[];
  interactions?: ClientInteraction[];
  documents?: ClientDocument[];
  representatives?: ContactPerson[];
}

export interface ClientInteraction {
  _id?: string;
  type: 'note' | 'meeting' | 'call' | 'email' | 'other';
  title?: string;
  description: string;
  date: Date;
  Employee?: Employee | string;
}

export interface ClientDocument {
  _id?: string;
  name: string;
  type: string;
  url: string;
  size?: number;
  uploadedBy: Employee | string;
  uploadedAt: Date;
}

export interface ClientCreateData {
  name: string;
  email: string;
  phone?: string;
  type: 'personal' | 'business';
  businessName?: string;
  businessTaxId?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  representatives?: ContactPerson[];
}

export interface ClientUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  type?: 'personal' | 'business';
  businessName?: string;
  businessTaxId?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  representatives?: ContactPerson[];
  notes?: string;
}

export interface ClientFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  type?: string;
} 