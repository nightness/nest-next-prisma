import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from '../system/types';

@Injectable()
export class SystemInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest<Request>();
        request.handlerName = context.getHandler().name; // Get the name of the handler method
        request.controllerName = context.getClass().name; // Get the name of the controller class

        // You can rethrow the same error
        return throwError(() => error);
      }),
    );
  }
}
