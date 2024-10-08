import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

import { JwtPayload } from '../api/auth/auth.types';

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  isEmailVerified?: boolean;
  isActive?: boolean;
}

export type Request = ExpressRequest & {
  user?: JwtPayload;  // Decoded JWT payload
  accessToken?: string; // Original JWT token
};

export type Response = ExpressResponse;
