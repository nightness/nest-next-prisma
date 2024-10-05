import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from '../../system/types';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
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

    req.user = decoded;
    req.accessToken = token;

    next();
  }
}
