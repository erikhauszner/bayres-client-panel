import api from '../api';
import { Lead, LeadFilters, LeadResponse, LeadInteraction, LeadStatusUpdate } from '../types/lead';

class LeadService {
  async getLeads(filters: LeadFilters = {}): Promise<LeadResponse> {
    try {
      const response = await api.get<LeadResponse>('/leads', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  }

  async getLeadById(id: string): Promise<Lead> {
    try {
      const response = await api.get<Lead>(`/leads/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching lead with ID ${id}:`, error);
      throw error;
    }
  }

  async createLead(leadData: Omit<Lead, '_id'>): Promise<Lead> {
    try {
      const response = await api.post<Lead>('/leads', leadData);
      return response.data;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  async createAndAssignLead(leadData: Omit<Lead, '_id'>, userId: string): Promise<Lead> {
    try {
      // Primero creamos el lead
      const lead = await this.createLead(leadData);
      
      // Luego lo asignamos al usuario
      if (lead._id) {
        return await this.assignLead(lead._id, userId);
      }
      
      return lead;
    } catch (error) {
      console.error('Error creating and assigning lead:', error);
      throw error;
    }
  }

  async updateLead(id: string, leadData: Partial<Lead>): Promise<Lead> {
    try {
      const response = await api.put<Lead>(`/leads/${id}`, leadData);
      return response.data;
    } catch (error) {
      console.error(`Error updating lead with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteLead(id: string): Promise<void> {
    try {
      await api.delete(`/leads/${id}`);
    } catch (error) {
      console.error(`Error deleting lead with ID ${id}:`, error);
      throw error;
    }
  }

  async addInteraction(id: string, interaction: Omit<LeadInteraction, '_id'>): Promise<Lead> {
    try {
      const response = await api.post<Lead>(`/leads/${id}/interactions`, interaction);
      return response.data;
    } catch (error) {
      console.error(`Error adding interaction to lead with ID ${id}:`, error);
      throw error;
    }
  }

  async updateInteraction(leadId: string, interactionId: string, interaction: Partial<LeadInteraction>): Promise<Lead> {
    try {
      const response = await api.put<Lead>(`/leads/${leadId}/interactions/${interactionId}`, interaction);
      return response.data;
    } catch (error) {
      console.error(`Error updating interaction ${interactionId} for lead with ID ${leadId}:`, error);
      throw error;
    }
  }

  async deleteInteraction(leadId: string, interactionId: string): Promise<Lead> {
    try {
      const response = await api.delete<Lead>(`/leads/${leadId}/interactions/${interactionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting interaction ${interactionId} for lead with ID ${leadId}:`, error);
      throw error;
    }
  }

  async updateStatus(id: string, statusUpdate: LeadStatusUpdate): Promise<Lead> {
    try {
      const response = await api.put<Lead>(`/leads/${id}/status`, statusUpdate);
      return response.data;
    } catch (error) {
      console.error(`Error updating status for lead with ID ${id}:`, error);
      throw error;
    }
  }

  async assignLead(id: string, userId: string): Promise<Lead> {
    try {
      const response = await api.put<Lead>(`/leads/${id}/assign`, { assignedTo: userId });
      return response.data;
    } catch (error) {
      console.error(`Error assigning lead with ID ${id} to user ${userId}:`, error);
      throw error;
    }
  }

  async unassignLead(id: string): Promise<Lead> {
    try {
      const response = await api.put<Lead>(`/leads/${id}/assign`, { assignedTo: null });
      return response.data;
    } catch (error) {
      console.error(`Error unassigning lead with ID ${id}:`, error);
      throw error;
    }
  }

  async approveLead(id: string): Promise<Lead> {
    try {
      const response = await api.put<Lead>(`/leads/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error(`Error approving lead with ID ${id}:`, error);
      throw error;
    }
  }

  async rejectLead(id: string, reason: string): Promise<Lead> {
    try {
      const response = await api.put<Lead>(`/leads/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting lead with ID ${id}:`, error);
      throw error;
    }
  }

  async convertToClient(id: string, type: 'personal' | 'business'): Promise<{ message: string; clientId: string }> {
    try {
      const response = await api.post<{ message: string; clientId: string }>(`/leads/${id}/convert`, { type });
      return response.data;
    } catch (error) {
      console.error(`Error converting lead with ID ${id} to client:`, error);
      throw error;
    }
  }

  // Métodos para gestionar tareas
  async addTask(id: string, task: any): Promise<Lead> {
    try {
      const response = await api.post<Lead>(`/leads/${id}/tasks`, task);
      return response.data;
    } catch (error) {
      console.error(`Error adding task to lead with ID ${id}:`, error);
      throw error;
    }
  }

  async updateTask(leadId: string, taskId: string, task: any): Promise<Lead> {
    try {
      const response = await api.put<Lead>(`/leads/${leadId}/tasks/${taskId}`, task);
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${taskId} for lead with ID ${leadId}:`, error);
      throw error;
    }
  }

  async updateTaskStatus(leadId: string, taskId: string, status: string): Promise<Lead> {
    try {
      const response = await api.put<Lead>(`/leads/${leadId}/tasks/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating task status ${taskId} for lead with ID ${leadId}:`, error);
      throw error;
    }
  }

  async deleteTask(leadId: string, taskId: string): Promise<Lead> {
    try {
      const response = await api.delete<Lead>(`/leads/${leadId}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting task ${taskId} for lead with ID ${leadId}:`, error);
      throw error;
    }
  }

  async assignTask(leadId: string, taskId: string, assignedTo: string | null): Promise<Lead> {
    try {
      const response = await api.put<Lead>(`/leads/${leadId}/tasks/${taskId}/assign`, { assignedTo });
      return response.data;
    } catch (error) {
      console.error(`Error assigning task ${taskId} for lead with ID ${leadId}:`, error);
      throw error;
    }
  }

  // Métodos para gestionar documentos
  async uploadDocument(id: string, data: any): Promise<Lead> {
    try {
      // Verificar si es FormData o un objeto normal
      const isFormData = data instanceof FormData;
      
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      } : undefined;
      
      const response = await api.post<Lead>(`/leads/${id}/documents`, data, config);
      return response.data;
    } catch (error) {
      console.error(`Error uploading document to lead with ID ${id}:`, error);
      throw error;
    }
  }

  async updateDocument(leadId: string, documentId: string, documentData: any): Promise<Lead> {
    try {
      const response = await api.put<Lead>(`/leads/${leadId}/documents/${documentId}`, documentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating document ${documentId} for lead with ID ${leadId}:`, error);
      throw error;
    }
  }

  async deleteDocument(leadId: string, documentId: string): Promise<Lead> {
    try {
      const response = await api.delete<Lead>(`/leads/${leadId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting document ${documentId} for lead with ID ${leadId}:`, error);
      throw error;
    }
  }

  // Métodos para gestionar notas
  async addNote(id: string, content: string): Promise<Lead> {
    try {
      const response = await api.post<Lead>(`/leads/${id}/notes`, { content });
      return response.data;
    } catch (error) {
      console.error(`Error adding note to lead with ID ${id}:`, error);
      throw error;
    }
  }

  async updateNote(id: string, noteId: string, content: string): Promise<Lead> {
    try {
      const response = await api.put<Lead>(`/leads/${id}/notes/${noteId}`, { content });
      return response.data;
    } catch (error) {
      console.error(`Error updating note for lead with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteNote(id: string, noteId: string): Promise<Lead> {
    try {
      const response = await api.delete<Lead>(`/leads/${id}/notes/${noteId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting note for lead with ID ${id}:`, error);
      throw error;
    }
  }

  async updateLeadStage(id: string, stage: string): Promise<Lead> {
    try {
      const response = await api.put<Lead>(`/leads/${id}/stage`, { stage });
      return response.data;
    } catch (error) {
      console.error(`Error updating stage for lead with ID ${id}:`, error);
      throw error;
    }
  }

  async importLeads(formData: FormData) {
    try {
      const response = await api.post('/leads/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        totalImported: response.data.totalImported,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error importing leads:', error);
      throw error;
    }
  }

  async getLeadsCountByEmployee(employeeId: string): Promise<number> {
    try {
      const response = await api.get<{ count: number }>(`/leads/count/by-employee/${employeeId}`);
      return response.data.count;
    } catch (error) {
      console.error(`Error fetching leads count for employee ${employeeId}:`, error);
      return 0; // En caso de error, devolver 0 como fallback
    }
  }

  async annulLead(id: string, reason: string): Promise<{ message: string; lead: Lead }> {
    try {
      const response = await api.put<{ message: string; lead: Lead }>(`/leads/${id}/annul`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error annulling lead with ID ${id}:`, error);
      throw error;
    }
  }
}

export const leadService = new LeadService(); 