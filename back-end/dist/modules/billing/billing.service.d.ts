import { CheckoutDto } from './dto/checkout.dto.js';
import { BillingSummaryDto, CatalogResponseDto, RevenueReportDto } from './dto/billing-response.dto.js';
import { PaymentsService } from '../payments/payments.service.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';
import { CommissionsService } from '../commissions/commissions.service.js';
import { PropertiesService } from '../properties/properties.service.js';
import { CheckoutOrderDto, PaymentResponseDto } from '../payments/dto/payment-response.dto.js';
import { VerifyPaymentDto } from '../payments/dto/create-payment.dto.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export declare class BillingService {
    private readonly paymentsService;
    private readonly subscriptionsService;
    private readonly commissionsService;
    private readonly propertiesService;
    private readonly logger;
    constructor(paymentsService: PaymentsService, subscriptionsService: SubscriptionsService, commissionsService: CommissionsService, propertiesService: PropertiesService);
    catalog(): CatalogResponseDto;
    private assertSeller;
    private quote;
    checkout(dto: CheckoutDto, user: AuthenticatedUser): Promise<CheckoutOrderDto>;
    verify(dto: VerifyPaymentDto, user: AuthenticatedUser): Promise<{
        payment: PaymentResponseDto;
        unlocked: string;
    }>;
    private fulfil;
    summary(user: AuthenticatedUser): Promise<BillingSummaryDto>;
    cancelSubscription(user: AuthenticatedUser): Promise<import("../subscriptions/dto/subscription-response.dto.js").SubscriptionResponseDto>;
    revenueReport(): Promise<RevenueReportDto>;
}
