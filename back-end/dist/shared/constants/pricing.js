"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GST_PERCENT = exports.COMMISSION_BPS = exports.FEATURED_TIERS = exports.FEATURED_PACKS = exports.BILLING_CYCLES = exports.PLAN_TIERS = exports.PLAN_CATALOG = void 0;
exports.planPrice = planPrice;
exports.withGst = withGst;
exports.gstOn = gstOn;
exports.bpsOf = bpsOf;
const billing_enum_js_1 = require("../enums/billing.enum.js");
exports.PLAN_CATALOG = {
    [billing_enum_js_1.PlanTier.FREE]: {
        tier: billing_enum_js_1.PlanTier.FREE,
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
    [billing_enum_js_1.PlanTier.SILVER]: {
        tier: billing_enum_js_1.PlanTier.SILVER,
        name: 'Silver',
        pricePerMonth: 999,
        listingQuota: 10,
        commissionDiscountBps: 25,
        highlights: [
            'Up to 10 active listings',
            'Priority verification (front of the admin queue)',
            '0.25% off seller commission',
            'Listing performance summary',
        ],
    },
    [billing_enum_js_1.PlanTier.GOLD]: {
        tier: billing_enum_js_1.PlanTier.GOLD,
        name: 'Gold',
        pricePerMonth: 2499,
        listingQuota: null,
        commissionDiscountBps: 50,
        highlights: [
            'Unlimited active listings',
            'Priority verification (front of the admin queue)',
            '0.50% off seller commission',
            'One free 7-day Spotlight every month',
            'Listing performance summary',
        ],
    },
};
exports.PLAN_TIERS = [billing_enum_js_1.PlanTier.FREE, billing_enum_js_1.PlanTier.SILVER, billing_enum_js_1.PlanTier.GOLD];
exports.BILLING_CYCLES = {
    monthly: { months: 1, label: 'Monthly', discountPct: 0 },
    quarterly: { months: 3, label: 'Quarterly', discountPct: 10 },
    yearly: { months: 12, label: 'Yearly', discountPct: 20 },
};
function planPrice(tier, cycle) {
    const { months, discountPct } = exports.BILLING_CYCLES[cycle];
    const gross = exports.PLAN_CATALOG[tier].pricePerMonth * months;
    return Math.round(gross * (1 - discountPct / 100));
}
exports.FEATURED_PACKS = {
    [billing_enum_js_1.FeaturedTier.SPOTLIGHT]: {
        tier: billing_enum_js_1.FeaturedTier.SPOTLIGHT,
        name: 'Spotlight',
        price: 499,
        days: 7,
        rank: 1,
        highlights: ['Top of buyer search for 7 days', '"Featured" badge on the listing card'],
    },
    [billing_enum_js_1.FeaturedTier.PREMIUM]: {
        tier: billing_enum_js_1.FeaturedTier.PREMIUM,
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
exports.FEATURED_TIERS = [billing_enum_js_1.FeaturedTier.SPOTLIGHT, billing_enum_js_1.FeaturedTier.PREMIUM];
exports.COMMISSION_BPS = {
    sale: { seller: 200, buyer: 100 },
    rent: { seller: 300, buyer: 200 },
};
exports.GST_PERCENT = 18;
function withGst(amount) {
    return Math.round(amount * (1 + exports.GST_PERCENT / 100));
}
function gstOn(amount) {
    return Math.round(amount * (exports.GST_PERCENT / 100));
}
function bpsOf(amount, bps) {
    return Math.round((amount * bps) / 10_000);
}
//# sourceMappingURL=pricing.js.map