import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { DISABLE_AUTH, JWT_SECRET } from '../../config/config.env';
import { Request } from '../../system/types';

@Injectable()
export class AuthenticatedUserGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (!!DISABLE_AUTH) {
      request.user = {
        email: 'nobody@noplace',
        name: 'nobody',
        sub: '0',
        iat: 0,
        exp: Date.now() * 2, // Far distant future
      };
      return true;
    }
    const authHeader = request.headers.authorization;
    const [authType, authKey] = authHeader
      ? authHeader.split(' ')
      : ['none', ''];

    if (authType.toLowerCase() === 'bearer') {
      try {
        const payload = this.jwtService.verify(authKey, {
          secret: JWT_SECRET,
          ignoreExpiration: false,
          ignoreNotBefore: false,
        });

        // Check if not before date
        if (payload.nbf && Date.now() < payload.nbf) {
          return false;
        }

        // Check if past exp date
        if (payload.exp && Date.now() > payload.exp) {
          return false;
        }

        // Set user in request and return true
        request.user = payload;
        return true;
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  }
}
