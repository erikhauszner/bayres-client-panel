import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AuditStatistics as AuditStatsType } from '@/lib/services/auditService';
import auditService from '@/lib/services/auditService';
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

// Componente auxiliar para mostrar cuando los datos están cargando
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-48">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mb-4"></div>
    <p className="text-muted-foreground">Cargando estadísticas...</p>
  </div>
);

// Componente auxiliar para mostrar un error
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center h-48">
    <div className="text-red-500 mb-4">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="48" 
        height="48" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <p className="text-muted-foreground mb-4">Error al cargar las estadísticas</p>
    <button 
      onClick={onRetry} 
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
    >
      Reintentar
    </button>
  </div>
);

const AuditStatistics: React.FC = () => {
  const [stats, setStats] = useState<AuditStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date()
  });

  // Cargar estadísticas
  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(false);
      
      let startDate, endDate;
      if (dateRange?.from) {
        startDate = format(dateRange.from, 'yyyy-MM-dd');
      }
      if (dateRange?.to) {
        endDate = format(dateRange.to, 'yyyy-MM-dd');
      }
      
      const statsData = await auditService.getStatistics(startDate, endDate);
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar estadísticas de auditoría:', error);
      toast.error('Error al cargar estadísticas');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas al montar o cambiar el rango de fechas
  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={loadStatistics} />;
  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DatePickerWithRange 
          dateRange={dateRange} 
          onDateRangeChange={setDateRange} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gráfico de acciones */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <BarChartIcon className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-medium">Acciones realizadas</h3>
            </div>
            
            <div className="space-y-4">
              {stats.actionStats.map((item) => (
                <div key={item._id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item._id || 'Desconocido'}</span>
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${(item.count / stats.total) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Gráfico de módulos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-medium">Actividad por módulo</h3>
            </div>
            
            <div className="space-y-4">
              {stats.moduleStats.map((item) => (
                <div key={item._id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item._id || 'Desconocido'}</span>
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(item.count / stats.total) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Gráfico de tipos de objetivos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <LineChartIcon className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-medium">Tipo de registros</h3>
            </div>
            
            <div className="space-y-4">
              {stats.targetTypeStats.map((item) => (
                <div key={item._id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item._id || 'Desconocido'}</span>
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(item.count / stats.total) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Usuarios más activos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-medium">Usuarios más activos</h3>
            </div>
            
            <div className="space-y-4">
              {stats.userStats.map((item) => (
                <div key={item._id.userId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item._id.userName || 'Desconocido'}</span>
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(item.count / stats.userStats[0].count) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditStatistics; 