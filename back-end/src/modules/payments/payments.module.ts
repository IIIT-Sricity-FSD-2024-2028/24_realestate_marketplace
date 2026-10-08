import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { Payment, PaymentSchema } from './schemas/payment.schema.js';
import { MockPaymentGateway } from './gateway/mock.gateway.js';
import { paymentGatewayProvider } from './gateway/payment-gateway.provider.js';

/**
 * The money rail: the payment ledger plus whichever gateway driver the
 * environment selected. Exports PaymentsService so BillingService can open
 * orders and capture them; the driver itself stays private to this module.
 */
@Module({
  imports: [MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }])],
  controllers: [PaymentsController],
  providers: [PaymentsService, MockPaymentGateway, paymentGatewayProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
