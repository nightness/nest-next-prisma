import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../../modules/prisma/prisma.service';
import { UserService } from '../user/user.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisService } from '../../modules/redis/redis.service';
import { EjsService } from '../../modules/ejs/ejs.service';

@Module({
  providers: [AuthService, EjsService, UserService, JwtService, PrismaService, RedisService],
  controllers: [AuthController],
})
export class AuthModule {
}
