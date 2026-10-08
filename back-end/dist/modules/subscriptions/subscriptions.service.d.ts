import { Model } from 'mongoose';
import { SubscriptionDocument } from './schemas/subscription.schema.js';
import { SubscriptionResponseDto } from './dto/subscription-response.dto.js';
import { PlanTier } from '../../shared/enums/billing.enum.js';
import { type BillingCycle, type PlanDefinition } from '../../shared/constants/pricing.js';
export interface PlanState {
    tier: PlanTier;
    definition: PlanDefinition;
    subscription: SubscriptionDocument | null;
}
export declare class SubscriptionsService {
    private readonly subscriptionModel;
    private readonly logger;
    constructor(subscriptionModel: Model<SubscriptionDocument>);
    activePlan(sellerId: string): Promise<PlanState>;
    activate(sellerId: string, tier: PlanTier, cycle: BillingCycle, amountPaid: number, paymentId: string): Promise<SubscriptionDocument>;
    cancel(sellerId: string): Promise<PlanState>;
    hasListingHeadroom(plan: PlanState, listingsUsed: number): boolean;
    toResponse(plan: PlanState, listingsUsed: number): SubscriptionResponseDto;
    activeCountsByTier(): Promise<Record<string, number>>;
    monthlyRecurringRevenue(): Promise<number>;
}
