import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  DragStart,
} from '@hello-pangea/dnd';
import { Task, TaskInput } from '../types/Task';
import { TaskDialog } from './TaskDialog';
import { TaskCard } from './TaskCard';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

type TaskStatus = Task['status'];

interface TaskBoardProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onAddTask: (taskData: TaskInput) => Promise<void>;
  onUpdateTask: (id: number, taskData: Partial<TaskInput>) => Promise<void>;
  onDeleteTask: (id: number) => Promise<void>;
}

type TaskColumns = Record<TaskStatus, Task[]>;

const STATUS_COLUMNS: Array<{ key: TaskStatus; title: string; hint: string }> = [
  {
    key: 'todo',
    title: 'To Do',
    hint: 'Plan the next move',
  },
  {
    key: 'in_progress',
    title: 'In Progress',
    hint: 'Crafting something great',
  },
  {
    key: 'done',
    title: 'Done',
    hint: 'Wrapped up with care',
  },
];

const createColumnMap = (taskList: Task[]): TaskColumns =>
  taskList.reduce(
    (acc, task) => {
      acc[task.status].push(task);
      return acc;
    },
    { todo: [] as Task[], in_progress: [] as Task[], done: [] as Task[] }
  );

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  loading,
  error,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [columns, setColumns] = useState<TaskColumns>(() => createColumnMap(tasks));
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!isDraggingRef.current) {
      setColumns(createColumnMap(tasks));
    }
  }, [tasks]);

  const totalTaskCount = useMemo(
    () => tasks.length,
    [tasks]
  );

  const handleDragStart = (start: DragStart) => {
    isDraggingRef.current = true;
    setActiveTaskId(parseInt(start.draggableId, 10));
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    isDraggingRef.current = false;
    setActiveTaskId(null);

    if (!destination) {
      setColumns(createColumnMap(tasks));
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumnKey = source.droppableId as TaskStatus;
    const destinationColumnKey = destination.droppableId as TaskStatus;
    const taskId = parseInt(draggableId, 10);

    setColumns(prevColumns => {
      const nextColumns: TaskColumns = {
        todo: [...prevColumns.todo],
        in_progress: [...prevColumns.in_progress],
        done: [...prevColumns.done],
      };

      const sourceList = nextColumns[sourceColumnKey];
      const destinationList = nextColumns[destinationColumnKey];

      const [movedTask] = sourceList.splice(source.index, 1);

      if (!movedTask) {
        return prevColumns;
      }

      const updatedTask = destinationColumnKey === sourceColumnKey
        ? movedTask
        : { ...movedTask, status: destinationColumnKey };

      destinationList.splice(destination.index, 0, updatedTask);

      return nextColumns;
    });

    try {
      await onUpdateTask(taskId, { status: destinationColumnKey });
    } catch (error) {
      console.error('Failed to update task status', error);
      setColumns(createColumnMap(tasks));
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (data: TaskInput) => {
    if (editingTask) {
      await onUpdateTask(editingTask.id, data);
    } else {
      await onAddTask(data);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setEditingTask(undefined);
      }, 150);
    }
    setDialogOpen(open);
  };

  const renderColumn = (
    title: string,
    hint: string,
    status: TaskStatus,
    items: Task[],
  ) => (
    <Droppable droppableId={status} key={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`relative flex flex-col rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm p-6 transition-all shadow-[0_8px_24px_-12px_rgba(15,23,42,0.3)] dark:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] ${
            snapshot.isDraggingOver
              ? 'ring-2 ring-primary/30 shadow-[0_12px_32px_-16px_rgba(56,189,248,0.5)]'
              : ''
          }`}
        >
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                {title}
              </h2>
              <p className="mt-1 text-[11px] text-muted-foreground/70">{hint}</p>
            </div>
            <span className="inline-flex h-6 min-w-[2rem] items-center justify-center rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
              {items.length}
            </span>
          </div>

          <div className="mt-6 flex flex-1 flex-col gap-4">
            {loading && items.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/70 bg-zinc-100/70 dark:bg-zinc-900/70 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              items.map((task, index) => (
                <Draggable
                  key={task.id}
                  draggableId={task.id.toString()}
                  index={index}
                >
                {(dragProvided, dragSnapshot) => {
                  const isDragging = dragSnapshot.isDragging;
                  const usePortal = isDragging;
                  
                  const child = (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      style={{
                        ...dragProvided.draggableProps.style,
                      }}
                    >
                      <TaskCard
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={onDeleteTask}
                        onStatusChange={onUpdateTask}
                        isDragging={isDragging}
                        isBeingDragged={activeTaskId === task.id}
                      />
                    </div>
                  );

                  if (!usePortal) {
                    return child;
                  }

                  const portalContainer = document.querySelector('body');
                  if (!portalContainer) return child;

                  return createPortal(
                    <div style={{ position: 'fixed', zIndex: 999999, pointerEvents: 'none', top: 0, left: 0, width: '100%', height: '100%' }}>
                      {child}
                    </div>,
                    portalContainer
                  );
                }}
                </Draggable>
              ))
            )}
            {provided.placeholder}
            {!loading && items.length === 0 && (
              <div
                className={`flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200/80 px-4 py-16 text-xs text-muted-foreground/60 transition-all ${
                  snapshot.isDraggingOver
                    ? 'border-primary/40 bg-primary/5 text-primary'
                    : ''
                }`}
              >
                <span>{snapshot.isDraggingOver ? 'Drop to get started' : 'No tasks yet'}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Droppable>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/80 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tasks</h1>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {loading ? 'Loading your workspace…' : `${totalTaskCount} ${totalTaskCount === 1 ? 'task' : 'tasks'}`}
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            size="sm"
            className="gap-2 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-8 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid gap-6 md:grid-cols-3">
            {STATUS_COLUMNS.map(column =>
              renderColumn(
                column.title,
                column.hint,
                column.key,
                columns[column.key]
              )
            )}
          </div>
        </DragDropContext>
      </main>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        task={editingTask}
        onSubmit={handleDialogSubmit}
      />
    </div>
  );
};


