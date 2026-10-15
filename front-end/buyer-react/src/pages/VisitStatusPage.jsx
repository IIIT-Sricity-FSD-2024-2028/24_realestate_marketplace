import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { buyerApi } from '../api/buyerApi.js';
import { useToast } from '../context/ToastContext.jsx';
import useLiveRefresh from '../hooks/useLiveRefresh.js';
import PageHeader from '../components/PageHeader.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { getInitials } from '../utils/format.js';

export default function VisitStatusPage() {
  const { showToast } = useToast();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requested'); // 'requested' | 'upcoming' | 'completed' | 'cancelled'
  const [cancellingId, setCancellingId] = useState(null);

  const fetchVisits = useCallback(async () => {
    try {
      const res = await buyerApi.getMineVisits();
      setVisits(res.data || []);
    } catch (err) {
      console.error('Failed to load visits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  useLiveRefresh(fetchVisits, { intervalMs: 15000 });

  const requestedVisits = useMemo(() => visits.filter((v) => v.status === 'pending'), [visits]);
  const upcomingVisits = useMemo(
    () => visits.filter((v) => v.status === 'confirmed' || v.status === 'rescheduled'),
    [visits]
  );
  const completedVisits = useMemo(() => visits.filter((v) => v.status === 'completed'), [visits]);
  const cancelledVisits = useMemo(() => visits.filter((v) => v.status === 'cancelled'), [visits]);

  async function handleCancel(visitId) {
    if (!window.confirm('Are you sure you want to cancel this visit request?')) return;
    setCancellingId(visitId);
    try {
      await buyerApi.cancelVisit(visitId, 'Cancelled by buyer');
      showToast('Visit cancelled successfully');
      await fetchVisits();
    } catch (err) {
      showToast(err.message || 'Failed to cancel visit', 'error');
    } finally {
      setCancellingId(null);
    }
  }

  const currentTabVisits = useMemo(() => {
    if (activeTab === 'requested') return requestedVisits;
    if (activeTab === 'upcoming') return upcomingVisits;
    if (activeTab === 'completed') return completedVisits;
    return cancelledVisits;
  }, [activeTab, requestedVisits, upcomingVisits, completedVisits, cancelledVisits]);

  const emptyTexts = {
    requested:
      'No pending requests — schedule a visit from any property listing and our admin team will confirm your slot.',
    upcoming: 'Nothing confirmed yet. A request appears here as soon as an admin approves your time slot.',
    completed: 'No completed visits yet.',
    cancelled: 'No cancelled visits.',
  };

  return (
    <div>
      <PageHeader
        title="Visit Status"
        subtitle="Track your scheduled property site inspections with our city admin team"
      />

      <div className="content-section">
        {/* Tab Filters with Count Badges */}
        <div className="tab-bar">
          <button
            type="button"
            className={`tab ${activeTab === 'requested' ? 'active' : ''}`}
            onClick={() => setActiveTab('requested')}
          >
            Requested {requestedVisits.length > 0 && `(${requestedVisits.length})`}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming {upcomingVisits.length > 0 && `(${upcomingVisits.length})`}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed {completedVisits.length > 0 && `(${completedVisits.length})`}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled {cancelledVisits.length > 0 && `(${cancelledVisits.length})`}
          </button>
        </div>

        {/* Tab Content */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <h3
            style={{
              padding: '1.25rem 1.5rem',
              fontWeight: 700,
              fontSize: '1rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              margin: 0,
            }}
          >
            Visits — {activeTab.toUpperCase()}
          </h3>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Loading visits…</div>
          ) : currentTabVisits.length === 0 ? (
            <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                {emptyTexts[activeTab]}
              </p>
              {activeTab === 'requested' && (
                <Link
                  to={window.location.pathname.startsWith('/buyer') ? '/buyer/explore' : '/explore'}
                  className="btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '2rem',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}
                >
                  📅 Browse Properties to Request a Visit
                </Link>
              )}
            </div>
          ) : (
            <div>
              {currentTabVisits.map((v) => {
                const title = v.propertyTitle || 'Property';
                const location = [v.propertyCity, v.propertyState].filter(Boolean).join(', ') || 'Location pending';
                const initials = getInitials(title);

                const statusStyles = {
                  pending: { badge: 'badge-orange', label: '⏳ Sent to admin — awaiting confirmation' },
                  confirmed: { badge: 'badge-green', label: '✓ Confirmed by admin' },
                  rescheduled: { badge: 'badge-blue', label: '↻ Admin moved this to a new slot' },
                  completed: { badge: 'badge-green', label: '● Visit completed' },
                  cancelled: { badge: 'badge-red', label: '● Cancelled' },
                };
                const currentStatus = statusStyles[v.status] || { badge: 'badge-orange', label: v.status };

                const canCancel = v.status === 'pending' || v.status === 'confirmed' || v.status === 'rescheduled';

                return (
                  <div
                    key={v.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.25rem 1.5rem',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '280px', flex: 1 }}>
                      <div
                        style={{
                          width: '3rem',
                          height: '3rem',
                          borderRadius: '9999px',
                          background: v.status === 'cancelled' ? '#ef4444' : '#1DB954',
                          color: '#000',
                          fontWeight: 800,
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>

                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0 }}>
                          {title}
                        </h4>
                        <p style={{ color: '#9ca3af', fontSize: '0.8125rem', margin: '0.2rem 0 0.4rem' }}>
                          📍 {location}
                        </p>
                        <p style={{ color: '#d1d5db', fontSize: '0.75rem', fontWeight: 600 }}>
                          📅 {v.requestedDate} &nbsp;·&nbsp; 🕐 {v.requestedSlot}
                        </p>
                        {v.message && (
                          <p style={{ color: '#6b7280', fontSize: '0.75rem', fontStyle: 'italic', margin: '0.25rem 0 0' }}>
                            "{v.message}"
                          </p>
                        )}
                        {v.status === 'cancelled' && v.cancelReason && (
                          <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                            Reason: {v.cancelReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`status-badge ${currentStatus.badge}`}>{currentStatus.label}</span>
                      {canCancel && (
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleCancel(v.id)}
                          disabled={cancellingId === v.id}
                        >
                          {cancellingId === v.id ? 'Cancelling…' : 'Cancel Visit'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
