import { Module } from '@nestjs/common';
import { ShortlistsController } from './shortlists.controller.js';
import { ShortlistsService } from './shortlists.service.js';

@Module({
  controllers: [ShortlistsController],
  providers: [ShortlistsService]
})
export class ShortlistsModule {}
