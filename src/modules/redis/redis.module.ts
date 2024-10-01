// src/app.module.ts
import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisModule as Redis } from '@nestjs-modules/ioredis';
import { REDIS_HOST, REDIS_PORT } from '../../config/config.env';

@Global()
@Module({
  imports: [
    Redis.forRoot({
      type: 'single',
      url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    }),
    RedisModule,
  ],  
  providers: [
    RedisService,
  ],
  exports: [
    RedisService,
  ],
})
export class RedisModule {}
