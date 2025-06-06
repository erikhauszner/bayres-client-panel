import { io, Socket } from 'socket.io-client';
import { notificationService } from './notificationService';
import { API_URL } from '../config';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private employeeId: string | undefined = undefined;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private apiUrl: string = API_URL;

  // Inicializar la conexión de Socket.IO
  connect(employeeId: string | undefined) {
    if (!employeeId) {
      console.warn('No se puede conectar Socket.IO sin ID de empleado');
      return;
    }

    // Guardar el ID del empleado para reconexiones
    this.employeeId = employeeId;

    if (this.isConnected && this.socket) {
      console.log('Socket ya está conectado');
      return;
    }

    try {
      // Desconectar cualquier socket existente
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      // Reiniciar contador de intentos
      this.reconnectAttempts = 0;
      
      // Asegurarse que no haya doble barra o /api al final
      let baseUrl = this.apiUrl;
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4);
      }
      
      console.log('Iniciando conexión Socket.IO con base URL:', baseUrl);
      
      // Crear la conexión con el servidor raíz - SIN NAMESPACE
      this.socket = io(baseUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        path: '/socket.io', // Path correcto para Socket.IO
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 20000,
        autoConnect: true,
        forceNew: true
      });
      
      // Imprimir información de depuración
      console.log('Socket.IO intentando conectar al servidor:', baseUrl);
      
      // Manejar eventos de Socket.IO
      this.setupSocketEvents(employeeId);
    } catch (error) {
      console.error('Error conectando Socket.IO:', error);
      this.isConnected = false;
    }
  }

  // Configurar los eventos de Socket.IO
  private setupSocketEvents(employeeId: string) {
    if (!this.socket) return;

    // Cuando se conecte el socket
    this.socket.on('connect', () => {
      console.log('Socket.IO conectado con ID:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Autenticar al usuario
      this.socket?.emit('authenticate', employeeId);
    });

    // Cuando se desconecte el socket
    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO desconectado:', reason);
      this.isConnected = false;
      
      // Intentar reconectar automáticamente si la desconexión no fue voluntaria
      if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Intento de reconexión ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        // Reconectar con un retraso progresivo
        setTimeout(() => {
          if (this.employeeId) {
            this.connect(this.employeeId);
          }
        }, 1000 * this.reconnectAttempts);
      }
    });

    // Cuando ocurra un error de conexión
    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión Socket.IO:', error);
      this.isConnected = false;
    });

    // Cuando se reciba confirmación de autenticación
    this.socket.on('authenticated', (data) => {
      console.log('Socket.IO autenticado:', data);
    });

    // Cuando se reciba una nueva notificación
    this.socket.on('new_notification', (data) => {
      console.log('Nueva notificación recibida vía Socket.IO:', data);
      
      // Mostrar la notificación como toast
      if (data.notification) {
        const notificationData = data.notification;
        
        // Verificar si es una notificación externa o relacionada con leads
        const isExternalNotification = notificationData.isExternalNotification === true;
        const isLeadRelated = notificationData.isLeadRelated === true || 
                              (notificationData.title && notificationData.title.includes('lead')) ||
                              (notificationData.title && notificationData.title.includes('Lead')) ||
                              (notificationData.title && notificationData.title.includes('Obteniendo')) ||
                              (notificationData.message && notificationData.message.includes('lead'));
        
        // Considerar como externa si es externa o relacionada con leads
        const shouldTreatAsExternal = isExternalNotification || isLeadRelated;
                              
        if (shouldTreatAsExternal) {
          console.log('🔔 NOTIFICACIÓN EXTERNA o de LEADS RECIBIDA:', notificationData.title);
        }
        
        // Crear objeto de notificación con todos los campos necesarios
        const notification = {
          _id: notificationData._id || `temp_${Date.now()}`,
          userId: this.employeeId || 'unknown', // Usar el ID del empleado actual
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || 'task_assigned', // Asignar un tipo por defecto
          status: notificationData.status || 'unread',
          createdAt: notificationData.createdAt || new Date(),
          data: notificationData.data,
          metadata: {
            variant: notificationData.variant || 'default',
            action: notificationData.action,
            duration: notificationData.duration || 5000,
            isExternalNotification: shouldTreatAsExternal,
            isLeadRelated
          }
        };
        
        // SIEMPRE mostrar la notificación como toast independientemente de la bandera showAsToast
        console.log('Mostrando notificación como toast:', notification.title);
        
        // Si es una notificación externa o de leads, damos mayor duración y otra variante para destacarla
        if (shouldTreatAsExternal) {
          // Mostrar con mayor importancia en el toast
          notificationService.showExternalNotificationToast(notification);
          
          // Forzar actualización inmediata de las notificaciones en el menú
          setTimeout(() => {
            notificationService.getNotifications(5);
          }, 500);
        } else {
          // Notificación normal
          notificationService.showToast(notification);
        }
      }
    });

    // Manejar errores
    this.socket.on('error', (error) => {
      console.error('Error de Socket.IO:', error);
    });
  }

  // Desconectar el socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket.IO desconectado manualmente');
    }
  }

  // Verificar si el socket está conectado
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

export const socketService = new SocketService(); 