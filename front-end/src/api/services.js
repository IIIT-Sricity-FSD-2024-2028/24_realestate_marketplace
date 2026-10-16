/**
 * services.js
 * Purpose: One named function per backend endpoint, grouped by feature, so
 *          pages never hand-build URLs. Request/response shapes are exactly
 *          what the old static pages sent, so the backend is unchanged.
 * Inputs:  plain values (ids, payload objects, File lists).
 * Outputs: Promises resolving to the backend envelope ({ message, data }).
 * API calls: listed next to each function below.
 */
import { api, sendJson } from './client.js';

/** Turns { a: 1, b: '' } into "?a=1" (empty values are skipped). */
export function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  const text = query.toString();
  return text ? '?' + text : '';
}

/** Packs File objects into the multipart field the upload routes expect. */
function filesForm(files) {
  const form = new FormData();
  Array.from(files || []).forEach((file) => form.append('files', file)); // field name: "files"
  return form;
}

// ── Authentication ──────────────────────────────────────────────────────────
export const authApi = {
  // POST /auth/register — creates a buyer or seller account and returns a JWT.
  register: (payload) => sendJson('/auth/register', 'POST', payload),
  // POST /auth/login — userType picks buyer vs seller when one email owns both.
  login: (payload) => sendJson('/auth/login', 'POST', payload),
  // POST /auth/forgot-password — emails a fresh password to the account.
  forgotPassword: (payload) => sendJson('/auth/forgot-password', 'POST', payload),
  // PATCH /auth/change-password — any signed-in account.
  changePassword: (payload) => sendJson('/auth/change-password', 'PATCH', payload),
  // GET /auth/me — the signed-in account's profile (createdAt, phone, city…).
  me: () => api('/auth/me'),
};

// ── Properties / listings ───────────────────────────────────────────────────
export const propertiesApi = {
  // GET /properties — public catalogue with filters + pagination.
  list: (params) => api('/properties' + toQuery(params)),
  // GET /properties/:id — one listing.
  get: (id) => api('/properties/' + encodeURIComponent(id)),
  // GET /properties/mine — the seller's own submissions (any status).
  mine: () => api('/properties/mine'),
  // GET /properties/review-queue — admin desk (city scoped server-side).
  reviewQueue: (limit = 100) => api('/properties/review-queue' + toQuery({ limit })),
  // POST /properties — seller submits a new listing (starts pending).
  create: (payload) => sendJson('/properties', 'POST', payload),
  // PATCH /properties/:id — admin/superuser/owner edits a listing.
  update: (id, payload) => sendJson('/properties/' + encodeURIComponent(id), 'PATCH', payload),
  // DELETE /properties/:id
  remove: (id) => api('/properties/' + encodeURIComponent(id), { method: 'DELETE' }),
  // PATCH /properties/:id/verify — admin approves.
  verify: (id) => api('/properties/' + encodeURIComponent(id) + '/verify', { method: 'PATCH' }),
  // PATCH /properties/:id/reject — admin rejects with an optional reason.
  reject: (id, reason) => sendJson('/properties/' + encodeURIComponent(id) + '/reject', 'PATCH', { reason: reason || undefined }),
  // POST /properties/:id/images — public buyer-facing photos (multipart).
  uploadImages: (id, files) => api('/properties/' + encodeURIComponent(id) + '/images', { method: 'POST', body: filesForm(files) }),
  // POST /properties/:id/documents — private ownership documents (multipart).
  uploadDocuments: (id, files) => api('/properties/' + encodeURIComponent(id) + '/documents', { method: 'POST', body: filesForm(files) }),
};

// ── Users (admin + superuser) ───────────────────────────────────────────────
export const usersApi = {
  list: () => api('/users'), // GET /users
  create: (payload) => sendJson('/users', 'POST', payload), // POST /users
  update: (id, payload) => sendJson('/users/' + encodeURIComponent(id), 'PATCH', payload), // PATCH /users/:id
  remove: (id) => api('/users/' + encodeURIComponent(id), { method: 'DELETE' }), // DELETE /users/:id
};

// ── Negotiations (offers) ───────────────────────────────────────────────────
const negPath = (id, action) => '/negotiations/' + encodeURIComponent(id) + '/' + action;
export const negotiationsApi = {
  create: (payload) => sendJson('/negotiations', 'POST', payload), // POST /negotiations (buyer offer)
  mine: () => api('/negotiations/mine'), // GET — buyer's own offers
  reviewQueue: (limit = 100) => api('/negotiations/review-queue' + toQuery({ limit })), // GET — admin oversight
  sellerQueue: (limit = 100) => api('/negotiations/seller-queue' + toQuery({ limit })), // GET — offers on my listings
  counter: (id, counterAmount) => sendJson(negPath(id, 'counter'), 'PATCH', { counterAmount }), // seller counters
  accept: (id) => api(negPath(id, 'accept'), { method: 'PATCH' }), // seller accepts → purchase created
  reject: (id, reason) => sendJson(negPath(id, 'reject'), 'PATCH', { reason: reason || undefined }),
  acceptCounter: (id) => api(negPath(id, 'accept-counter'), { method: 'PATCH' }), // buyer accepts counter
  withdraw: (id) => api(negPath(id, 'withdraw'), { method: 'PATCH' }), // buyer withdraws
};

// ── Site visits ─────────────────────────────────────────────────────────────
const visitPath = (id, action) => '/visits/' + encodeURIComponent(id) + '/' + action;
export const visitsApi = {
  create: (payload) => sendJson('/visits', 'POST', payload), // POST /visits (buyer request)
  mine: () => api('/visits/mine'), // GET — buyer's visits
  reviewQueue: (limit = 100) => api('/visits/review-queue' + toQuery({ limit })), // GET — admin queue
  confirm: (id) => api(visitPath(id, 'confirm'), { method: 'PATCH' }),
  reschedule: (id, requestedDate, requestedSlot) => sendJson(visitPath(id, 'reschedule'), 'PATCH', { requestedDate, requestedSlot }),
  complete: (id) => api(visitPath(id, 'complete'), { method: 'PATCH' }),
  cancel: (id) => api(visitPath(id, 'cancel'), { method: 'PATCH' }),
};

// ── Purchases (deal tracking) ───────────────────────────────────────────────
const purchasePath = (id, action) => '/purchases/' + encodeURIComponent(id) + '/' + action;
export const purchasesApi = {
  mine: () => api('/purchases/mine'), // GET — buyer's deals
  reviewQueue: (limit = 100) => api('/purchases/review-queue' + toQuery({ limit })), // GET — admin desk
  sellerQueue: (limit = 100) => api('/purchases/seller-queue' + toQuery({ limit })), // GET — seller's deals
  advance: (id) => api(purchasePath(id, 'advance'), { method: 'PATCH' }), // admin moves to next step
  cancel: (id) => api(purchasePath(id, 'cancel'), { method: 'PATCH' }), // admin cancels
};

// ── Billing / payments ──────────────────────────────────────────────────────
export const billingApi = {
  catalog: () => api('/billing/catalog'), // GET — plans, packs, gateway info
  summary: () => api('/billing/summary'), // GET — my plan, dues, payments
  checkout: (request) => sendJson('/billing/checkout', 'POST', request), // POST — opens an order
  verify: (signature) => sendJson('/billing/verify', 'POST', signature), // POST — confirms payment
  cancelled: (orderId, reason) => sendJson('/billing/cancelled', 'POST', { orderId, reason }), // POST
  demoCheckout: (orderId) => sendJson('/billing/demo-checkout/' + encodeURIComponent(orderId), 'POST', {}), // POST — test gateway
  cancelSubscription: () => api('/billing/subscription/cancel', { method: 'PATCH' }), // PATCH
  revenue: () => api('/billing/revenue'), // GET — superuser revenue report
};

// ── System logs (superuser) ─────────────────────────────────────────────────
export const logsApi = {
  channels: () => api('/logs'), // GET /logs — one summary per channel
  entries: (channel, params) => api('/logs/' + encodeURIComponent(channel) + toQuery(params)), // GET /logs/:channel
};

// ── Health (outside /api/v1) ────────────────────────────────────────────────
export async function fetchHealth() {
  // GET /health — { status: 'ok' | 'degraded', database, uptime }
  const res = await fetch('/health');
  if (!res.ok) throw new Error('Health check failed with status ' + res.status);
  const body = await res.json();
  // The global response interceptor wraps it in { data: {...} }.
  return body && body.data ? body.data : body;
}
