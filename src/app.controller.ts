// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Hello')
@Controller()
export class AppController {
  @Get('hello')
  getHello() {
    return { message: 'Hello from NestJS API!' };
  }
}
