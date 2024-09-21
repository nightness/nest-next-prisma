import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppMiddleware } from '../app.middleware';

export default function setupApp(app: NestExpressApplication) {
  // Register global filter for handling system errors
  // app.useGlobalFilters(new SystemFilter(ejsService, routesService));

  // Errors interceptor
  // app.useGlobalInterceptors(new SystemInterceptor());

  // Enable validation globally... Binding ValidationPipe at the application level, thus ensuring all
  // endpoints are protected from receiving incorrect data.
  app.useGlobalPipes(new ValidationPipe());

  // Enable shutdown hooks
  app.enableShutdownHooks();

  // Top level middleware, logs every request to the console
  const appMiddleware = new AppMiddleware();
  app.use(appMiddleware.use.bind(appMiddleware));

  const listen = async () => {
    // Listen for connections
    const server = await app.listen(process.env.SERVER_PORT || 3000);

    // Use the server to handle shutdown
    server.on('close', onShutdown);

    return server;
  };

  return listen;
}

// Global shutdown hook
async function onShutdown() {}
