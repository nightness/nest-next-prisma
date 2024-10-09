// app/tasks/page.tsx

export const dynamic = 'force-dynamic'; // Forces dynamic rendering

import AddTaskForm from './AddTaskForm';
import TaskList from './TaskList';

export default function TasksPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Task List</h1>
      <AddTaskForm />
      <TaskList />
    </main>
  );
}
