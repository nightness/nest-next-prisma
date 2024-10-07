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
import { HYBRID_ENV, NODE_ENV, SERVER_PORT } from './config/config.env';

// Since the default is true, we can disable the hybrid environment by passing the --no-hybrid flag
const noHybrid = process.argv.includes('--no-hybrid');

// Sanity check on arguments
if (process.argv.length > 2 && !process.argv.includes('--no-hybrid')) {
  console.error('Invalid argument. Use --no-hybrid to disable the hybrid environment.');
  process.exit(1);
}

NestFactory.create<NestExpressApplication>(AppModule).then(async (app) => {
  // Check if we are in development mode
  const dev = NODE_ENV !== 'production';

  console.log(`> Starting server in ${dev ? 'development' : 'production'} mode`);

  // Enable the hybrid environment and run Next.js as middleware (defaults to true)
  if (!noHybrid && HYBRID_ENV) {
    // Set global prefix for API routes
    app.setGlobalPrefix('api');

    try {
      const nextApp = Next({ dev, conf: nextConfig, dir: './' });
      const handle = nextApp.getRequestHandler();
      await nextApp.prepare();

      // Middleware to handle Next.js routing
      app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.url.startsWith('/api') || req.url.startsWith('/swagger') || req.url.startsWith('/css')) {
          return next();
        }
        return handle(req, res);
      });
    } catch (error) {
      console.error('Error starting Next.js:', error);
      process.exit(1);
    }
  }

  // Config Security Policy
  configSecurityPolicy(app);

  // Config App
  const listen = configApp(app);

  // Config Swagger
  configSwagger(app);

  // Listen for connections
  listen().then(() => {
    console.log(`> Ready on http://localhost:${SERVER_PORT}`);
  });
});
