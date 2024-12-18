import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    // Loosen CSP for Swagger routes
    if (
      req.path.startsWith('/swagger') ||
      req.path.startsWith('/favicon.ico')
    ) {
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
      );
    }

    next();
  }
}
