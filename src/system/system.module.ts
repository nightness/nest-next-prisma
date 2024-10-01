import { Global, Module } from '@nestjs/common';

import { FileSystemService } from '../modules/filesystem/filesystem.service';

@Global()
@Module({
  providers: [],
  exports: [
    FileSystemService,
  ],
})
export class SystemModule {}
