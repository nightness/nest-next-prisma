import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { Request, Response } from '../system/types';

@Catch()
@Injectable()
export class SystemFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const path = ctx.getRequest().url;
    const status = exception.getStatus?.() ?? 500;
    const controllerName = request.controllerName;
    const handlerName = request.handlerName;

    // Handle UnauthorizedException
    // if (exception instanceof UnauthorizedException) {
    //   return this.ejsService.sendView(
    //     response,
    //     '401', // 401 page
    //     { url: path },
    //     HttpStatus.UNAUTHORIZED,
    //   );
    // }

    // Handle ForbiddenException
    // if (exception instanceof ForbiddenException) {
    //   return this.ejsService.sendView(
    //     response,
    //     '403', // 403 page
    //     { url: path },
    //     HttpStatus.FORBIDDEN,
    //   );
    // }

    // Handle NotFoundException
    // if (exception instanceof NotFoundException) {
    //   return this.ejsService.sendView(
    //     response,
    //     '404', // 404 page
    //     { url: path },
    //     HttpStatus.NOT_FOUND,
    //   );
    // }

    // Handle any other exception
    // return this.ejsService.sendView(
    //   response,
    //   `500`,
    //   {
    //     url: path,
    //     statusCode: status,
    //     exceptionMessage: exception.message,
    //   },
    //   status,
    // );
  }
}
