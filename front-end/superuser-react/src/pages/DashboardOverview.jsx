import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Icon from '../components/Icons.jsx';
import { getDashboardStats } from '../api/superuserApi.js';
import useSuperuserData from '../hooks/useSuperuserData.js';

export default function DashboardOverview() {
  const { data, status, error, reload } = useSuperuserData(getDashboardStats);

  const stats = data || {
    totalUsers: '—',
    totalProperties: '—',
    activeUsers: '—',
    systemStatus: 'OK',
  };

  return (
    <div className="section active">
      <PageHeader
        title="Super Admin Overview"
        subtitle="Global statistics and platform health metrics."
        actions={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => reload(false)}
            title="Refresh statistics"
          >
            <Icon name="refresh" size="1rem" />
            <span>Refresh</span>
          </button>
        }
      />

      <div className="section-body">
        {status === 'error' && (
          <div className="form-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error?.message || 'Failed to load system statistics.'}
          </div>
        )}

        <div className="stats-grid">
          <StatCard
            icon="users"
            iconType="primary"
            value={stats.totalUsers}
            label="Total Users"
          />
          <StatCard
            icon="home"
            iconType="info"
            value={stats.totalProperties}
            label="Total Properties"
          />
          <StatCard
            icon="check"
            iconType="warning"
            value={stats.activeUsers}
            label="Active Users"
          />
          <StatCard
            icon="shield"
            iconType="danger"
            value={stats.systemStatus}
            label="System Status"
          />
        </div>

        <div className="overview-grid" style={{ marginTop: '2rem' }}>
          <div className="panel">
            <div className="panel-head">
              <h3>System Health & Operations</h3>
              <span className="badge badge--green">Live</span>
            </div>
            <div className="system-health-list">
              <div className="health-item">
                <div className="health-indicator ok" />
                <div className="health-info">
                  <strong>API Gateway & NestJS Backend</strong>
                  <p>Serving ports 3000 / 3001 with active session validation</p>
                </div>
                <span className="health-tag">99.98% Uptime</span>
              </div>
              <div className="health-item">
                <div className="health-indicator ok" />
                <div className="health-info">
                  <strong>Database Engine</strong>
                  <p>Relational storage with strict transaction guarantees</p>
                </div>
                <span className="health-tag">Connected</span>
              </div>
              <div className="health-item">
                <div className="health-indicator ok" />
                <div className="health-info">
                  <strong>Audit & Access Logging</strong>
                  <p>Rotating daily logs in logs/http, error, app, audit</p>
                </div>
                <span className="health-tag">Active</span>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Superuser Quick Access</h3>
            </div>
            {(() => {
              const prefix = window.location.pathname.startsWith('/superuser') ? '/superuser' : '';
              return (
                <div className="quick-links-grid">
                  <Link to={`${prefix}/users`} className="quick-link-card">
                    <div className="quick-link-icon primary">
                      <Icon name="users" size="1.25rem" />
                    </div>
                    <div>
                      <strong>Manage Users</strong>
                      <p>Mint admin city desks and manage access</p>
                    </div>
                  </Link>

                  <Link to={`${prefix}/properties`} className="quick-link-card">
                    <div className="quick-link-icon info">
                      <Icon name="home" size="1.25rem" />
                    </div>
                    <div>
                      <strong>Property Operations</strong>
                      <p>Inspect, edit, and moderate catalog listings</p>
                    </div>
                  </Link>

                  <Link to={`${prefix}/revenue`} className="quick-link-card">
                    <div className="quick-link-icon warning">
                      <Icon name="revenue" size="1.25rem" />
                    </div>
                    <div>
                      <strong>Platform Revenue</strong>
                      <p>Collected fees, receivables, and plans</p>
                    </div>
                  </Link>

                  <Link to={`${prefix}/logs`} className="quick-link-card">
                    <div className="quick-link-icon logs">
                      <Icon name="logs" size="1.25rem" />
                    </div>
                    <div>
                      <strong>Live System Logs</strong>
                      <p>Audit trail, errors, and request throughput</p>
                    </div>
                  </Link>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
