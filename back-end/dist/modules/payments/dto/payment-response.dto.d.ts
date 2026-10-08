import { PaymentPurpose, PaymentStatus } from '../../../shared/enums/billing.enum.js';
export declare class PaymentResponseDto {
    id: string;
    userId: string | null;
    purpose: PaymentPurpose;
    description: string;
    baseAmount: number;
    taxAmount: number;
    amount: number;
    currency: string;
    status: PaymentStatus;
    receipt: string;
    gateway: string;
    gatewayOrderId: string;
    gatewayPaymentId: string | null;
    metadata: Record<string, unknown>;
    failureReason: string | null;
    paidAt: string | null;
    payerName?: string;
    payerEmail?: string;
    createdAt: string;
    updatedAt: string;
}
export declare class CheckoutOrderDto {
    orderId: string;
    paymentId: string;
    amount: number;
    baseAmount: number;
    taxAmount: number;
    currency: string;
    keyId: string;
    gateway: string;
    isLive: boolean;
    description: string;
    receipt: string;
}
