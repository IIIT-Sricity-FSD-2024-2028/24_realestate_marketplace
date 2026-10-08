import { PaymentResponseDto } from '../../payments/dto/payment-response.dto.js';
import { CommissionResponseDto } from '../../commissions/dto/commission-response.dto.js';
import { SubscriptionResponseDto } from '../../subscriptions/dto/subscription-response.dto.js';
import { PropertyResponseDto } from '../../properties/dto/property-response.dto.js';
export declare class CatalogResponseDto {
    plans: unknown[];
    cycles: unknown[];
    featuredPacks: unknown[];
    commission: unknown;
    gstPercent: number;
    gateway: string;
    isLive: boolean;
}
export declare class BillingSummaryDto {
    plan?: SubscriptionResponseDto;
    listings?: PropertyResponseDto[];
    commissions: CommissionResponseDto[];
    amountDue: number;
    lifetimeSpend: number;
    payments: PaymentResponseDto[];
}
export declare class RevenueReportDto {
    totalCollected: number;
    receivable: number;
    mrr: number;
    waived: number;
    byStream: unknown;
    monthly: unknown[];
    byCity: unknown[];
    subscriptions: unknown;
    checkoutFunnel: unknown;
    recentPayments: PaymentResponseDto[];
}
