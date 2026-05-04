import { Module } from '@nestjs/common';
import { ShortlistsController } from '../controllers/shortlists.controller.js';
import { ShortlistsService } from '../services/shortlists.service.js';

@Module({
  controllers: [ShortlistsController],
  providers: [ShortlistsService]
})
export class ShortlistsModule {}
