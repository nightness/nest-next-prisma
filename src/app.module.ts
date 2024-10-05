// src/app.module.ts
import { join } from 'path';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Algorithm } from 'jsonwebtoken';

import { SseModule } from './modules/sse/sse.module';
import { AppController } from './app.controller';
import { JWT_ALGORITHM, JWT_PRIVATE_KEY, JWT_SECRET } from './config/config.env';
import { RedisModule } from './modules/redis/redis.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { EjsModule } from './modules/ejs/ejs.module';
import { EmailerModule } from './modules/emailer/emailer.module';
import { FilesystemModule } from './modules/filesystem/filesystem.module';

import { AuthModule } from './api/auth/auth.module';
import { TasksModule } from './api/tasks/tasks.module';
import { AuthMiddleware } from './api/auth/auth.middleware';
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
    SseModule,
    RedisModule,
    PrismaModule,
    EjsModule,
    EmailerModule,
    FilesystemModule,
    TasksModule,
  ],  
  controllers: [AppController],
  providers: [JwtService],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(AuthMiddleware)        
  // }
}
