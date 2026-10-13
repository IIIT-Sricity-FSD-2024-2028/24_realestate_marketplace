import { api } from './client.js';

export const sellerApi = {
  // Properties
  getMyListings: () => api('/properties/mine'),
  createProperty: (data) =>
    api('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  uploadPropertyImages: (propertyId, formData) =>
    api(`/properties/${propertyId}/images`, {
      method: 'POST',
      body: formData,
    }),
  uploadPropertyDocuments: (propertyId, formData) =>
    api(`/properties/${propertyId}/documents`, {
      method: 'POST',
      body: formData,
    }),
  deleteProperty: (propertyId) =>
    api(`/properties/${propertyId}`, {
      method: 'DELETE',
    }),

  // Negotiations
  getSellerNegotiations: () => api('/negotiations/seller-queue?limit=100'),
  acceptNegotiation: (id) =>
    api(`/negotiations/${id}/accept`, {
      method: 'PATCH',
    }),
  rejectNegotiation: (id, reason) =>
    api(`/negotiations/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason: reason ? reason.trim() : undefined }),
    }),
  counterNegotiation: (id, counterAmount) =>
    api(`/negotiations/${id}/counter`, {
      method: 'PATCH',
      body: JSON.stringify({ counterAmount: Number(counterAmount) }),
    }),

  // Purchases / Deals
  getSellerPurchases: () => api('/purchases/seller-queue?limit=100'),

  // Password change
  changePassword: (currentPassword, newPassword) =>
    api('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Billing & Subscriptions
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
  cancelBillingOrder: (orderId, reason = 'Cancelled by user') =>
    api('/billing/cancelled', {
      method: 'POST',
      body: JSON.stringify({ orderId, reason }),
    }),
  cancelSubscription: () =>
    api('/billing/subscription/cancel', {
      method: 'PATCH',
    }),

  // Auth
  login: (email, password) =>
    api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, userType: 'seller' }),
    }),
  register: (name, email, password) =>
    api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, userType: 'seller' }),
    }),
  forgotPassword: (email) =>
    api('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, userType: 'seller' }),
    }),
};
