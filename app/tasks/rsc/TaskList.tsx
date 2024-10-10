// app/tasks/TaskList.tsx

import { getTasks } from './serverActions';
import TaskItem from './TaskItem';

export default async function TaskList() {
  const tasks = await getTasks();

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
