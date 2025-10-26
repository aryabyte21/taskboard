import React, { useState } from 'react';
import { Task, TaskInput } from '../types/Task';

interface TaskFormProps {
  onSubmit: (taskData: TaskInput) => Promise<void>;
  onAISuggest?: () => Promise<void>;
  initialTask?: Task;
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onAISuggest,
  initialTask,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(
    initialTask?.description || ''
  );
  const [status, setStatus] = useState<TaskInput['status']>(
    initialTask?.status || 'todo'
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
      });

      setTitle('');
      setDescription('');
      setStatus('todo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-slate-200 shadow-sm p-6"
    >
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        {initialTask ? '✏️ Edit Task' : '✨ Create New Task'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-900 mb-2">
            Task Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., Design new landing page"
            disabled={isSubmitting || isLoading}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details about this task..."
            rows={4}
            disabled={isSubmitting || isLoading}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed resize-none"
          />
        </div>

        {/* Status Input */}
        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-slate-900 mb-2">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskInput['status'])}
            disabled={isSubmitting || isLoading}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="todo">📝 Todo</option>
            <option value="in_progress">🚀 In Progress</option>
            <option value="done">✅ Done</option>
          </select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 mt-6 flex-col sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {isSubmitting ? '💾 Saving...' : '💾 Save Task'}
        </button>

        {onAISuggest && (
          <button
            type="button"
            onClick={onAISuggest}
            disabled={isSubmitting || isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isLoading ? '⏳ Loading...' : '✨ Get AI Suggestions'}
          </button>
        )}
      </div>
    </form>
  );
};
