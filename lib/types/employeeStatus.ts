/**
 * Tipo que define la estructura del estado de un empleado
 */
export interface EmployeeStatus {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  department?: string;
  lastLogin?: Date;
  lastLogout?: Date;
  isActive: boolean;
  isOnline: boolean;
  status: 'online' | 'offline' | 'break';
  activeTime: number; // en minutos
  activeTimeFormatted: string;
  activeSessions?: number;
  devices?: {
    deviceInfo: {
      userAgent: string;
      ipAddress: string;
    };
    createdAt: Date;
    expiresAt: Date;
  }[];
  statistics?: {
    onlineTime: number; // en segundos
    breakTime: number; // en segundos
    offlineTime: number; // en segundos
    onlineTimeFormatted: string;
    breakTimeFormatted: string;
    offlineTimeFormatted: string;
    totalTimeFormatted: string;
    currentSessionTime?: number; // en segundos
    currentSessionTimeFormatted?: string;
  };
} 