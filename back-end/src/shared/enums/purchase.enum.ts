export enum DealStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/** The 5 fixed steps a purchase moves through, in order. `dealStep` is 1-indexed into this array. */
export const DEAL_STEPS = [
  'Offer Accepted',
  'Document Verification',
  'Token Payment',
  'Full Payment',
  'Registration',
] as const;
