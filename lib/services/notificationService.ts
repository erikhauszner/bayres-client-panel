import api from '../api';
import type { Notification as AppNotification, NotificationPreferences } from '../types/notification';
import { toast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import React from 'react';
import { API_URL, NOTIFICATIONS_URL } from '../config';

// Definir un tipo de evento personalizado para notificaciones
export interface NotificationEvent extends CustomEvent {
  detail: {
    notification: {
      title: string;
      message: string;
      type?: string;
      variant?: "default" | "destructive" | "success" | "warning";
    }
  }
}

// Función para crear la URL base de notificaciones
const getNotificationsBaseUrl = () => {
  // Usamos una URL específica para notificaciones
  return NOTIFICATIONS_URL;
};

class NotificationService {
  // Cache de notificaciones mostradas para evitar duplicados
  private shownNotifications: Set<string> = new Set();
  
  async getNotifications(limit: number = 10, offset: number = 0, showToast: boolean = false): Promise<AppNotification[]> {
    try {
      const url = `${getNotificationsBaseUrl()}?limit=${limit}&offset=${offset}`;
      console.log(`🔄 API Request: GET ${url}`);
      const response = await api.get<any>(url);
      
      // Asegurar que siempre se devuelva un array
      let notifications: AppNotification[] = [];
      
      if (Array.isArray(response.data)) {
        notifications = response.data;
      } else if (response.data && Array.isArray(response.data.notifications)) {
        notifications = response.data.notifications;
      } else {
        console.warn('Formato de respuesta de notificaciones inesperado:', response.data);
        return [];
      }
      
      // Si es la primera carga (offset=0) y hay notificaciones no leídas, mostrar la más reciente como toast
      // SOLO si esta función se llama con showToast=true
      if (offset === 0 && notifications.length > 0 && showToast) {
        const unreadNotifications = notifications.filter(n => n.status === 'unread');
        if (unreadNotifications.length > 0) {
          // Mostrar solo la notificación más reciente si no se ha mostrado antes
          const latestNotification = unreadNotifications[0];
          
          // Verificar si ya mostramos esta notificación
          if (latestNotification._id && !this.shownNotifications.has(latestNotification._id)) {
            console.log('🔄 Notificación no leída detectada:', latestNotification.title);
            
            // Verificar si es una notificación externa o de leads
            const isLeadRelated = 
              (latestNotification.title || '').toLowerCase().includes('lead') || 
              (latestNotification.message || '').toLowerCase().includes('lead') ||
              (latestNotification.title || '').includes('Obteniendo');
            
            const isExternal = 
              latestNotification.metadata?.isExternalNotification === true ||
              isLeadRelated;
            
            // Asegurar que tenga metadatos
            if (!latestNotification.metadata) {
              latestNotification.metadata = {};
            }
            
            // Si es externa o de leads, mostrar con mayor importancia
            if (isExternal) {
              latestNotification.metadata.isExternalNotification = true;
              this.showExternalNotificationToast(latestNotification);
            } else {
              this.showToast(latestNotification);
            }
          }
        }
      }
      
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const url = `${getNotificationsBaseUrl()}/count`;
      const response = await api.get<{ count: number }>(url);
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const url = `${getNotificationsBaseUrl()}/${notificationId}/read`;
      await api.put(url);
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const url = `${getNotificationsBaseUrl()}/read-all`;
      await api.put(url);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const url = `${getNotificationsBaseUrl()}/${notificationId}`;
      await api.delete(url);
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  }

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const url = `${getNotificationsBaseUrl()}/preferences`;
      const response = await api.get<NotificationPreferences>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      const url = `${getNotificationsBaseUrl()}/preferences`;
      const response = await api.put<NotificationPreferences>(url, preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Inicializar el listener de eventos de notificación
  constructor() {
    // Configurar un event listener global para notificaciones
    if (typeof window !== 'undefined') {
      window.addEventListener('bayres-notification', ((event: NotificationEvent) => {
        const { notification } = event.detail;
        
        // Generar un ID único para esta notificación basado en título y mensaje
        const notificationId = `event_${notification.title}_${Date.now()}`;
        
        // Verificar si ya mostramos esta notificación
        if (this.shownNotifications.has(notificationId)) {
          return;
        }
        
        // Marcar como mostrada
        this.shownNotifications.add(notificationId);
        
        // Mostrar notificación como toast
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.variant || 'default',
          duration: 5000,
        });
      }) as EventListener);
    }
  }
  
  // Disparar una notificación desde cualquier parte de la aplicación
  triggerNotification(title: string, message: string, variant: "default" | "destructive" | "success" | "warning" = "default") {
    if (typeof window !== 'undefined') {
      // Generar un ID único para esta notificación
      const notificationId = `trigger_${title}_${Date.now()}`;
      
      // Verificar si ya mostramos esta notificación
      if (this.shownNotifications.has(notificationId)) {
        return;
      }
      
      // Marcar como mostrada
      this.shownNotifications.add(notificationId);
      
      const event = new CustomEvent('bayres-notification', {
        detail: {
          notification: {
            title,
            message,
            variant
          }
        }
      });
      
      window.dispatchEvent(event);
    }
  }

  // Método para mostrar una notificación como toast
  showToast(notification: AppNotification) {
    console.log('🎯 showToast llamado con notificación:', {
      title: notification.title,
      _id: notification._id,
      metadata: notification.metadata,
      hasMetadata: !!notification.metadata
    });
    
    // Verificar si ya mostramos esta notificación
    if (notification._id && this.shownNotifications.has(notification._id)) {
      console.log('⚠️ Notificación ya mostrada anteriormente, ignorando:', notification._id);
      return;
    }
    
    // Marcar como mostrada
    if (notification._id) {
      this.shownNotifications.add(notification._id);
    }
    
    // Obtener variante de los metadatos o mapear según el tipo
    let variant: "default" | "destructive" | "success" | "warning" = "default";
    
    // Si hay metadatos con variante, usarlos directamente
    if (notification.metadata?.variant) {
      const metaVariant = notification.metadata.variant;
      if (metaVariant === 'default' || metaVariant === 'destructive' || 
          metaVariant === 'success' || metaVariant === 'warning') {
        variant = metaVariant;
      }
    } else {
      // Mapeo según el tipo si no hay variante en metadatos
      switch (notification.type) {
        case 'task_overdue':
        case 'task_due_soon':
          variant = "warning";
          break;
        case 'task_completed':
        case 'project_completed':
          variant = "success";
          break;
        default:
          variant = "default";
          break;
      }
    }
    
    // Duración personalizada o predeterminada
    const duration = notification.metadata?.duration || 5000;
    
    // Verificar si es una notificación externa o de leads
    const isLeadRelated = 
      (notification.title || '').toLowerCase().includes('lead') || 
      (notification.message || '').toLowerCase().includes('lead') ||
      (notification.title || '').includes('Obteniendo');
    
    const isExternal = 
      notification.metadata?.isExternalNotification === true ||
      isLeadRelated;
    
    console.log('🔍 Verificación de tipo de notificación:', {
      isLeadRelated,
      isExternalFromMeta: notification.metadata?.isExternalNotification === true,
      isExternal,
      title: notification.title
    });
    
    // Si es notificación externa, mostrar con el método especializado
    if (isExternal) {
      console.log('🌟 Redirigiendo a showExternalNotificationToast');
      this.showExternalNotificationToast(notification);
      return;
    }
    
    console.log('📢 Mostrando toast normal con configuración:', { variant, duration });
    
    // Mostrar la notificación como toast
    try {
      toast({
        title: notification.title,
        description: notification.message,
        variant: variant,
        duration: duration
      });
      console.log('✅ Toast normal ejecutado');
    } catch (error) {
      console.warn('⚠️ Error con toast normal, usando sonner:', error);
      // Respaldo con sonner
      sonnerToast.info(notification.title, {
        description: notification.message,
        duration: duration
      });
    }
  }
  
  // Método para mostrar una notificación externa como toast con mayor prioridad
  showExternalNotificationToast(notification: AppNotification) {
    console.log('🌟⚡ showExternalNotificationToast iniciado para:', notification.title);
    
    // Verificar si ya mostramos esta notificación
    if (notification._id && this.shownNotifications.has(notification._id)) {
      console.log('⚠️ Notificación externa ya mostrada, ignorando:', notification._id);
      return;
    }
    
    // Marcar como mostrada
    if (notification._id) {
      this.shownNotifications.add(notification._id);
      console.log('✅ Notificación marcada como mostrada:', notification._id);
    }
    
    // Obtener variante de los metadatos o usar una específica para notificaciones externas
    let variant: "default" | "destructive" | "success" | "warning" = "success";
    
    // Si hay metadatos con variante, usarlos pero dar preferencia a las variantes destacadas
    if (notification.metadata?.variant) {
      const metaVariant = notification.metadata.variant;
      if (metaVariant === 'destructive' || metaVariant === 'warning') {
        variant = metaVariant;
      }
    }
    
    // Mayor duración para notificaciones externas
    const duration = notification.metadata?.duration || 8000;
    
    console.log('🔔 EJECUTANDO toast() para NOTIFICACIÓN EXTERNA:', {
      title: notification.title,
      variant,
      duration
    });
    
    // Intentar mostrar con el toast de shadcn/ui primero
    try {
      toast({
        title: `⚡ ${notification.title}`,
        description: notification.message,
        variant: variant,
        duration: duration
      });
      console.log('✅ Toast shadcn/ui ejecutado exitosamente');
    } catch (error) {
      console.warn('⚠️ Error con toast shadcn/ui, usando sonner como backup:', error);
    }
    
    // SIEMPRE usar sonner como respaldo para garantizar que aparezca
    try {
      // Usar diferentes métodos de sonner según la variante
      const toastTitle = `⚡ ${notification.title}`;
      const toastOptions = {
        description: notification.message,
        duration: duration,
        position: "bottom-right" as const
      };
      
      switch (variant) {
        case 'destructive':
          sonnerToast.error(toastTitle, toastOptions);
          break;
        case 'warning':
          sonnerToast.warning(toastTitle, toastOptions);
          break;
        case 'success':
          sonnerToast.success(toastTitle, toastOptions);
          break;
        default:
          sonnerToast.info(toastTitle, toastOptions);
          break;
      }
      console.log('✅ Sonner toast ejecutado exitosamente con variante:', variant);
    } catch (error) {
      console.error('❌ Error con ambos toast systems:', error);
    }
    
    // Si hay una acción pero NO tiene URL (para evitar recargas), crear un segundo toast con la acción
    const action = notification.metadata?.action;
    if (action && typeof action === 'object' && action.label && !action.url) {
      const actionLabel = action.label;
      setTimeout(() => {
        toast({
          title: `Acción: ${notification.title}`,
          description: `${actionLabel}`,
          variant: "default",
          duration: 3000
        });
      }, 1000);
    }
    
    // Guardar en localStorage para persistencia
    try {
      if (typeof window !== 'undefined') {
        const previousNotifications = JSON.parse(localStorage.getItem('recentNotifications') || '[]');
        previousNotifications.unshift({
          id: notification._id,
          title: notification.title,
          message: notification.message,
          timestamp: new Date().toISOString()
        });
        
        // Limitar a las últimas 5 notificaciones
        const recentNotifications = previousNotifications.slice(0, 5);
        localStorage.setItem('recentNotifications', JSON.stringify(recentNotifications));
      }
    } catch (error) {
      console.error('Error al guardar notificación en localStorage:', error);
    }
  }
}

export const notificationService = new NotificationService(); 