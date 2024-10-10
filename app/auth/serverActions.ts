// app/auth/serverActions.ts
'use server';
import "server-only";

// import { revalidatePath } from 'next/cache';
import * as bcrypt from 'bcryptjs';
import { prisma } from 'lib/prisma';
import redisUtils from "@/lib/redisUtils";

// verify email
export async function verifyEmail(token: string) {
  const email = await redisUtils.get(token);
  if (!email) {
    throw new Error('Invalid token');
  }

  await prisma.user.update({
    where: { email },
    data: { isEmailVerified: true },
  });

  await redisUtils.del(token);
}

// password reset via token
export async function resetPassword(token: string, newPassword: string) {
  const email = await redisUtils.get(token);
  if (!email) {
    throw new Error('Invalid token');
  }

  // Update hashed password
  const password = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password },
  });

  await redisUtils.del(token);
}

