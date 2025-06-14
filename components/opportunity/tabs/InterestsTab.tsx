'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Interest {
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
}

interface InterestsTabProps {
  interests: Interest[];
  onAddInterest: () => void;
  onEditInterest: (interest: Interest) => void;
  onDeleteInterest: (interest: Interest) => void;
  canEdit: boolean;
}

export default function InterestsTab({
  interests,
  onAddInterest,
  onEditInterest,
  onDeleteInterest,
  canEdit
}: InterestsTabProps) {
  // Filtrar solo intereses activos (no eliminados)
  const activeInterests = interests.filter(interest => !interest.deletedAt);

  return (
    <div className="space-y-4">
      {/* Card principal con lista de intereses */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>
              Intereses del Cliente ({activeInterests.length})
            </CardTitle>
            {canEdit && (
              <Button onClick={onAddInterest} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Interés
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeInterests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Heart className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay intereses registrados
              </h3>
              <p className="text-gray-600 mb-4">
                Agrega los servicios o productos que interesan al cliente para un mejor seguimiento
              </p>
              {canEdit && (
                <Button onClick={onAddInterest} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Interés
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {activeInterests.map((interest) => (
                <Card key={interest._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100">
                          {interest.title}
                        </CardTitle>
                        {interest.description && (
                          <CardDescription className="mt-1 text-gray-600 dark:text-gray-300">
                            {interest.description}
                          </CardDescription>
                        )}
                        {interest.approximateBudget && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                            Presupuesto: ${interest.approximateBudget.toLocaleString()}
                          </p>
                        )}
                      </div>
                      {canEdit && (
                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditInterest(interest)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteInterest(interest)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Creado por {interest.createdBy.firstName} {interest.createdBy.lastName}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(interest.createdAt), {
                          addSuffix: true,
                          locale: es
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mostrar intereses eliminados si los hay */}
      {interests.some(interest => interest.deletedAt) && (
        <div className="mt-8">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Intereses Eliminados
          </h4>
          <div className="space-y-2">
            {interests
              .filter(interest => interest.deletedAt)
              .map((interest) => (
                <Card key={interest._id} className="bg-gray-50 border-gray-200">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 line-through">
                            {interest.title}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Eliminado
                          </Badge>
                        </div>
                        {interest.approximateBudget && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-through">
                            Presupuesto: ${interest.approximateBudget.toLocaleString()}
                          </p>
                        )}
                        {interest.deletionReason && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Razón: {interest.deletionReason}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Eliminado por {interest.deletedBy?.firstName} {interest.deletedBy?.lastName}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
} 