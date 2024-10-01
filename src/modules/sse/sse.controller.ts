import {
  Controller,
  Sse,
  Res,
  Req,
  Logger,
  Post,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SseService } from './sse.service';
import { catchError } from 'rxjs/operators';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventDto, EventType } from './sse.types';
import { AuthenticatedUserGuard } from '../../system/guards/authenticated.guard';
import type { Request, Response } from '../../system/types';

@Controller('sse')
@ApiTags('sse')
@UseGuards(AuthenticatedUserGuard)
export class SseController {
  private logger = new Logger(SseController.name);

  constructor(private sseService: SseService) {}

  @Sse()
  @ApiOkResponse({ description: 'Event stream', type: EventDto })
  sse(@Req() req: Request, @Res() res: Response) {
    const userId = `${req.user?.sub}`;
    const connectionId = `${userId}-${Date.now()}`; // Concatenate user ID and timestamp to create a unique connection ID
    const events$ = this.sseService.registerConnection(userId, connectionId);
    res.on('close', () => {
      this.sseService.unregisterConnection(userId, connectionId);
    });
    return events$.pipe(
      catchError((error) => {
        this.logger.error(`Error sending SSE: ${error.message}`);
        return [];
      }),
    );
  }

  // Sends the current server time to the user as a server-sent event
  @Post('/now')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event sent successfully',
  })
  async now(@Req() req: Request) {
    const userId = `${req.user?.sub}`;
    const now = new Date();
    const message: EventDto = {
      type: EventType.NOW,
      message: `The current server time is ${now.toLocaleString()}`,
      timestamp: now,
    };
    this.sseService.emitEventToUser(userId, message);
  }
}
