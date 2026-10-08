export enum PropertyType {
  APARTMENT = 'apartment',
  VILLA = 'villa',
  PLOT = 'plot',
  COMMERCIAL = 'commercial',
  PENTHOUSE = 'penthouse',
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  RENTED = 'rented',
  UNDER_OFFER = 'under_offer',
}

export enum ListingType {
  SALE = 'sale',
  RENT = 'rent',
}

/**
 * Moderation state for a listing. Admin/superuser-created listings are
 * auto-VERIFIED; seller-submitted listings start PENDING and only appear in
 * public search results once an admin/superuser verifies them.
 */
export enum PropertyVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}
