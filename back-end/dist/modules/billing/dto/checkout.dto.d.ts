import { FeaturedTier, PaymentPurpose, PlanTier } from '../../../shared/enums/billing.enum.js';
import { type BillingCycle } from '../../../shared/constants/pricing.js';
export declare class CheckoutDto {
    purpose: PaymentPurpose;
    tier?: PlanTier;
    cycle?: BillingCycle;
    propertyId?: string;
    pack?: FeaturedTier;
    commissionId?: string;
}
