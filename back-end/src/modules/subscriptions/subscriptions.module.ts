import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionsService } from './subscriptions.service.js';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema.js';

/**
 * Seller listing plans. Has no controller of its own — plans are read and
 * bought through `/billing`, which composes plan state with listing counts
 * and the rate card. This module owns nothing but the subscription records.
 */
@Module({
  imports: [MongooseModule.forFeature([{ name: Subscription.name, schema: SubscriptionSchema }])],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
