import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  CreateOrderInput,
  GatewayOrder,
  GatewaySignature,
  PaymentGateway,
} from './payment-gateway.interface.js';

const RAZORPAY_ORDERS_URL = 'https://api.razorpay.com/v1/orders';

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

/**
 * The live Razorpay driver. Selected automatically the moment
 * RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are present in the environment.
 *
 * Talks to the REST API directly over `fetch` rather than pulling in the
 * `razorpay` npm package — the two calls we need (create an order, verify a
 * signature) are a POST and an HMAC, and the SDK would add a dependency for
 * neither. Works identically against test keys (`rzp_test_…`) and live keys
 * (`rzp_live_…`); Razorpay decides which by the key itself.
 *
 * Note the units: Razorpay counts in **paise**, this application counts in
 * whole rupees. The conversion happens here and nowhere else, so no other
 * file has to remember it.
 */
@Injectable()
export class RazorpayGateway implements PaymentGateway {
  readonly name = 'razorpay';
  private readonly logger = new Logger(RazorpayGateway.name);

  constructor(
    readonly keyId: string,
    private readonly keySecret: string,
    private readonly webhookSecret: string | null,
  ) {}

  /** `rzp_live_…` keys move real money; `rzp_test_…` keys do not. */
  get isLive(): boolean {
    return this.keyId.startsWith('rzp_live_');
  }

  async createOrder(input: CreateOrderInput): Promise<GatewayOrder> {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    let response: Response;
    try {
      response = await fetch(RAZORPAY_ORDERS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: input.amountInRupees * 100, // ₹ -> paise
          currency: 'INR',
          receipt: input.receipt,
          notes: input.notes,
        }),
      });
    } catch (error) {
      this.logger.error(`Razorpay unreachable: ${(error as Error).message}`);
      throw new InternalServerErrorException('Payment gateway is unreachable. Please try again.');
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      this.logger.error(`Razorpay order failed (${response.status}): ${detail}`);
      throw new InternalServerErrorException('Payment gateway rejected the order. Please try again.');
    }

    const order = (await response.json()) as RazorpayOrderResponse;
    return {
      orderId: order.id,
      amount: Math.round(order.amount / 100), // paise -> ₹
      currency: order.currency,
      keyId: this.keyId,
      receipt: order.receipt,
    };
  }

  /**
   * Razorpay's documented checkout verification:
   * `HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)`
   * must equal `razorpay_signature`.
   */
  verifySignature({ orderId, paymentId, signature }: GatewaySignature): boolean {
    return this.matches(this.sign(`${orderId}|${paymentId}`, this.keySecret), signature);
  }

  /** Webhooks are signed over the raw body with the *webhook* secret, not the key secret. */
  verifyWebhook(rawBody: string, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('Webhook received but RAZORPAY_WEBHOOK_SECRET is unset — rejecting.');
      return false;
    }
    return this.matches(this.sign(rawBody, this.webhookSecret), signature);
  }

  private sign(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  private matches(expected: string, received: string): boolean {
    if (typeof received !== 'string' || expected.length !== received.length) return false;
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  }
}
