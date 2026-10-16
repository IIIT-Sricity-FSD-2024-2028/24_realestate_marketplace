/**
 * AdminProfileSection.jsx
 * Purpose: Admin "Profile" — read-only account details with real desk
 *          statistics. Admins cannot edit their own profile; only a superuser
 *          can change an admin's details.
 * Inputs (props): desk – shared queues (for the stats)
 *                 profile – { profile } from useAdminProfile()
 * Outputs: header card + read-only details.
 * API calls: GET /auth/me (inside useAdminProfile).
 */
import { useEffect, useState } from 'react';
import { authApi } from '../../../api/services.js';
import { Avatar, Badge, Card, PageHeader } from '../../../components/common/ui.jsx';
import { getUser } from '../../../auth/session.js';
import { monthYear } from '../../../utils/format.js';
import { groupBuyers, groupSellers } from '../useAdminDesk.js';

/** Hook: the admin's profile, read from the real account (not editable). */
export function useAdminProfile() {
  const [profile, setProfile] = useState(() => {
    const user = getUser() || {};
    return { name: user.name || '', email: user.email || '', location: user.city || '' };
  });

  // GET /auth/me — phone, city and member-since come from the server.
  useEffect(() => {
    let alive = true;
    authApi
      .me()
      .then((res) => {
        const me = res.data || {};
        if (!alive) return;
        setProfile((p) => ({
          name: me.name || p.name,
          email: me.email || p.email,
          phone: me.phone || '',
          location: me.city || p.location,
          state: me.state || '',
          createdAt: me.createdAt,
        }));
      })
      .catch(() => {
        /* fall back to the session details */
      });
    return () => {
      alive = false;
    };
  }, []);

  return { profile };
}

export default function AdminProfileSection({ desk, profile: { profile } }) {
  // Real statistics for this desk.
  const stats = [
    { label: 'Current Buyers', value: groupBuyers(desk.negotiations, desk.visits, desk.purchases).length, cls: 'text-brand' },
    { label: 'Current Sellers', value: groupSellers(desk.listings).size, cls: 'text-orange' },
    { label: 'Active Deals', value: desk.purchases.filter((p) => p.dealStatus === 'in_progress').length, cls: 'text-info' },
    { label: 'Deals Closed', value: desk.purchases.filter((p) => p.dealStatus === 'completed').length, cls: 'text-brand' },
    { label: 'Listings Verified', value: desk.listings.filter((l) => l.verificationStatus === 'verified').length, cls: 'text-warning' },
    { label: 'Visits Completed', value: desk.visits.filter((v) => v.status === 'completed').length, cls: 'text-brand' },
  ];

  const details = [
    { label: 'Full Name', value: profile.name },
    { label: 'Email', value: profile.email },
    { label: 'Phone', value: profile.phone },
    { label: 'City', value: profile.location },
    { label: 'State', value: profile.state },
    { label: 'Member Since', value: profile.createdAt ? monthYear(profile.createdAt) : '' },
  ];

  return (
    <>
      <PageHeader title="Profile" subtitle="Your admin account & performance overview" />
      <div className="content">
        <Card>
          <div className="profile-head">
            <Avatar name={profile.name || 'Admin User'} size="xl" color="var(--brand)" textColor="#000" />
            <div className="grow">
              <h2 className="profile-name">{profile.name || 'Admin User'}</h2>
              <p className="text-secondary small">{profile.email}</p>
              <p className="text-secondary small">
                {profile.phone || '—'} • {profile.location || '—'}
              </p>
            </div>
            <Badge tone="green">⭐ Active Admin</Badge>
          </div>
          <div className="mini-stats">
            {stats.map((s) => (
              <div key={s.label} className="mini-stat">
                <div className={'mini-stat-value ' + s.cls}>{s.value}</div>
                <div className="mini-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="divider-top">
            <div className="form-grid-2">
              {details.map((d) => (
                <div key={d.label}>
                  <div className="text-secondary small">{d.label}</div>
                  <div className="strong">{d.value || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
