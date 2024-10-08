import { Test, TestingModule } from '@nestjs/testing';
import { SseController } from './sse.controller';
import { SseService } from './sse.service';

describe('SseController', () => {
  let controller: SseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SseService],
      controllers: [SseController],
    }).compile();

    controller = module.get<SseController>(SseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
