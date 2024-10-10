// app/auth/serverActions.ts
'use server';
import "server-only";

// import { revalidatePath } from 'next/cache';
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

