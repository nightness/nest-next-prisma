// src/app.module.ts
import { join } from 'path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { SseModule } from './sse/sse.module';
import { SystemModule } from './system/system.module';
import { Algorithm } from 'jsonwebtoken';

import { AppController } from './app.controller';
import { JWT_ALGORITHM, JWT_PRIVATE_KEY, JWT_SECRET } from './config/config.env';

@Module({
  imports: [
    // Configure ServeStaticModule to serve the Next.js /public folder
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    JwtModule.register({
      secret: JWT_SECRET,
      privateKey: JWT_PRIVATE_KEY,
      signOptions: {
        algorithm: (JWT_ALGORITHM || 'HS256') as Algorithm,
      },
      verifyOptions: {
        algorithms: ([JWT_ALGORITHM || 'HS256']) as Algorithm[],
      },
    }),
    AuthModule,
    SystemModule,
    SseModule,
  ],  
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
