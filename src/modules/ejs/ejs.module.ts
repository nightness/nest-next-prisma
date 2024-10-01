import { Module } from '@nestjs/common';
import { EjsService } from './ejs.service';

@Module({
    controllers: [],
    providers: [EjsService],
    exports: [EjsService],
})
export class EjsModule {}
