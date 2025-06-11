import api from '../api';
import { Project, ProjectCreateData, ProjectUpdateData, ProjectFilters, ProjectResponse, ProjectTask, ProjectTaskComment } from '../types/project';
import { toast } from 'sonner';

class ProjectService {
  async getProjects(filters: ProjectFilters = {}): Promise<ProjectResponse> {
    try {
      const response = await api.get('/projects', { params: filters });
      
      // Verificamos si la respuesta es un array o un objeto con la estructura ProjectResponse
      if (Array.isArray(response.data)) {
        // Si es un array, lo transformamos al formato ProjectResponse
        return {
          data: response.data,
          total: response.data.length,
          page: filters.page || 1,
          limit: filters.limit || response.data.length
        };
      }
      
      // Si ya tiene la estructura correcta, lo devolvemos tal cual
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await api.get<Project>(`/projects/${id}`);
      console.log(`Proyecto obtenido con ID ${id}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching project with ID ${id}:`, error);
      
      // Más información de depuración
      if (error.response) {
        console.error('Detalles del error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Si es un error 500, proporcionar un mensaje más descriptivo
        if (error.response.status === 500) {
          console.error('Error 500 del servidor al obtener el proyecto. Posible problema con la API o la base de datos.');
        }
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
      } else {
        console.error('Error en la configuración de la solicitud:', error.message);
      }
      
      throw error;
    }
  }

  async createProject(projectData: ProjectCreateData): Promise<Project> {
    try {
      const response = await api.post<Project>('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, projectData: ProjectUpdateData): Promise<Project> {
    try {
      const response = await api.put<Project>(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`Error updating project with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      console.error(`Error deleting project with ID ${id}:`, error);
      throw error;
    }
  }

  async updateProjectStatus(id: string, status: string): Promise<Project> {
    try {
      const response = await api.put<Project>(`/projects/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for project with ID ${id}:`, error);
      throw error;
    }
  }

  async getProjectTasks(projectId: string): Promise<ProjectTask[]> {
    try {
      const response = await api.get<ProjectTask[]>(`/projects/${projectId}/tasks`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
      throw error;
    }
  }

  async createProjectTask(projectId: string, taskData: Omit<ProjectTask, '_id'>): Promise<ProjectTask> {
    try {
      const response = await api.post<ProjectTask>(`/projects/${projectId}/tasks`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Error creating task for project ${projectId}:`, error);
      throw error;
    }
  }

  async updateProjectTask(projectId: string, taskId: string, taskData: Partial<ProjectTask>): Promise<ProjectTask> {
    try {
      const response = await api.put<ProjectTask>(`/projects/${projectId}/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${taskId} for project ${projectId}:`, error);
      throw error;
    }
  }

  async updateProjectTaskDates(projectId: string, taskId: string, startDate: Date | string, dueDate: Date | string): Promise<ProjectTask> {
    try {
      // Formatear las fechas si son objetos Date
      const formattedStartDate = startDate instanceof Date ? startDate.toISOString() : startDate;
      const formattedDueDate = dueDate instanceof Date ? dueDate.toISOString() : dueDate;
      
      console.log(`Actualizando fechas de tarea ${taskId} en proyecto ${projectId}:`, { 
        startDate: formattedStartDate, 
        dueDate: formattedDueDate 
      });
      
      // Usar el endpoint PATCH específico para fechas
      const response = await api.patch<{task: ProjectTask, message: string, fechas?: {startDate: string, dueDate: string}}>(
        `/projects/${projectId}/tasks/${taskId}/dates`, 
        { startDate: formattedStartDate, endDate: formattedDueDate },
        { timeout: 15000 }
      );
      
      console.log('Respuesta del servidor:', response.data);
      
      if (!response.data.task) {
        throw new Error('La respuesta no contiene la tarea actualizada');
      }
      
      return response.data.task;
    } catch (error: any) {
      console.error(`Error updating dates for task ${taskId} of project ${projectId}:`, error);
      throw error;
    }
  }

  async deleteProjectTask(projectId: string, taskId: string): Promise<void> {
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    } catch (error) {
      console.error(`Error deleting task ${taskId} from project ${projectId}:`, error);
      throw error;
    }
  }

  async addDocument(projectId: string, formData: FormData): Promise<Project> {
    try {
      const response = await api.post<Project>(`/projects/${projectId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding document to project ${projectId}:`, error);
      throw error;
    }
  }

  async deleteDocument(projectId: string, documentId: string): Promise<Project> {
    try {
      const response = await api.delete<Project>(`/projects/${projectId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting document ${documentId} from project ${projectId}:`, error);
      throw error;
    }
  }

  async getTaskComments(projectId: string, taskId: string): Promise<ProjectTaskComment[]> {
    try {
      console.log(`Obteniendo comentarios para la tarea ${taskId} del proyecto ${projectId}`);
      const response = await api.get<ProjectTaskComment[]>(`/projects/${projectId}/tasks/${taskId}/comments`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching comments for task ${taskId} in project ${projectId}:`, error);
      
      // Si el error es 404, puede ser normal en una tarea nueva sin comentarios
      if (error.response && error.response.status === 404) {
        console.log(`No se encontraron comentarios para la tarea ${taskId}`);
      } else {
        // Para otros errores, mostrar detalles
        if (error.response) {
          console.error('Detalles del error:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          });
        }
      }
      
      // Devolver array vacío para evitar errores en la UI
      return [];
    }
  }

  async addTaskComment(projectId: string, taskId: string, commentData: { content: string }): Promise<ProjectTaskComment> {
    try {
      const response = await api.post<ProjectTaskComment>(`/projects/${projectId}/tasks/${taskId}/comments`, commentData);
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to task ${taskId} in project ${projectId}:`, error);
      throw error;
    }
  }

  async updateTaskComment(projectId: string, taskId: string, commentId: string, commentData: { content: string }): Promise<void> {
    try {
      await api.put<void>(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, commentData);
    } catch (error) {
      console.error(`Error updating comment ${commentId} for task ${taskId} in project ${projectId}:`, error);
      throw error;
    }
  }

  async deleteTaskComment(projectId: string, taskId: string, commentId: string): Promise<void> {
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
    } catch (error) {
      console.error(`Error deleting comment ${commentId} for task ${taskId} in project ${projectId}:`, error);
      throw error;
    }
  }

  // Métodos para finanzas del proyecto
  async getProjectFinances(projectId: string): Promise<any> {
    try {
      const response = await api.get(`/projects/${projectId}/finances`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching finances for project ${projectId}:`, error);
      throw error;
    }
  }

  async addProjectExpense(projectId: string, expenseData: any): Promise<any> {
    try {
      const response = await api.post(`/projects/${projectId}/expenses`, expenseData);
      return response.data;
    } catch (error) {
      console.error(`Error adding expense to project ${projectId}:`, error);
      throw error;
    }
  }

  // Métodos para notificaciones del proyecto
  async createProjectNotification(notificationData: {
    projectId: string;
    type: string;
    daysBeforeDeadline?: number;
  }): Promise<any> {
    try {
      const response = await api.post('/notifications/project', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating project notification:', error);
      throw error;
    }
  }

  async getProjectNotifications(projectId: string): Promise<any[]> {
    try {
      const response = await api.get(`/notifications/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notifications for project ${projectId}:`, error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();