import { Module } from '@nestjs/common';
import { VisitsController } from '../controllers/visits.controller.js';
import { VisitsService } from '../services/visits.service.js';

@Module({
  controllers: [VisitsController],
  providers: [VisitsService]
})
export class VisitsModule {}
