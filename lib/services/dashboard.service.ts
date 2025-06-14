import axios from 'axios';
import { API_URL } from '../config';

const API_ENDPOINT = `${API_URL}/dashboard/stats`;

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
};

export interface DashboardStats {
  employeesOnline: number;
  assignedLeads: number;
  pendingTasks: number;
  leadsToReview: number;
  leadsToAssign: number;
  myOpportunities: number;
  activeOpportunities: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await axios.get(API_ENDPOINT, getAuthHeaders());
    return response.data;
  }
}; 