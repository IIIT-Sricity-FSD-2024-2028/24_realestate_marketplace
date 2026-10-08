import { PlanTier, SubscriptionStatus } from '../../../shared/enums/billing.enum.js';
export declare class SubscriptionResponseDto {
    id: string | null;
    tier: PlanTier;
    planName: string;
    cycle: string | null;
    status: SubscriptionStatus;
    listingQuota: number | null;
    listingsUsed: number;
    listingsRemaining: number | null;
    commissionDiscountBps: number;
    highlights: string[];
    startsAt: string | null;
    expiresAt: string | null;
    daysRemaining: number;
    renewalDue?: boolean;
}
