import axios from 'axios';
import { API_ENDPOINT } from '@/lib/config';
import {
  Automation,
  AutomationStats,
  CreateAutomationData,
  UpdateAutomationData,
  AutomationResponse,
  AutomationsResponse,
  AutomationStatsResponse
} from '@/lib/types/automation';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export class AutomationService {
  /**
   * Obtener todas las automatizaciones
   */
  static async getAll(filters?: {
    status?: string;
    search?: string;
    createdBy?: string;
  }): Promise<Automation[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.createdBy) params.append('createdBy', filters.createdBy);

    const response = await axios.get<AutomationsResponse>(
      `${API_ENDPOINT}/automations?${params}`,
      { headers: getAuthHeaders() }
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Error al obtener automatizaciones');
  }

  /**
   * Obtener automatización por ID
   */
  static async getById(id: string): Promise<Automation> {
    const response = await axios.get<AutomationResponse>(
      `${API_ENDPOINT}/automations/${id}`,
      { headers: getAuthHeaders() }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Automatización no encontrada');
  }

  /**
   * Obtener automatización por nombre (público)
   */
  static async getByName(name: string): Promise<Partial<Automation>> {
    const response = await axios.get<AutomationResponse>(
      `${API_ENDPOINT}/automations/public/${name}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Automatización no encontrada');
  }

  /**
   * Crear nueva automatización
   */
  static async create(data: CreateAutomationData): Promise<Automation> {
    const response = await axios.post<AutomationResponse>(
      `${API_ENDPOINT}/automations`,
      data,
      { headers: getAuthHeaders() }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Error al crear automatización');
  }

  /**
   * Actualizar automatización
   */
  static async update(id: string, data: UpdateAutomationData): Promise<Automation> {
    const response = await axios.put<AutomationResponse>(
      `${API_ENDPOINT}/automations/${id}`,
      data,
      { headers: getAuthHeaders() }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Error al actualizar automatización');
  }

  /**
   * Eliminar automatización
   */
  static async delete(id: string): Promise<void> {
    const response = await axios.delete<AutomationResponse>(
      `${API_ENDPOINT}/automations/${id}`,
      { headers: getAuthHeaders() }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar automatización');
    }
  }

  /**
   * Cambiar estado de automatización
   */
  static async changeStatus(id: string, status: 'active' | 'inactive' | 'draft'): Promise<Automation> {
    const response = await axios.patch<AutomationResponse>(
      `${API_ENDPOINT}/automations/${id}/status`,
      { status },
      { headers: getAuthHeaders() }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Error al cambiar estado');
  }

  /**
   * Duplicar automatización
   */
  static async duplicate(id: string, newName: string): Promise<Automation> {
    const response = await axios.post<AutomationResponse>(
      `${API_ENDPOINT}/automations/${id}/duplicate`,
      { newName },
      { headers: getAuthHeaders() }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Error al duplicar automatización');
  }

  /**
   * Obtener automatizaciones activas
   */
  static async getActive(): Promise<Automation[]> {
    const response = await axios.get<AutomationsResponse>(
      `${API_ENDPOINT}/automations/active`,
      { headers: getAuthHeaders() }
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Error al obtener automatizaciones activas');
  }

  /**
   * Obtener estadísticas
   */
  static async getStats(): Promise<AutomationStats> {
    const response = await axios.get<AutomationStatsResponse>(
      `${API_ENDPOINT}/automations/stats`,
      { headers: getAuthHeaders() }
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Error al obtener estadísticas');
  }

  /**
   * Enviar datos a una automatización (método legacy)
   */
  static async submitForm(automationName: string, formData: Record<string, any>): Promise<any> {
    // Este método está deprecated, usar submit() en su lugar
    throw new Error('Método deprecated. Usar submit() en su lugar.');
  }

  /**
   * Obtener automatización pública por ID
   */
  static async getPublic(id: string): Promise<Automation> {
    const response = await axios.get<AutomationResponse>(
      `${API_ENDPOINT}/automations/public/id/${id}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Automatización no encontrada');
  }

  /**
   * Enviar formulario de automatización
   */
  static async submit(id: string, data: Record<string, string>): Promise<void> {
    const response = await axios.post<AutomationResponse>(
      `${API_ENDPOINT}/automations/${id}/submit`,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al enviar formulario');
    }
  }
} 