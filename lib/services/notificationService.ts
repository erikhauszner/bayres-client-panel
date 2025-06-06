import api from '../api';
import type { Notification as AppNotification, NotificationPreferences } from '../types/notification';
import { toast } from "@/components/ui/use-toast";
import React from 'react';

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

class NotificationService {
  // Cache de notificaciones mostradas para evitar duplicados
  private shownNotifications: Set<string> = new Set();
  
  async getNotifications(limit: number = 10, offset: number = 0, showToast: boolean = false): Promise<AppNotification[]> {
    try {
      console.log(`🔄 API Request: GET notifications?limit=${limit}&offset=${offset}`);
      const response = await api.get<any>(`notifications?limit=${limit}&offset=${offset}`);
      
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
      const response = await api.get<{ count: number }>('notifications/count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.put(`notifications/${notificationId}/read`);
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await api.put('notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`notifications/${notificationId}`);
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  }

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await api.get<NotificationPreferences>('notifications/preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      const response = await api.put<NotificationPreferences>('notifications/preferences', preferences);
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
    // Verificar si ya mostramos esta notificación
    if (notification._id && this.shownNotifications.has(notification._id)) {
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
    
    // Si es notificación externa, mostrar con el método especializado
    if (isExternal) {
      this.showExternalNotificationToast(notification);
      return;
    }
    
    // Mostrar la notificación como toast
    toast({
      title: notification.title,
      description: notification.message,
      variant: variant,
      duration: duration
    });
  }
  
  // Método para mostrar una notificación externa como toast con mayor prioridad
  showExternalNotificationToast(notification: AppNotification) {
    // Verificar si ya mostramos esta notificación
    if (notification._id && this.shownNotifications.has(notification._id)) {
      return;
    }
    
    // Marcar como mostrada
    if (notification._id) {
      this.shownNotifications.add(notification._id);
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
    
    console.log('🔔 Mostrando NOTIFICACIÓN EXTERNA como toast:', notification.title);
    
    // Mostrar la notificación como toast (MÉTODO ÚNICO para evitar duplicación)
    toast({
      title: `⚡ ${notification.title}`,
      description: notification.message,
      variant: variant,
      duration: duration
    });
    
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