"use client"

import { useActivityTracker } from '@/hooks/useActivityTracker';

/**
 * Componente que inicializa el sistema de rastreo de actividad
 * Se debe colocar dentro del AuthProvider para tener acceso al contexto de autenticación
 */
export default function ActivityTrackerProvider() {
  // El hook se encarga de toda la lógica de inicialización y limpieza
  useActivityTracker();
  
  // Este componente no renderiza nada, solo ejecuta el hook
  return null;
} 