import { Module } from '@nestjs/common';
import { NegotiationsController } from '../controllers/negotiations.controller.js';
import { NegotiationsService } from '../services/negotiations.service.js';

@Module({
  controllers: [NegotiationsController],
  providers: [NegotiationsService]
})
export class NegotiationsModule {}
