import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommissionsController } from './commissions.controller.js';
import { CommissionsService } from './commissions.service.js';
import { Commission, CommissionSchema } from './schemas/commission.schema.js';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module.js';

/**
 * Brokerage on closed deals. Depends on SubscriptionsModule because a
 * seller's plan discounts their commission rate — and on nothing else, so
 * PurchasesModule can import this to accrue on completion without a cycle.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Commission.name, schema: CommissionSchema }]),
    SubscriptionsModule,
  ],
  controllers: [CommissionsController],
  providers: [CommissionsService],
  exports: [CommissionsService],
})
export class CommissionsModule {}
