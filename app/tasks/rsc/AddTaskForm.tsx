// app/tasks/AddTaskForm.tsx

'use client';

import { useState, useTransition } from 'react';
import { createTask } from './serverActions';
import { useRouter } from 'next/navigation';

export default function AddTaskForm() {
  const [taskTitle, setTaskTitle] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    startTransition(async () => {
      await createTask(taskTitle);
      setTaskTitle(''); // Clear input after adding task
      router.refresh(); // Refresh to get updated tasks
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        placeholder="New task title"
        style={{ padding: '0.5rem', width: '300px' }}
      />
      <button type="submit" style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }} disabled={isPending}>
        Add Task
      </button>
    </form>
  );
}
