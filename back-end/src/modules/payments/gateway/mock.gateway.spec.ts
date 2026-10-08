import { MockPaymentGateway } from './mock.gateway.js';

describe('MockPaymentGateway', () => {
  let gateway: MockPaymentGateway;

  beforeEach(() => {
    gateway = new MockPaymentGateway();
  });

  const openOrder = () =>
    gateway.createOrder({ amountInRupees: 7961, receipt: 'TRU-SUB-8F2A19', notes: { purpose: 'subscription' } });

  it('mints a Razorpay-shaped order id', async () => {
    const order = await openOrder();
    expect(order.orderId).toMatch(/^order_/);
    expect(order.amount).toBe(7961);
    expect(order.currency).toBe('INR');
  });

  it('reports itself as not live, so the UI can show a TEST MODE banner', () => {
    expect(gateway.isLive).toBe(false);
    expect(gateway.name).toBe('mock');
  });

  it('verifies a signature it produced', async () => {
    const order = await openOrder();
    const signed = gateway.simulateCheckout(order.orderId);
    expect(signed.paymentId).toMatch(/^pay_/);
    expect(gateway.verifySignature(signed)).toBe(true);
  });

  it('rejects a forged signature', async () => {
    const order = await openOrder();
    const signed = gateway.simulateCheckout(order.orderId);
    expect(gateway.verifySignature({ ...signed, signature: 'f'.repeat(64) })).toBe(false);
  });

  it('rejects a signature replayed against a different payment id', async () => {
    const order = await openOrder();
    const signed = gateway.simulateCheckout(order.orderId);
    expect(gateway.verifySignature({ ...signed, paymentId: 'pay_somethingelse' })).toBe(false);
  });

  it('rejects a signature replayed against a different order', async () => {
    const [a, b] = await Promise.all([openOrder(), openOrder()]);
    const signedA = gateway.simulateCheckout(a.orderId);
    expect(gateway.verifySignature({ ...signedA, orderId: b.orderId })).toBe(false);
  });

  it('rejects a malformed signature instead of throwing', async () => {
    const order = await openOrder();
    const signed = gateway.simulateCheckout(order.orderId);
    // timingSafeEqual throws on a length mismatch, so the length is checked first.
    expect(() => gateway.verifySignature({ ...signed, signature: 'short' })).not.toThrow();
    expect(gateway.verifySignature({ ...signed, signature: 'short' })).toBe(false);
  });

  it('refuses to sign an order it never issued', () => {
    expect(() => gateway.simulateCheckout('order_neverExisted')).toThrow(/Unknown order/);
  });

  it('uses a per-process secret, so a signature cannot cross instances', async () => {
    const order = await openOrder();
    const signed = gateway.simulateCheckout(order.orderId);
    const other = new MockPaymentGateway();
    // The other instance never issued this order, so it refuses outright —
    // and even the signature would not verify against its own secret.
    expect(other.verifySignature(signed)).toBe(false);
  });

  it('verifies a webhook body against its own secret', () => {
    const body = JSON.stringify({ event: 'payment.captured' });
    // Only the gateway can produce a valid webhook signature, so an
    // unsigned body is rejected.
    expect(gateway.verifyWebhook(body, 'a'.repeat(64))).toBe(false);
  });
});
