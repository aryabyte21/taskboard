import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskInput, AITaskSuggestion } from '../types/Task';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { taskApi } from '../services/api';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onAddTask: (taskData: TaskInput) => Promise<void>;
  onUpdateTask: (id: number, taskData: Partial<TaskInput>) => Promise<void>;
  onDeleteTask: (id: number) => Promise<void>;
}

export const TaskListComponent: React.FC<TaskListProps> = ({
  tasks,
  loading,
  error,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [suggestions, setSuggestions] = useState<AITaskSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddTask = async (taskData: TaskInput) => {
    await onAddTask(taskData);
    setShowForm(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const taskId = active.id as number;
    const newStatus = over.id as Task['status'];
    
    if (newStatus === 'todo' || newStatus === 'in_progress' || newStatus === 'done') {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus) {
        await onUpdateTask(taskId, { status: newStatus });
      }
    }
    
    setActiveId(null);
  };

  const handleAISuggestions = async () => {
    setSuggestionsLoading(true);
    setSuggestionsError(null);

    try {
      const context =
        tasks.length > 0
          ? `I already have these tasks: ${tasks
              .slice(0, 3)
              .map((t) => t.title)
              .join(', ')}`
          : 'I need help organizing my work';

      const newSuggestions = await taskApi.getAISuggestions(context);
      setSuggestions(newSuggestions);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      setSuggestionsError(
        errorMessage.includes('GROQ_API_KEY')
          ? '⚠️ AI Suggestions require GROQ_API_KEY to be set in backend/.env file. Get a free key from https://console.groq.com'
          : `Failed to get AI suggestions: ${errorMessage}`
      );
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleUseSuggestion = async (suggestion: AITaskSuggestion) => {
    try {
      await onAddTask({
        title: suggestion.title,
        description: suggestion.description,
        status: 'todo',
      });
      setSuggestions(suggestions.filter((s) => s.title !== suggestion.title));
    } catch (err) {
      console.error('Error adding suggested task:', err);
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-700 font-semibold text-lg">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  
  const activeTask = tasks.find(t => t.id === activeId);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  📋 Task Board
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  ✨ Real-time collaboration • 🎯 Drag & drop to organize
                </p>
              </div>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                  showForm
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-red-200/50'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/50'
                }`}
              >
                {showForm ? '✕ Close' : '✨ New Task'}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-800 shadow-sm">
              <p className="font-semibold">⚠️ Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Form Section */}
          {showForm && (
            <div className="mb-8 animate-in slide-in-from-top duration-300">
              <TaskForm
                onSubmit={handleAddTask}
                onAISuggest={handleAISuggestions}
                isLoading={suggestionsLoading}
              />
            </div>
          )}

          {/* AI Suggestions */}
          {(suggestions.length > 0 || suggestionsError) && (
            <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span> AI Suggestions
              </h3>
              {suggestionsError && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r text-red-700 text-sm">
                  {suggestionsError}
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-5 rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-xl transition-all duration-200"
                    >
                      <h4 className="font-bold text-slate-900 mb-2 text-lg">
                        {suggestion.title}
                      </h4>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {suggestion.description}
                      </p>
                      <button
                        onClick={() => handleUseSuggestion(suggestion)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold text-sm hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                      >
                        ✓ Add to Tasks
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Instruction Banner */}
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-blue-900 text-sm font-medium">
              💡 <strong>Pro Tip:</strong> Drag and drop tasks between columns to change their status!
            </p>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Todo Column */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <h2 className="font-bold text-white text-lg flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  To Do
                  <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    {todoTasks.length}
                  </span>
                </h2>
              </div>
              <SortableContext items={todoTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div
                  data-status="todo"
                  id="todo"
                  className="p-4 space-y-3 min-h-96 bg-gradient-to-b from-red-50/30 to-transparent"
                >
                  {todoTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onDelete={onDeleteTask}
                      onStatusChange={(id, status) => onUpdateTask(id, { status })}
                    />
                  ))}
                  {todoTasks.length === 0 && (
                    <p className="text-slate-400 text-center py-16 italic">
                      No tasks here yet<br/>
                      <span className="text-xs">Drop a task or create a new one!</span>
                    </p>
                  )}
                </div>
              </SortableContext>
            </div>

            {/* In Progress Column */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
                <h2 className="font-bold text-white text-lg flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  In Progress
                  <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    {inProgressTasks.length}
                  </span>
                </h2>
              </div>
              <SortableContext items={inProgressTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div
                  data-status="in_progress"
                  id="in_progress"
                  className="p-4 space-y-3 min-h-96 bg-gradient-to-b from-yellow-50/30 to-transparent"
                >
                  {inProgressTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onDelete={onDeleteTask}
                      onStatusChange={(id, status) => onUpdateTask(id, { status })}
                    />
                  ))}
                  {inProgressTasks.length === 0 && (
                    <p className="text-slate-400 text-center py-16 italic">
                      No tasks in progress<br/>
                      <span className="text-xs">Drag a task here to start working!</span>
                    </p>
                  )}
                </div>
              </SortableContext>
            </div>

            {/* Done Column */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <h2 className="font-bold text-white text-lg flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  Done
                  <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    {doneTasks.length}
                  </span>
                </h2>
              </div>
              <SortableContext items={doneTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div
                  data-status="done"
                  id="done"
                  className="p-4 space-y-3 min-h-96 bg-gradient-to-b from-green-50/30 to-transparent"
                >
                  {doneTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onDelete={onDeleteTask}
                      onStatusChange={(id, status) => onUpdateTask(id, { status })}
                    />
                  ))}
                  {doneTasks.length === 0 && (
                    <p className="text-slate-400 text-center py-16 italic">
                      No completed tasks<br/>
                      <span className="text-xs">Drag finished tasks here!</span>
                    </p>
                  )}
                </div>
              </SortableContext>
            </div>
          </div>
        </main>
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <div className="bg-white p-4 rounded-lg shadow-2xl border-2 border-blue-500 opacity-90">
            <h3 className="font-semibold text-slate-900">{activeTask.title}</h3>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
