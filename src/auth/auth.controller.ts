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
import { JwtService } from '@nestjs/jwt';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DISABLE_REGISTRATION } from '../config/config.env';
import { ControllerInfo } from '../system/decorators/controller-info/controller-info.decorator';
import { HandlerInfo } from '../system/decorators/handler-info/handler-info.decorator';
import { AuthenticatedUserGuard } from '../system/guards/authenticated.guard';
import type { Request, Response } from '../system/types';

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
@ControllerInfo('Authentication')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  @HandlerInfo('register')
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
  @HandlerInfo('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    description: 'User logged in',
    type: LoginResponseDto,
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
  @HandlerInfo('logout')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User logged out' })
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
  async logout(
    @Body('refreshToken') refreshToken: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      await this.authService.deleteRefreshToken(refreshToken);
      response.status(HttpStatus.OK).send();
    } catch (e) {
      response.status(HttpStatus.CONFLICT).send();
    }
  }

  @Post('refresh')
  @HandlerInfo('refresh')
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
    console.log('refreshToken', refreshToken);
    const user = await this.authService.validateRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload: JwtPayload = {
      email: user.email,
      name: user.name || '',
      sub: user.id,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60, // 1 hour
    };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
    return { user: payload, access_token };
  }

  @Post('change-password')
  @HandlerInfo('changePassword')
  @UseGuards(AuthenticatedUserGuard)
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({
    type: ChangePasswordDto,
    required: true,
    description: 'User password details',
    schema: {
      format: 'object',
      properties: {
        currentPassword: { type: 'string' },
        newPassword: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Password changed' })
  async changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<LoginResponseDto> {
    const user = req.dbUser;

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return await this.authService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Delete('delete')
  @HandlerInfo('deleteAccount')
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
      const user = req.dbUser;
      if (!user) {
        response.status(HttpStatus.UNAUTHORIZED);
        return;
      }
      const deleted = await this.authService.deleteAccount(
        user.id,
        password,
      );
      if (!deleted) {
        response.status(HttpStatus.UNAUTHORIZED);
      } else {
        response.status(HttpStatus.OK);
      }
    } catch (e) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('password-reset/success')
  @Render('password-reset/completed')
  completedPasswordResetRequest() {
    return {}; // No data to send to ejs renderer
  }

  @Get('password-reset')
  @Render('password-reset/complete')
  completePasswordResetRequest(@Query('token') token: string) {
    // Check if the token is valid
    if (!token) {
      throw new BadRequestException('Missing token');
    }

    // Check if the token is a password reset token
    if (!token.startsWith('pr_')) {
      throw new BadRequestException('Invalid token');
    }

    return this.authService.completePasswordResetRequest(token);
  }

  @Post('password-reset')
  @HandlerInfo('completePasswordResetPost')
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
  @HandlerInfo('forgotPassword')
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
  @HandlerInfo('verifyEmail')
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
  @HandlerInfo('sendVerificationEmail')
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
