// app/tasks/serverActions.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function createTask(title: string) {
  await prisma.task.create({ data: { title, completed: false } });
  revalidatePath('/tasks');
}

export async function toggleTask(id: string, completed: boolean) {
  await prisma.task.update({
    where: { id },
    data: { completed },
  });
  revalidatePath('/tasks');
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath('/tasks');
}
