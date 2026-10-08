import { BillingService } from './billing.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { BillingSummaryDto, CatalogResponseDto, RevenueReportDto } from './dto/billing-response.dto.js';
import { PaymentsService } from '../payments/payments.service.js';
import { CheckoutOrderDto, PaymentResponseDto } from '../payments/dto/payment-response.dto.js';
import { FailPaymentDto, VerifyPaymentDto } from '../payments/dto/create-payment.dto.js';
import { SubscriptionResponseDto } from '../subscriptions/dto/subscription-response.dto.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export declare class BillingController {
    private readonly billingService;
    private readonly paymentsService;
    constructor(billingService: BillingService, paymentsService: PaymentsService);
    catalog(): {
        message: string;
        data: CatalogResponseDto;
    };
    summary(user: AuthenticatedUser): Promise<{
        message: string;
        data: BillingSummaryDto;
    }>;
    checkout(dto: CheckoutDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: CheckoutOrderDto;
    }>;
    verifyPayment(dto: VerifyPaymentDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: PaymentResponseDto;
    }>;
    cancelled(dto: FailPaymentDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: PaymentResponseDto;
    }>;
    simulate(orderId: string): {
        message: string;
        data: {
            orderId: string;
            paymentId: string;
            signature: string;
        };
    };
    cancelSubscription(user: AuthenticatedUser): Promise<{
        message: string;
        data: SubscriptionResponseDto;
    }>;
    revenue(): Promise<{
        message: string;
        data: RevenueReportDto;
    }>;
}
