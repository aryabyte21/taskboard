import { useTasks } from './hooks/useTasks';
import { TaskBoard } from './components/TaskBoard';
import './App.css';

function App() {
  const { tasks, loading, error, addTask, updateTask, deleteTask } = useTasks();

  return (
    <div className="app">
      <TaskBoard
        tasks={tasks}
        loading={loading}
        error={error}
        onAddTask={addTask}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />
    </div>
  );
}

export default App;
