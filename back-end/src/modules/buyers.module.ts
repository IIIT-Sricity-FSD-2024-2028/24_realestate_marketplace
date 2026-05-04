import { Module } from '@nestjs/common';
import { BuyersController } from '../controllers/buyers.controller.js';
import { BuyersService } from '../services/buyers.service.js';

@Module({
  controllers: [BuyersController],
  providers: [BuyersService]
})
export class BuyersModule {}
