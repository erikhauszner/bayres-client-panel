export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  position: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  // Información Básica
  _id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  position?: string;
  industry?: string;
  companySize?: string;
  website?: string;

  // Información de Contacto
  phone?: string;
  whatsapp?: string;
  email: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;

  // Información de Ubicación
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
  zoneType?: 'urban' | 'suburban' | 'rural' | 'industrial' | 'commercial';
  marketArea?: string;

  // Información de Lead
  source: string;
  captureDate?: Date;
  initialScore?: number;
  currentStage: string;
  status: string;
  isApproved?: boolean;
  estimatedValue?: number;
  priority?: 'baja' | 'media' | 'alta';
  interestedProducts?: string[];
  estimatedBudget?: number;

  // Segmentación Demográfica
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  educationLevel?: 'highschool' | 'technical' | 'bachelor' | 'master' | 'phd';
  annualIncome?: number;
  personalInterests?: string;
  preferredChannel?: 'email' | 'phone' | 'social' | 'messaging' | 'inperson';
  purchaseFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'occasional';
  devicesUsed?: string[];
  decisionInfluencers?: string;

  // Referencias y Conexiones
  referenceSource?: 'client' | 'partner' | 'employee' | 'event' | 'other';
  referrerName?: string;
  referenceDetails?: string;
  connections?: {
    companyName: string;
    relationship: string;
    description: string;
    type: 'client' | 'partner' | 'supplier' | 'other';
  }[];

  // Información Adicional
  notes?: {
    _id?: string;
    content: string;
    createdAt: Date;
    user: Employee | string;
  }[];
  attachments?: string[];
  interactionHistory?: LeadInteraction[];
  tasks?: LeadTask[];
  followUps?: {
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
  }[];
  documents?: LeadDocument[];
  lastActivity?: Date;
  nextContactDate?: Date;
  tags?: string[];
  categories?: string[];
  trackingStatus?: string;
  preferredContactTime?: string;

  // Campos de sistema
  assignedTo?: Employee | string;
  createdBy?: Employee | string;
  createdAt?: Date;
  updatedAt?: Date;

  // Campos de anulación
  annulationReason?: string;
  annulationDate?: Date;
  annulatedBy?: Employee | string;

  // Campos para Oportunidades
  canMoveToSales?: boolean;
  movedToOpportunities?: boolean;
  opportunityId?: string;
}

export interface LeadFilters {
  status?: string | { $ne: string } | any;
  currentStage?: string;
  assignedTo?: string;
  priority?: 'baja' | 'media' | 'alta';
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
  isApproved?: boolean | string;
}

export interface LeadResponse {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface LeadInteraction {
  _id?: string;
  type: 'note' | 'meeting' | 'task' | 'status_change' | 'status' | 'call' | 'video' | 'in-person' | 'email' | 'other' | 'aprobacion' | 'rechazo';
  title?: string;
  description: string;
  date: Date;
  user: Employee | string;
  completed?: boolean;
  dueDate?: Date;
  priority?: 'baja' | 'media' | 'alta';
  meetingType?: 'call' | 'video' | 'in-person' | 'email';
  result?: string;
  assignedTo?: (Employee | string)[] | null;
}

export interface LeadStatusUpdate {
  _id?: string;
  status: string;
  previousStatus?: string;
  currentStage: string;
  previousStage?: string;
  date: Date;
  reason: string;
  user: Employee | string;
}

export interface LeadAssignment {
  assignedTo: string;
}

export interface LeadTask {
  _id?: string;
  title: string;
  description?: string;
  dueDate: Date;
  status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  priority: 'baja' | 'media' | 'alta';
  assignedTo?: Employee | string;
  user?: Employee | string;
  createdAt?: Date;
}

export interface LeadDocument {
  _id?: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  uploadDate: Date;
  user?: Employee | string;
  tags?: string[];
  uploadedBy?: Employee | string;
  isExternalLink?: boolean;
} 