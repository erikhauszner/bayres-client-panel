import { AxiosInstance } from 'axios';
import api from '@/lib/api';

export interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  targetType: string;
  targetId: string;
  previousData?: any;
  newData?: any;
  module: string;
  ip: string;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  module?: string;
  targetType?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
  searchText?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface AuditStatistics {
  actionStats: { _id: string; count: number }[];
  moduleStats: { _id: string; count: number }[];
  targetTypeStats: { _id: string; count: number }[];
  userStats: { _id: { userId: string; userName: string }; count: number }[];
  dailyStats: { _id: string; count: number }[];
  total: number;
}

export class AuditService {
  private api: AxiosInstance;

  constructor() {
    this.api = api;
  }

  /**
   * Obtiene los logs de auditoría con filtros opcionales
   */
  async getLogs(filters: AuditLogFilters = {}): Promise<PaginatedResponse<AuditLog>> {
    try {
      const response = await this.api.get('/audit/logs', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error al obtener logs de auditoría:', error);
      throw error;
    }
  }

  /**
   * Obtiene un log de auditoría específico por ID
   */
  async getLogDetails(id: string): Promise<AuditLog> {
    try {
      const response = await this.api.get(`/audit/logs/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener detalles del log:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de auditoría
   */
  async getStatistics(startDate?: string, endDate?: string): Promise<AuditStatistics> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await this.api.get('/audit/statistics', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de auditoría:', error);
      throw error;
    }
  }

  /**
   * Obtiene actividades recientes
   */
  async getRecentActivity(limit: number = 10): Promise<AuditLog[]> {
    try {
      const response = await this.api.get('/audit/recent-activity', { 
        params: { limit } 
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener actividades recientes:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de actividades de un usuario
   */
  async getUserActivityHistory(userId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<AuditLog>> {
    try {
      const response = await this.api.get(`/audit/user-activity/${userId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de actividad del usuario:', error);
      throw error;
    }
  }
}

export default new AuditService(); 