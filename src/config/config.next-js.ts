import { NestExpressApplication } from '@nestjs/platform-express';
import { NextFunction, Request, Response } from 'express';
import Next from 'next';

export default async function configNextJs(app: NestExpressApplication) {
  // Setup Next.js
  const dev = process.env.NODE_ENV !== 'production';
  const nextApp = Next({ dev });
  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  // Middleware to handle Next.js routing
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    return handle(req, res);
  });
}
