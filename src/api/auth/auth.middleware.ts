import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from '../../system/types';

import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}
  async use(req: Request, res: Response, next: () => void) {
    // Decode authorization in header
    const authorization = req.headers.authorization;
    if (!authorization) {
      return next();
    }
    const token = authorization.split(' ')[1];
    if (!token) {
      return next();
    }
    const decoded = this.jwtService.decode(token);
    if (!decoded) {
      return next();
    }

    // Check if user exists
    const user = await this.authService.validateUser(decoded);
    if (!user) {
      return next();
    }

    // Attach user to request
    // console.log('user>', user);
    req.dbUser = user;

    next();
  }
}
