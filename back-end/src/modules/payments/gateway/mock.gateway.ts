import { Injectable, Logger } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type {
  CreateOrderInput,
  GatewayOrder,
  GatewaySignature,
  PaymentGateway,
} from './payment-gateway.interface.js';

/**
 * Offline payment gateway — the default driver.
 *
 * It is *not* a stub that returns `{ success: true }`. It implements the same
 * protocol Razorpay does, end to end:
 *
 *   1. `createOrder` mints an `order_…` id and remembers the amount server-side.
 *   2. The checkout UI collects "payment" against that order id.
 *   3. `simulateCheckout` returns a `pay_…` id plus a real HMAC-SHA256
 *      signature over `orderId|paymentId`, keyed with the mock secret —
 *      byte-for-byte the algorithm Razorpay uses.
 *   4. `verifySignature` recomputes that HMAC and compares in constant time.
 *
 * So the *verification path the application depends on is the real one*. When
 * RAZORPAY_KEY_ID/SECRET are set, RazorpayGateway takes over and every line of
 * calling code stays identical — only the source of the signature changes.
 */
@Injectable()
export class MockPaymentGateway implements PaymentGateway {
  readonly name = 'mock';
  readonly isLive = false;
  readonly keyId = 'rzp_test_truestate_mock';

  private readonly logger = new Logger(MockPaymentGateway.name);

  /**
   * Orders opened in this process, so the mock can reject a signature request
   * for an order it never issued — the same way a real gateway would.
   * In-memory on purpose: the authoritative record is the Payment collection,
   * this is only the gateway's own side of the conversation.
   */
  private readonly orders = new Map<string, { amount: number; receipt: string }>();

  /**
   * The mock's signing secret. Randomised per boot rather than hard-coded, so
   * a signature captured from one run cannot be replayed against the next.
   */
  private readonly keySecret = randomBytes(32).toString('hex');

  createOrder(input: CreateOrderInput): Promise<GatewayOrder> {
    const orderId = `order_${randomBytes(9).toString('base64url')}`;
    this.orders.set(orderId, { amount: input.amountInRupees, receipt: input.receipt });
    this.logger.debug(
      `Mock order ${orderId} opened for ₹${input.amountInRupees} (${input.notes.purpose ?? 'unknown'})`,
    );
    return Promise.resolve({
      orderId,
      amount: input.amountInRupees,
      currency: 'INR',
      keyId: this.keyId,
      receipt: input.receipt,
    });
  }

  /** Produces exactly what Razorpay's hosted checkout hands back on success. */
  simulateCheckout(orderId: string): GatewaySignature {
    if (!this.orders.has(orderId)) {
      // The server restarted between opening the order and paying it. Say so
      // plainly rather than minting a signature for an order we never issued.
      throw new Error(
        `Unknown order "${orderId}" — it was opened before the server restarted. Start the payment again.`,
      );
    }
    const paymentId = `pay_${randomBytes(9).toString('base64url')}`;
    return { orderId, paymentId, signature: this.sign(`${orderId}|${paymentId}`) };
  }

  verifySignature({ orderId, paymentId, signature }: GatewaySignature): boolean {
    return this.matches(this.sign(`${orderId}|${paymentId}`), signature);
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    return this.matches(this.sign(rawBody), signature);
  }

  private sign(payload: string): string {
    return createHmac('sha256', this.keySecret).update(payload).digest('hex');
  }

  /**
   * Constant-time compare. `timingSafeEqual` throws on a length mismatch, so
   * that is checked first — a wrong-length signature is simply invalid.
   */
  private matches(expected: string, received: string): boolean {
    if (typeof received !== 'string' || expected.length !== received.length) return false;
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  }
}
