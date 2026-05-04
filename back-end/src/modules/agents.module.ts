import { Module } from '@nestjs/common';
import { AgentsController } from '../controllers/agents.controller.js';
import { AgentsService } from '../services/agents.service.js';

@Module({
  controllers: [AgentsController],
  providers: [AgentsService]
})
export class AgentsModule {}
