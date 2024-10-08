import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  Post,
  Query,
  Render,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DISABLE_REGISTRATION } from '../../config/config.env';
import { AuthenticatedUserGuard } from '../../system/guards/authenticated.guard';
import type { Request, Response } from '../../system/types';

import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  DeleteAccountDto,
  JwtPayload,
  LoginDto,
  LoginResponseDto,
  RegisterDto,
} from './auth.types';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered',
    type: LoginResponseDto,
  })
  @ApiBody({
    type: RegisterDto,
    required: true,
    description: 'User details',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // console.log('registerDto', registerDto);
    if (!!DISABLE_REGISTRATION) {
      throw new ForbiddenException('New registrations are disabled');
    }
    return await this.authService.register(
      registerDto.name,
      registerDto.email,
      registerDto.password,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    description: 'User logged in',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid email or password',
  })
  @ApiBody({
    type: LoginDto,
    required: true,
    description: 'User login details',
    schema: {
      format: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User logged out' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invalid refresh token',
  })
  @ApiBody({
    required: true,
    description: 'Refresh token',
    schema: {
      format: 'object',
      properties: {
        refreshToken: { type: 'string' },
      },
    },
  })
  async logout(@Body('refreshToken') refreshToken: string): Promise<void> {
    await this.authService.deleteRefreshToken(refreshToken);
  }
  
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    required: true,
    description: 'Refresh token',
    schema: {
      format: 'object',
      properties: {
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Refreshed access token',
    schema: {
      format: 'object',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ user: JwtPayload; access_token: string }> {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('change-password')
  @UseGuards(AuthenticatedUserGuard)
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({
    type: ChangePasswordDto,
    required: true,
    description: 'User password details',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed and new tokens issued',
    type: LoginResponseDto,
  })
  async changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<LoginResponseDto> {
    const user = req.user;
  
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }
  
    const uid = user.sub;
    return await this.authService.changePassword(
      uid,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }
  
  @Delete('delete')
  @ApiOperation({ summary: "Delete a user's account" })
  @UseGuards(AuthenticatedUserGuard)
  @ApiBody({
    type: DeleteAccountDto,
    required: true,
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'User was deleted' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The provided password is incorrect',
  })
  async deleteAccount(
    @Req() req: Request,
    @Body('password') password: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        return;
      }
  
      const uid = user.sub;
      const deleted = await this.authService.deleteAccount(uid, password);
      if (!deleted) {
        response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Incorrect password' });
      } else {
        response.status(HttpStatus.OK).json({ message: 'Account deleted successfully' });
      }
    } catch (e) {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'An error occurred while deleting the account' });
    }
  }  

  @Post('password-reset')
  @ApiOperation({
    summary: "POST method for updating a user's password from view",
  })
  @ApiResponse({ status: 204, description: 'Password reset' })
  async completePasswordResetPost(
    @Query('token') token: string,
    @Req() req: Request,
  ): Promise<void> {
    if (!token) {
      throw new BadRequestException('Invalid token');
    }

    // Check if the token is a password reset token
    if (!token.startsWith('pr_')) {
      throw new BadRequestException('Invalid token');
    }

    const { password, confirmPassword } = req.body ?? {};
    if (!password || !confirmPassword) {
      throw new BadRequestException('Invalid password');
    }

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    return this.authService.completePasswordResetPost(token, password);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary:
      'Sends an e-mail to the specified user so they can reset their password',
  })
  @ApiBody({
    required: true,
    description: 'User email',
    schema: {
      format: 'object',
      properties: {
        email: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Password reset' })
  async forgotPassword(@Body('email') email: string): Promise<void> {
    return this.authService.forgotPassword(email);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiQuery({
    required: true,
    name: 'token',
    type: 'string',
    description: 'Verification token',
  })
  @ApiResponse({ status: 204, description: 'Email verified' })
  @Render('verify-email/completed')
  async verifyEmail(@Query('token') token: string): Promise<void> {
    return this.authService.verifyEmail(token);
  }

  @Post('send-verification-email')
  @ApiOperation({ summary: 'Send verification email' })
  @ApiBody({
    required: true,
    description: 'User email',
    schema: {
      format: 'object',
      properties: {
        email: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: 'If the e-mail is valid, they were sent a verification email',
  })
  async sendVerificationEmail(@Body('email') email: string): Promise<void> {
    this.authService.sendVerificationEmail(email);
  }
}
