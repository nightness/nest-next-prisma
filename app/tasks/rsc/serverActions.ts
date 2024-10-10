// app/tasks/serverActions.ts
'use server';
import "server-only";

import { revalidatePath } from 'next/cache';
import { prisma } from 'lib/prisma';

export async function getTasks() {
  return prisma.task.findMany();
}

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
