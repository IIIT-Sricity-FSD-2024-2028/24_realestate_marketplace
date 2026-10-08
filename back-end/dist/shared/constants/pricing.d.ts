import { PlanTier, FeaturedTier } from '../enums/billing.enum.js';
export interface PlanDefinition {
    tier: PlanTier;
    name: string;
    pricePerMonth: number;
    listingQuota: number | null;
    commissionDiscountBps: number;
    highlights: string[];
}
export declare const PLAN_CATALOG: Record<PlanTier, PlanDefinition>;
export declare const PLAN_TIERS: PlanTier[];
export declare const BILLING_CYCLES: {
    readonly monthly: {
        readonly months: 1;
        readonly label: "Monthly";
        readonly discountPct: 0;
    };
    readonly quarterly: {
        readonly months: 3;
        readonly label: "Quarterly";
        readonly discountPct: 10;
    };
    readonly yearly: {
        readonly months: 12;
        readonly label: "Yearly";
        readonly discountPct: 20;
    };
};
export type BillingCycle = keyof typeof BILLING_CYCLES;
export declare function planPrice(tier: PlanTier, cycle: BillingCycle): number;
export interface FeaturedPack {
    tier: FeaturedTier;
    name: string;
    price: number;
    days: number;
    rank: number;
    highlights: string[];
}
export declare const FEATURED_PACKS: Record<FeaturedTier, FeaturedPack>;
export declare const FEATURED_TIERS: FeaturedTier[];
export declare const COMMISSION_BPS: {
    readonly sale: {
        readonly seller: 200;
        readonly buyer: 100;
    };
    readonly rent: {
        readonly seller: 300;
        readonly buyer: 200;
    };
};
export declare const GST_PERCENT = 18;
export declare function withGst(amount: number): number;
export declare function gstOn(amount: number): number;
export declare function bpsOf(amount: number, bps: number): number;
