import { Module } from '@nestjs/common';
import { ListingsController } from '../controllers/listings.controller.js';
import { ListingsService } from '../services/listings.service.js';
import { PropertiesModule } from './properties.module.js';

@Module({
  imports: [PropertiesModule],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
