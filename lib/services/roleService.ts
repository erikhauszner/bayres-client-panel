import api from '@/lib/api'

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: any[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export class RoleService {
  static async getRoles(): Promise<Role[]> {
    try {
      const response = await api.get('/roles')
      return response.data
    } catch (error) {
      console.error('Error fetching roles:', error)
      return []
    }
  }

  static async getRoleById(id: string | object): Promise<Role | null> {
    try {
      // Asegurarse de que id es un string
      const roleId = typeof id === 'object' && id !== null && '_id' in id 
        ? (id as any)._id 
        : (typeof id === 'string' ? id : null)
      
      if (!roleId) {
        console.error('Invalid role ID:', id)
        return null
      }
      
      const response = await api.get(`/roles/${roleId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching role ${id}:`, error)
      return null
    }
  }

  static async getRolePermissions(id: string | object): Promise<any[]> {
    try {
      // Asegurarse de que id es un string
      const roleId = typeof id === 'object' && id !== null && '_id' in id 
        ? (id as any)._id 
        : (typeof id === 'string' ? id : null)
      
      if (!roleId) {
        console.error('Invalid role ID:', id)
        return []
      }
      
      const response = await api.get(`/roles/${roleId}/permissions`)
      return response.data
    } catch (error) {
      console.error(`Error fetching role permissions ${id}:`, error)
      return []
    }
  }

  static async updateRole(id: string | object, roleData: {
    name?: string;
    description?: string;
    permissions?: string[];
    isActive?: boolean;
  }): Promise<Role | null> {
    try {
      // Asegurarse de que id es un string
      const roleId = typeof id === 'object' && id !== null && '_id' in id 
        ? (id as any)._id 
        : (typeof id === 'string' ? id : null)
      
      if (!roleId) {
        console.error('Invalid role ID:', id)
        return null
      }
      
      const response = await api.put(`/roles/${roleId}`, roleData)
      return response.data
    } catch (error) {
      console.error(`Error updating role ${id}:`, error)
      throw error
    }
  }

  static async createRole(roleData: {
    name: string;
    description: string;
    permissions: string[];
    isActive?: boolean;
  }): Promise<Role | null> {
    try {
      const response = await api.post('/roles', roleData)
      return response.data
    } catch (error) {
      console.error('Error creating role:', error)
      throw error
    }
  }

  static async deleteRole(id: string | object): Promise<boolean> {
    try {
      // Asegurarse de que id es un string
      const roleId = typeof id === 'object' && id !== null && '_id' in id 
        ? (id as any)._id 
        : (typeof id === 'string' ? id : null)
      
      if (!roleId) {
        console.error('Invalid role ID:', id)
        return false
      }
      
      await api.delete(`/roles/${roleId}`)
      return true
    } catch (error) {
      console.error(`Error deleting role ${id}:`, error)
      throw error
    }
  }

  static async toggleRoleStatus(id: string | object): Promise<Role | null> {
    try {
      // Asegurarse de que id es un string
      const roleId = typeof id === 'object' && id !== null && '_id' in id 
        ? (id as any)._id 
        : (typeof id === 'string' ? id : null)
      
      if (!roleId) {
        console.error('Invalid role ID:', id)
        return null
      }
      
      const response = await api.put(`/roles/${roleId}/toggle-status`)
      return response.data
    } catch (error) {
      console.error(`Error toggling role status ${id}:`, error)
      throw error
    }
  }

  static async getActiveRoles(): Promise<Role[]> {
    try {
      // Obtener todos los roles y filtrar solo los activos
      const roles = await this.getRoles()
      return roles.filter(role => role.isActive)
    } catch (error) {
      console.error('Error fetching active roles:', error)
      return []
    }
  }
}

export default RoleService 