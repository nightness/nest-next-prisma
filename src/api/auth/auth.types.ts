import { ApiProperty } from '@nestjs/swagger';

/* eslint-disable @typescript-eslint/no-namespace */
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      isAdmin: boolean;
      isEmailVerified: boolean;
      isActive: boolean;
    }

    interface Request {
      controllerName?: string;
      handlerName?: string;
    }
  }
}

export class RegisterDto {
  @IsString()
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsEmail()
  @ApiProperty({ example: 'john@doe.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message: 'Password too weak',
  // })
  @ApiProperty({ example: 'password' })
  password: string;

  constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
}

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'john@doe.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'password' })
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'currentPassword' })
  currentPassword: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  @IsString()
  @ApiProperty({ example: 'newPassword' })
  newPassword: string;

  constructor(currentPassword: string, newPassword: string) {
    this.currentPassword = currentPassword;
    this.newPassword = newPassword;
  }
}

export class DeleteAccountDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'currentPassword' })
  password: string;

  constructor(password: string) {
    this.password = password;
  }
}

export class JwtPayload {
  @ApiProperty({ example: 'john@doe.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '1234567890', description: 'User ID' })
  sub: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Token issued at',
  })
  iat: number;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Token expiry',
  })
  exp?: number;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Token not valid before',
  })
  nbf?: number;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Token issuer',
  })
  iss?: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Token audience',
  })
  aud?: string;

  @ApiProperty({ example: '2021-01-01T00:00:00.000Z', description: 'Token ID' })
  jti?: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Token type',
  })
  typ?: string = 'JWT';

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Token algorithm',
  })
  alg?: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Token key ID',
  })
  kid?: string;

  constructor(
    email: string,
    name: string,
    sub: string,
    iat: number,
    exp?: number,
    nbf?: number,
    iss?: string,
    aud?: string,
    jti?: string,
    typ?: string,
    alg?: string,
    kid?: string,
  ) {
    this.email = email;
    this.name = name;
    this.sub = sub;
    this.iat = iat;
    this.exp = exp;
    this.nbf = nbf;
    this.iss = iss;
    this.aud = aud;
    this.jti = jti;
    this.typ = typ;
    this.alg = alg;
    this.kid = kid;
  }
}

export class AuthenticationResponseDto {
  @ApiProperty({ example: 'access_token' })
  access_token: string;

  @ApiProperty({ example: 'refresh_token' })
  refresh_token: string;

  constructor(access_token: string, refresh_token: string) {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
  }
}

export class LoginResponseDto extends AuthenticationResponseDto {
  @ApiProperty({ example: 'User' })
  user: JwtPayload;

  constructor(user: JwtPayload, access_token: string, refresh_token: string) {
    super(access_token, refresh_token);
    this.user = user;
  }
}
