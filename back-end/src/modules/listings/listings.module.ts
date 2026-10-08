import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller.js';
import { ListingsService } from './listings.service.js';
import { PropertiesModule } from '../properties/properties.module.js';

@Module({
  imports: [PropertiesModule],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
