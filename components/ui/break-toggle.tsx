"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EmployeeStatusService } from '@/lib/services/employeeStatusService';
import { PauseCircleIcon, PlayCircleIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface BreakToggleProps {
  collapsed?: boolean;
}

export function BreakToggle({ collapsed = false }: BreakToggleProps) {
  const [onBreak, setOnBreak] = useState(false);
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
      setOnBreak(employeeStatus.status === 'break');
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

  const toggleBreak = async () => {
    try {
      setIsChanging(true);
      const newStatus = onBreak ? 'online' : 'break';
      await EmployeeStatusService.updateCurrentEmployeeStatus(newStatus);
      setOnBreak(!onBreak);
      
      toast({
        title: 'Pausa actualizada',
        description: onBreak ? 'Has vuelto de la pausa' : 'Has iniciado una pausa',
      });
    } catch (error) {
      console.error('Error al actualizar el estado de pausa:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar tu estado de pausa',
        variant: 'destructive',
      });
    } finally {
      setIsChanging(false);
    }
  };

  const getBreakIcon = () => {
    if (loading || isChanging) {
      return <LoadingSpinner className="h-4 w-4" />;
    }
    
    return onBreak 
      ? <PlayCircleIcon className="h-4 w-4 text-green-500" /> 
      : <PauseCircleIcon className="h-4 w-4 text-amber-500" />;
  };

  const getBreakLabel = () => {
    return onBreak ? 'Volver de pausa' : 'Iniciar pausa';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className={`w-full justify-start ${
              onBreak ? 'text-green-500 hover:text-green-600' : 'text-amber-500 hover:text-amber-600'
            }`}
            onClick={toggleBreak}
            disabled={loading || isChanging}
          >
            {getBreakIcon()}
            {!collapsed && <span className="ml-2">{getBreakLabel()}</span>}
          </Button>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{getBreakLabel()}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
} 