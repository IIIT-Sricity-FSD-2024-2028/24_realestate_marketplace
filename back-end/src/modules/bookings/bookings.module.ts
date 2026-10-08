import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';
import { PropertiesModule } from '../properties/properties.module.js';

@Module({
  imports: [PropertiesModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
