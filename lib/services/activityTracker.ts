import { logAuditAction } from './auditService';

/**
 * Sistema de Actividad Real con Detección de Interacción
 * Usa el sistema de auditoría existente para registrar actividades
 * 
 * Reglas:
 * - 20 minutos sin actividad → BREAK automático
 * - 40 minutos sin actividad → OFFLINE automático
 */
export class ActivityTracker {
  private static instance: ActivityTracker;
  private lastActivity: number = Date.now();
  private breakTimer: NodeJS.Timeout | null = null;
  private offlineTimer: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;
  
  // Tiempos en milisegundos
  private readonly BREAK_TIMEOUT = 20 * 60 * 1000;  // 20 minutos
  private readonly OFFLINE_TIMEOUT = 40 * 60 * 1000; // 40 minutos
  
  // Eventos que consideramos como actividad real
  private readonly ACTIVITY_EVENTS = [
    'click', 'keydown', 'scroll', 'touchstart', 'mousedown'
  ];

  private constructor() {}

  static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }

  /**
   * Inicializar el tracker de actividad
   */
  public initialize(): void {
    if (this.isInitialized) return;
    
    console.log('🔍 ActivityTracker: Iniciando sistema de detección de actividad');
    
    // Detectar eventos de interacción del usuario
    this.ACTIVITY_EVENTS.forEach(eventType => {
      document.addEventListener(eventType, this.handleUserInteraction.bind(this), {
        passive: true,
        capture: true
      });
    });

    // Detectar navegación entre páginas
    this.setupNavigationTracking();
    
    // Iniciar timers
    this.resetActivityTimers();
    
    this.isInitialized = true;
    console.log('✅ ActivityTracker: Sistema iniciado correctamente');
  }

  /**
   * Configurar rastreo de navegación
   */
  private setupNavigationTracking(): void {
    // Detectar cambios de ruta (SPA)
    let currentPath = window.location.pathname;
    
    const checkPathChange = () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.logActivity('navigation', {
          type: 'route_change',
          path: currentPath,
          timestamp: new Date().toISOString()
        });
      }
    };

    // Verificar cambios de ruta cada segundo
    setInterval(checkPathChange, 1000);
  }

  /**
   * Manejar interacciones del usuario
   */
  private handleUserInteraction(event: Event): void {
    // Registrar actividad cada 30 segundos máximo para evitar spam
    const now = Date.now();
    if (now - this.lastActivity < 30000) return; // 30 segundos
    
    this.logActivity('interaction', {
      eventType: event.type,
      page: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Registrar actividad específica de la plataforma
   */
  public logPlatformActivity(action: string, details: any = {}): void {
    this.logActivity('platform_action', {
      action,
      details,
      page: window.location.pathname,
      timestamp: new Date().toISOString()
    });

    console.log(`📊 Actividad registrada: ${action}`, details);
  }

  /**
   * Registrar actividad usando el sistema de auditoría
   */
  private logActivity(type: string, details: any): void {
    const now = Date.now();
    this.lastActivity = now;

    // Resetear timers de inactividad
    this.resetActivityTimers();

    // Registrar en el sistema de auditoría cada 2 minutos máximo
    if (now - this.lastAuditLog > 2 * 60 * 1000) {
      this.sendToAuditSystem(type, details);
      this.lastAuditLog = now;
    }
  }

  private lastAuditLog: number = 0;

  /**
   * Enviar actividad al sistema de auditoría
   */
  private async sendToAuditSystem(type: string, details: any): Promise<void> {
    try {
      await logAuditAction({
        action: 'actividad_usuario',
        description: `Actividad detectada: ${type}`,
        targetType: 'actividad',
        module: 'sistema',
        details: {
          activityType: type,
          ...details
        }
      });
    } catch (error) {
      console.error('Error al registrar actividad en auditoría:', error);
    }
  }

  /**
   * Resetear timers de inactividad
   */
  private resetActivityTimers(): void {
    // Limpiar timers existentes
    if (this.breakTimer) {
      clearTimeout(this.breakTimer);
    }
    if (this.offlineTimer) {
      clearTimeout(this.offlineTimer);
    }

    // Timer para BREAK (20 minutos)
    this.breakTimer = setTimeout(() => {
      this.handleInactivityBreak();
    }, this.BREAK_TIMEOUT);

    // Timer para OFFLINE (40 minutos)
    this.offlineTimer = setTimeout(() => {
      this.handleInactivityOffline();
    }, this.OFFLINE_TIMEOUT);
  }

  /**
   * Manejar inactividad - cambio a BREAK
   */
  private async handleInactivityBreak(): Promise<void> {
    console.log('⚠️ ActivityTracker: 20 minutos de inactividad detectados - cambiando a BREAK');
    
    try {
      // Registrar en auditoría
      await logAuditAction({
        action: 'inactividad_detectada',
        description: 'Inactividad de 20 minutos detectada - cambio automático a BREAK',
        targetType: 'empleado',
        module: 'sistema',
        details: {
          inactivityDuration: '20_minutes',
          newStatus: 'break',
          lastActivity: new Date(this.lastActivity).toISOString()
        }
      });

      await this.changeEmployeeStatus('break');
      this.showInactivityNotification('break');
    } catch (error) {
      console.error('Error al cambiar estado a break:', error);
    }
  }

  /**
   * Manejar inactividad - cambio a OFFLINE
   */
  private async handleInactivityOffline(): Promise<void> {
    console.log('🔴 ActivityTracker: 40 minutos de inactividad detectados - cambiando a OFFLINE');
    
    try {
      // Registrar en auditoría
      await logAuditAction({
        action: 'inactividad_detectada',
        description: 'Inactividad de 40 minutos detectada - cambio automático a OFFLINE',
        targetType: 'empleado',
        module: 'sistema',
        details: {
          inactivityDuration: '40_minutes',
          newStatus: 'offline',
          lastActivity: new Date(this.lastActivity).toISOString()
        }
      });

      await this.changeEmployeeStatus('offline');
      this.showInactivityNotification('offline');
    } catch (error) {
      console.error('Error al cambiar estado a offline:', error);
    }
  }

  /**
   * Mostrar notificación de inactividad
   */
  private showInactivityNotification(status: 'break' | 'offline'): void {
    const messages = {
      break: {
        title: '⏸️ Estado cambiado a Descanso',
        message: 'No detectamos actividad en los últimos 20 minutos. Tu estado se cambió automáticamente a "Descanso".'
      },
      offline: {
        title: '🔴 Estado cambiado a Desconectado',
        message: 'No detectamos actividad en los últimos 40 minutos. Tu estado se cambió automáticamente a "Desconectado".'
      }
    };

    const config = messages[status];
    
    // Crear notificación visual
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1f2937;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 350px;
      font-family: system-ui, -apple-system, sans-serif;
      animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px;">${config.title}</div>
          <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">${config.message}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; opacity: 0.7; padding: 0;">
          ×
        </button>
      </div>
    `;

    // Agregar animación CSS
    if (!document.getElementById('activity-tracker-styles')) {
      const styles = document.createElement('style');
      styles.id = 'activity-tracker-styles';
      styles.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto-remover después de 10 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Cambiar estado del empleado
   */
  private async changeEmployeeStatus(status: 'online' | 'offline' | 'break'): Promise<void> {
    try {
      const { EmployeeStatusService } = await import('./employeeStatusService');
      await EmployeeStatusService.updateCurrentEmployeeStatus(status);

      // Registrar cambio de estado en auditoría
      await logAuditAction({
        action: 'cambio_estado_automatico',
        description: `Cambio automático de estado a ${status} por inactividad`,
        targetType: 'empleado',
        module: 'sistema',
        details: {
          newStatus: status,
          reason: 'inactivity_timeout',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error al cambiar estado del empleado:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de actividad
   */
  public getActivityStats(): any {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;
    
    return {
      lastActivity: new Date(this.lastActivity).toISOString(),
      timeSinceLastActivity: Math.floor(timeSinceLastActivity / 1000), // en segundos
      isActive: timeSinceLastActivity < this.BREAK_TIMEOUT,
      timeUntilBreak: Math.max(0, this.BREAK_TIMEOUT - timeSinceLastActivity),
      timeUntilOffline: Math.max(0, this.OFFLINE_TIMEOUT - timeSinceLastActivity)
    };
  }

  /**
   * Destruir el tracker
   */
  public destroy(): void {
    console.log('🔄 ActivityTracker: Destruyendo sistema');
    
    // Limpiar event listeners
    this.ACTIVITY_EVENTS.forEach(eventType => {
      document.removeEventListener(eventType, this.handleUserInteraction.bind(this));
    });

    // Limpiar timers
    if (this.breakTimer) {
      clearTimeout(this.breakTimer);
    }
    if (this.offlineTimer) {
      clearTimeout(this.offlineTimer);
    }

    this.isInitialized = false;
  }
}

// Singleton global
export const activityTracker = ActivityTracker.getInstance(); 