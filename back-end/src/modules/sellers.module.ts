import { Module } from '@nestjs/common';
import { SellersController } from '../controllers/sellers.controller.js';
import { SellersService } from '../services/sellers.service.js';

@Module({
  controllers: [SellersController],
  providers: [SellersService]
})
export class SellersModule {}
