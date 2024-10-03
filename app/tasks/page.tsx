// app/tasks/page.tsx

'use client';

import { Task } from '@prisma/client';
import React, { useState, useEffect } from 'react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle }),
    });
    const task = await res.json();
    setTasks([...tasks, task]);
    setNewTaskTitle('');
  };

  const toggleTask = async (id: string, completed: boolean) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed } : task
      )
    );
  };

  const deleteTask = async (id: string) => {
    console.log('deleteTask', id);
    await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Task List</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task title"
          style={{ padding: '0.5rem', width: '300px' }}
        />
        <button onClick={addTask} style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}>
          Add Task
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: '0.5rem' }}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id, !task.completed)}
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none', marginLeft: '0.5rem' }}>
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              style={{ marginLeft: '1rem', color: 'red', border: 'none', background: 'none' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
