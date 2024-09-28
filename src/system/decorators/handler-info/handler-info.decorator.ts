// custom-decorators.ts
import { SetMetadata } from '@nestjs/common';

export const HandlerInfo = (handlerName: string) =>
  SetMetadata('handlerName', handlerName);
