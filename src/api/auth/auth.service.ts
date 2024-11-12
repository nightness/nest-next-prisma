import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import {
  ACCESS_TOKEN_EXPIRATION,
  MAX_REFRESH_TOKENS,
  REFRESH_TOKEN_EXPIRATION,
} from '../../config/config.env';
import { UserService } from '../user/user.service';
import { EjsService } from '../../modules/ejs/ejs.service';
import { EmailerService } from '../../modules/emailer/emailer.service';
import { RedisService } from '../../modules/redis/redis.service';

import { JwtPayload, LoginResponseDto } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private emailerService: EmailerService, // Service for sending emails
    private ejsService: EjsService, // Service for rendering HTML templates
    private redisService: RedisService, // Service for Redis operations
    private userService: UserService, // Service for user operations
    private jwtService: JwtService // NestJS JWT service for token operations
  ) {}

  async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
    // Step 1: Validate the refresh token and retrieve the user
    const user = await this.validateRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  
    // Step 2: Delete the old refresh token to prevent reuse
    await this.deleteRefreshToken(refreshToken);
  
    // Step 3: Generate a new access token
    const payload: JwtPayload = {
      email: user.email,
      name: user.name || '',
      sub: user.id,
      iat: Date.now(),
      exp: Date.now() + ACCESS_TOKEN_EXPIRATION * 1000, // Use configured expiration
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
  
    // Step 4: Generate a new refresh token and save it in Redis
    const newRefreshToken = this.generateRandomToken('rt');
    await this.redisService.saveToken(
      newRefreshToken,
      user.id,
      REFRESH_TOKEN_EXPIRATION
    );
  
    // Step 5: Return both tokens in the response
    return {
      user: payload,
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }
  
  async deleteAccount(userId: string, password: string): Promise<boolean> {
    // Fetch the full user record so we have access to the password
    const user = await this.userService.findById(userId);

    // Verify the password provided by the user matches the one stored in the database
    const isMatch =
      user && (await this.comparePassword(password, user.password));
    if (!isMatch) {
      return false;
    }

    // Delete all tokens for the user from Redis
    await this.redisService.deleteTokens('*', user.id);

    // Delete the user record
    await this.userService.delete(user.id);

    return true;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<LoginResponseDto> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await this.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash the password and update the user record
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.update(userId, { password: hashedNewPassword });

    // Delete all refresh tokens for the user
    // NOTE: This will log out the user from all devices
    await this.redisService.deleteTokens('rt', userId);

    // Send an email to the user to notify them of the password change
    const staticHtml = await this.ejsService.renderFileToString(
      'password-reset/completed.ejs',
      {
        name: user.name,
        randomNumber: Math.random(),
      }
    );
    await this.emailerService.sendEmail(
      user.email,
      'Notification: Your password was recently changed',
      staticHtml
    );

    // Return new tokens
    return this.createAuthTokens(user);
  }

  async deleteRefreshToken(refreshToken: string): Promise<void> {
    try {
      if (!refreshToken || !(await this.redisService.exists(refreshToken))) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      await this.redisService.deleteToken(refreshToken);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new UnauthorizedException('Invalid refresh token: ', error.message);
    }
  }

  private generateRandomToken(prefix?: string): string {
    const token = randomBytes(32).toString('hex');
    return prefix ? `${prefix}_${token}` : token; // Generates a 32-byte random string, converted to hexadecimal format
  }

  async validateRefreshToken(token: string): Promise<User | null> {
    if (!token) {
      return null;
    }
    if (!token.startsWith('rt_')) {
      return null;
    }
    const userId = await this.redisService.get(token);
    if (!userId) {
      return null;
    }

    return this.userService.findById(userId);
  }

  // async validateUser(payload: JwtPayload): Promise<ExpressUser> {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id: payload.sub, email: payload.email },
  //     select: {
  //       id: true,
  //       name: true,
  //       email: true,
  //       isActive: true,
  //       isEmailVerified: true,
  //       isAdmin: true,
  //     },
  //   });
  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }
  //   if (!user.isActive) {
  //     throw new UnauthorizedException('User is not active');
  //   }
  //   return {
  //     id: user.id,
  //     name: user.name!,
  //     email: user.email,
  //     isAdmin: user.isAdmin,
  //     isEmailVerified: user.isEmailVerified,
  //     isActive: user.isActive
  //   };
  // }

  private async createAuthTokens(user: User): Promise<LoginResponseDto> {
    const payload: JwtPayload = {
      email: user.email,
      name: user.name!,
      sub: user.id,
      iat: Date.now(),
      exp: Date.now() + ACCESS_TOKEN_EXPIRATION * 1000,
    };

    // Create an access token and return it
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });

    const refreshToken = this.generateRandomToken('rt');
    await this.redisService.saveToken(
      refreshToken,
      user.id,
      REFRESH_TOKEN_EXPIRATION
    );

    return {
      user: payload,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<LoginResponseDto> {
    // Check if user with the email already exists
    const userExists = await this.userService.findByEmail(email);
    if (userExists) {
      throw new BadRequestException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create({
      name,
      email,
      password: hashedPassword,
    });

    return this.createAuthTokens(user);
  }

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { length: count } = await this.redisService.keys(`rt_*:${user.id}`);
    if (count > MAX_REFRESH_TOKENS) {
      throw new UnauthorizedException(
        'Too many logins. Try again later, reset your password, or logout from other devices.'
      );
    }

    const passwordIsValid = await this.comparePassword(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthTokens(user);
  }

  private async comparePassword(
    enteredPassword: string,
    storedPasswordHash: string
  ): Promise<boolean> {
    return bcrypt.compare(enteredPassword, storedPasswordHash);
  }
}
