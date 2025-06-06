import api from '@/lib/api';
import { Employee } from '@/lib/types/employee';
import Cookies from 'js-cookie';

export interface AuthResponse {
  employee: Employee;
  token: string;
}

export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { token, employee } = response.data;
      
      // Guardar token en localStorage y cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', token);
        
        // Guardar en cookie con fecha de expiración
        const expiryDays = 1;
        Cookies.set('token', token, { 
          expires: expiryDays,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        // Guardar timestamp de expiración para verificación local
        const expiryTime = new Date();
        expiryTime.setDate(expiryTime.getDate() + expiryDays);
        localStorage.setItem('tokenExpiry', expiryTime.getTime().toString());
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  static async register(data: any): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { token, employee } = response.data;
      
      // Guardar token en localStorage y cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', token);
        
        // Guardar en cookie con fecha de expiración
        const expiryDays = 1;
        Cookies.set('token', token, { 
          expires: expiryDays,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        // Guardar timestamp de expiración para verificación local
        const expiryTime = new Date();
        expiryTime.setDate(expiryTime.getDate() + expiryDays);
        localStorage.setItem('tokenExpiry', expiryTime.getTime().toString());
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  static async getCurrentEmployee(): Promise<Employee> {
    try {
      // Verificar token localmente antes de hacer la petición
      if (this.isTokenExpiredLocally()) {
        console.warn('Token expirado localmente, forzando logout');
        this.clearAuthData();
        throw new Error('Token expirado');
      }
      
      const response = await api.get<Employee>('/auth/me');
      console.log('Respuesta del servidor (getCurrentEmployee):', response.data);
      
      // Asegurarnos de que el campo phone esté correctamente procesado
      const employee = response.data;
      console.log('Campo phone en respuesta:', employee.phone, typeof employee.phone);
      
      return employee;
    } catch (error: any) {
      console.error('Error al obtener el empleado actual:', error);
      
      // Si es un error de autenticación, limpiar datos
      if (error.response && error.response.status === 401) {
        this.clearAuthData();
      }
      
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
      this.clearAuthData();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Limpiar datos de todas formas
      this.clearAuthData();
      throw error;
    }
  }
  
  // Método para limpiar todos los datos de autenticación
  static clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      Cookies.remove('token');
    }
  }
  
  // Verificar si el token ha expirado según datos locales
  static isTokenExpiredLocally(): boolean {
    if (typeof window !== 'undefined') {
      const expiryStr = localStorage.getItem('tokenExpiry');
      if (!expiryStr) return true;
      
      const expiry = parseInt(expiryStr, 10);
      const now = new Date().getTime();
      
      return now > expiry;
    }
    return true; // En el servidor consideramos expirado
  }

  static async changePassword(data: { currentPassword: string; newPassword: string }) {
    try {
      await api.post('/auth/change-password', data);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  static async resetPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/reset-password', { email });
      return response.data;
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      throw error;
    }
  }

  static async verifyResetToken(token: string): Promise<{ valid: boolean }> {
    try {
      const response = await api.get<{ valid: boolean }>(`/auth/verify-reset-token/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error al verificar token de restablecimiento:', error);
      return { valid: false };
    }
  }

  static async setNewPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/new-password', { token, password });
      return response.data;
    } catch (error) {
      console.error('Error al establecer nueva contraseña:', error);
      throw error;
    }
  }

  static isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || Cookies.get('token');
      
      // Verificar si hay token y si no ha expirado
      if (token && !this.isTokenExpiredLocally()) {
        return true;
      }
      
      // Si ha expirado, limpiar datos
      if (this.isTokenExpiredLocally()) {
        this.clearAuthData();
      }
      
      return false;
    }
    return false;
  }

  static getAuthHeaders(): { Authorization: string } | {} {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || Cookies.get('token');
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    }
    return {};
  }

  /**
   * Cambiar la contraseña cuando es forzado por el sistema
   */
  static async changePasswordForced(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/change-password/forced', {
        currentPassword,
        newPassword
      })
    } catch (error) {
      console.error('Error al cambiar la contraseña forzada:', error)
      throw error
    }
  }
}

export const authService = new AuthService(); 