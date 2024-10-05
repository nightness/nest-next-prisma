import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// For generating JWT tokens
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
// Your custom JwtPayload interface
import { ACCESS_TOKEN_EXPIRATION, EMAIL_VERIFICATION_TOKEN_EXPIRATION, MAX_CONCURRENT_EMAIL_VERIFICATION_REQUESTS, MAX_CONCURRENT_PASSWORD_RESET_REQUESTS, MAX_REFRESH_TOKENS, PASSWORD_RESET_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION, SERVER_URL } from '../../config/config.env';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { EjsService } from '../../modules/ejs/ejs.service';
import { EmailerService } from '../../modules/emailer/emailer.service';
import { RedisService } from '../../modules/redis/redis.service';
import { User as ExpressUser } from '../../system/types';

import { JwtPayload, LoginResponseDto } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private emailerService: EmailerService, // Service for sending emails
    private ejsService: EjsService, // Service for rendering HTML templates
    private redisService: RedisService, // Service for Redis operations
    private userService: UserService, // Service for user operations
    private jwtService: JwtService, // NestJS JWT service for token operations
    private prisma: PrismaService, // Add PrismaService for database access
  ) {}

  async refreshToken(refreshToken: string) {
    const user = await this.validateRefreshToken(refreshToken);
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

  // Verifies the token used for render the page to reset password
  async completePasswordResetRequest(token: string) {
    // Get the user ID associated with the token
    const userId = await this.redisService.get(token);
    if (!userId) {
      throw new BadRequestException('Invalid or expired token');
    }

    return { token, validationErrors: [] }; // Data passed to the view
  }

  async completePasswordResetPost(
    token: string,
    password: string,
  ): Promise<void> {
    // Get the user ID associated with the token
    const userId = await this.redisService.get(token);
    if (!userId) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Hash the password and update the user record
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userService.update(userId, { password: hashedPassword });

    // Delete all "pr" tokens for this user
    await this.redisService.deleteTokens('pr', userId);
  }

  async deleteAccount(userId: string, password: string): Promise<boolean> {
    // Fetch the full user record so we have access to the password
    const user = await this.userService.findById(userId);

    // Verify the password provided by the user matches the one stored in the database
    const isMatch = user && await this.comparePassword(password, user.password);
    if (!isMatch) {
      return false;
    }

    // Delete all tokens for the user from Redis
    await this.redisService.deleteTokens('*', user.id);

    // Delete the user record
    await this.userService.delete(user.id);

    return true;
  }

  // Initiates the password reset process
  async sendVerificationEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return;
    }

    // User is limited to MAX_CONCURRENT_EMAIL_VERIFICATION_REQUESTS requests per day to prevent abuse
    const keys = await this.redisService.keys(`ve_*:${user.id}`);
    if (keys.length > MAX_CONCURRENT_EMAIL_VERIFICATION_REQUESTS) {
      // Look though the keys to determine how long the user has to wait before making another request
      let waitTime = 0;
      for (const key of keys) {
        const ttl = await this.redisService.ttl(key);
        if (ttl > waitTime) {
          waitTime = ttl;
        }
      }

      const waitHours = Math.floor(waitTime / 60 / 60);
      const waitMinutes = Math.ceil((waitTime / 60) % 60);

      if (waitHours === 0) {
        throw new BadRequestException(
          `Too many requests. Try again in ${waitMinutes} minutes`,
        );
      }

      throw new BadRequestException(
        `Too many requests. Try again in ${
          waitHours === 1 ? 'an hour' : `${waitHours} hours`
        } hours and ${Math.ceil((waitTime / 60) % 60)} minutes`,
      );
    }

    // Create a token for verifying the email and store it in Redis
    const token = this.generateRandomToken('ve');

    // Send the token to the user via email
    const verificationLink = `${SERVER_URL}/auth/verify-email?token=${token}`;

    // Use ejs to render the html that will form the body of the e-mail
    const staticHtml = await this.ejsService.renderFileToString(
      'verify-email/request.ejs',
      {
        name: user.name,
        actionLink: verificationLink,
        randomNumber: Math.random(),
      },
    );

    // Save token to Redis
    await this.redisService.saveToken(
      token,
      user.id,
      EMAIL_VERIFICATION_TOKEN_EXPIRATION,
    );

    // Send e-mail to user
    await this.emailerService.sendEmail(
      email,
      'E-Mail Verification',
      staticHtml,
    );
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Missing token');
    }
    if (!token.startsWith('ve_')) {
      throw new BadRequestException('Invalid token');
    }
    const userId = await this.redisService.get(token);
    if (!userId) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.userService.update(userId, { isEmailVerified: true });

    // Delete all "ve" tokens for this user
    await this.redisService.deleteTokens('ve', userId);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // throw new BadRequestException('User not found');
      return; // Don't reveal if the user exists
    }

    // User is limited to MAX_CONCURRENT_PASSWORD_RESET_REQUESTS requests per day to prevent abuse
    const keys = await this.redisService.keys(`pr_*:${user.id}`);
    if (keys.length > MAX_CONCURRENT_PASSWORD_RESET_REQUESTS) {
      // Get the wait time until the next key of the provided keys expires
      const { waitTime, waitMinutes, waitHours } =
        await this.redisService.waitTime(keys);

      if (waitHours === 0) {
        throw new BadRequestException(
          `Too many requests. Try again in ${waitMinutes} minutes`,
        );
      }

      throw new BadRequestException(
        `Too many requests. Try again in ${
          waitHours === 1 ? 'an hour' : `${waitHours} hours`
        } hours and ${Math.ceil((waitTime / 60) % 60)} minutes`,
      );
    }

    // Create a token for password resets
    const token = this.generateRandomToken('pr');

    // The link used to reset the password
    const resetLink = `${SERVER_URL}/auth/password-reset?token=${token}`;

    // Parse the ejs view that will form the email to the user
    const staticHtml = await this.ejsService.renderFileToString(
      'password-reset/request.ejs',
      {
        name: user.name,
        actionLink: resetLink,
        randomNumber: Math.random(),
      },
    );

    // Save the token to redis
    await this.redisService.saveToken(
      token,
      user.id,
      PASSWORD_RESET_TOKEN_EXPIRATION,
    );

    // Send email to user
    await this.emailerService.sendEmail(email, 'Password Reset', staticHtml);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
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
    await this.redisService.deleteTokens('rt', userId);

    // Send an email to the user to notify them of the password change
    const staticHtml = await this.ejsService.renderFileToString(
      'password-reset/completed.ejs',
      {
        name: user.name,
        randomNumber: Math.random(),
      },
    );
    await this.emailerService.sendEmail(
      user.email,
      'Notification: Your password was recently changed',
      staticHtml,
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

  async validateUser(payload: JwtPayload): Promise<ExpressUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub, email: payload.email },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        isEmailVerified: true,
        isAdmin: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }
    return {
      id: user.id,
      name: user.name!,
      email: user.email,
      isAdmin: user.isAdmin,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive
    };
  }

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
      REFRESH_TOKEN_EXPIRATION,
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
    password: string,
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
        'Too many logins. Try again later, reset your password, or logout from other devices.',
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
    storedPasswordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(enteredPassword, storedPasswordHash);
  }
}
