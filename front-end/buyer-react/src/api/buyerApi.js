import { api } from './client.js';

export const buyerApi = {
  // ── Properties ──
  getProperties: (page = 1, limit = 50) =>
    api(`/properties?limit=${limit}&page=${page}`),

  fetchEveryListing: async () => {
    const all = [];
    let page = 1;
    const MAX_PAGES = 20;
    while (page <= MAX_PAGES) {
      const res = await api(`/properties?limit=50&page=${page}`);
      const data = res.data || {};
      const items = data.items || [];
      all.push(...items);
      const totalPages = data.totalPages || 1;
      if (page >= totalPages || items.length === 0) break;
      page++;
    }
    return all;
  },

  getPropertyById: (id) => api(`/properties/${id}`),

  // ── Negotiations (Offers) ──
  getMineNegotiations: () => api('/negotiations/mine'),
  createOffer: (propertyId, offerAmount, message, paymentMode = 'Cash') =>
    api('/negotiations', {
      method: 'POST',
      body: JSON.stringify({
        propertyId,
        offerAmount: Number(offerAmount),
        message: message ? message.trim() : undefined,
        paymentMode,
      }),
    }),
  acceptCounterOffer: (negotiationId) =>
    api(`/negotiations/${negotiationId}/accept-counter`, {
      method: 'PATCH',
    }),
  withdrawOffer: (negotiationId) =>
    api(`/negotiations/${negotiationId}/withdraw`, {
      method: 'PATCH',
    }),

  // ── Purchases (Deal progression) ──
  getMinePurchases: () => api('/purchases/mine'),

  // ── Site Visits ──
  getMineVisits: () => api('/visits/mine'),
  requestVisit: (propertyId, requestedDate, requestedSlot, message) =>
    api('/visits', {
      method: 'POST',
      body: JSON.stringify({
        propertyId,
        requestedDate,
        requestedSlot,
        message: message ? message.trim() : undefined,
      }),
    }),
  cancelVisit: (visitId, reason) =>
    api(`/visits/${visitId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason: reason || 'Cancelled by buyer' }),
    }),

  // ── Billing, Invoices & Commissions ──
  getBillingCatalog: () => api('/billing/catalog'),
  getBillingSummary: () => api('/billing/summary'),
  checkoutBilling: (request) =>
    api('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
  verifyBilling: (signature) =>
    api('/billing/verify', {
      method: 'POST',
      body: JSON.stringify(signature),
    }),
  demoCheckout: (orderId) =>
    api(`/billing/demo-checkout/${encodeURIComponent(orderId)}`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  cancelBillingOrder: (orderId, reason = 'Cancelled by user') =>
    api('/billing/cancelled', {
      method: 'POST',
      body: JSON.stringify({ orderId, reason }),
    }),

  // ── Auth ──
  login: (email, password) =>
    api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, userType: 'buyer' }),
    }),
  register: (name, email, password) =>
    api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, userType: 'buyer' }),
    }),
  forgotPassword: (email) =>
    api('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, userType: 'buyer' }),
    }),
  changePassword: (currentPassword, newPassword) =>
    api('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};
