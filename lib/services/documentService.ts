import api from '../api';
import { Document, DocumentUploadData, DocumentVersion } from '../types/document';

class DocumentService {
  async getDocuments(filters: {
    projectId?: string;
    taskId?: string;
    clientId?: string;
    type?: string;
    status?: string;
    search?: string;
  } = {}): Promise<Document[]> {
    try {
      const params = new URLSearchParams();
      
      // Añadir filtros a los parámetros
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      // Nota: Para desarrollo, devolveremos un array vacío hasta que la API esté disponible
      // const response = await api.get<Document[]>(`/api/documents?${params.toString()}`);
      // return response.data;
      console.log("Servicio de documentos en modo mock");
      return [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  async getDocumentById(documentId: string): Promise<Document | null> {
    try {
      const response = await api.get<Document>(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching document ${documentId}:`, error);
      return null;
    }
  }

  async uploadDocument(documentData: DocumentUploadData): Promise<Document | null> {
    try {
      // Crear FormData para la subida del archivo
      const formData = new FormData();
      
      // Añadir el archivo
      formData.append('file', documentData.file);
      
      // Añadir los metadatos
      formData.append('name', documentData.name);
      formData.append('type', documentData.type);
      if (documentData.description) formData.append('description', documentData.description);
      if (documentData.notes) formData.append('notes', documentData.notes);
      if (documentData.tags) {
        documentData.tags.forEach(tag => formData.append('tags[]', tag));
      }
      
      // Si es para un proyecto específico, usar la ruta de proyectos
      if (documentData.projectId) {
        const response = await api.post<Document>(`/projects/${documentData.projectId}/documents`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Ruta general de documentos
        const response = await api.post<Document>('/documents', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  }

  async updateDocument(documentId: string, data: Partial<Document>): Promise<Document | null> {
    try {
      const response = await api.put<Document>(`/documents/${documentId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating document ${documentId}:`, error);
      return null;
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      await api.delete(`/documents/${documentId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting document ${documentId}:`, error);
      return false;
    }
  }

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    try {
      const response = await api.get<DocumentVersion[]>(`/documents/${documentId}/versions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching versions for document ${documentId}:`, error);
      return [];
    }
  }

  async uploadNewVersion(documentId: string, file: File, notes?: string): Promise<DocumentVersion | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (notes) {
        formData.append('notes', notes);
      }
      
      const response = await api.post<DocumentVersion>(`/documents/${documentId}/versions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error uploading new version for document ${documentId}:`, error);
      return null;
    }
  }

  async revertToVersion(documentId: string, versionNumber: number): Promise<Document | null> {
    try {
      const response = await api.post<Document>(`/documents/${documentId}/revert`, {
        version: versionNumber
      });
      return response.data;
    } catch (error) {
      console.error(`Error reverting document ${documentId} to version ${versionNumber}:`, error);
      return null;
    }
  }

  getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const documentTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const textTypes = ['txt', 'md', 'rtf', 'csv'];
    
    if (imageTypes.includes(extension)) return 'image';
    if (documentTypes.includes(extension)) return 'document';
    if (textTypes.includes(extension)) return 'text';
    
    return 'unknown';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const documentService = new DocumentService(); 