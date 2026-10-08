import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { CheckoutDto } from './dto/checkout.dto.js';
import { BillingSummaryDto, CatalogResponseDto, RevenueReportDto } from './dto/billing-response.dto.js';
import { PaymentsService } from '../payments/payments.service.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';
import { CommissionsService } from '../commissions/commissions.service.js';
import { PropertiesService } from '../properties/properties.service.js';
import { CheckoutOrderDto, PaymentResponseDto } from '../payments/dto/payment-response.dto.js';
import { VerifyPaymentDto } from '../payments/dto/create-payment.dto.js';
import {
  BILLING_CYCLES,
  COMMISSION_BPS,
  FEATURED_PACKS,
  FEATURED_TIERS,
  GST_PERCENT,
  PLAN_CATALOG,
  PLAN_TIERS,
  gstOn,
  planPrice,
  type BillingCycle,
} from '../../shared/constants/pricing.js';
import {
  CommissionStatus,
  FeaturedTier,
  PaymentPurpose,
  PaymentStatus,
  PlanTier,
} from '../../shared/enums/billing.enum.js';
import { UserType } from '../users/schemas/user.schema.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import type { PaymentDocument } from '../payments/schemas/payment.schema.js';

/** A server-computed price. The client never supplies any part of this. */
interface Quote {
  baseAmount: number;
  taxAmount: number;
  description: string;
  metadata: Record<string, unknown>;
}

/**
 * The revenue orchestrator.
 *
 * PaymentsService knows how to take money but not what anything costs;
 * SubscriptionsService, CommissionsService and PropertiesService know what
 * they sell but nothing about payment. This service is the only place the
 * two halves meet, which is what keeps the dependency graph acyclic.
 *
 * Two rules hold for every purchase that passes through here:
 *   1. The price is computed from the rate card, never read from the request.
 *   2. Nothing is granted until a gateway signature has been verified.
 */
@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly commissionsService: CommissionsService,
    private readonly propertiesService: PropertiesService,
  ) {}

  catalog(): CatalogResponseDto {
    return {
      plans: PLAN_TIERS.map((tier) => {
        const plan = PLAN_CATALOG[tier];
        return {
          ...plan,
          // Every cycle priced up-front, so the plan cards can show
          // "₹2,249/mo billed yearly" without doing arithmetic client-side.
          pricing: Object.fromEntries(
            (Object.keys(BILLING_CYCLES) as BillingCycle[]).map((cycle) => {
              const base = planPrice(tier, cycle);
              return [cycle, { base, tax: gstOn(base), total: base + gstOn(base) }];
            }),
          ),
        };
      }),
      cycles: Object.entries(BILLING_CYCLES).map(([key, value]) => ({ key, ...value })),
      featuredPacks: FEATURED_TIERS.map((tier) => {
        const pack = FEATURED_PACKS[tier];
        return { ...pack, tax: gstOn(pack.price), total: pack.price + gstOn(pack.price) };
      }),
      commission: COMMISSION_BPS,
      gstPercent: GST_PERCENT,
      gateway: this.paymentsService.gatewayName,
      isLive: this.paymentsService.isLive,
    };
  }

  private assertSeller(user: AuthenticatedUser): void {
    if (user.userType !== UserType.SELLER) {
      throw new ForbiddenException('Only seller accounts can buy listing plans and promotions');
    }
  }

  /**
   * Prices a purchase from the rate card.
   *
   * The single choke point where money is decided. Every branch reads its
   * amount from shared/constants/pricing.ts (or, for commission, from the
   * already-accrued invoice) — never from the request body.
   */
  private async quote(dto: CheckoutDto, user: AuthenticatedUser): Promise<Quote> {
    switch (dto.purpose) {
      case PaymentPurpose.SUBSCRIPTION: {
        this.assertSeller(user);
        if (!dto.tier || !dto.cycle) {
          throw new BadRequestException('A plan tier and billing cycle are required');
        }
        if (dto.tier === PlanTier.FREE) {
          throw new BadRequestException('The Starter plan is free — there is nothing to pay for.');
        }
        const base = planPrice(dto.tier, dto.cycle);
        const plan = PLAN_CATALOG[dto.tier];
        return {
          baseAmount: base,
          taxAmount: gstOn(base),
          description: `${plan.name} plan — ${BILLING_CYCLES[dto.cycle].label.toLowerCase()}`,
          metadata: { tier: dto.tier, cycle: dto.cycle, months: BILLING_CYCLES[dto.cycle].months },
        };
      }

      case PaymentPurpose.FEATURED_LISTING: {
        this.assertSeller(user);
        if (!dto.propertyId || !dto.pack) {
          throw new BadRequestException('A property and a promotion pack are required');
        }
        // Ownership is checked *before* taking money, not after — nobody
        // should be able to pay for a promotion that then cannot be applied.
        const owned = await this.propertiesService.promotableForSeller(user.id);
        const property = owned.find((p) => p.id === dto.propertyId);
        if (!property) {
          throw new ForbiddenException('You can only promote your own active listings');
        }
        const pack = FEATURED_PACKS[dto.pack];
        return {
          baseAmount: pack.price,
          taxAmount: gstOn(pack.price),
          description: `${pack.name} promotion (${pack.days} days) — ${property.title}`,
          metadata: {
            propertyId: dto.propertyId,
            pack: dto.pack,
            days: pack.days,
            propertyTitle: property.title,
          },
        };
      }

      case PaymentPurpose.COMMISSION: {
        if (!dto.commissionId) {
          throw new BadRequestException('A commission invoice ID is required');
        }
        // loadPayable enforces both ownership and that the line is still open.
        const commission = await this.commissionsService.loadPayable(dto.commissionId, user.id);
        return {
          baseAmount: commission.baseAmount,
          taxAmount: commission.taxAmount,
          description: `Platform commission (${(commission.rateBps / 100).toFixed(2)}% ${commission.side}-side)`,
          metadata: {
            commissionId: dto.commissionId,
            side: commission.side,
            purchaseId: commission.purchaseId.toString(),
          },
        };
      }

      default:
        throw new BadRequestException('Unsupported payment purpose');
    }
  }

  /** Prices the purchase and opens a gateway order for it. */
  async checkout(dto: CheckoutDto, user: AuthenticatedUser): Promise<CheckoutOrderDto> {
    const quote = await this.quote(dto, user);
    const { checkout } = await this.paymentsService.openOrder({
      userId: user.id,
      purpose: dto.purpose,
      baseAmount: quote.baseAmount,
      taxAmount: quote.taxAmount,
      description: quote.description,
      metadata: quote.metadata,
    });
    return checkout;
  }

  /**
   * Verifies the checkout signature and then — and only then — grants what
   * was bought.
   *
   * Fulfilment is driven off the payment's own `metadata`, recorded when the
   * order was opened, rather than off anything the client sends back here.
   * So even a perfectly-signed response cannot redirect a ₹499 Spotlight
   * payment into activating a Gold plan.
   */
  async verify(dto: VerifyPaymentDto, user: AuthenticatedUser): Promise<{
    payment: PaymentResponseDto;
    unlocked: string;
  }> {
    const payment = await this.paymentsService.verifyAndCapture(dto, user.id);
    const unlocked = await this.fulfil(payment, user);
    return { payment: this.paymentsService.toResponse(payment), unlocked };
  }

  private async fulfil(payment: PaymentDocument, user: AuthenticatedUser): Promise<string> {
    const meta = payment.metadata ?? {};
    switch (payment.purpose) {
      case PaymentPurpose.SUBSCRIPTION: {
        const subscription = await this.subscriptionsService.activate(
          user.id,
          meta.tier as PlanTier,
          meta.cycle as BillingCycle,
          payment.amount,
          payment._id.toString(),
        );
        const plan = PLAN_CATALOG[subscription.tier];
        const quota = plan.listingQuota === null ? 'unlimited' : `${plan.listingQuota}`;
        return `${plan.name} plan active — ${quota} listings, valid until ${subscription.expiresAt.toDateString()}`;
      }

      case PaymentPurpose.FEATURED_LISTING: {
        const property = await this.propertiesService.applyFeature(
          meta.propertyId as string,
          meta.pack as FeaturedTier,
          user.id,
        );
        return `"${property.title}" is now featured at the top of buyer search`;
      }

      case PaymentPurpose.COMMISSION: {
        const commission = await this.commissionsService.settle(
          meta.commissionId as string,
          payment._id.toString(),
        );
        return `Commission invoice settled — ₹${commission.amount.toLocaleString('en-IN')}`;
      }

      default:
        // Unreachable while every purpose is handled above, but a payment
        // must never be silently captured with nothing granted.
        this.logger.error(`No fulfilment handler for purpose "${String(payment.purpose)}"`);
        throw new BadRequestException('This payment could not be applied. Contact support.');
    }
  }

  /** One call that fills the whole Billing page for a buyer or a seller. */
  async summary(user: AuthenticatedUser): Promise<BillingSummaryDto> {
    const [commissions, payments] = await Promise.all([
      this.commissionsService.findByParty(user.id),
      this.paymentsService.findByUser(user.id),
    ]);

    const amountDue = commissions
      .filter((c) => c.status === CommissionStatus.ACCRUED)
      .reduce((sum, c) => sum + c.amount, 0);
    const lifetimeSpend = payments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + p.amount, 0);

    const summary: BillingSummaryDto = { commissions, amountDue, lifetimeSpend, payments };

    if (user.userType === UserType.SELLER) {
      // `listingsUsed` comes from the very method create() enforces against,
      // never recomputed here — a dashboard that counts differently from the
      // server is how you end up with a banner saying "1 of 2 used" next to a
      // rejected submission. `listings` is a separate, narrower query: only
      // an open listing can be promoted, so a sold one is excluded there even
      // though it still occupies a plan slot.
      const [plan, used, listings] = await Promise.all([
        this.subscriptionsService.activePlan(user.id),
        this.propertiesService.countListingsForQuota(user.id),
        this.propertiesService.promotableForSeller(user.id),
      ]);
      summary.plan = this.subscriptionsService.toResponse(plan, used);
      summary.listings = listings;
    }

    return summary;
  }

  async cancelSubscription(user: AuthenticatedUser) {
    this.assertSeller(user);
    const plan = await this.subscriptionsService.cancel(user.id);
    const listings = await this.propertiesService.promotableForSeller(user.id);
    return this.subscriptionsService.toResponse(plan, listings.length);
  }

  /**
   * The superuser revenue report.
   *
   * Draws the line the business actually cares about: `totalCollected` is
   * money in the bank (verified payments only), while `receivable` is
   * commission the platform has earned on closed deals but not yet been paid.
   */
  async revenueReport(): Promise<RevenueReportDto> {
    const [byStream, monthly, commissionTotals, byCity, subscriptions, mrr, funnel, recentPayments] =
      await Promise.all([
        this.paymentsService.totalsByPurpose(),
        this.paymentsService.monthlyTotals(6),
        this.commissionsService.totals(),
        this.commissionsService.totalsByCity(),
        this.subscriptionsService.activeCountsByTier(),
        this.subscriptionsService.monthlyRecurringRevenue(),
        this.paymentsService.statusCounts(),
        this.paymentsService.findAll(12),
      ]);

    const totalCollected = Object.values(byStream).reduce((sum, s) => sum + s.amount, 0);

    return {
      totalCollected,
      receivable: commissionTotals[CommissionStatus.ACCRUED]?.amount ?? 0,
      mrr,
      waived: commissionTotals[CommissionStatus.WAIVED]?.amount ?? 0,
      byStream,
      monthly,
      byCity,
      subscriptions,
      checkoutFunnel: {
        created: funnel[PaymentStatus.CREATED] ?? 0,
        paid: funnel[PaymentStatus.PAID] ?? 0,
        failed: funnel[PaymentStatus.FAILED] ?? 0,
      },
      recentPayments,
    };
  }
}
