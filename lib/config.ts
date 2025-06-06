// URL base de la API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const API_ENDPOINT = `${API_URL}/api`;

// Tiempo de caducidad del token JWT en segundos
export const TOKEN_EXPIRY = 86400; // 24 horas

// Número máximo de intentos de inicio de sesión
export const MAX_LOGIN_ATTEMPTS = 5;

// Tiempo de bloqueo después de múltiples intentos fallidos (en minutos)
export const LOCKOUT_TIME = 15; 