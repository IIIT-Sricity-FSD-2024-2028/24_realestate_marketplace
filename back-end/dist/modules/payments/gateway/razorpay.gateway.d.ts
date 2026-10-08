import type { CreateOrderInput, GatewayOrder, GatewaySignature, PaymentGateway } from './payment-gateway.interface.js';
export declare class RazorpayGateway implements PaymentGateway {
    readonly keyId: string;
    private readonly keySecret;
    private readonly webhookSecret;
    readonly name = "razorpay";
    private readonly logger;
    constructor(keyId: string, keySecret: string, webhookSecret: string | null);
    get isLive(): boolean;
    createOrder(input: CreateOrderInput): Promise<GatewayOrder>;
    verifySignature({ orderId, paymentId, signature }: GatewaySignature): boolean;
    verifyWebhook(rawBody: string, signature: string): boolean;
    private sign;
    private matches;
}
