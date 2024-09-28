import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

import { JwtPayload } from '../auth/auth.types';

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  isEmailVerified?: boolean;
  isActive?: boolean;
}

export type Request = ExpressRequest & {
  user?: JwtPayload;
  dbUser?: User;
  controllerName?: string;
  handlerName?: string;
};

export type Response = ExpressResponse;
