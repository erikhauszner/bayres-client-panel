// URL base de la API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://147.93.36.93:3000'; //https://api.bayreshub.com
export const API_ENDPOINT = `${API_URL}/api`;

// URL base para el cliente (frontend)
export const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://147.93.36.93:3001';

// URL para webhooks externos (usada en módulo de leads)
export const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://147.93.36.93:5678';

// Tiempo de caducidad del token JWT en segundos
export const TOKEN_EXPIRY = 86400; // 24 horas

// Número máximo de intentos de inicio de sesión
export const MAX_LOGIN_ATTEMPTS = 5;

// Tiempo de bloqueo después de múltiples intentos fallidos (en minutos)
export const LOCKOUT_TIME = 15;

// Conexión a MongoDB (para el servidor)
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:wNbSKJw096Jnz2tSioZdr8wOztNOFNU1i14LTC5zinXzTYJdjSnamupFikv8nPVG@147.93.36.93:27017/bayres-panel?directConnection=true'; 