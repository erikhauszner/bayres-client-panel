"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { socketService } from "@/lib/services/socketService"
import { toast } from "@/components/ui/use-toast"
import { notificationService } from "@/lib/services/notificationService"

// Componente que escucha las notificaciones por WebSocket y las muestra
export function WebSocketListener() {
  const { employee } = useAuth()
  const connectionAttemptedRef = useRef(false)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastNotificationIdRef = useRef<string | null>(null)
  const checkNotificationsIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Función para verificar notificaciones, con opción de mostrar o no como toast
  const checkNotifications = async (showToast = false) => {
    console.log('⚡ Verificando notificaciones...');
    try {
      await notificationService.getNotifications(5, 0, showToast);
    } catch (error) {
      console.error('Error en verificación de notificaciones:', error);
    }
  };
  
  useEffect(() => {
    // Solo conectar si tenemos un empleado válido
    if (!employee || !employee._id) return;
    
    console.log('WebSocketListener: Conectando socket para empleado', employee._id)
    
    // Conectar WebSocket si hay un empleado autenticado
    const connectSocket = () => {
      socketService.connect(employee._id)
      
      // Marcamos que se intentó la conexión, pero sin mostrar el toast
      if (!connectionAttemptedRef.current) {
        connectionAttemptedRef.current = true
      }
    }
    
    // Establecer conexión inicial
    connectSocket()
    
    // Comprobar periódicamente si el socket está conectado y reconectar si es necesario
    reconnectTimeoutRef.current = setInterval(() => {
      if (!socketService.isSocketConnected()) {
        console.log('WebSocketListener: Reconectando socket después de pérdida de conexión')
        connectSocket()
      }
    }, 30000)
    
    // Verificador menos agresivo de notificaciones (cada 15 segundos)
    // Y SOLO para actualizar el contador, no para mostrar toasts
    checkNotificationsIntervalRef.current = setInterval(async () => {
      await checkNotifications(false);
    }, 15000);
    
    // Realizar verificación inmediata al cargar (sin mostrar toast)
    checkNotifications(false);
    
    // Como respaldo, si WebSockets falla, verificar nuevas notificaciones periódicamente
    // pero con mucha menor frecuencia (cada 2 minutos)
    fallbackIntervalRef.current = setInterval(async () => {
      if (!socketService.isSocketConnected()) {
        console.log('WebSocketListener: Usando fallback para verificar notificaciones')
        await checkNotifications(true); // Solo mostrar toast en el fallback
      }
    }, 120000) // 2 minutos
    
    // También verificar al recuperar el foco, pero sin mostrar toast
    const checkOnFocus = () => checkNotifications(false);
    window.addEventListener('focus', checkOnFocus);
    
    return () => {
      // Limpieza al desmontar
      console.log('WebSocketListener: Limpiando recursos')
      
      if (reconnectTimeoutRef.current) {
        clearInterval(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current)
        fallbackIntervalRef.current = null
      }
      
      if (checkNotificationsIntervalRef.current) {
        clearInterval(checkNotificationsIntervalRef.current)
        checkNotificationsIntervalRef.current = null
      }
      
      window.removeEventListener('focus', checkOnFocus);
      
      socketService.disconnect()
    }
  }, [employee])
  
  // Este componente no renderiza nada visible
  return null
}

export default WebSocketListener 