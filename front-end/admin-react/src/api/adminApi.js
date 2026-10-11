import { api } from './client.js';

/**
 * Every backend endpoint the admin portal calls, in one place.
 * These are the exact requests the old admin-login.html / admin-dashboard.html
 * made — same paths, methods, query strings and payloads.
 */

const json = (method, body) => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });

// ── Auth ────────────────────────────────────────────────────────────────
export const login = (email, password) => api('/auth/login', json('POST', { email, password }));
export const forgotPassword = (email) => api('/auth/forgot-password', json('POST', { email }));

// ── Users (User Management) ─────────────────────────────────────────────
export const listUsers = () => api('/users');
export const createUser = (payload) => api('/users', json('POST', payload));
export const setUserBlocked = (id, isBlocked) => api('/users/' + id, json('PATCH', { isBlocked }));
export const deleteUser = (id) => api('/users/' + id, { method: 'DELETE' });

// ── Properties (Manage Listings + Property Verification) ────────────────
export const listProperties = (page, limit, city) =>
  api('/properties?page=' + page + '&limit=' + limit + (city ? '&city=' + encodeURIComponent(city) : ''));
export const getProperty = (id) => api('/properties/' + id);
export const updateProperty = (id, payload) => api('/properties/' + id, json('PATCH', payload));
export const deleteProperty = (id) => api('/properties/' + id, { method: 'DELETE' });
export const getPropertyReviewQueue = () => api('/properties/review-queue?limit=100');
export const verifyProperty = (id) => api('/properties/' + id + '/verify', { method: 'PATCH' });
export const rejectProperty = (id, reason) => api('/properties/' + id + '/reject', json('PATCH', { reason }));

// ── Negotiations (read-only oversight) ──────────────────────────────────
export const getNegotiationQueue = () => api('/negotiations/review-queue?limit=100');

// ── Purchases (Purchase Tracking) ───────────────────────────────────────
export const getPurchaseQueue = () => api('/purchases/review-queue?limit=100');
export const advancePurchase = (id) => api('/purchases/' + id + '/advance', { method: 'PATCH' });
export const cancelPurchase = (id) => api('/purchases/' + id + '/cancel', { method: 'PATCH' });

// ── Visits (Scheduled Visits) ───────────────────────────────────────────
export const getVisitQueue = () => api('/visits/review-queue?limit=100');
export const confirmVisit = (id) => api('/visits/' + id + '/confirm', { method: 'PATCH' });
export const rescheduleVisit = (id, requestedDate, requestedSlot) =>
  api('/visits/' + id + '/reschedule', json('PATCH', { requestedDate, requestedSlot }));
export const completeVisit = (id) => api('/visits/' + id + '/complete', { method: 'PATCH' });
export const cancelVisit = (id) => api('/visits/' + id + '/cancel', { method: 'PATCH' });
