'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OpportunityInfoTabProps {
  opportunity: {
    title: string;
    description?: string;
    estimatedValue?: number;
    probability: number;
    expectedCloseDate?: string;
    priority: string;
    interests?: Array<{
      _id: string;
      title: string;
      description?: string;
      approximateBudget?: number;
      createdBy: {
        firstName: string;
        lastName: string;
      };
      createdAt: string;
      deletedAt?: string;
      deletedBy?: {
        firstName: string;
        lastName: string;
      };
      deletionReason?: string;
    }>;
  };
  formatCurrency: (amount?: number) => string;
  formatDate: (dateString?: string) => string;
}

export default function OpportunityInfoTab({ opportunity, formatCurrency, formatDate }: OpportunityInfoTabProps) {
  // Función para calcular el valor total de los intereses
  const calculateInterestsTotalValue = () => {
    if (!opportunity?.interests) return 0;
    
    // Filtrar solo intereses activos (no eliminados) y sumar sus presupuestos aproximados
    return opportunity.interests
      .filter(interest => !interest.deletedAt)
      .reduce((total, interest) => {
        return total + (interest.approximateBudget || 0);
      }, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles de la Oportunidad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Valor Estimado</label>
            <p className="text-lg font-semibold">{formatCurrency(calculateInterestsTotalValue())}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Probabilidad</label>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{opportunity.probability}%</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Cierre Esperada</label>
            <p>{formatDate(opportunity.expectedCloseDate)}</p>
          </div>
        </div>

        {opportunity.description && (
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Descripción</label>
            <p className="mt-1">{opportunity.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 