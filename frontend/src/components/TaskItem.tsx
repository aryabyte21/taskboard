import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types/Task';

interface TaskItemProps {
  task: Task;
  onDelete: (id: number) => Promise<void>;
  onStatusChange: (id: number, status: Task['status']) => Promise<void>;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onDelete,
  onStatusChange,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      try {
        await onDelete(task.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsUpdating(true);
    try {
      await onStatusChange(task.id, e.target.value as Task['status']);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: Task['status']): string => {
    switch (status) {
      case 'todo':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border-2 border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isDragging ? 'shadow-2xl ring-2 ring-blue-500' : 'hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <h3 className="font-bold text-slate-900 text-base flex-1 break-words">
          {task.title}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border-2 ${getStatusColor(
            task.status
          )}`}
        >
          {task.status === 'todo' && '📝'}
          {task.status === 'in_progress' && '🚀'}
          {task.status === 'done' && '✅'}
          {' '}{task.status.replace('_', ' ')}
        </span>
      </div>

      <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
        {task.description}
      </p>

      <div className="flex gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={isUpdating}
          className="flex-1 px-3 py-2 text-sm border-2 border-slate-300 rounded-lg font-semibold text-slate-700 bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <option value="todo">📝 Todo</option>
          <option value="in_progress">🚀 In Progress</option>
          <option value="done">✅ Done</option>
        </select>
      </div>

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleDelete}
          disabled={isDeleting || isUpdating}
          className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? '⏳ Deleting...' : '🗑️ Delete'}
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200">
        <small className="text-slate-400 text-xs flex items-center gap-1">
          <span>🕒</span>
          {new Date(task.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </small>
      </div>
    </div>
  );
};
