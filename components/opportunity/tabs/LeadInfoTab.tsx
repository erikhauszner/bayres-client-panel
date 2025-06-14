'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LeadInfoTabProps {
  leadSnapshot: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
    position?: string;
    industry?: string;
    source: string;
    currentStage: string;
    captureDate: string;
    estimatedBudget?: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    website?: string;
  };
  formatCurrency: (amount?: number) => string;
  formatDate: (dateString?: string) => string;
}

export default function LeadInfoTab({ leadSnapshot, formatCurrency, formatDate }: LeadInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Lead Original</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</label>
            <p className="text-lg font-semibold">{leadSnapshot.firstName} {leadSnapshot.lastName}</p>
          </div>
          
          {leadSnapshot.email && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              <p>{leadSnapshot.email}</p>
            </div>
          )}
          
          {leadSnapshot.phone && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</label>
              <p>{leadSnapshot.phone}</p>
            </div>
          )}
          
          {leadSnapshot.company && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Empresa</label>
              <p>{leadSnapshot.company}</p>
            </div>
          )}
          
          {leadSnapshot.position && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Cargo</label>
              <p>{leadSnapshot.position}</p>
            </div>
          )}
          
          {leadSnapshot.industry && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Industria</label>
              <p>{leadSnapshot.industry}</p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fuente</label>
            <p>{leadSnapshot.source}</p>
          </div>
          
          {leadSnapshot.estimatedBudget !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Presupuesto Estimado</label>
              <p>{formatCurrency(leadSnapshot.estimatedBudget)}</p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Etapa</label>
            <div className="mt-1">
              <Badge>{leadSnapshot.currentStage}</Badge>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Captura</label>
            <p>{formatDate(leadSnapshot.captureDate)}</p>
          </div>
          
          {leadSnapshot.website && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Sitio Web</label>
              <p>
                <a href={leadSnapshot.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                  {leadSnapshot.website}
                </a>
              </p>
            </div>
          )}
        </div>
        
        {(leadSnapshot.address || leadSnapshot.city || leadSnapshot.state || leadSnapshot.country || leadSnapshot.postalCode) && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Dirección</label>
            <p>
              {[
                leadSnapshot.address,
                leadSnapshot.city,
                leadSnapshot.state,
                leadSnapshot.postalCode,
                leadSnapshot.country
              ].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 