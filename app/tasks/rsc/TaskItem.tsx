// app/tasks/TaskItem.tsx

'use client';

import { Task } from '@prisma/client';
import { useTransition } from 'react';
import { toggleTask, deleteTask } from './serverActions';
import { useRouter } from 'next/navigation';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleTask(task.id, !task.completed);
      router.refresh(); // Refresh to get updated tasks
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTask(task.id);
      router.refresh(); // Refresh to get updated tasks
    });
  };

  return (
    <li style={{ marginBottom: '0.5rem' }}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggle}
      />
      <span
        style={{
          textDecoration: task.completed ? 'line-through' : 'none',
          marginLeft: '0.5rem',
        }}
      >
        {task.title}
      </span>
      <button
        onClick={handleDelete}
        style={{
          marginLeft: '1rem',
          color: 'red',
          border: 'none',
          background: 'none',
        }}
      >
        Delete
      </button>
    </li>
  );
}
