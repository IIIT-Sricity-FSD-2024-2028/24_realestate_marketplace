/**
 * Every enum the revenue side of the platform runs on.
 *
 * truEstate earns from three distinct streams, and each one is represented
 * here so a payment row can always be traced back to *why* it was charged:
 *
 *   1. Subscriptions   — sellers pay monthly to keep listings live (recurring)
 *   2. Featured slots  — sellers pay per listing to sit at the top of search
 *   3. Commission      — a % of the agreed price when a deal actually closes
 */

/** Seller listing plans. The tier a seller holds decides their listing quota. */
export enum PlanTier {
  FREE = 'free',
  SILVER = 'silver',
  GOLD = 'gold',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

/** Paid promotion packs a seller can buy for a single listing. */
export enum FeaturedTier {
  SPOTLIGHT = 'spotlight',
  PREMIUM = 'premium',
}

/**
 * What a payment was *for*. Every charge on the platform is one of these —
 * there is no untyped payment, which is what makes the revenue report
 * breakdown possible without guessing.
 */
export enum PaymentPurpose {
  SUBSCRIPTION = 'subscription',
  FEATURED_LISTING = 'featured_listing',
  COMMISSION = 'commission',
}

/**
 * Payment lifecycle, mirroring a real gateway's:
 * CREATED (order placed, money not moved) -> PAID (signature verified)
 * or FAILED. Nothing is ever marked PAID without a verified signature.
 */
export enum PaymentStatus {
  CREATED = 'created',
  PAID = 'paid',
  FAILED = 'failed',
}

/** Which side of a closed deal a commission line belongs to. */
export enum CommissionSide {
  BUYER = 'buyer',
  SELLER = 'seller',
}

/**
 * Commission lifecycle. A line is ACCRUED the instant a deal completes (this
 * is revenue the platform has *earned*), becomes PAID once the party settles
 * it through the gateway, and can be WAIVED by a superuser.
 */
export enum CommissionStatus {
  ACCRUED = 'accrued',
  PAID = 'paid',
  WAIVED = 'waived',
}
