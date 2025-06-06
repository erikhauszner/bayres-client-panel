// Verifica que las variables de entorno necesarias estén definidas
function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    // En el navegador, no queremos detener la ejecución, solo mostramos un error
    console.error(`Error: La variable de entorno ${name} no está definida.`);
    return '';
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
export const TOKEN_EXPIRY = 86400; // 24 horas

// Número máximo de intentos de inicio de sesión
export const MAX_LOGIN_ATTEMPTS = 5;

// Tiempo de bloqueo después de múltiples intentos fallidos (en minutos)
export const LOCKOUT_TIME = 15;

// Estas constantes no son variables de entorno ya que son configuraciones
// específicas de la aplicación y no cambian entre entornos 