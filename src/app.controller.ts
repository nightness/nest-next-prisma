// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('hello')
  getHello() {
    return { message: 'Hello from NestJS API!' };
  }
}
