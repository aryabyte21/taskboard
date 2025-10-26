import React, { useState } from 'react';
import { Task } from '../types/Task';
import { Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => Promise<void>;
  onStatusChange: (id: number, data: any) => Promise<void>;
  isDragging?: boolean;
  isBeingDragged?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  isDragging = false,
  isBeingDragged = false,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!window.confirm('Delete this task?')) return;

    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit(task);
  };

  const isGhost = isBeingDragged && !isDragging;

  const getStatusColor = () => {
    switch (task.status) {
      case 'todo':
        return 'bg-red-500 dark:bg-red-400';
      case 'in_progress':
        return 'bg-yellow-500 dark:bg-yellow-400';
      case 'done':
        return 'bg-green-500 dark:bg-green-400';
      default:
        return 'bg-blue-400 dark:bg-blue-500';
    }
  };

  return (
    <article
      onClick={handleEdit}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`group relative overflow-hidden rounded-2xl border bg-white transition-all duration-150 ease-out dark:bg-zinc-900 ${
        isDragging
          ? 'scale-105 rotate-1 border-blue-400/70 shadow-[0_20px_60px_-16px_rgba(59,130,246,0.9)] dark:border-blue-500/70 dark:shadow-[0_20px_60px_-16px_rgba(59,130,246,0.8)]'
          : isGhost
          ? 'opacity-25 scale-95 border-zinc-200/50 dark:border-zinc-800/50'
          : 'border-zinc-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.12),0_1px_2px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:border-zinc-300/90 hover:shadow-[0_4px_12px_-4px_rgba(15,23,42,0.18)] dark:border-zinc-800/80 dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] dark:hover:border-zinc-700/90'
      } ${isDragging || isGhost ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="relative z-[1] flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor()}`} />
              {new Date(task.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <h3 className="text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-50 line-clamp-2">
              {task.title}
            </h3>
          </div>

          {showActions && !isDragging && !isGhost && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="shrink-0 rounded-lg border border-transparent p-1.5 text-zinc-400 transition hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-500"
              aria-label="Delete task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {task.description && (
          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-zinc-50/40 to-zinc-100/60 transition-opacity dark:via-zinc-900/30 dark:to-zinc-800/50 ${
          isDragging ? 'opacity-70' : 'opacity-0 group-hover:opacity-50'
        }`}
      />
    </article>
  );
};

