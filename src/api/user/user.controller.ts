import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import type { Request } from '../../system/types';
import { JwtPayload } from '../auth/auth.types';

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
      return null;
    }
    return this.userService.findById(user.sub);
  }
}
