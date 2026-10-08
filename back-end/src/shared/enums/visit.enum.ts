/**
 * Site-visit lifecycle — strictly buyer ↔ admin (any admin conducts the
 * visit, not the seller):
 *   PENDING (buyer requests) → CONFIRMED (admin confirms)
 *                            ↘ RESCHEDULED (admin proposes a new date/slot)
 *                            ↘ CANCELLED (buyer or admin)
 *   CONFIRMED/RESCHEDULED → COMPLETED (admin marks the visit done)
 */
export enum VisitStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  RESCHEDULED = 'rescheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
