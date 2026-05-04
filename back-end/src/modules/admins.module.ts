import { Module } from '@nestjs/common';
import { AdminsController } from '../controllers/admins.controller.js';
import { AdminsService } from '../services/admins.service.js';

@Module({
  controllers: [AdminsController],
  providers: [AdminsService]
})
export class AdminsModule {}
