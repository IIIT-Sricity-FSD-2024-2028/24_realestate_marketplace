/**
 * constants.js
 * Purpose: Fixed business values the backend also enforces (cities, types,
 *          deal steps, status labels) — kept in one place so every page agrees.
 * Inputs:  none.
 * Outputs: exported constants.
 * API calls: none.
 */

// The four launch cities and their states (mirrors ServiceCity/CITY_STATE on the server).
export const SERVICE_CITY_STATE = {
  Hyderabad: 'Telangana',
  Chennai: 'Tamil Nadu',
  Bangalore: 'Karnataka',
  Kochi: 'Kerala',
};
export const SERVICE_CITIES = Object.keys(SERVICE_CITY_STATE);

// Property types accepted by the API (PropertyType enum).
export const PROPERTY_TYPES = ['apartment', 'villa', 'plot', 'commercial', 'penthouse'];

// Property availability statuses (PropertyStatus enum).
export const PROPERTY_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'under_offer', label: 'Under Offer' },
  { value: 'sold', label: 'Sold' },
  { value: 'rented', label: 'Rented' },
];

// The five deal steps an admin walks a purchase through.
export const DEAL_STEPS = ['Offer Accepted', 'Document Verification', 'Token Payment', 'Full Payment', 'Registration'];

// Seller listing verification → label + badge colour.
export const VERIFICATION_DISPLAY = {
  verified: { label: 'Approved', tone: 'green', key: 'approved' },
  pending: { label: 'Pending', tone: 'orange', key: 'pending' },
  rejected: { label: 'Rejected', tone: 'red', key: 'rejected' },
};

// Time slots offered for a site visit.
export const VISIT_SLOTS = ['9:00 AM', '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'];

// Revenue stream keys → readable names (superuser revenue page).
export const STREAM_LABELS = {
  subscription: 'Seller plans',
  featured_listing: 'Featured listings',
  commission: 'Deal commission',
};

// Fallback photo when a listing has no uploads (same image the old pages used).
export const FALLBACK_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';

// Avatar colours cycled for people lists.
export const AVATAR_COLORS = ['#f97316', '#3b82f6', '#1DB954', '#a855f7', '#ec4899', '#14b8a6'];
