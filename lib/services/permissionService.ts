import api from '@/lib/api'

export interface Permission {
  _id: string;
  name: string;
  description: string;
  module: string;
  action: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class PermissionService {
  static async getPermissions(): Promise<Permission[]> {
    try {
      const response = await api.get('/permissions')
      return response.data
    } catch (error) {
      console.error('Error fetching permissions:', error)
      return []
    }
  }

  static groupPermissionsByModule(permissions: Permission[]): { [key: string]: Permission[] } {
    const grouped: { [key: string]: Permission[] } = {}
    
    permissions.forEach(permission => {
      if (!grouped[permission.module]) {
        grouped[permission.module] = []
      }
      grouped[permission.module].push(permission)
    })
    
    return grouped
  }
}

export default PermissionService 