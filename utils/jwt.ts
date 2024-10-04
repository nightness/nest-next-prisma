"use server";

import jwt, { JwtPayload } from 'jsonwebtoken';

export async function decodePayload(token: string): Promise<JwtPayload> {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not set');
    }
  
    // Decode the token to get the payload.
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    if (!decoded || !decoded.exp) {
      throw new Error('Invalid token: missing expiration time');
    }
  
    return decoded;
  }
  