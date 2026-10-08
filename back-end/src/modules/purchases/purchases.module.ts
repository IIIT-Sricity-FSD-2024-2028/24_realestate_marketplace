import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchasesController } from './purchases.controller.js';
import { PurchasesService } from './purchases.service.js';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema.js';
import { PropertiesModule } from '../properties/properties.module.js';
import { CommissionsModule } from '../commissions/commissions.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Purchase.name, schema: PurchaseSchema }]),
    // Needed to scope review/seller queues by property location/ownership
    // (PropertiesService.propertyIdsForAdmin / propertyIdsForSeller / getOwnershipInfo).
    PropertiesModule,
    // Completing a purchase books the platform's brokerage on the deal.
    CommissionsModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
