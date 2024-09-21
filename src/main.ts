// src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import configApp from './config/config.app';
import configNextJs from './config/config.next-js';
import configSecurityPolicy from './config/config.security';
// import configSwagger from './config/config.swagger';

NestFactory.create<NestExpressApplication>(AppModule).then(async (app) => {
  // Config Next.js
  await configNextJs(app);

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
