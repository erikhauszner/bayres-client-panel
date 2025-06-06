import api from '@/lib/api'
import { Employee, EmployeeCreateData, EmployeeUpdateData, EmployeeFilters, EmployeeResponse, PermissionModule } from '../types/employee'

export class EmployeeService {
  static async getEmployees(filters: EmployeeFilters): Promise<EmployeeResponse> {
    const response = await api.get('/employees', { params: filters })
    return response.data
  }

  static async getEmployee(id: string): Promise<Employee> {
    const response = await api.get(`/employees/${id}`)
    return response.data
  }

  static async createEmployee(data: EmployeeCreateData): Promise<Employee> {
    try {
      console.log('Enviando datos para crear empleado:', data);
      const response = await api.post('/employees', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear empleado:', error);
      throw error;
    }
  }

  static async updateEmployee(id: string, data: EmployeeUpdateData): Promise<Employee> {
    try {
      console.log('Enviando datos para actualizar empleado:', id, data);
      const response = await api.put(`/employees/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar empleado ${id}:`, error);
      throw error;
    }
  }

  static async deleteEmployee(id: string): Promise<void> {
    await api.delete(`/employees/${id}`)
  }

  static async activateEmployee(id: string): Promise<Employee> {
    const response = await api.put(`/employees/${id}/activate`)
    return response.data
  }

  static async deactivateEmployee(id: string): Promise<Employee> {
    const response = await api.put(`/employees/${id}/deactivate`)
    return response.data
  }

  static async getEmployeePermissions(id: string): Promise<string[]> {
    try {
      const response = await api.get<string[]>(`/employees/${id}/permissions`)
      return response.data
    } catch (error) {
      console.error(`Error fetching permissions for employee ${id}:`, error)
      throw error
    }
  }

  static async updateEmployeePermissions(id: string, permissions: string[]): Promise<Employee> {
    try {
      const response = await api.put<Employee>(`/employees/${id}/permissions`, { permissions })
      return response.data
    } catch (error) {
      console.error(`Error updating permissions for employee ${id}:`, error)
      throw error
    }
  }

  static async getAllPermissionModules(): Promise<PermissionModule[]> {
    try {
      const response = await api.get<PermissionModule[]>('/permissions/modules')
      return response.data
    } catch (error) {
      console.error('Error fetching permission modules:', error)
      throw error
    }
  }

  static async resetPassword(id: string, newPassword: string, forcePasswordChange?: boolean): Promise<void> {
    try {
      await api.post(`/employees/${id}/reset-password`, { 
        newPassword,
        forcePasswordChange 
      })
    } catch (error) {
      console.error(`Error resetting password for employee ${id}:`, error)
      throw error
    }
  }

  static async updateMyProfile(data: EmployeeUpdateData): Promise<Employee> {
    try {
      console.log('Enviando datos para actualizar perfil propio:', data);
      const response = await api.put('/employees/profile/me', data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar perfil propio:', error);
      throw error;
    }
  }
}

export default EmployeeService 