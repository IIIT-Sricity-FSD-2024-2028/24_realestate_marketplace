/**
 * SuperuserOverview.jsx
 * Purpose: "Super Admin Overview" — global counts and platform health.
 * Inputs:  Redux store (overviewSlice).
 * Outputs: four stat cards (all real numbers).
 * API calls (via Redux thunks): GET /users, GET /properties?limit=1, GET /health
 */
import { useEffect } from 'react';
import { PageHeader, StatCard, StatusLine } from '../../../components/common/ui.jsx';
import { useAppDispatch, useAppSelector } from '../../../store/index.js';
import {
  fetchOverview,
  fetchOverviewHealth,
  selectOverviewError,
  selectOverviewHealth,
  selectOverviewStats,
  selectOverviewStatus,
} from '../../../store/slices/overviewSlice.js';

export default function SuperuserOverview() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectOverviewStats);
  const health = useAppSelector(selectOverviewHealth);
  const status = useAppSelector(selectOverviewStatus);
  const error = useAppSelector(selectOverviewError);

  useEffect(() => {
    // Only fetch if we don't already have data (avoids refetch on every tab-switch).
    if (status === 'idle') {
      dispatch(fetchOverview());
      dispatch(fetchOverviewHealth());
    }
  }, [dispatch, status]);

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
