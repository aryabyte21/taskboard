import axios, { AxiosInstance } from 'axios';
import { Task, TaskInput, AITaskSuggestion } from '../types/Task';

class TaskApiService {
  private apiClient: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getTasks(): Promise<Task[]> {
    try {
      const response = await this.apiClient.get<Task[]>('/tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getTask(id: number): Promise<Task> {
    try {
      const response = await this.apiClient.get<Task>(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  }

  async createTask(taskData: TaskInput): Promise<Task> {
    try {
      const response = await this.apiClient.post<Task>('/tasks', {
        task: taskData,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: number, taskData: Partial<TaskInput>): Promise<Task> {
    try {
      const response = await this.apiClient.patch<Task>(`/tasks/${id}`, {
        task: taskData,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  }

  async deleteTask(id: number): Promise<void> {
    try {
      await this.apiClient.delete(`/tasks/${id}`);
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  }

  async getAISuggestions(context: string): Promise<AITaskSuggestion[]> {
    try {
      const response = await this.apiClient.post<{ suggestions: AITaskSuggestion[] }>(
        '/ai_suggestions/tasks/suggest_tasks',
        { context }
      );
      return response.data.suggestions;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      throw error;
    }
  }
}

export const taskApi = new TaskApiService();
