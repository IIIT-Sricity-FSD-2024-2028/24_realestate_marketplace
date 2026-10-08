import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller.js';
import { BillingService } from './billing.service.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module.js';
import { CommissionsModule } from '../commissions/commissions.module.js';
import { PropertiesModule } from '../properties/properties.module.js';

/**
 * The revenue orchestrator — the only module that sees both the money rail
 * and the things money buys. Every other billing module stays single-purpose
 * and therefore cycle-free.
 */
@Module({
  imports: [PaymentsModule, SubscriptionsModule, CommissionsModule, PropertiesModule],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
