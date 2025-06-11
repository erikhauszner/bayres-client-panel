import { io, Socket } from 'socket.io-client';
import { notificationService } from './notificationService';
import { API_URL } from '../config';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private employeeId: string | undefined = undefined;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10; // Aumentado para mejorar la estabilidad
  private apiUrl: string = API_URL;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;

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
      this.setupHeartbeat(); // Asegurar que el heartbeat esté funcionando
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
      
      // Configurar heartbeat para mantener la conexión activa
      this.setupHeartbeat();
    } catch (error) {
      console.error('Error conectando Socket.IO:', error);
      this.isConnected = false;
    }
  }

  // Configurar el heartbeat para mantener la conexión activa
  private setupHeartbeat() {
    // Limpiar cualquier intervalo existente
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Establecer un nuevo intervalo para enviar heartbeats
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        this.socket.emit('heartbeat', { employeeId: this.employeeId, timestamp: Date.now() });
        this.lastHeartbeat = Date.now();
      }
    }, 30000); // Cada 30 segundos
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
      
      // Enviar un heartbeat inmediatamente
      this.socket?.emit('heartbeat', { employeeId, timestamp: Date.now() });
      this.lastHeartbeat = Date.now();
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

    // Respuesta a los heartbeats
    this.socket.on('heartbeat_response', (data) => {
      console.log('Heartbeat response:', data);
    });

    // Manejar notificaciones
    this.socket.on('new_notification', (data) => {
      console.log('Nueva notificación recibida:', data);
      
      // Mostrar la notificación si está marcada para mostrarse como toast
      if (data.notification && data.notification.showAsToast) {
        // Usar el objeto de notificación completo para mostrar el toast
        notificationService.showToast(data.notification);
        
        // Refrescar el conteo de notificaciones no leídas
        notificationService.getUnreadCount().then(count => {
          console.log(`Notificaciones no leídas: ${count}`);
        });
        
        // Actualizar la lista de notificaciones
        setTimeout(() => {
          notificationService.getNotifications(5, 0);
        }, 500);
      }
    });
  }

  // Obtener el estado de la conexión
  isSocketConnected(): boolean {
    return this.isConnected && this.socket !== null;
  }

  // Desconectar el socket
  disconnect() {
    // Limpiar el intervalo de heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket.IO desconectado manualmente');
    }
  }

  // Enviar un evento personalizado
  emit(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
      return true;
    }
    console.warn(`No se puede emitir el evento '${event}' porque el socket no está conectado`);
    return false;
  }

  // Registrar una función para escuchar un evento específico
  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
      return true;
    }
    console.warn(`No se puede escuchar el evento '${event}' porque el socket no está inicializado`);
    return false;
  }
}

export const socketService = new SocketService(); 