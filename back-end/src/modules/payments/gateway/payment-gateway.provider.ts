import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MockPaymentGateway } from './mock.gateway.js';
import { RazorpayGateway } from './razorpay.gateway.js';
import { PAYMENT_GATEWAY, type PaymentGateway } from './payment-gateway.interface.js';

/**
 * Picks the payment driver at boot.
 *
 * Razorpay wins whenever both keys are present; otherwise the offline mock
 * takes over so the platform is fully demonstrable with an empty `.env`.
 * Nothing else in the codebase branches on this — everything injects
 * PAYMENT_GATEWAY and talks to the interface.
 */
export const paymentGatewayProvider: Provider = {
  provide: PAYMENT_GATEWAY,
  inject: [ConfigService, MockPaymentGateway],
  useFactory: (config: ConfigService, mock: MockPaymentGateway): PaymentGateway => {
    const logger = new Logger('PaymentGateway');
    const keyId = config.get<string | null>('payments.razorpay.keyId');
    const keySecret = config.get<string | null>('payments.razorpay.keySecret');

    if (keyId && keySecret) {
      const gateway = new RazorpayGateway(
        keyId,
        keySecret,
        config.get<string | null>('payments.razorpay.webhookSecret') ?? null,
      );
      logger.log(`Razorpay driver active (${gateway.isLive ? 'LIVE — real money' : 'test keys'})`);
      return gateway;
    }

    logger.log('Mock payment driver active — set RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET to go live');
    return mock;
  },
};
