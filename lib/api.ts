import axios from 'axios';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { API_URL } from './config';

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
    Cookies.remove('token');
  }
};

// Interceptores para la gestión de tokens y errores
api.interceptors.request.use(
  (config) => {
    // Verificar si estamos en el navegador
    const isClient = typeof window !== 'undefined';
    let token;
    
    if (isClient) {
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
      
      // Actualizar cookie con nueva fecha de expiración
      const expiryDays = 1;
      Cookies.set('token', newToken, { 
        expires: expiryDays,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Actualizar timestamp de expiración para verificación local
      const expiryTime = new Date();
      expiryTime.setDate(expiryTime.getDate() + expiryDays);
      localStorage.setItem('tokenExpiry', expiryTime.getTime().toString());
      
      // Mostrar notificación discreta de renovación (opcional)
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Sesión renovada automáticamente');
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
        
        // Limpiar datos de sesión
        clearSession();
        
        // Solo redirigir a login si estamos en el cliente y no estamos ya en la página de login
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          console.warn('Sesión expirada. Redirigiendo a login...');
          
          // Forzar recarga completa para asegurar que se limpien todos los estados
          window.location.href = '/login';
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