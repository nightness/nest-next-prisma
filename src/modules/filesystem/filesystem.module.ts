import { Global, Module } from '@nestjs/common';

import { FileSystemService } from './filesystem.service';

@Global()
@Module({
  providers: [
    FileSystemService,
  ],
  exports: [
    FileSystemService,
  ],
})
export class FilesystemModule {}
