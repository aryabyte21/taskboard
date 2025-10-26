export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status?: 'todo' | 'in_progress' | 'done';
}

export interface ApiResponse<T> {
  data?: T;
  errors?: string[];
}

export interface AITaskSuggestion {
  title: string;
  description: string;
}
