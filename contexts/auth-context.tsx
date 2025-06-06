"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { AuthService } from '@/lib/services/authService';
import { Employee } from '@/lib/types/employee';
import { socketService } from "@/lib/services/socketService";
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';

interface AuthContextType {
  employee: Employee | null;
  loading: boolean;
  isNewUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getCurrentEmployee: () => Promise<Employee | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar token almacenado al cargar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Cargar empleado cuando cambia el token
  useEffect(() => {
    const getCurrentEmployee = async () => {
      setLoading(true);
      try {
        const currentEmployee = await AuthService.getCurrentEmployee();
        setEmployee(currentEmployee);
        
        // Verificar si es un usuario nuevo que necesita completar su perfil
        console.log('Datos de empleado:', currentEmployee);
        console.log('Campo phone:', currentEmployee?.phone);
        
        // Usar una validación más estricta para el campo phone
        const needsOnboarding = currentEmployee && 
          (!currentEmployee.phone || currentEmployee.phone === '');
          
        console.log('¿Necesita onboarding?', needsOnboarding);
        setIsNewUser(!!needsOnboarding);
        
        if (currentEmployee && currentEmployee._id) {
          console.log('Conectando socket para empleado:', currentEmployee._id);
          socketService.connect(currentEmployee._id);
        }
      } catch (error) {
        setEmployee(null);
        console.error("Error loading current employee:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getCurrentEmployee();
    } else {
      setEmployee(null);
      setLoading(false);
      
      socketService.disconnect();
    }
  }, [token]);
  
  // Redireccionar a onboarding si es un usuario nuevo
  useEffect(() => {
    if (!loading && employee && isNewUser) {
      // Solo redireccionar si no estamos ya en /onboarding o /login
      if (pathname !== '/onboarding' && pathname !== '/login') {
        router.push('/onboarding');
      }
    }
  }, [loading, employee, isNewUser, pathname, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await AuthService.login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.token);
      setToken(response.token);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    console.log("Cerrando sesión - Paso 1: Limpiando estado local");
    
    // IMPORTANTE: Primero limpiar todos los datos locales
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    
    // Limpiar la cookie (esto es crucial)
    Cookies.remove('token', { path: '/' });
    
    // Actualizar el estado interno
    setToken(null);
    setEmployee(null);
    setIsNewUser(false);
    
    // Limpiar el intervalo de verificación
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
      sessionCheckIntervalRef.current = null;
    }
    
    // Desconectar socket al cerrar sesión
    socketService.disconnect();
    
    console.log("Cerrando sesión - Paso 2: Datos locales limpiados, intentando notificar al servidor");
    
    // Intentar realizar la llamada al servidor para logout, pero no esperar
    // El resultado de esta llamada no debe afectar la experiencia del usuario
    api.post('/auth/logout')
      .then(() => {
        console.log("Sesión cerrada correctamente en el servidor");
      })
      .catch((error: any) => {
        console.error("Error al cerrar sesión en el servidor:", error);
      });
    
    // Redirigir inmediatamente a login
    console.log("Cerrando sesión - Paso 3: Redirigiendo a login");
    window.location.href = "/login"; // Usar window.location en lugar de router para forzar recarga completa
  }, []);

  const getCurrentEmployee = async () => {
    try {
      const employee = await AuthService.getCurrentEmployee();
      setEmployee(employee);
      
      // Actualizar el estado de usuario nuevo
      console.log('Actualizando estado en getCurrentEmployee:', employee);
      console.log('Campo phone en getCurrentEmployee:', employee?.phone);
      
      // Usar una validación más estricta para el campo phone
      const needsOnboarding = employee && 
        (!employee.phone || employee.phone === '');
      
      console.log('¿Necesita onboarding? (getCurrentEmployee)', needsOnboarding);
      setIsNewUser(!!needsOnboarding);
      
      return employee;
    } catch (error) {
      console.error("Error fetching employee:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ employee, loading, isNewUser, login, logout, getCurrentEmployee }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 