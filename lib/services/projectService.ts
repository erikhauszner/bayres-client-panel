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

  async updateProjectTaskDates(projectId: string, taskId: string, startDate: Date | string, endDate: Date | string): Promise<ProjectTask> {
    try {
      // Formatear las fechas si son objetos Date
      const formattedStartDate = startDate instanceof Date ? startDate.toISOString() : startDate;
      const formattedEndDate = endDate instanceof Date ? endDate.toISOString() : endDate;
      
      console.log(`Actualizando fechas de tarea ${taskId} en proyecto ${projectId}:`, { 
        startDate: formattedStartDate, 
        endDate: formattedEndDate 
      });
      
      let response;
      
      // Usar try/catch para intentar primero PATCH, luego PUT como fallback
      try {
        // Intento 1: Usar el endpoint PATCH específico para fechas
        response = await api.patch<{task: ProjectTask, message: string, fechas?: {startDate: string, endDate: string}}>(
          `/projects/${projectId}/tasks/${taskId}/dates`, 
          { startDate: formattedStartDate, endDate: formattedEndDate },
          { timeout: 15000 } // 15s timeout para esta operación específica
        );
        
        console.log('Éxito con PATCH. Respuesta completa:', response.data);
        
        // Verificar explícitamente que la tarea está en la respuesta
        if (!response.data.task) {
          console.error('Error: La respuesta no contiene la tarea actualizada', response.data);
          throw new Error('La respuesta no contiene la tarea actualizada');
        }
        
        // Obtener la tarea actualizada
        let updatedTask = response.data.task;
        
        // Guardar el ID completo de MongoDB para verificación posterior
        const fullProjectId = updatedTask.project || projectId;
        const fullTaskId = updatedTask._id || taskId;
        
        console.log('IDs completos para verificación:', {
          projectId: fullProjectId,
          taskId: fullTaskId
        });
        
        // Si el servidor incluye fechas explícitas en la respuesta, usarlas para actualizar la tarea
        if (response.data.fechas) {
          console.log('Servidor devolvió fechas explícitas:', response.data.fechas);
          // Asegurarnos de que las fechas de la tarea coincidan con las fechas explícitas
          updatedTask = {
            ...updatedTask,
            startDate: response.data.fechas.startDate,
            endDate: response.data.fechas.endDate
          };
        }
        
        // Asegurarse de que las fechas existen antes de convertirlas
        if (updatedTask.startDate && updatedTask.endDate) {
          const receivedStartDate = new Date(updatedTask.startDate).toISOString();
          const receivedEndDate = new Date(updatedTask.endDate).toISOString();
          
          console.log('Fechas recibidas en la respuesta:', {
            startDate: receivedStartDate,
            endDate: receivedEndDate
          });
          
          // Comprobar si las fechas coinciden con lo que enviamos
          if (receivedStartDate !== formattedStartDate || receivedEndDate !== formattedEndDate) {
            console.warn('Advertencia: Las fechas recibidas no coinciden exactamente con las enviadas:', {
              enviadas: { startDate: formattedStartDate, endDate: formattedEndDate },
              recibidas: { startDate: receivedStartDate, endDate: receivedEndDate }
            });
            
            // Forzar las fechas correctas en la tarea devuelta
            updatedTask.startDate = formattedStartDate;
            updatedTask.endDate = formattedEndDate;
            
            console.log('Tarea con fechas forzadas:', updatedTask);
          }
        } else {
          console.error('Error: La tarea actualizada no contiene fechas válidas', updatedTask);
          
          // Forzar las fechas que enviamos en la tarea devuelta
          updatedTask.startDate = formattedStartDate;
          updatedTask.endDate = formattedEndDate;
        }
        
        // Verificar la tarea actual después de la actualización
        // IMPORTANTE: Saltamos la verificación si no tenemos un ID completo de MongoDB
        // para evitar errores 400 Bad Request
        if (fullProjectId && typeof fullProjectId === 'string' && fullProjectId.length > 12) {
          try {
            console.log(`Obteniendo tarea actualizada para verificar con ID completo: ${fullProjectId}`);
            const verifyTask = await this.getProjectTasks(fullProjectId).then(
              tasks => tasks.find(t => t._id === fullTaskId)
            );
            
            if (verifyTask) {
              console.log('Verificación de tarea después de actualizar:', {
                id: verifyTask._id,
                startDate: verifyTask.startDate,
                endDate: verifyTask.endDate
              });
              
              // Si la verificación muestra fechas diferentes, devolver la tarea verificada
              if (verifyTask.startDate !== formattedStartDate || verifyTask.endDate !== formattedEndDate) {
                console.warn('Las fechas verificadas no coinciden con las enviadas. Actualizando la UI con los datos verificados.');
                return verifyTask;
              }
            }
          } catch (verifyError) {
            console.error('Error al verificar la tarea actualizada:', verifyError);
            console.log('Continuando sin verificación adicional...');
          }
        } else {
          console.log('Saltando verificación porque no tenemos un ID de proyecto válido de MongoDB:', fullProjectId);
        }
        
        return updatedTask;
      } catch (patchError: any) {
        console.warn('Error con PATCH, intentando actualizar con PUT:', patchError.message);
        
        // Si obtenemos un error CORS, podría ser que el servidor no soporte PATCH
        if (patchError.message.includes('CORS') || !patchError.response) {
          // Intento 2: Usar PUT como alternativa si PATCH falla
          try {
            console.log('Intentando con PUT como alternativa');
            const putResponse = await api.put<ProjectTask>(
              `/projects/${projectId}/tasks/${taskId}`,
              { startDate: formattedStartDate, endDate: formattedEndDate },
              { timeout: 15000 }
            );
            
            console.log('Éxito con PUT:', putResponse.data);
            return putResponse.data;
          } catch (putError: any) {
            console.error('Error también con PUT:', putError.message);
            
            // Si también falla PUT, intentamos otra estrategia
            // Intento 3: Buscar la tarea, actualizarla y devolverla localmente
            const tasks = await this.getProjectTasks(projectId);
            const task = tasks.find(t => t._id === taskId);
            
            if (task) {
              task.startDate = formattedStartDate;
              task.endDate = formattedEndDate;
              
              // Intentar actualizar en segundo plano pero no esperamos respuesta
              api.put(`/projects/${projectId}/tasks/${taskId}`, task)
                .then(() => console.log('Actualización en segundo plano exitosa'))
                .catch(e => console.error('Error en actualización en segundo plano:', e));
              
              console.log('Retornando tarea actualizada localmente:', task);
              return task;
            }
            
            throw putError; // Si no podemos hacer nada, lanzamos el error original
          }
        } else {
          // Si no es un error CORS, puede ser un error de validación o similar
          // Pasamos el error para manejarlo más arriba
          console.error('Error específico del servidor:', patchError.response?.data);
          throw patchError;
        }
      }
    } catch (error: any) {
      console.error(`Error updating dates for task ${taskId} of project ${projectId}:`, error);
      
      // Información de depuración más detallada
      if (error.response) {
        console.error('Detalles del error de respuesta:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('Error de solicitud (no se recibió respuesta):', {
          method: error.config?.method,
          url: error.config?.url,
          timeout: error.config?.timeout
        });
      } else {
        console.error('Error de configuración:', error.message);
      }
      
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
}

export const projectService = new ProjectService();