export interface GatewayOrder {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    receipt: string;
}
export interface GatewaySignature {
    orderId: string;
    paymentId: string;
    signature: string;
}
export interface CreateOrderInput {
    amountInRupees: number;
    receipt: string;
    notes: Record<string, string>;
}
export interface PaymentGateway {
    readonly name: string;
    readonly isLive: boolean;
    readonly keyId: string;
    createOrder(input: CreateOrderInput): Promise<GatewayOrder>;
    verifySignature(input: GatewaySignature): boolean;
    verifyWebhook(rawBody: string, signature: string): boolean;
    simulateCheckout?(orderId: string): GatewaySignature;
}
export declare const PAYMENT_GATEWAY: unique symbol;
