// Verifica que las variables de entorno necesarias estén definidas
// y proporciona valores por defecto para desarrollo
function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Proporcionar valores por defecto en lugar de mostrar error
    console.warn(`Advertencia: La variable de entorno ${name} no está definida, usando valor por defecto.`);
    
    // Valores por defecto para desarrollo
    const defaults: Record<string, string> = {
      'NEXT_PUBLIC_API_URL': 'https://api.bayreshub.com/api',
      'NEXT_PUBLIC_CLIENT_URL': 'https://panel.bayreshub.com',
      'NEXT_PUBLIC_WEBHOOK_URL': 'https://api.bayreshub.com/external/',
      'NEXT_PUBLIC_NOTIFICATIONS_URL': 'https://api.bayreshub.com/notifications',
      'NEXT_PUBLIC_HEALTH_CHECK_URL': 'https://api.bayreshub.com/health',
     'NEXT_PUBLIC_UPLOADS_URL': 'https://api.bayreshub.com/uploads',
//      'NEXT_PUBLIC_API_URL': 'http://localhost:3000/api',
//      'NEXT_PUBLIC_CLIENT_URL': 'http://localhost:3001',
//      'NEXT_PUBLIC_WEBHOOK_URL': 'http://localhost:3000/external/',
//      'NEXT_PUBLIC_NOTIFICATIONS_URL': 'http://localhost:3000/notifications',
//      'NEXT_PUBLIC_HEALTH_CHECK_URL': 'http://localhost:3000/health',
//      'NEXT_PUBLIC_UPLOADS_URL': 'http://localhost:3000/uploads',
    };
    
    return defaults[name] || '';
  }
  return value;
}

// URLs del sistema
export const API_URL = getRequiredEnvVar('NEXT_PUBLIC_API_URL');
export const API_ENDPOINT = API_URL;

// URL base para el cliente (frontend)
export const CLIENT_URL = getRequiredEnvVar('NEXT_PUBLIC_CLIENT_URL');

// URL para webhooks externos (usada en módulo de leads)
export const WEBHOOK_URL = getRequiredEnvVar('NEXT_PUBLIC_WEBHOOK_URL');

// URL específica para notificaciones
export const NOTIFICATIONS_URL = getRequiredEnvVar('NEXT_PUBLIC_NOTIFICATIONS_URL');

// URL específica para health check
export const HEALTH_CHECK_URL = getRequiredEnvVar('NEXT_PUBLIC_HEALTH_CHECK_URL');

// URL para archivos subidos
export const UPLOADS_URL = getRequiredEnvVar('NEXT_PUBLIC_UPLOADS_URL');

// Tiempo de caducidad del token JWT en segundos
export const TOKEN_EXPIRY = 259200; // 72 horas (3 días)

// Número máximo de intentos de inicio de sesión
export const MAX_LOGIN_ATTEMPTS = 5;

// Tiempo de bloqueo después de múltiples intentos fallidos (en minutos)
export const LOCKOUT_TIME = 15;

// Estas constantes no son variables de entorno ya que son configuraciones
// específicas de la aplicación y no cambian entre entornos 