import axios from 'axios';
import { API_URL } from '../config';

const API_ENDPOINT = `${API_URL}/api-keys`;

// Función para obtener el token JWT del almacenamiento local
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Función para crear headers con autenticación
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
};

export interface ApiKey {
  id: string;
  name: string;
  key?: string;
  maskedKey?: string;
  permissions: string[];
  status: 'active' | 'inactive';
  expiresAt?: string;
  createdAt: string;
  lastUsed?: string;
}

export interface CreateApiKeyDto {
  name: string;
  permissions: string;
  expiresIn?: string;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  status: string;
  expiresAt?: string;
  createdAt: string;
}

export const apiKeyService = {
  // Obtener todas las API keys
  async getAllApiKeys(): Promise<ApiKey[]> {
    try {
      const response = await axios.get(API_ENDPOINT, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error al obtener API keys:', error);
      throw error;
    }
  },

  // Crear una nueva API key
  async createApiKey(data: CreateApiKeyDto): Promise<ApiKeyResponse> {
    try {
      const response = await axios.post(API_ENDPOINT, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error al crear API key:', error);
      throw error;
    }
  },

  // Obtener una API key por ID
  async getApiKeyById(id: string): Promise<ApiKey> {
    try {
      const response = await axios.get(`${API_ENDPOINT}/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error al obtener API key ${id}:`, error);
      throw error;
    }
  },

  // Actualizar el estado de una API key
  async updateApiKeyStatus(id: string, status: 'active' | 'inactive'): Promise<ApiKey> {
    try {
      const response = await axios.put(`${API_ENDPOINT}/${id}/status`, { status }, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar estado de API key ${id}:`, error);
      throw error;
    }
  },

  // Eliminar una API key
  async deleteApiKey(id: string): Promise<{ message: string, id: string }> {
    try {
      const response = await axios.delete(`${API_ENDPOINT}/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar API key ${id}:`, error);
      throw error;
    }
  }
}; 