/** Platform overview derived entirely from Redux repository slices. */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PageHeader, StatCard, StatusLine } from '../../../components/common/ui.jsx';
import { fetchHealth, fetchProperties, fetchUsers } from '../../../store/actions/apiActions.js';

export default function SuperuserOverview() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.items);
  const userLoading = useSelector((state) => state.users.loading);
  const propertyTotal = useSelector((state) => state.properties.public.total);
  const propertyLoading = useSelector((state) => state.properties.loading.public);
  const health = useSelector((state) => state.system.health);
  const error = useSelector((state) => state.users.error || state.properties.error || state.system.error);
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchProperties({ limit: 1 }));
    dispatch(fetchHealth());
  }, [dispatch]);
  const healthy = health?.status === 'ok';
  return (
    <>
      <PageHeader title="Super Admin Overview" subtitle="Global statistics and platform health metrics." />
      <div className="content">
        <StatusLine loading={userLoading || propertyLoading} error={error} />
        <div className="stats-grid">
          <StatCard label="Total Users" value={userLoading ? '…' : users.length} icon="users" />
          <StatCard label="Total Properties" value={propertyLoading ? '…' : propertyTotal} icon="home" tone="blue" />
          <StatCard
            label="Active Users (not blocked)"
            value={userLoading ? '…' : users.filter((user) => !user.isBlocked).length}
            icon="calendar"
            tone="yellow"
          />
          <StatCard
            label={health?.database ? 'System Status · database ' + health.database : 'System Status'}
            value={health ? (healthy ? 'OK' : String(health.status).toUpperCase()) : '…'}
            icon="shield"
            tone={healthy ? 'green' : 'red'}
          />
        </div>
      </div>
    </>
  );
}
