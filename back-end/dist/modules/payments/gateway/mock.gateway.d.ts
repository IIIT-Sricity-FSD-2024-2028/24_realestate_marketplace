import type { CreateOrderInput, GatewayOrder, GatewaySignature, PaymentGateway } from './payment-gateway.interface.js';
export declare class MockPaymentGateway implements PaymentGateway {
    readonly name = "mock";
    readonly isLive = false;
    readonly keyId = "rzp_test_truestate_mock";
    private readonly logger;
    private readonly orders;
    private readonly keySecret;
    createOrder(input: CreateOrderInput): Promise<GatewayOrder>;
    simulateCheckout(orderId: string): GatewaySignature;
    verifySignature({ orderId, paymentId, signature }: GatewaySignature): boolean;
    verifyWebhook(rawBody: string, signature: string): boolean;
    private sign;
    private matches;
}
