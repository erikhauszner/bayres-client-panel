'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Edit, Trash2, Clock } from 'lucide-react';

interface Note {
  _id?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  updatedBy?: {
    firstName: string;
    lastName: string;
  };
  deletedAt?: string;
  deletedBy?: {
    firstName: string;
    lastName: string;
  };
  deletionReason?: string;
}

interface LeadNotesTabProps {
  notes: Note[];
  formatDateTime: (dateString: string) => string;
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (note: Note) => void;
  canManageNotes: boolean;
}

export default function LeadNotesTab({ notes, formatDateTime, onAddNote, onEditNote, onDeleteNote, canManageNotes }: LeadNotesTabProps) {
  // Función auxiliar para obtener las iniciales del usuario
  const getUserInitials = (note: Note): string => {
    if (!note.user) return 'U';
    
    const firstName = note.user.firstName || '';
    const lastName = note.user.lastName || '';
    
    if (firstName && firstName.length > 0) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName && lastName.length > 0) {
      return lastName.charAt(0).toUpperCase();
    }
    
    return 'U'; // Usuario desconocido
  };
  
  // Función para obtener el nombre completo del usuario
  const getUserFullName = (note: Note): string => {
    if (!note.user) return 'Usuario desconocido';
    
    const firstName = note.user.firstName || '';
    const lastName = note.user.lastName || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return 'Usuario desconocido';
  };

  // Separar notas activas y eliminadas
  const activeNotes = notes.filter(note => !note.deletedAt);
  const deletedNotes = notes.filter(note => note.deletedAt);

  return (
    <div className="space-y-6">
      {/* Notas Activas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Notas del Lead ({activeNotes.length})</CardTitle>
          {canManageNotes && (
            <Button onClick={onAddNote} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Nota
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {activeNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay notas registradas
            </div>
          ) : (
            <div className="space-y-6">
              {activeNotes.map((note, index) => (
                <div key={note._id || index} className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    {note.user?.avatar && (
                      <AvatarImage src={note.user.avatar} alt={getUserFullName(note)} />
                    )}
                    <AvatarFallback>
                      {getUserInitials(note)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {getUserFullName(note)}
                        </div>
                        {note.updatedAt && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Editada
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(note.createdAt)}
                        </div>
                        {canManageNotes && note._id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEditNote(note)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onDeleteNote(note)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-300">{note.content}</p>
                    {note.updatedAt && note.updatedBy && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Última edición: {formatDateTime(note.updatedAt)} por {note.updatedBy.firstName} {note.updatedBy.lastName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notas Eliminadas */}
      {deletedNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Notas Eliminadas ({deletedNotes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deletedNotes.map((note, index) => (
                <div key={note._id || `deleted-${index}`} className="flex gap-4 opacity-60">
                  <Avatar className="h-8 w-8">
                    {note.user?.avatar && (
                      <AvatarImage src={note.user.avatar} alt={getUserFullName(note)} />
                    )}
                    <AvatarFallback className="text-xs">
                      {getUserInitials(note)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-gray-500 dark:text-gray-400">
                        {getUserFullName(note)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDateTime(note.createdAt)}
                      </div>
                    </div>
                    <p className="text-sm line-through text-gray-500 dark:text-gray-400">{note.content}</p>
                    {note.deletedAt && note.deletedBy && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <p>Eliminada: {formatDateTime(note.deletedAt)} por {note.deletedBy.firstName} {note.deletedBy.lastName}</p>
                        {note.deletionReason && (
                          <p>Razón: {note.deletionReason}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 