/**
 * Negotiation lifecycle (strictly buyer-seller — admins don't negotiate):
 *   PENDING (buyer offers) → COUNTERED (seller counters) → ACCEPTED (either
 *   side accepts the amount on the table → auto-creates a Purchase)
 *                                                        ↘ REJECTED (seller)
 *   PENDING/COUNTERED → WITHDRAWN (buyer)
 */
export enum NegotiationStatus {
  PENDING = 'pending',
  COUNTERED = 'countered',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}
