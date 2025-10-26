import { useState, useEffect, useCallback } from 'react';
import { Task, TaskInput } from '../types/Task';
import { taskApi } from '../services/api';
import { webSocketService } from '../services/cable';



interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (taskData: TaskInput) => Promise<void>;
  updateTask: (id: number, taskData: Partial<TaskInput>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.action === 'create' && message.task) {
      setTasks((prev) => [message.task, ...prev]);
    } else if (message.action === 'update' && message.task) {
      setTasks((prev) =>
        prev.map((task) => (task.id === message.task.id ? message.task : task))
      );
    } else if (message.action === 'destroy' && message.id) {
      setTasks((prev) => prev.filter((task) => task.id !== message.id));
    }
  }, []);

  const addTask = useCallback(
    async (taskData: TaskInput) => {
      try {
        await taskApi.createTask(taskData);
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to create task');
      }
    },
    []
  );

  const updateTask = useCallback(
    async (id: number, taskData: Partial<TaskInput>) => {
      try {
        await taskApi.updateTask(id, taskData);
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to update task');
      }
    },
    []
  );

  const deleteTask = useCallback(
    async (id: number) => {
      try {
        await taskApi.deleteTask(id);
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to delete task');
      }
    },
    []
  );

  const refreshTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
    webSocketService.subscribe(handleWebSocketMessage);

    return () => {
      webSocketService.unsubscribe(handleWebSocketMessage);
    };
  }, [fetchTasks, handleWebSocketMessage]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    refreshTasks,
  };
};
