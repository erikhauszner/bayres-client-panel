import React from 'react';
import { AuditLog } from '@/lib/services/auditService';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  FileText,
  Clock,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import AuditLogDetail from './AuditLogDetail';

interface AuditLogListProps {
  logs: AuditLog[];
}

const AuditLogList: React.FC<AuditLogListProps> = ({ logs }) => {
  // Función para formatear la fecha
  const formatDate = (date: Date) => {
    try {
      const dateObj = new Date(date);
      return formatDistanceToNow(dateObj, { 
        addSuffix: true,
        locale: es
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para determinar el color del badge según la acción
  const getActionColor = (action: string) => {
    switch (action) {
      case 'creación':
        return 'bg-green-500 hover:bg-green-600';
      case 'actualización':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'eliminación':
        return 'bg-red-500 hover:bg-red-600';
      case 'login':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'logout':
        return 'bg-slate-500 hover:bg-slate-600';
      case 'exportación':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'asignación':
        return 'bg-cyan-500 hover:bg-cyan-600';
      case 'cambio_estado':
        return 'bg-violet-500 hover:bg-violet-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay registros disponibles</h3>
        <p className="text-muted-foreground mt-2">
          No se encontraron registros de auditoría con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Acción</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Módulo</TableHead>
            <TableHead className="w-[120px]">Fecha</TableHead>
            <TableHead className="w-[80px] text-right">Detalle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log._id}>
              <TableCell>
                <Badge className={getActionColor(log.action)}>
                  {log.action}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{log.description}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  {log.userName}
                </div>
              </TableCell>
              <TableCell>{log.module}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="truncate">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {new Date(log.timestamp).toLocaleString()}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-right">
                <AuditLogDetail log={log} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AuditLogList; 