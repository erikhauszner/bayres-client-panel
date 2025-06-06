// URL base de la API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bayreshub.com/api'; //https://api.bayreshub.com
export const API_ENDPOINT = `${API_URL}/api`;

// URL base para el cliente (frontend)
export const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://panel.bayreshub.com';

// URL para webhooks externos (usada en módulo de leads)
export const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://n8n.bayreshub.com';

// Tiempo de caducidad del token JWT en segundos
export const TOKEN_EXPIRY = 86400; // 24 horas

// Número máximo de intentos de inicio de sesión
export const MAX_LOGIN_ATTEMPTS = 5;

// Tiempo de bloqueo después de múltiples intentos fallidos (en minutos)
export const LOCKOUT_TIME = 15;

// Conexión a MongoDB (para el servidor)
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:0XdJF794RkeDQ8DbQiah7uqqZQAei7JVrYsuKXextWnKy7lqXo7QazEuEjVcbyjR@147.93.36.93:27017/default?directConnection=true'; 