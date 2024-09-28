import { CanActivate, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ForbiddenGuard implements CanActivate {
  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    throw new ForbiddenException('You are not allowed to access this resource');
  }
}
