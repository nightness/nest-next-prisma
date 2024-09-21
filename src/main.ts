// src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NextFunction, Request, Response } from 'express';
import Next from 'next';

import { AppModule } from './app.module';
import configApp from './config/config.app';
import configSecurityPolicy from './config/config.security';
// import configSwagger from './config/config.swagger';

NestFactory.create<NestExpressApplication>(AppModule).then(async (app) => {
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

  // Config App
  const listen = configApp(app);

  // Config Security Policy
  configSecurityPolicy(app);

  // Config Swagger
  // configSwagger(app);

  // Listen for connections
  listen().then(() => {
    console.log(`> Ready on http://localhost:3000`);
  });
});
