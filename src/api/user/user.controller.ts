import { Controller, ForbiddenException, Get, NotFoundException, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import type { Request } from '../../system/types';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(
    private userService: UserService,
  ) { }

  @Get('me')
  @ApiOperation({ summary: 'Get the current user' })
  meRequest(@Req() req: Request) {  
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('Login required');
    }
    const result = this.userService.findById(user.sub);
    return result;
  }
}
