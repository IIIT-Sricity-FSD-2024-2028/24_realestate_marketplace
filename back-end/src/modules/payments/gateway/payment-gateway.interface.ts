/**
 * The contract every payment gateway driver implements.
 *
 * truEstate ships two drivers behind this one interface:
 *
 *   `mock`      — the default. Implements Razorpay's *exact* order/signature
 *                 protocol locally, so the whole checkout works offline with
 *                 no account, no keys and no real money.
 *   `razorpay`  — the real thing. Activated purely by setting RAZORPAY_KEY_ID
 *                 and RAZORPAY_KEY_SECRET in `.env`.
 *
 * Because both speak the same protocol — create an order server-side, let the
 * client pay, then verify an HMAC-SHA256 signature server-side before granting
 * anything — going live is a config change, not a rewrite. No calling code in
 * the app knows which driver is loaded.
 */

/** What the server hands the checkout UI after an order is opened. */
export interface GatewayOrder {
  /** Gateway order id, e.g. `order_NcL9k2...`. Stored on the Payment row. */
  orderId: string;
  /** Amount in whole rupees. The driver converts to paise at the boundary. */
  amount: number;
  currency: string;
  /** Publishable key the checkout widget needs. Never the secret. */
  keyId: string;
  /** Our own reference, e.g. `rcpt_sub_65f1...`. Lets us reconcile later. */
  receipt: string;
}

/** The triplet a completed checkout hands back, to be verified server-side. */
export interface GatewaySignature {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface CreateOrderInput {
  amountInRupees: number;
  receipt: string;
  /** Free-form context echoed back by the gateway (purpose, plan, propertyId…). */
  notes: Record<string, string>;
}

export interface PaymentGateway {
  /** Driver name, persisted on every Payment row so history stays readable. */
  readonly name: string;
  /** True when real money moves. The UI shows a "TEST MODE" banner when false. */
  readonly isLive: boolean;
  /** Publishable key for the checkout widget. */
  readonly keyId: string;

  createOrder(input: CreateOrderInput): Promise<GatewayOrder>;

  /**
   * Verifies `HMAC_SHA256(orderId + "|" + paymentId, keySecret) === signature`.
   * This is the security boundary: a payment is only ever marked PAID when
   * this returns true, so a client cannot self-report a successful payment.
   */
  verifySignature(input: GatewaySignature): boolean;

  /** Verifies a gateway webhook against the raw request body. */
  verifyWebhook(rawBody: string, signature: string): boolean;

  /**
   * Mock driver only — produces the paymentId + signature the real hosted
   * checkout widget would have returned. Undefined on the live driver, which
   * is exactly what stops the demo checkout from ever minting a real payment.
   */
  simulateCheckout?(orderId: string): GatewaySignature;
}

/** DI token for the driver selected at boot. */
export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');
