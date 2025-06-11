"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EmployeeStatusService } from '@/lib/services/employeeStatusService';
import { WifiIcon, WifiOffIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface StatusToggleProps {
  collapsed?: boolean;
}

export function StatusToggle({ collapsed = false }: StatusToggleProps) {
  const [status, setStatus] = useState<'online' | 'offline'>('online');
  const [loading, setLoading] = useState(true);
  const [isChanging, setIsChanging] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Cargar el estado actual al montar el componente
    loadCurrentStatus();

    // Actualizar el estado cada 5 minutos
    const interval = setInterval(loadCurrentStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadCurrentStatus = async () => {
    try {
      setLoading(true);
      const employeeStatus = await EmployeeStatusService.getCurrentEmployeeStatus();
      // Si el estado es 'break', considerarlo como 'online'
      setStatus(employeeStatus.status === 'break' ? 'online' : employeeStatus.status);
    } catch (error) {
      console.error('Error al cargar el estado actual:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar tu estado actual',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: 'online' | 'offline') => {
    try {
      setIsChanging(true);
      await EmployeeStatusService.updateCurrentEmployeeStatus(newStatus);
      setStatus(newStatus);
      
      const statusMessages = {
        online: 'Estás disponible y en línea',
        offline: 'Estás desconectado'
      };
      
      toast({
        title: 'Estado actualizado',
        description: statusMessages[newStatus],
      });
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar tu estado',
        variant: 'destructive',
      });
    } finally {
      setIsChanging(false);
    }
  };

  const getStatusIcon = () => {
    if (loading || isChanging) {
      return <LoadingSpinner className="h-4 w-4" />;
    }
    
    switch (status) {
      case 'online':
        return <WifiIcon className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOffIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'online':
        return 'Disponible';
      case 'offline':
        return 'Desconectado';
    }
  };

  const handleToggle = () => {
    if (loading || isChanging) return;
    updateStatus(status === 'online' ? 'offline' : 'online');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className={`w-full justify-start ${
              status === 'online' ? 'text-green-500 hover:text-green-600' :
              'text-gray-500 hover:text-gray-600'
            }`}
            onClick={handleToggle}
            disabled={loading || isChanging}
          >
            {getStatusIcon()}
            {!collapsed && <span className="ml-2">{getStatusLabel()}</span>}
          </Button>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{getStatusLabel()}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
} 