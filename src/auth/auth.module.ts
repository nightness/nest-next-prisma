import { MiddlewareConsumer, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../system/services/prisma/prisma.service';
import { UserService } from '../user/user.service';

import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService, UserService, JwtService, PrismaService],
  controllers: [AuthController],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    // Decode JWT
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
