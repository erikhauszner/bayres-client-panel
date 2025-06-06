export interface Employee {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  phone?: string;
  role: string;
  roleName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastAccess?: string;
  lastLogin?: string | Date;
  permissions: string[];
  avatar?: string;
  
  // Información personal
  birthDate?: string;
  gender?: string;
  documentId?: string;
  documentType?: string;
  
  // Información geográfica
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  
  // Redes sociales
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}

export interface EmployeeCreateData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  phone?: string;
  role: string;
  
  // Información personal
  birthDate?: string;
  gender?: string;
  documentId?: string;
  documentType?: string;
  
  // Información geográfica
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  
  // Redes sociales
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}

export interface EmployeeUpdateData {
  email?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  department?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  
  // Información personal
  birthDate?: string;
  gender?: string;
  documentId?: string;
  documentType?: string;
  
  // Información geográfica
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  
  // Redes sociales
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}

export interface EmployeeLoginData {
  email: string;
  password: string;
}

export interface EmployeeFilters {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface EmployeeResponse {
  data: Employee[];
  total: number;
  pages: number;
}

export interface PermissionModule {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface Permission {
  name: string;
  displayName: string;
  value: string;
} 