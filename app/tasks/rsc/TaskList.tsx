// app/tasks/TaskList.tsx

import { PrismaClient } from '@prisma/client';
import TaskItem from './TaskItem';

const prisma = new PrismaClient();

export default async function TaskList() {
  const tasks = await prisma.task.findMany();

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
