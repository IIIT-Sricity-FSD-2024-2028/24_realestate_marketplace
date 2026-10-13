import { api } from './client.js';

// ── Auth ─────────────────────────────────────────────────────────────
export async function login(email, password) {
  return api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ── Dashboard Overview Stats ──────────────────────────────────────────
export async function getDashboardStats() {
  const [usersRes, propsRes] = await Promise.all([
    api('/users'),
    api('/properties?limit=1'),
  ]);
  const users = usersRes.data || [];
  const activeUsers = users.filter((u) => !u.isBlocked).length;
  const totalProps = (propsRes.data && propsRes.data.total) || 0;

  return {
    totalUsers: users.length,
    activeUsers,
    totalProperties: totalProps,
    systemStatus: 'OK',
  };
}

// ── User Management (Full CRUD) ───────────────────────────────────────
export async function listUsers() {
  return api('/users');
}

export async function createUser(userData) {
  return api('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function updateUser(id, userData) {
  return api('/users/' + id, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
}

export async function deleteUser(id) {
  return api('/users/' + id, {
    method: 'DELETE',
  });
}

export async function setUserBlocked(id, isBlocked) {
  return api('/users/' + id, {
    method: 'PATCH',
    body: JSON.stringify({ isBlocked }),
  });
}

// ── Property Operations ───────────────────────────────────────────────
export async function listProperties(filter = {}) {
  const params = new URLSearchParams();
  if (filter.limit) params.set('limit', String(filter.limit));
  else params.set('limit', '50');
  if (filter.status && filter.status !== 'all') params.set('status', filter.status);

  return api('/properties?' + params.toString());
}

export async function updateProperty(id, propertyData) {
  return api('/properties/' + id, {
    method: 'PATCH',
    body: JSON.stringify(propertyData),
  });
}

export async function deleteProperty(id) {
  return api('/properties/' + id, {
    method: 'DELETE',
  });
}

// ── Revenue Dashboard ────────────────────────────────────────────────
export async function getRevenueReport() {
  return api('/billing/revenue');
}

// ── System Logs ──────────────────────────────────────────────────────
export async function getLogChannels() {
  return api('/logs');
}

export async function getLogEntries(channel, { lines = 100, level = '' } = {}) {
  const query = new URLSearchParams();
  if (lines) query.set('lines', String(lines));
  if (level) query.set('level', level);

  return api(`/logs/${channel}?${query.toString()}`);
}
