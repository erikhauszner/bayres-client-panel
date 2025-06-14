// Tipos para las automatizaciones

export interface AutomationField {
  id: string;                      // ID único del campo
  name: string;                    // Nombre del campo (ej: "keywords", "location")
  label: string;                   // Etiqueta para mostrar (ej: "Palabras clave", "Ubicación")
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea';  // Tipo de campo
  description?: string;            // Descripción opcional del campo
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';  // Tamaño del campo de texto
  required: boolean;               // Si el campo es obligatorio
  placeholder?: string;            // Placeholder del campo
  defaultValue?: string;           // Valor por defecto
  order?: number;                  // Orden de aparición en el formulario
}

export interface WebhookConfig {
  enabled: boolean;
  url: string;
  method: 'POST' | 'GET';
  headers: Record<string, string>;
  sendLeadData: boolean;
  customPayload?: string;
}

export interface BackendAutomationConfig {
  webhookUrl: string;
  apiKey?: string;
  sendEmployeeId: boolean;
  notificationEmail?: string;
  successRedirectUrl?: string;
  errorRedirectUrl?: string;
}

export interface Automation {
  _id: string;
  name: string;                    // Nombre de la automatización
  description?: string;            // Descripción de la automatización
  fields?: AutomationField[];      // Campos de texto personalizables
  
  // Propiedades del backend
  status: 'active' | 'inactive' | 'draft';  // Estado del backend
  config?: BackendAutomationConfig;         // Configuración del backend
  
  // Propiedades del frontend (para compatibilidad)
  webhookConfig?: WebhookConfig;   // Configuración de webhook (frontend)
  isActive?: boolean;              // Estado activo/inactivo (frontend)
  
  // Metadatos
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AutomationStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
}

// Tipos para crear/actualizar automatizaciones
export interface CreateAutomationData {
  name: string;
  description?: string;
  fields?: AutomationField[];
  webhookConfig?: WebhookConfig;
}

export interface UpdateAutomationData {
  name?: string;
  description?: string;
  fields?: AutomationField[];
  webhookConfig?: WebhookConfig;
  isActive?: boolean;
}

// Respuestas de la API
export interface AutomationResponse {
  success: boolean;
  message?: string;
  data?: Automation;
  errors?: string[];
}

export interface AutomationsResponse {
  success: boolean;
  data: Automation[];
  total: number;
}

export interface AutomationStatsResponse {
  success: boolean;
  data: AutomationStats;
} 