import { Module } from '@nestjs/common';
import { PurchasesController } from '../controllers/purchases.controller.js';
import { PurchasesService } from '../services/purchases.service.js';

@Module({
  controllers: [PurchasesController],
  providers: [PurchasesService]
})
export class PurchasesModule {}
