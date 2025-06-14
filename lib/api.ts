import axios from 'axios';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { API_URL, TOKEN_EXPIRY } from './config';

// Crear una instancia de axios con la URL base de la API
console.log('API_URL configurada en:', API_URL);

const api = axios.create({
  baseURL: `${API_URL}`, // Ya incluye /api como parte de la URL base
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // Reducir a 10 segundos para evitar bloqueos largos
});

// Función para limpiar los datos de sesión
const clearSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    Cookies.remove('token');
    
    // Limpiar cualquier otro dato de sesión
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('sessionId');
    
    console.log('🧹 Sesión limpiada completamente');
  }
};

// Función para verificar si el token está expirado
const isTokenExpired = () => {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('token');
  const tokenExpiry = localStorage.getItem('tokenExpiry');

  if (!token) return true;

  if (tokenExpiry) {
    const expiryTime = parseInt(tokenExpiry);
    const currentTime = new Date().getTime();
    return currentTime > expiryTime;
  }

  return false; // Si no hay información de expiración, asumir que es válido
};

// Función para redirigir al login
const redirectToLogin = (reason?: string) => {
  if (typeof window !== 'undefined') {
    console.warn('Sesión expirada. Redirigiendo a login...', reason);
    
    // Limpiar datos de sesión
    clearSession();
    
    // Evitar redirección infinita si ya estamos en login
    if (!window.location.pathname.includes('/login')) {
      // Mostrar toast de error si está disponible
      if (typeof toast === 'function') {
        toast.error(reason || 'Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      // Redirigir al login
      window.location.href = '/login';
    }
  }
};

// Interceptores para la gestión de tokens y errores
api.interceptors.request.use(
  (config) => {
    // Verificar si estamos en el navegador
    const isClient = typeof window !== 'undefined';
    let token;
    
    if (isClient) {
      // No verificar el token para rutas de autenticación
      const isAuthRoute = config.url && [
        '/auth/login', 
        'auth/login', 
        '/auth/register', 
        'auth/register',
        '/auth/me',
        'auth/me',
        '/auth/forgot-password',
        'auth/forgot-password',
        '/auth/reset-password',
        'auth/reset-password'
      ].some(
        route => config.url?.includes(route)
      );
      
      // Verificar si el token está expirado antes de hacer la petición (excepto para rutas de auth)
      if (!isAuthRoute && isTokenExpired()) {
        console.warn('Token expirado detectado en interceptor de petición - ejecutando logout automático');
        
        // **LOGOUT AUTOMÁTICO**: Intentar hacer logout en el servidor antes de redirigir
        const expiredToken = localStorage.getItem('token');
        if (expiredToken) {
          // Hacer logout en el servidor de manera asíncrona sin bloquear
          fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${expiredToken}`
            },
            body: JSON.stringify({})
          }).then(() => {
            console.log('✅ Logout automático por token expirado ejecutado');
          }).catch((logoutError) => {
            console.warn('⚠️ Error durante logout automático por token expirado:', logoutError);
          });
        }
        
        redirectToLogin('Token expirado - logout automático ejecutado');
        return Promise.reject(new Error('Token expirado'));
      }
      
      // Cliente: Obtener token del localStorage o cookie del cliente
      token = localStorage.getItem('token') || Cookies.get('token');
    } else {
      // Servidor: No podemos acceder a localStorage
      token = Cookies.get('token'); // En el servidor, solo intentamos obtener de las cookies
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Error en interceptor de petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación y renovación automática de tokens
api.interceptors.response.use(
  (response) => {
    // RENOVACIÓN AUTOMÁTICA DE TOKENS: Verificar si el servidor envió un nuevo token
    const newToken = response.headers['x-new-token'];
    if (newToken && typeof window !== 'undefined') {
      console.log('🔄 Token renovado automáticamente por el servidor');
      
      // Actualizar el token en localStorage y cookies
      localStorage.setItem('token', newToken);
      
      // Calcular fecha de expiración basada en el TOKEN_EXPIRY (72 horas = 3 días)
      const expiryDays = 3;
      
      // Actualizar cookie con nueva fecha de expiración
      Cookies.set('token', newToken, { 
        expires: expiryDays,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Actualizar timestamp de expiración para verificación local
      // Usar el tiempo de expiración exacto del TOKEN_EXPIRY en segundos
      const expiryTime = new Date();
      expiryTime.setTime(expiryTime.getTime() + (TOKEN_EXPIRY * 1000)); // TOKEN_EXPIRY es en segundos
      localStorage.setItem('tokenExpiry', expiryTime.getTime().toString());
      
      // Mostrar notificación discreta de renovación (opcional)
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Sesión renovada automáticamente hasta', expiryTime.toLocaleString());
      }
    }
    
    // Específicamente para notificaciones, hacer un log detallado
    if (response.config.url?.includes('notifications')) {
      console.log('📩 API Response Notificaciones:', {
        url: response.config.url,
        status: response.status,
        dataType: typeof response.data,
        dataPreview: Array.isArray(response.data) 
          ? `Array con ${response.data.length} elementos`
          : (typeof response.data === 'object' ? JSON.stringify(response.data).substring(0, 150) + '...' : response.data)
      });
      
      // Si es una solicitud GET de notificaciones, verificar si hay no leídas
      if (response.config.method === 'get' && Array.isArray(response.data)) {
        const unreadNotifications = response.data.filter(n => n.status === 'unread');
        if (unreadNotifications.length > 0) {
          console.log(`🔔 Hay ${unreadNotifications.length} notificaciones sin leer en la respuesta`);
        }
      }
    }
    
    return response;
  },
  async (error) => {
    // Gestión global de errores
    if (error.response) {
      // El servidor respondió con un estado de error
      console.error('Error en respuesta API:', {
        status: error.response.status,
        url: error.config.url,
        data: error.response.data,
        method: error.config.method
      });
      
      // Manejar error 500 (Error interno del servidor)
      if (error.response.status === 500) {
        console.error('Error interno del servidor:', {
          url: error.config.url,
          method: error.config.method,
          data: error.config.data
        });
        
        // Intentar parsear el cuerpo de la solicitud si es un string JSON
        if (typeof error.config.data === 'string') {
          try {
            const requestData = JSON.parse(error.config.data);
            console.log('Datos enviados en la solicitud:', requestData);
          } catch (e) {
            // Si no es JSON válido, mostrar como está
            console.log('Datos enviados en la solicitud (raw):', error.config.data);
          }
        }
      }
      
      // Manejar error 401 (No autorizado)
      if (error.response.status === 401) {
        console.error('Error de autenticación: Token inválido o expirado');
        
        // Usar la función centralizada de redirección
        redirectToLogin('Token inválido o expirado');
        
        return Promise.reject(error);
      }
      
      // Manejar error 403 (Prohibido)
      if (error.response.status === 403) {
        console.error('Error de autorización: Sin permisos suficientes');
        
        // **MEJORADO**: Verificar si el servidor indica que se requiere logout
        const errorData = error.response.data || {};
        const requiresLogout = errorData.action === 'logout_required';
        
        // **MÁS ESPECÍFICO**: Solo hacer logout automático en casos muy específicos
        const errorMessage = errorData.message || '';
        const isTokenError = 
          requiresLogout ||
          errorMessage.includes('Token inválido') || 
          errorMessage.includes('Token no proporcionado') ||
          errorMessage.includes('Sesión expirada') ||
          errorMessage.includes('Empleado inactivo');
        
        // **EVITAR BUCLES**: No hacer logout automático para errores de permisos normales
        const isNormalPermissionError = 
          errorMessage.includes('No autorizado') ||
          errorMessage.includes('Sin permisos suficientes') ||
          errorMessage.includes('permisos insuficientes');
        
        if (isTokenError && !isNormalPermissionError) {
          console.warn('Error 403 de token/sesión detectado, ejecutando logout automático');
          
          // **LOGOUT AUTOMÁTICO**: Llamar al endpoint de logout antes de redirigir
          try {
            const token = localStorage.getItem('token');
            if (token) {
              // Intentar hacer logout en el servidor
              await api.post('/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
              });
              console.log('✅ Logout automático ejecutado correctamente');
            }
          } catch (logoutError) {
            console.warn('⚠️ Error durante logout automático:', logoutError);
            // Continuar con la limpieza aunque falle el logout del servidor
          }
          
          redirectToLogin('Sesión expirada - logout automático ejecutado');
          return Promise.reject(error);
        }
        
        // **LOGGING DETALLADO**: Para debuggear errores 403 que no son de token
        console.warn('Error 403 que NO es de token:', {
          url: error.config.url,
          message: errorMessage,
          requiresLogout,
          isTokenError,
          isNormalPermissionError
        });
        
        // Para otros errores 403, solo mostrar toast
        if (typeof toast === 'function') {
          toast.error('No tienes permisos para realizar esta acción');
        }
      }
    } else if (error.request) {
      // La petición se realizó pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      // Error al configurar la petición
      console.error('Error al configurar la petición:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 