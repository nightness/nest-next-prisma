// src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NextFunction, Request, Response } from 'express';
import Next from 'next';

import { AppModule } from './app.module';
import configApp from './config/config.app';
import configSecurityPolicy from './config/config.security';
import configSwagger from './config/config.swagger';
import * as nextConfig from '../next.config.js';
import { HYBRID_ENV, NODE_ENV } from './config/config.env';

NestFactory.create<NestExpressApplication>(AppModule).then(async (app) => {
  // Enable the hybrid environment and run Next.js as middleware (defaults to true)
  if (HYBRID_ENV === 'development') {
    const dev = NODE_ENV !== 'production';
    const nextApp = Next({ dev, conf: nextConfig, dir: './' });
    const handle = nextApp.getRequestHandler();
    await nextApp.prepare();

    // Set global prefix for API routes
    app.setGlobalPrefix('api');

    // Middleware to handle Next.js routing
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.url.startsWith('/api') || req.url.startsWith('/swagger') || req.url.startsWith('/css')) {
        return next();
      }
      return handle(req, res);
    });
  }

  // Config Security Policy
  configSecurityPolicy(app);


  // Config App
  const listen = configApp(app);

  // Config Swagger
  configSwagger(app);

  // Listen for connections
  listen().then(() => {
    console.log(`> Ready on http://localhost:3000`);
  });
});
