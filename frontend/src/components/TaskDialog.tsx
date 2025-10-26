import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Task, TaskInput } from '../types/Task';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['todo', 'in_progress', 'done']),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onSubmit: (data: TaskInput) => Promise<void>;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onOpenChange,
  task,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Task['status']>('todo');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
    },
  });

  useEffect(() => {
    if (open) {
      const status = task?.status || 'todo';
      setSelectedStatus(status);
      setValue('status', status);
      reset({
        title: task?.title || '',
        description: task?.description || '',
        status: status,
      });
    }
  }, [open, task, reset, setValue]);

  const handleFormSubmit = async (data: TaskFormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, status: selectedStatus });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setError(null);
      setSelectedStatus('todo');
    }
    onOpenChange(newOpen);
  };

  const handleStatusClick = (status: Task['status']) => {
    setSelectedStatus(status);
    setValue('status', status);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border/40 rounded-2xl" key={task?.id || 'new'}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {task ? 'Edit Task' : 'New Task'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="px-4 py-3 text-sm text-destructive bg-destructive/5 border border-destructive/10 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Title</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              disabled={isSubmitting}
              className="bg-background/50 border-border/40 rounded-xl h-11"
              autoFocus
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              disabled={isSubmitting}
              rows={4}
              className="bg-background/50 border-border/40 rounded-xl resize-none"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleStatusClick('todo')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedStatus === 'todo'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                To Do
              </button>
              <button
                type="button"
                onClick={() => handleStatusClick('in_progress')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedStatus === 'in_progress'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => handleStatusClick('done')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedStatus === 'done'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                Done
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl"
          >
            {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
