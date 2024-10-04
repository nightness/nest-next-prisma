"use server";

import { JwtPayload, verify } from 'jsonwebtoken';

export async function decodePayload(token: string): Promise<JwtPayload> {
  // Check if token is set
  if (!token) {
    throw new Error('No token provided');
  }

  // Check if JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not set');
  }

  // Decode the token to get the payload.
  return verify(token, process.env.JWT_SECRET) as JwtPayload;
}

export async function getExpirationTime(token: string): Promise<number> {
  try {
    // Decode the token to get the payload.
    const decoded = await decodePayload(token);

    // If no expiration time is set, return Infinity
    if (!decoded.exp) {
      return Infinity;
    }

    const expirationTime = decoded.exp;
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    if (timeUntilExpiration <= 0) {
      throw new Error('Token already expired');
    }

    return timeUntilExpiration / 1000; // Convert to seconds
  } catch (error: any) {
    throw new Error(`Failed to get expiration time: ${error.message}. Token: ${token}`);
  }
}
