import { RedisModule as Redis } from '@nestjs-modules/ioredis';
import { Global, Module } from '@nestjs/common';

import { REDIS_HOST, REDIS_PORT } from '../config/config.env';
import { EjsService } from './services/ejs/ejs.service';
import { EmailerService } from './services/emailer/emailer.service';
import { FileSystemService } from './services/filesystem/filesystem.service';
import { RedisService } from './services/redis/redis.service';
import { PrismaService } from './services/prisma/prisma.service';

@Global()
@Module({
  imports: [
    Redis.forRoot({
      type: 'single',
      url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    }),
  ],
  providers: [
    RedisService,
    PrismaService,
    EjsService,
    FileSystemService,
    EmailerService,
  ],
  exports: [
    RedisService,
    PrismaService,
    EjsService,
    FileSystemService,
    EmailerService,
  ],
})
export class SystemModule {}
