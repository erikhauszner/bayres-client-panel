/**
 * Utilidades para exportación de datos
 */

/**
 * Convierte un objeto a formato CSV
 * @param data Array de objetos a convertir
 * @param headers Cabeceras personalizadas (opcional)
 * @returns String en formato CSV
 */
export const objectsToCSV = <T extends Record<string, any>>(
  data: T[],
  headers?: Record<string, string>
): string => {
  if (!data || data.length === 0) return '';

  // Obtener todas las claves únicas de los objetos
  const allKeys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });

  // Convertir a array y ordenar para mantener consistencia
  const keys = Array.from(allKeys).sort();

  // Construir la línea de cabeceras
  const headerRow = headers
    ? keys.map(key => headers[key] || key).join(',')
    : keys.join(',');

  // Construir las filas de datos
  const rows = data.map(item => {
    return keys.map(key => {
      const value = item[key];
      // Formatear los valores para CSV
      return formatValueForCSV(value);
    }).join(',');
  });

  // Unir todas las filas
  return [headerRow, ...rows].join('\n');
};

/**
 * Formatea un valor para ser incluido en un CSV
 * @param value Valor a formatear
 * @returns Valor formateado para CSV
 */
const formatValueForCSV = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }

  // Manejar fechas
  if (value instanceof Date) {
    return `"${value.toISOString()}"`;
  }

  // Manejar objetos y arrays
  if (typeof value === 'object') {
    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
  }

  // Manejar strings que necesitan ser escapados
  if (typeof value === 'string') {
    // Escapar comillas dobles y encerrar en comillas si contiene caracteres especiales
    if (value.includes('"') || value.includes(',') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  // Manejar booleanos
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  // Otros tipos primitivos
  return String(value);
};

/**
 * Descarga un string como un archivo
 * @param content Contenido a descargar
 * @param fileName Nombre del archivo
 * @param contentType Tipo de contenido
 */
export const downloadString = (
  content: string,
  fileName: string,
  contentType: string
): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Exporta un array de objetos a un archivo CSV
 * @param data Datos a exportar
 * @param fileName Nombre del archivo
 * @param headers Cabeceras personalizadas (opcional)
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  fileName: string,
  headers?: Record<string, string>
): void => {
  const csv = objectsToCSV(data, headers);
  downloadString(csv, fileName, 'text/csv;charset=utf-8');
};

/**
 * Exporta registros de auditoría a CSV
 * @param logs Registros de auditoría
 * @param fileName Nombre del archivo (opcional)
 */
export const exportAuditLogsToCSV = (logs: any[], fileName: string = 'audit-logs.csv'): void => {
  // Definir cabeceras personalizadas en español
  const headers: Record<string, string> = {
    _id: 'ID',
    action: 'Acción',
    description: 'Descripción',
    userName: 'Usuario',
    userId: 'ID Usuario',
    targetType: 'Tipo de Objetivo',
    targetId: 'ID Objetivo',
    module: 'Módulo',
    ip: 'Dirección IP',
    userAgent: 'Navegador',
    timestamp: 'Fecha y Hora',
    createdAt: 'Fecha de Creación',
    updatedAt: 'Fecha de Actualización'
  };

  // Procesar los datos para mejorar la legibilidad
  const processedLogs = logs.map(log => {
    // Crear una copia del log para no modificar el original
    const processedLog = { ...log };
    
    // Formatear fechas
    if (processedLog.timestamp) {
      processedLog.timestamp = new Date(processedLog.timestamp).toLocaleString();
    }
    if (processedLog.createdAt) {
      processedLog.createdAt = new Date(processedLog.createdAt).toLocaleString();
    }
    if (processedLog.updatedAt) {
      processedLog.updatedAt = new Date(processedLog.updatedAt).toLocaleString();
    }
    
    // Eliminar datos complejos que no son útiles en un CSV
    delete processedLog.previousData;
    delete processedLog.newData;
    
    return processedLog;
  });

  // Exportar a CSV
  exportToCSV(processedLogs, fileName, headers);
}; 