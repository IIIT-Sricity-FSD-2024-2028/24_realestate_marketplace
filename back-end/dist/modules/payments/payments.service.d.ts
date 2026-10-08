import { Model } from 'mongoose';
import { PaymentDocument } from './schemas/payment.schema.js';
import { PaymentResponseDto, CheckoutOrderDto } from './dto/payment-response.dto.js';
import { VerifyPaymentDto } from './dto/create-payment.dto.js';
import { type PaymentGateway } from './gateway/payment-gateway.interface.js';
import { PaymentPurpose } from '../../shared/enums/billing.enum.js';
export interface OpenOrderInput {
    userId: string;
    purpose: PaymentPurpose;
    baseAmount: number;
    taxAmount: number;
    description: string;
    metadata?: Record<string, unknown>;
}
export declare class PaymentsService {
    private readonly paymentModel;
    private readonly gateway;
    private readonly logger;
    constructor(paymentModel: Model<PaymentDocument>, gateway: PaymentGateway);
    get gatewayName(): string;
    get isLive(): boolean;
    toResponse(p: PaymentDocument): PaymentResponseDto;
    private receiptFor;
    openOrder(input: OpenOrderInput): Promise<{
        payment: PaymentDocument;
        checkout: CheckoutOrderDto;
    }>;
    verifyAndCapture(dto: VerifyPaymentDto, userId: string): Promise<PaymentDocument>;
    markFailed(orderId: string, userId: string, reason: string): Promise<PaymentResponseDto>;
    simulateCheckout(orderId: string): {
        orderId: string;
        paymentId: string;
        signature: string;
    };
    verifyWebhook(rawBody: string, signature: string): boolean;
    captureFromWebhook(orderId: string, gatewayPaymentId: string): Promise<PaymentDocument | null>;
    findByUser(userId: string, limit?: number): Promise<PaymentResponseDto[]>;
    findAll(limit?: number): Promise<PaymentResponseDto[]>;
    findOne(id: string): Promise<PaymentResponseDto>;
    totalsByPurpose(): Promise<Record<string, {
        amount: number;
        count: number;
    }>>;
    monthlyTotals(months?: number): Promise<{
        month: string;
        amount: number;
        count: number;
    }[]>;
    statusCounts(): Promise<Record<string, number>>;
}
