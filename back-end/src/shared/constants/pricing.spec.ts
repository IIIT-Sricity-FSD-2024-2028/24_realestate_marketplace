import {
  BILLING_CYCLES,
  COMMISSION_BPS,
  FEATURED_PACKS,
  GST_PERCENT,
  PLAN_CATALOG,
  bpsOf,
  gstOn,
  planPrice,
  withGst,
} from './pricing.js';
import { FeaturedTier, PlanTier } from '../enums/billing.enum.js';

describe('pricing rate card', () => {
  describe('planPrice', () => {
    it('charges the plain monthly rate with no discount', () => {
      expect(planPrice(PlanTier.SILVER, 'monthly')).toBe(999);
      expect(planPrice(PlanTier.GOLD, 'monthly')).toBe(2499);
    });

    it('applies the commitment discount on longer cycles', () => {
      // 999 * 3 = 2997, less 10% = 2697.3 -> 2697
      expect(planPrice(PlanTier.SILVER, 'quarterly')).toBe(2697);
      // 2499 * 12 = 29988, less 20% = 23990.4 -> 23990
      expect(planPrice(PlanTier.GOLD, 'yearly')).toBe(23990);
    });

    it('makes a longer commitment cheaper per month, never dearer', () => {
      for (const tier of [PlanTier.SILVER, PlanTier.GOLD]) {
        const perMonth = (cycle: keyof typeof BILLING_CYCLES) =>
          planPrice(tier, cycle) / BILLING_CYCLES[cycle].months;
        expect(perMonth('quarterly')).toBeLessThan(perMonth('monthly'));
        expect(perMonth('yearly')).toBeLessThan(perMonth('quarterly'));
      }
    });

    it('prices the free tier at zero on every cycle', () => {
      for (const cycle of Object.keys(BILLING_CYCLES) as (keyof typeof BILLING_CYCLES)[]) {
        expect(planPrice(PlanTier.FREE, cycle)).toBe(0);
      }
    });
  });

  describe('tax helpers', () => {
    it('computes GST at the configured rate', () => {
      expect(GST_PERCENT).toBe(18);
      expect(gstOn(1000)).toBe(180);
      expect(withGst(1000)).toBe(1180);
    });

    it('rounds to whole rupees rather than carrying paise', () => {
      expect(gstOn(499)).toBe(90); // 89.82
      expect(Number.isInteger(gstOn(1299))).toBe(true);
    });

    it('leaves a zero amount at zero', () => {
      expect(gstOn(0)).toBe(0);
      expect(withGst(0)).toBe(0);
    });
  });

  describe('bpsOf', () => {
    it('treats 100 bps as one percent', () => {
      expect(bpsOf(1_000_000, 100)).toBe(10_000);
      expect(bpsOf(8_500_000, 200)).toBe(170_000);
    });

    it('handles the discounted seller rate', () => {
      // 2.00% base less the 0.50% Gold discount = 1.50%
      const rate = COMMISSION_BPS.sale.seller - PLAN_CATALOG[PlanTier.GOLD].commissionDiscountBps;
      expect(rate).toBe(150);
      expect(bpsOf(7_000_000, rate)).toBe(105_000);
    });

    it('never lets a plan discount exceed the base rate', () => {
      for (const tier of Object.values(PlanTier)) {
        expect(PLAN_CATALOG[tier].commissionDiscountBps).toBeLessThan(COMMISSION_BPS.sale.seller);
        expect(PLAN_CATALOG[tier].commissionDiscountBps).toBeLessThan(COMMISSION_BPS.rent.seller);
      }
    });
  });

  describe('catalogue integrity', () => {
    it('gives a higher tier at least as much quota as a lower one', () => {
      const free = PLAN_CATALOG[PlanTier.FREE].listingQuota;
      const silver = PLAN_CATALOG[PlanTier.SILVER].listingQuota;
      expect(free).not.toBeNull();
      expect(silver).not.toBeNull();
      expect(silver as number).toBeGreaterThan(free as number);
      // Gold is unlimited, represented as null rather than a large number.
      expect(PLAN_CATALOG[PlanTier.GOLD].listingQuota).toBeNull();
    });

    it('ranks the longer promotion above the shorter one', () => {
      const spotlight = FEATURED_PACKS[FeaturedTier.SPOTLIGHT];
      const premium = FEATURED_PACKS[FeaturedTier.PREMIUM];
      expect(premium.rank).toBeGreaterThan(spotlight.rank);
      expect(premium.days).toBeGreaterThan(spotlight.days);
      expect(premium.price).toBeGreaterThan(spotlight.price);
    });

    it('charges more on a rental than on a sale, since the base is smaller', () => {
      expect(COMMISSION_BPS.rent.seller).toBeGreaterThan(COMMISSION_BPS.sale.seller);
      expect(COMMISSION_BPS.rent.buyer).toBeGreaterThan(COMMISSION_BPS.sale.buyer);
    });
  });
});
