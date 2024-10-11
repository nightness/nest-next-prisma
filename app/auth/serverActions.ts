// app/auth/serverActions.ts
'use server';
import 'server-only';

import * as bcrypt from 'bcryptjs';
import { prisma } from 'lib/prisma';
import redisUtils from '@/lib/redisUtils';
import { User } from '@prisma/client';
import {
  EMAIL_VERIFICATION_TOKEN_EXPIRATION,
  MAX_CONCURRENT_EMAIL_VERIFICATION_REQUESTS,
  MAX_CONCURRENT_PASSWORD_RESET_REQUESTS,
  PASSWORD_RESET_TOKEN_EXPIRATION,
  SERVER_URL,
} from '@/src/config/config.env';
import { randomBytes } from 'crypto';

// Interface for expiration information
interface ExpirationInfo {
  waitTime: number;
  waitHours: number;
  waitMinutes: number;
  asString: string;
}

// Utility function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
}

// Utility function to validate password strength
function isStrongPassword(password: string): boolean {
  // Implement password strength criteria as needed
  return password.length >= 8;
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  return user;
}

// Create verification email token
export async function createVerifyEmailToken(user: User): Promise<string> {
  const token = generateRandomToken('ve');

  // Save token to Redis with the token as key and user.id as value
  await redisUtils.saveToken(
    token,
    user.id,
    EMAIL_VERIFICATION_TOKEN_EXPIRATION
  );

  return token;
}

// Check for maximum concurrent email verification requests
async function getFirstExpirationTime(
  prefix: string,
  userId: string,
  maxRequests: number
): Promise<ExpirationInfo | undefined> {
  // Get all keys matching 've_*:{userId}'
  const keys = await redisUtils.keys(`${prefix}_*:${userId}`);

  if (keys.length >= maxRequests) {
    // Calculate the maximum wait time
    const { waitTime, waitMinutes, waitHours } =
      await redisUtils.waitTime(keys);

    const asString =
      waitHours === 0
        ? `Too many requests. Try again in ${waitMinutes} minutes.`
        : `Too many requests. Try again in ${waitHours} hour(s) and ${waitMinutes} minute(s).`;

    return {
      waitTime,
      waitHours,
      waitMinutes,
      asString,
    };
  }

  return undefined;
}

// Send verification email
export async function sendVerificationEmail(email: string): Promise<void> {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email address format');
  }

  const user = await findUserByEmail(email);
  if (!user) {
    // Don't throw an error here
    // We do not want to reveal if the email is not registered
    return;
  }

  // Check request limits before creating a token
  const expiration = await getFirstExpirationTime(
    've',
    user.id,
    MAX_CONCURRENT_EMAIL_VERIFICATION_REQUESTS
  );
  if (expiration) {
    throw new Error(expiration.asString);
  }

  // Create a token for verifying the email
  const token = await createVerifyEmailToken(user);
  const verificationLink = `${SERVER_URL}/auth/verify-email?token=${token}`;

  // TODO: Implement email sending functionality
  if (process.env.NODE_ENV !== 'production') {
    console.log('Verification link:', verificationLink);
  }

  // Use ejs to render the HTML for the email body
  // const staticHtml = await renderFileToString('verify-email/request.ejs', {
  //   name: user.name,
  //   actionLink: verificationLink,
  //   randomNumber: Math.random(),
  // });

  // Send email to user
  // await sendEmail(email, 'E-Mail Verification', staticHtml);
}

// Verify email
export async function verifyEmail(token: string): Promise<void> {
  // Check if the token is a verify email token
  if (!token || !token.startsWith('ve_')) {
    throw new Error('Invalid token');
  }

  const userId = await redisUtils.get(token);
  if (!userId) {
    throw new Error('Invalid token');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isEmailVerified: true },
  });

  // Delete all "ve" tokens for this user
  await redisUtils.deleteTokens('ve_', userId);
}

// Create password reset token
export async function createPasswordResetToken(user: User): Promise<string> {
  const token = generateRandomToken('pr');

  await redisUtils.saveToken(token, user.id, PASSWORD_RESET_TOKEN_EXPIRATION);

  return token;
}

// Reset password using token
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  // Check if the token is a password reset token
  if (!token || !token.startsWith('pr_')) {
    throw new Error('Invalid token');
  }

  if (!newPassword || !isStrongPassword(newPassword)) {
    throw new Error('Password does not meet complexity requirements.');
  }

  const userId = await redisUtils.get(token);
  if (!userId) {
    throw new Error('Invalid token');
  }

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Delete all "pr" tokens for this user
  await redisUtils.deleteTokens('pr_', userId);
}

// Send password reset email
export async function sendPasswordResetEmail(email: string): Promise<void> {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email address.');
  }

  const user = await findUserByEmail(email);
  if (!user) {
    // Don't throw an error here
    // We do not want to reveal if the email is not registered
    return;
  }

  // Check request limits before creating a token
  const expiration = await getFirstExpirationTime(
    'pr',
    user.id,
    MAX_CONCURRENT_PASSWORD_RESET_REQUESTS
  );
  if (expiration) {
    throw new Error(expiration.asString);
  }

  // Create a token for resetting the password
  const token = await createPasswordResetToken(user);
  const resetLink = `${SERVER_URL}/auth/reset-password?token=${token}`;

  // TODO: Implement email sending functionality
  if (process.env.NODE_ENV !== 'production') {
    console.log('Reset link:', resetLink);
  }

  // TODO: Render the HTML for the email body

  // TODO: Send email to user 
}

// Generate a random token
function generateRandomToken(prefix?: string): string {
  const token = randomBytes(32).toString('hex');
  return prefix ? `${prefix}_${token}` : token; // Generates a 32-byte random string, converted to hexadecimal format
}
