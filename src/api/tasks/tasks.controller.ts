// src/api/tasks/tasks.controller.ts

import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete
  } from '@nestjs/common';
  import { TasksService } from './tasks.service';
  import { Task } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
  
  @Controller('tasks')
  @ApiTags('Tasks')
  export class TasksController {
    constructor(private readonly tasksService: TasksService) {}
  
    @Post()
    async create(@Body() data: { title: string; description?: string }): Promise<Task> {
      return this.tasksService.create(data);
    }
  
    @Get()
    async findAll(): Promise<Task[]> {
      return this.tasksService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Task | null> {
      return this.tasksService.findOne(id);
    }
  
    @Put(':id')
    async update(
      @Param('id') id: string,
      @Body() data: { title?: string; description?: string; completed?: boolean },
    ): Promise<Task> {
      return this.tasksService.update(id, data);
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string, @Body() body: any): Promise<Task> {
      return this.tasksService.remove(id);
    }
  }
  