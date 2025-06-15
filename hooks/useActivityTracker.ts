import { useEffect, useRef } from 'react';
import { activityTracker } from '@/lib/services/activityTracker';
import { useAuth } from '@/contexts/auth-context';

/**
 * Hook para gestionar el sistema de rastreo de actividad
 * Se inicializa automáticamente cuando el usuario está autenticado
 */
export const useActivityTracker = () => {
  const { employee } = useAuth();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Solo inicializar si el empleado está autenticado y no se ha inicializado antes
    if (employee && !isInitialized.current) {
      console.log('🚀 Inicializando sistema de rastreo de actividad para:', employee.firstName);
      
      try {
        activityTracker.initialize();
        isInitialized.current = true;
        
        // Registrar actividad inicial de login
        activityTracker.logPlatformActivity('user_login', {
          userId: employee._id,
          userName: `${employee.firstName} ${employee.lastName}`,
          loginTime: new Date().toISOString()
        });
        
        console.log('✅ Sistema de rastreo de actividad iniciado correctamente');
      } catch (error) {
        console.error('❌ Error al inicializar sistema de rastreo:', error);
      }
    }

    // Cleanup cuando el usuario se desautentica
    if (!employee && isInitialized.current) {
      console.log('🔄 Destruyendo sistema de rastreo de actividad');
      
      try {
        // Registrar actividad de logout antes de destruir
        activityTracker.logPlatformActivity('user_logout', {
          logoutTime: new Date().toISOString()
        });
        
        activityTracker.destroy();
        isInitialized.current = false;
        
        console.log('✅ Sistema de rastreo destruido correctamente');
      } catch (error) {
        console.error('❌ Error al destruir sistema de rastreo:', error);
      }
    }
  }, [employee]);

  // Función para registrar actividades específicas de la plataforma
  const logActivity = (action: string, details?: any) => {
    if (isInitialized.current) {
      activityTracker.logPlatformActivity(action, details);
    }
  };

  // Función para obtener estadísticas de actividad
  const getStats = () => {
    if (isInitialized.current) {
      return activityTracker.getActivityStats();
    }
    return null;
  };

  return {
    isTracking: isInitialized.current,
    logActivity,
    getStats
  };
}; 