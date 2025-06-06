import api from '../api';
import { Client, ClientCreateData, ClientUpdateData, ClientFilters, ClientInteraction, ClientDocument } from '../types/client';

class ClientService {
  async getClients(filters: ClientFilters = {}): Promise<{ data: Client[]; total: number; page: number; limit: number; pages: number }> {
    try {
      const response = await api.get<{ data: Client[]; total: number; page: number; limit: number; pages: number }>('/clients', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  async getClientById(id: string): Promise<Client> {
    try {
      const response = await api.get<Client>(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error);
      throw error;
    }
  }

  async createClient(clientData: ClientCreateData): Promise<Client> {
    try {
      const response = await api.post<Client>('/clients', clientData);
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async updateClient(id: string, clientData: ClientUpdateData): Promise<Client> {
    try {
      const response = await api.put<Client>(`/clients/${id}`, clientData);
      return response.data;
    } catch (error) {
      console.error(`Error updating client with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      await api.delete(`/clients/${id}`);
    } catch (error) {
      console.error(`Error deleting client with ID ${id}:`, error);
      throw error;
    }
  }

  async activateClient(id: string): Promise<Client> {
    try {
      const response = await api.put<Client>(`/clients/${id}/activate`, {});
      return response.data;
    } catch (error) {
      console.error(`Error activating client with ID ${id}:`, error);
      throw error;
    }
  }

  async deactivateClient(id: string): Promise<Client> {
    try {
      const response = await api.put<Client>(`/clients/${id}/toggle-status`, {});
      return response.data;
    } catch (error) {
      console.error(`Error deactivating client with ID ${id}:`, error);
      throw error;
    }
  }

  async addInteraction(id: string, interaction: Omit<ClientInteraction, '_id'>): Promise<Client> {
    try {
      const response = await api.post<Client>(`/clients/${id}/interactions`, interaction);
      return response.data;
    } catch (error) {
      console.error(`Error adding interaction to client with ID ${id}:`, error);
      throw error;
    }
  }

  async addDocument(id: string, formData: FormData): Promise<Client> {
    try {
      const response = await api.post<Client>(`/clients/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding document to client with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteDocument(clientId: string, documentId: string): Promise<Client> {
    try {
      const response = await api.delete<Client>(`/clients/${clientId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting document ${documentId} from client ${clientId}:`, error);
      throw error;
    }
  }

  async convertLeadToClient(leadId: string | undefined, type: 'personal' | 'business'): Promise<{ message: string; clientId: string }> {
    if (!leadId) {
      throw new Error('No se puede convertir un lead sin ID');
    }

    const response = await api.post<{ message: string; clientId: string }>(`/clients/convert/${leadId}`, { type });
    return response.data;
  }
}

export const clientService = new ClientService();

export const convertClientToLead = async (clientId: string): Promise<{ leadId: string }> => {
  try {
    const response = await api.post(`/clients/convert-to-lead/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Error converting client to lead:', error);
    throw error;
  }
}; 