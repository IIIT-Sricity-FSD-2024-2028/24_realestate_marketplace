import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema.js';
import { SubscriptionResponseDto } from './dto/subscription-response.dto.js';
import { PlanTier, SubscriptionStatus } from '../../shared/enums/billing.enum.js';
import {
  BILLING_CYCLES,
  PLAN_CATALOG,
  type BillingCycle,
  type PlanDefinition,
} from '../../shared/constants/pricing.js';
import { istTimestamp } from '../../shared/helpers/ist-time.helper.js';

/** A seller's live entitlements: which plan they hold and what it allows. */
export interface PlanState {
  tier: PlanTier;
  definition: PlanDefinition;
  /** Null on the free tier — no row is written for it. */
  subscription: SubscriptionDocument | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Seller listing plans — the platform's recurring revenue.
 *
 * Deliberately imports no other domain module. The listing *count* a quota is
 * checked against is passed in by the caller rather than fetched here, which
 * is what lets PropertiesService depend on this service without a cycle.
 */
@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  /**
   * The seller's plan as of right now.
   *
   * Expiry is evaluated by date rather than by a scheduled job: a term that
   * has run out simply stops matching, so a lapsed seller falls back to the
   * free tier the moment their term ends, with no cron to miss.
   */
  async activePlan(sellerId: string): Promise<PlanState> {
    const free: PlanState = {
      tier: PlanTier.FREE,
      definition: PLAN_CATALOG[PlanTier.FREE],
      subscription: null,
    };
    if (!Types.ObjectId.isValid(sellerId)) return free;

    const subscription = await this.subscriptionModel
      .findOne({
        sellerId,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: { $gt: new Date() },
      })
      .sort({ expiresAt: -1 });

    if (!subscription) return free;
    return {
      tier: subscription.tier,
      definition: PLAN_CATALOG[subscription.tier],
      subscription,
    };
  }

  /**
   * Starts (or extends) a paid term. Called only by BillingService, and only
   * after a payment signature has been verified — never straight from a
   * request.
   *
   * Renewing the tier you already hold *extends* the existing term instead of
   * starting a fresh one, so paying early never costs a seller the days they
   * had left. Switching tier starts a new term and retires the old row.
   */
  async activate(
    sellerId: string,
    tier: PlanTier,
    cycle: BillingCycle,
    amountPaid: number,
    paymentId: string,
  ): Promise<SubscriptionDocument> {
    if (tier === PlanTier.FREE) {
      throw new BadRequestException('The Starter plan is free — there is nothing to activate.');
    }
    const { months } = BILLING_CYCLES[cycle];
    const current = await this.activePlan(sellerId);

    if (current.subscription && current.tier === tier) {
      const extended = new Date(current.subscription.expiresAt);
      extended.setMonth(extended.getMonth() + months);
      current.subscription.expiresAt = extended;
      current.subscription.cycle = cycle;
      current.subscription.amountPaid += amountPaid;
      current.subscription.paymentId = new Types.ObjectId(paymentId);
      await current.subscription.save();
      this.logger.log(`Extended ${tier} plan for seller ${sellerId} to ${extended.toISOString()}`);
      return current.subscription;
    }

    // Upgrading or downgrading: the previous term is closed out rather than
    // left active, so `activePlan` can never find two live plans to choose from.
    if (current.subscription) {
      current.subscription.status = SubscriptionStatus.CANCELLED;
      await current.subscription.save();
    }

    const startsAt = new Date();
    const expiresAt = new Date(startsAt);
    expiresAt.setMonth(expiresAt.getMonth() + months);

    const created = await this.subscriptionModel.create({
      sellerId: new Types.ObjectId(sellerId),
      tier,
      cycle,
      amountPaid,
      status: SubscriptionStatus.ACTIVE,
      startsAt,
      expiresAt,
      paymentId: new Types.ObjectId(paymentId),
    });
    this.logger.log(`Activated ${tier} plan for seller ${sellerId} until ${expiresAt.toISOString()}`);
    return created;
  }

  /** Ends a paid plan immediately; the seller drops to the free tier's quota. */
  async cancel(sellerId: string): Promise<PlanState> {
    const current = await this.activePlan(sellerId);
    if (!current.subscription) {
      throw new BadRequestException('You are on the free Starter plan — there is nothing to cancel.');
    }
    current.subscription.status = SubscriptionStatus.CANCELLED;
    await current.subscription.save();
    return this.activePlan(sellerId);
  }

  /**
   * Whether `listingsUsed` leaves room for one more listing under this plan.
   * The count is supplied by the caller (PropertiesService), which owns it.
   */
  hasListingHeadroom(plan: PlanState, listingsUsed: number): boolean {
    const quota = plan.definition.listingQuota;
    return quota === null || listingsUsed < quota;
  }

  toResponse(plan: PlanState, listingsUsed: number): SubscriptionResponseDto {
    const { definition, subscription } = plan;
    const quota = definition.listingQuota;
    const daysRemaining = subscription
      ? Math.max(0, Math.ceil((subscription.expiresAt.getTime() - Date.now()) / DAY_MS))
      : 0;

    return {
      id: subscription?._id.toString() ?? null,
      tier: plan.tier,
      planName: definition.name,
      cycle: subscription?.cycle ?? null,
      status: subscription?.status ?? SubscriptionStatus.ACTIVE,
      listingQuota: quota,
      listingsUsed,
      listingsRemaining: quota === null ? null : Math.max(0, quota - listingsUsed),
      commissionDiscountBps: definition.commissionDiscountBps,
      highlights: definition.highlights,
      startsAt: subscription ? istTimestamp(subscription.startsAt) : null,
      expiresAt: subscription ? istTimestamp(subscription.expiresAt) : null,
      daysRemaining,
      ...(subscription && daysRemaining <= 7 && { renewalDue: true }),
    };
  }

  /** Active paid subscriptions, per tier — feeds the superuser revenue report. */
  async activeCountsByTier(): Promise<Record<string, number>> {
    const rows = await this.subscriptionModel.aggregate<{ _id: string; count: number }>([
      { $match: { status: SubscriptionStatus.ACTIVE, expiresAt: { $gt: new Date() } } },
      { $group: { _id: '$tier', count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((r) => [r._id, r.count]));
  }

  /**
   * Monthly recurring revenue: every live plan normalised to a per-month
   * figure, so a yearly and a monthly subscriber are comparable.
   */
  async monthlyRecurringRevenue(): Promise<number> {
    const counts = await this.activeCountsByTier();
    return Object.entries(counts).reduce((total, [tier, count]) => {
      const definition = PLAN_CATALOG[tier as PlanTier];
      return total + (definition ? definition.pricePerMonth * count : 0);
    }, 0);
  }
}
