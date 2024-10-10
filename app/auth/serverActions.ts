// app/auth/serverActions.ts
'use server';
import 'server-only';

// import { revalidatePath } from 'next/cache';
import * as bcrypt from 'bcryptjs';
import { prisma } from 'lib/prisma';
import redisUtils from '@/lib/redisUtils';

// Create verify email link
export async function createVerifyEmailToken(email: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  // Create a token and save it in Redis
  const token = await bcrypt.hash(user.id, 10);
  await redisUtils.saveToken(token, user.id, 60 * 60 * 24);

  // Return the token
  return token;
}


// verify email
export async function verifyEmail(token: string) {
  const userId = await redisUtils.get(token);
  if (!userId) {
    throw new Error('Invalid token');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isEmailVerified: true },
  });

  await redisUtils.del(token);
}

// Create a password reset token
export async function createPasswordResetToken(email: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  // Create a token and save it in Redis
  const token = await bcrypt.hash(user.id, 10);
  await redisUtils.saveToken(token, user.id, 60 * 60);

  // Return the token
  return token;
}

// password reset via token
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  // Get the user ID associated with the token
  const userId = await redisUtils.get(token);
  if (!userId) {
    throw new Error('Invalid token');
  }

  // Hash the password and update the user record
  const password = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password },
  });

  // Delete all "pr" tokens for this user
  await redisUtils.deleteTokens('pr_', userId);
}
