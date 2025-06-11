import api from '@/lib/api';
import { EmployeeStatus } from '../types/employeeStatus';

export interface DailyStats {
  date: string;
  onlineTime: number;
  breakTime: number;
  offlineTime: number;
  totalTime: number;
  onlineTimeFormatted: string;
  breakTimeFormatted: string;
  offlineTimeFormatted: string;
  totalTimeFormatted: string;
  actionsCount: number;
}

/**
 * Servicio para manejar el estado y monitoreo de empleados
 */
export class EmployeeStatusService {
  /**
   * Obtiene el estado de todos los empleados
   * @returns Lista de estados de empleados
   */
  static async getAllEmployeesStatus(): Promise<EmployeeStatus[]> {
    try {
      console.log('EmployeeStatusService: Obteniendo estado de todos los empleados');
      const response = await api.get('employees/status/all');
      
      // Verificar que los datos tengan la forma esperada
      if (response.data && Array.isArray(response.data)) {
        console.log(`EmployeeStatusService: Se obtuvieron ${response.data.length} registros de empleados`);
        
        // Verificar que cada registro tenga un estado
        const missingStatus = response.data.filter((emp: any) => !emp.status);
        if (missingStatus.length > 0) {
          console.warn(`EmployeeStatusService: Hay ${missingStatus.length} empleados sin estado definido`);
        }
        
        // Verificar distribución de estados
        const onlineCount = response.data.filter((emp: any) => emp.status === 'online').length;
        const offlineCount = response.data.filter((emp: any) => emp.status === 'offline').length;
        const breakCount = response.data.filter((emp: any) => emp.status === 'break').length;
        
        console.log(`EmployeeStatusService: Distribución de estados - Online: ${onlineCount}, Offline: ${offlineCount}, Break: ${breakCount}`);
      } else {
        console.warn('EmployeeStatusService: Los datos recibidos no tienen el formato esperado', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('EmployeeStatusService: Error al obtener el estado de los empleados:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene el estado detallado de un empleado específico
   * @param id ID del empleado
   * @returns Estado detallado del empleado
   */
  static async getEmployeeStatus(id: string): Promise<EmployeeStatus> {
    try {
      console.log(`EmployeeStatusService: Obteniendo estado del empleado ${id}`);
      const response = await api.get(`employees/${id}/status`);
      
      // Verificar el estado recibido
      if (response.data && response.data.status) {
        console.log(`EmployeeStatusService: Empleado ${id} tiene estado: ${response.data.status}`);
      } else {
        console.warn(`EmployeeStatusService: El empleado ${id} no tiene un estado definido`);
      }
      
      return response.data;
    } catch (error) {
      console.error(`EmployeeStatusService: Error al obtener el estado del empleado ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Actualiza manualmente el estado de un empleado
   * @param id ID del empleado
   * @param status Nuevo estado (online, offline, break)
   * @returns Resultado de la operación
   */
  static async updateEmployeeStatus(id: string, status: 'online' | 'offline' | 'break'): Promise<{ message: string, status: string }> {
    try {
      console.log(`EmployeeStatusService: Actualizando estado del empleado ${id} a "${status}"`);
      const response = await api.put(`employees/${id}/status`, { status });
      
      console.log(`EmployeeStatusService: Estado del empleado ${id} actualizado correctamente`);
      return response.data;
    } catch (error) {
      console.error(`EmployeeStatusService: Error al actualizar el estado del empleado ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza el estado del empleado actual
   * @param status Nuevo estado (online, offline, break)
   * @returns Resultado de la operación
   */
  static async updateCurrentEmployeeStatus(status: 'online' | 'offline' | 'break'): Promise<{ message: string, status: string }> {
    try {
      console.log(`EmployeeStatusService: Actualizando estado del empleado actual a "${status}"`);
      const response = await api.put('employees/status/current', { status });
      
      console.log('EmployeeStatusService: Estado actualizado correctamente:', response.data);
      return response.data;
    } catch (error) {
      console.error(`EmployeeStatusService: Error al actualizar el estado del empleado actual:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el estado actual del empleado logueado
   * @returns Estado del empleado actual
   */
  static async getCurrentEmployeeStatus(): Promise<EmployeeStatus> {
    try {
      console.log('EmployeeStatusService: Obteniendo estado del empleado actual');
      const response = await api.get('employees/status/current');
      
      // Verificar el estado recibido
      if (response.data && response.data.status) {
        console.log(`EmployeeStatusService: El empleado actual tiene estado: ${response.data.status}`);
      } else {
        console.warn('EmployeeStatusService: El empleado actual no tiene un estado definido');
      }
      
      return response.data;
    } catch (error) {
      console.error('EmployeeStatusService: Error al obtener el estado del empleado actual:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas diarias de actividad de un empleado específico
   * @param employeeId - ID del empleado
   * @param startDate - Fecha de inicio (YYYY-MM-DD)
   * @param endDate - Fecha de fin (YYYY-MM-DD)
   */
  static async getEmployeeDailyStats(
    employeeId: string, 
    startDate: string, 
    endDate: string
  ): Promise<DailyStats[]> {
    try {
      const response = await api.get(`/employees/daily-stats/${employeeId}`, {
        params: {
          startDate,
          endDate
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas diarias del empleado:', error);
      throw error;
    }
  }
} 