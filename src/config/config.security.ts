import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { SERVER_PORT, SERVER_URL } from './config.env';

export default function setupSecurityPolicy(app: NestExpressApplication) {
  // Sets various HTTP headers to help protect your app.
  app.use(helmet());

  // Sets the X-XSS-Protection header to "1; mode=block".
  app.use(helmet.xssFilter());

  // Sets the Referrer-Policy header to "same-origin".
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

  // Sets the Content-Security-Policy header to help prevent XSS attacks.
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          `http://localhost:${SERVER_PORT}/js`,
          `${SERVER_URL}/js`,
        ],
        frameSrc: ["'self'", SERVER_URL],
        styleSrc: [
          "'self'",
          `${SERVER_URL}/css`,
          `http://localhost:${SERVER_PORT}/css`,
        ],
        imgSrc: [
          "'self'",
          'data:',
          SERVER_URL,
          `http://localhost:${SERVER_PORT}`,
        ],
      },
    }),
  );

  app.enableCors({
    origin: [SERVER_URL], // Add your React dev server URL here
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP Methods
    allowedHeaders: 'Content-Type, Accept', // Allowed HTTP Headers
    credentials: true, // This is important for cookies, sessions, or basic auth
  });
}
