/**
 * SuperuserOverview.jsx
 * Purpose: "Super Admin Overview" — global counts and platform health.
 * Inputs:  none.
 * Outputs: four stat cards (all real numbers).
 * API calls: GET /users, GET /properties?limit=1 (for the total), GET /health
 */
import { useEffect, useState } from 'react';
import { PageHeader, StatCard, StatusLine } from '../../../components/common/ui.jsx';
import { fetchHealth, propertiesApi, usersApi } from '../../../api/services.js';

export default function SuperuserOverview() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([usersApi.list(), propertiesApi.list({ limit: 1 })])
      .then(([users, props]) => {
        if (!alive) return;
        setStats({
          totalUsers: users.data.length,
          activeUsers: users.data.filter((u) => !u.isBlocked).length, // not blocked
          totalProperties: props.data.total,
        });
      })
      .catch((err) => alive && setError(err.message || 'Failed to load dashboard stats'));
    // /health reports whether MongoDB is connected.
    fetchHealth()
      .then((h) => alive && setHealth(h))
      .catch(() => alive && setHealth({ status: 'unreachable' }));
    return () => {
      alive = false;
    };
  }, []);

  const healthy = health && health.status === 'ok';
  return (
    <>
      <PageHeader title="Super Admin Overview" subtitle="Global statistics and platform health metrics." />
      <div className="content">
        <StatusLine error={error} />
        <div className="stats-grid">
          <StatCard label="Total Users" value={stats ? stats.totalUsers : '…'} icon="users" />
          <StatCard label="Total Properties" value={stats ? stats.totalProperties : '…'} icon="home" tone="blue" />
          <StatCard label="Active Users (not blocked)" value={stats ? stats.activeUsers : '…'} icon="calendar" tone="yellow" />
          <StatCard
            label={health && health.database ? 'System Status · database ' + health.database : 'System Status'}
            value={health ? (healthy ? 'OK' : String(health.status).toUpperCase()) : '…'}
            icon="shield"
            tone={healthy ? 'green' : 'red'}
          />
        </div>
      </div>
    </>
  );
}
