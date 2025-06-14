'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileIcon, FileTextIcon, ImageIcon, FileArchiveIcon, FileSpreadsheetIcon, PresentationIcon } from 'lucide-react';

interface Document {
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  tags?: string[];
  uploadDate: string;
  user: {
    firstName: string;
    lastName: string;
  };
  isExternalLink?: boolean;
}

interface LeadDocumentsTabProps {
  documents: Document[];
  formatDate: (dateString: string) => string;
}

export default function LeadDocumentsTab({ documents, formatDate }: LeadDocumentsTabProps) {
  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('image')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    } else if (type.includes('pdf')) {
      return <FileTextIcon className="h-8 w-8 text-red-500" />;
    } else if (type.includes('zip') || type.includes('rar')) {
      return <FileArchiveIcon className="h-8 w-8 text-yellow-500" />;
    } else if (type.includes('excel') || type.includes('sheet') || type.includes('csv')) {
      return <FileSpreadsheetIcon className="h-8 w-8 text-green-500" />;
    } else if (type.includes('powerpoint') || type.includes('presentation')) {
      return <PresentationIcon className="h-8 w-8 text-orange-500" />;
    }
    return <FileIcon className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Desconocido';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos del Lead Original</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay documentos registrados
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-4 flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {doc.name}
                      </a>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(doc.uploadDate)}
                      </div>
                    </div>
                    
                    {doc.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{doc.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 items-center text-xs">
                      <Badge variant="outline">{doc.fileType}</Badge>
                      {doc.fileSize && (
                        <span className="text-gray-500 dark:text-gray-400">{formatFileSize(doc.fileSize)}</span>
                      )}
                      {doc.isExternalLink && (
                        <Badge variant="secondary">Enlace externo</Badge>
                      )}
                    </div>
                    
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {doc.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="bg-gray-100 dark:bg-gray-800">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Subido por: {doc.user.firstName} {doc.user.lastName}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 