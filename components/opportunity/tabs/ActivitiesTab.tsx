'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Activity {
  _id: string;
  type: string;
  description: string;
  performedBy: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  date: string;
  isVisibleToOriginalAgent: boolean;
}

interface ActivitiesTabProps {
  activities: Activity[];
  formatDateTime: (dateString: string) => string;
}

const activityTypeIcons: Record<string, string> = {
  'status_change': '🔄',
  'comment': '💬',
  'edit': '✏️',
  'create': '➕',
  'transfer': '↗️',
  'delete': '🗑️',
  'assign': '👤',
  'update': '📝',
};

export default function ActivitiesTab({ activities, formatDateTime }: ActivitiesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Actividades</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay actividades registradas
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity._id} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-xl">
                  {activityTypeIcons[activity.type] || '📋'}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {activity.performedBy.firstName} {activity.performedBy.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(activity.date)}
                    </div>
                  </div>
                  <p className="text-sm">{activity.description}</p>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                    {!activity.isVisibleToOriginalAgent && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Privado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 