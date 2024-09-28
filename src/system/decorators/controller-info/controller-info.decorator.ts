// custom-decorators.ts
import { SetMetadata } from '@nestjs/common';

export const ControllerInfo = (controllerName: string) =>
  SetMetadata('controllerName', controllerName);
