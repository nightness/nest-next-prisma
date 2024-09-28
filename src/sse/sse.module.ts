import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SseService } from './sse.service';
import { SseController } from './sse.controller';

@Module({
  providers: [SseService, JwtService],
  controllers: [SseController],
})
export class SseModule {}
