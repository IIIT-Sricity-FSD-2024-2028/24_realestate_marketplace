import { PlanTier, FeaturedTier } from '../enums/billing.enum.js';

/**
 * The platform's rate card — the single source of truth for every rupee
 * truEstate charges.
 *
 * Prices live here, never in the frontend. The checkout endpoint always
 * recomputes the amount from this file using the plan/pack *code* the client
 * sent, so a tampered request body ("plan: gold, amount: 1") cannot buy a
 * ₹2,499 plan for ₹1. The dashboards read the same catalogue over
 * `GET /billing/catalog`, so the price on the card and the price charged can
 * never drift apart.
 *
 * All amounts are whole rupees (INR). The gateway boundary converts to paise.
 */

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  /** Monthly price in ₹. The free tier is 0 and is never charged. */
  pricePerMonth: number;
  /** How many listings this tier may keep live at once. `null` = unlimited. */
  listingQuota: number | null;
  /** Commission discount this tier earns on the seller-side rate, in basis points. */
  commissionDiscountBps: number;
  highlights: string[];
}

export const PLAN_CATALOG: Record<PlanTier, PlanDefinition> = {
  [PlanTier.FREE]: {
    tier: PlanTier.FREE,
    name: 'Starter',
    pricePerMonth: 0,
    listingQuota: 2,
    commissionDiscountBps: 0,
    highlights: [
      'Up to 2 active listings',
      'Standard verification queue',
      'Buyer enquiries & negotiation',
    ],
  },
  [PlanTier.SILVER]: {
    tier: PlanTier.SILVER,
    name: 'Silver',
    pricePerMonth: 999,
    listingQuota: 10,
    commissionDiscountBps: 25, // 0.25% off the seller-side commission
    highlights: [
      'Up to 10 active listings',
      'Priority verification (front of the admin queue)',
      '0.25% off seller commission',
      'Listing performance summary',
    ],
  },
  [PlanTier.GOLD]: {
    tier: PlanTier.GOLD,
    name: 'Gold',
    pricePerMonth: 2499,
    listingQuota: null,
    commissionDiscountBps: 50, // 0.50% off the seller-side commission
    highlights: [
      'Unlimited active listings',
      'Priority verification (front of the admin queue)',
      '0.50% off seller commission',
      'One free 7-day Spotlight every month',
      'Listing performance summary',
    ],
  },
};

export const PLAN_TIERS: PlanTier[] = [PlanTier.FREE, PlanTier.SILVER, PlanTier.GOLD];

/** Billing cycles a seller can buy a plan for, and the discount for committing longer. */
export const BILLING_CYCLES = {
  monthly: { months: 1, label: 'Monthly', discountPct: 0 },
  quarterly: { months: 3, label: 'Quarterly', discountPct: 10 },
  yearly: { months: 12, label: 'Yearly', discountPct: 20 },
} as const;

export type BillingCycle = keyof typeof BILLING_CYCLES;

/** Price of `tier` for one `cycle`, with the long-commitment discount applied. */
export function planPrice(tier: PlanTier, cycle: BillingCycle): number {
  const { months, discountPct } = BILLING_CYCLES[cycle];
  const gross = PLAN_CATALOG[tier].pricePerMonth * months;
  return Math.round(gross * (1 - discountPct / 100));
}

export interface FeaturedPack {
  tier: FeaturedTier;
  name: string;
  price: number;
  days: number;
  /** Higher wins when two featured listings compete for the top of search. */
  rank: number;
  highlights: string[];
}

export const FEATURED_PACKS: Record<FeaturedTier, FeaturedPack> = {
  [FeaturedTier.SPOTLIGHT]: {
    tier: FeaturedTier.SPOTLIGHT,
    name: 'Spotlight',
    price: 499,
    days: 7,
    rank: 1,
    highlights: ['Top of buyer search for 7 days', '"Featured" badge on the listing card'],
  },
  [FeaturedTier.PREMIUM]: {
    tier: FeaturedTier.PREMIUM,
    name: 'Premium',
    price: 1299,
    days: 30,
    rank: 2,
    highlights: [
      'Top of buyer search for 30 days',
      '"Premium" badge on the listing card',
      'Ranked above Spotlight listings',
    ],
  },
};

export const FEATURED_TIERS: FeaturedTier[] = [FeaturedTier.SPOTLIGHT, FeaturedTier.PREMIUM];

/**
 * Commission, in basis points of the agreed price (100 bps = 1%).
 *
 * Charged only when a purchase actually completes — truEstate never bills for
 * a deal that fell through. The seller-side rate is reduced by the seller's
 * plan discount, which is the whole reason a Gold plan pays for itself on a
 * single sale.
 */
export const COMMISSION_BPS = {
  /** Sale: 2% from the seller, 1% from the buyer. */
  sale: { seller: 200, buyer: 100 },
  /** Rent: charged on the *annual* rent, not the monthly figure stored on the listing. */
  rent: { seller: 300, buyer: 200 },
} as const;

/** GST charged on platform fees and commission, in percent. */
export const GST_PERCENT = 18;

/** Adds GST and returns the rounded rupee total. */
export function withGst(amount: number): number {
  return Math.round(amount * (1 + GST_PERCENT / 100));
}

/** The GST component of a base amount, rounded to rupees. */
export function gstOn(amount: number): number {
  return Math.round(amount * (GST_PERCENT / 100));
}

/** Basis points of an amount, rounded to whole rupees. */
export function bpsOf(amount: number, bps: number): number {
  return Math.round((amount * bps) / 10_000);
}
