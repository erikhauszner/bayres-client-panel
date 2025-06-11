import React, { useState } from 'react';
import { AuditLog } from '@/lib/services/auditService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AuditLogDetailProps {
  log: AuditLog;
}

export const AuditLogDetail: React.FC<AuditLogDetailProps> = ({ log }) => {
  // Estado para manejar qué campos mostrar (todos o solo los cambiados)
  const [showOnlyChanges, setShowOnlyChanges] = useState(true);

  // Función para determinar los campos que han cambiado
  const getChangedFields = () => {
    if (!log.previousData || !log.newData) return [];
    
    const allFields = new Set([
      ...Object.keys(log.previousData),
      ...Object.keys(log.newData)
    ]);
    
    return Array.from(allFields).filter(field => {
      const prevValue = log.previousData?.[field];
      const newValue = log.newData?.[field];
      
      // Si un campo no existe en una versión pero sí en la otra, ha cambiado
      if (prevValue === undefined || newValue === undefined) return true;
      
      // Para objetos y arrays, comparar como JSON
      if (
        typeof prevValue === 'object' && 
        typeof newValue === 'object' && 
        prevValue !== null && 
        newValue !== null
      ) {
        return JSON.stringify(prevValue) !== JSON.stringify(newValue);
      }
      
      // Para tipos primitivos, comparación directa
      return prevValue !== newValue;
    });
  };

  // Función para formatear valores para mostrar
  const formatValue = (value: any): string => {
    if (value === undefined || value === null) return "—";
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'boolean') return value ? "Sí" : "No";
    return String(value);
  };

  // Obtener los campos cambiados
  const changedFields = getChangedFields();
  
  // Filtrar campos a mostrar basado en la preferencia del usuario
  const fieldsToShow = showOnlyChanges 
    ? changedFields 
    : (log.previousData && log.newData ? Array.from(new Set([
        ...Object.keys(log.previousData),
        ...Object.keys(log.newData)
      ])) : []);

  // Ignorar estos campos en la vista
  const ignoredFields = ['_id', '__v', 'updatedAt', 'createdAt'];
  const filteredFields = fieldsToShow.filter(field => !ignoredFields.includes(field));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalles del Registro</DialogTitle>
          <DialogDescription>
            Información detallada sobre la acción de {log.action} por {log.userName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Usuario</h4>
            <p className="text-sm">{log.userName}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Acción</h4>
            <Badge variant="secondary">{log.action}</Badge>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Fecha</h4>
            <p className="text-sm">{new Date(log.timestamp).toLocaleString()}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Módulo</h4>
            <p className="text-sm">{log.module}</p>
          </div>
          <div className="col-span-2">
            <h4 className="text-sm font-medium mb-1">Descripción</h4>
            <p className="text-sm">{log.description}</p>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex-1 overflow-hidden flex flex-col mt-4">
          {log.action === 'actualización' && log.previousData && log.newData ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Cambios Realizados</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowOnlyChanges(!showOnlyChanges)}
                >
                  {showOnlyChanges ? 'Mostrar Todos los Campos' : 'Solo Cambios'}
                </Button>
              </div>
              
              <ScrollArea className="flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Campo</TableHead>
                      <TableHead className="w-[37.5%]">Valor Anterior</TableHead>
                      <TableHead className="w-[37.5%]">Valor Nuevo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFields.length > 0 ? (
                      filteredFields.map((field) => {
                        const prevValue = log.previousData?.[field];
                        const newValue = log.newData?.[field];
                        const hasChanged = 
                          changedFields.includes(field) &&
                          (
                            prevValue !== newValue ||
                            JSON.stringify(prevValue) !== JSON.stringify(newValue)
                          );
                        
                        return (
                          <TableRow key={field} className={hasChanged ? "bg-amber-50" : ""}>
                            <TableCell className="font-medium">
                              {field}
                              {hasChanged && <Badge variant="outline" className="ml-2">Cambio</Badge>}
                            </TableCell>
                            <TableCell className="font-mono text-sm whitespace-pre-wrap break-all">
                              {formatValue(prevValue)}
                            </TableCell>
                            <TableCell className="font-mono text-sm whitespace-pre-wrap break-all">
                              {formatValue(newValue)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          No hay cambios para mostrar
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          ) : log.action === 'creación' && log.newData ? (
            <>
              <h3 className="text-lg font-medium mb-4">Datos Creados</h3>
              <ScrollArea className="flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Campo</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(log.newData)
                      .filter(field => !ignoredFields.includes(field))
                      .map((field) => (
                        <TableRow key={field}>
                          <TableCell className="font-medium">{field}</TableCell>
                          <TableCell className="font-mono text-sm whitespace-pre-wrap break-all">
                            {formatValue(log.newData?.[field])}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          ) : log.action === 'eliminación' && log.previousData ? (
            <>
              <h3 className="text-lg font-medium mb-4">Datos Eliminados</h3>
              <ScrollArea className="flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Campo</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(log.previousData)
                      .filter(field => !ignoredFields.includes(field))
                      .map((field) => (
                        <TableRow key={field}>
                          <TableCell className="font-medium">{field}</TableCell>
                          <TableCell className="font-mono text-sm whitespace-pre-wrap break-all">
                            {formatValue(log.previousData?.[field])}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">No hay datos detallados disponibles para esta acción.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuditLogDetail; 