import { Module } from '@nestjs/common';
import { BookingsController } from '../controllers/bookings.controller.js';
import { BookingsService } from '../services/bookings.service.js';
import { PropertiesModule } from './properties.module.js';

@Module({
  imports: [PropertiesModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
