export interface Proyecto {
  _id: string;
  name: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  description?: string;
  client?: string;
}

export interface Representante {
  _id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
}

export interface Actividad {
  _id: string;
  type: string;
  title: string;
  date: string;
  description: string;
}

export interface Factura {
  _id: string;
  number: string;
  date: string;
  amount: string;
  status: string;
}

export interface Documento {
  _id: string;
  name: string;
  date: string;
  size: string;
}

export interface ClientData {
  id: string;
  name: string;
  contact?: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  industry?: string;
  status: string;
  projects: Proyecto[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  city?: string;
  country?: string;
  postalCode?: string;
  whatsapp?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  taxId?: string;
  notes?: string;
  activities?: Actividad[];
  invoices?: Factura[];
  documents?: Documento[];
  representatives?: Representante[];
  assignedTo?: string;
  company?: string;
  source?: string;
  tags?: string[];
} 