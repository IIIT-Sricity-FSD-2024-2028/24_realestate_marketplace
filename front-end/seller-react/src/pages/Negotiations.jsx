import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import PillFilters from '../components/PillFilters.jsx';
import CounterOfferModal from '../components/CounterOfferModal.jsx';
import { sellerApi } from '../api/sellerApi.js';
import { fmtInrSeller } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import useLiveRefresh from '../hooks/useLiveRefresh.js';
import { LoadingState } from '../components/StateMessage.jsx';
import Modal from '../components/Modal.jsx';

export default function Negotiations() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [negotiations, setNegotiations] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [activeCounterNeg, setActiveCounterNeg] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [queueRes, listingsRes] = await Promise.all([
        sellerApi.getSellerNegotiations(),
        sellerApi.getMyListings().catch(() => ({ data: [] })),
      ]);
      setNegotiations(queueRes.data?.items || []);
      setMyListings(listingsRes.data || []);
    } catch (err) {
      if (!silent) showToast(err.message || "Couldn't load negotiations", 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useLiveRefresh(() => loadData(true));

  function negBucket(status) {
    if (status === 'accepted') return 'completed';
    if (status === 'rejected' || status === 'withdrawn') return 'rejected';
    return 'ongoing'; // pending, countered
  }

  const counts = useMemo(() => {
    return {
      all: negotiations.length,
      ongoing: negotiations.filter((n) => negBucket(n.status) === 'ongoing').length,
      completed: negotiations.filter((n) => negBucket(n.status) === 'completed').length,
      rejected: negotiations.filter((n) => negBucket(n.status) === 'rejected').length,
    };
  }, [negotiations]);

  const filtered = useMemo(() => {
    if (filter === 'all') return negotiations;
    return negotiations.filter((n) => negBucket(n.status) === filter);
  }, [negotiations, filter]);

  async function handleAccept(id) {
    try {
      await sellerApi.acceptNegotiation(id);
      showToast('Offer accepted — purchase created and tracking started!', 'success');
      loadData(true);
    } catch (err) {
      showToast(err.message || 'Failed to accept offer', 'error');
    }
  }

  async function handleConfirmReject(e) {
    e.preventDefault();
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await sellerApi.rejectNegotiation(rejectTarget.id, rejectReason);
      showToast('Offer rejected', 'success');
      setRejectTarget(null);
      setRejectReason('');
      loadData(true);
    } catch (err) {
      showToast(err.message || 'Failed to reject offer', 'error');
    } finally {
      setRejecting(false);
    }
  }

  function getEmptyMessage() {
    if (negotiations.length > 0 && filter !== 'all') {
      return 'No negotiations in this filter category. Switch to "All" to view your other offers.';
    }
    if (!myListings.length) {
      return (
        <div>
          <p style={{ fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>No offers yet — because you have no listings.</p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Buyer offers only appear here for properties you submitted and an admin approved.
          </p>
          <button className="btn-primary" onClick={() => navigate('/add-property')}>
            Add a Property Listing
          </button>
        </div>
      );
    }
    const approved = myListings.filter((p) => p.verificationStatus === 'verified').length;
    if (!approved) {
      const pending = myListings.filter((p) => p.verificationStatus === 'pending').length;
      return (
        <div>
          <p style={{ fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
            No offers yet — your {myListings.length} listing{myListings.length > 1 ? 's are' : ' is'} pending admin review.
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            {pending > 0 && `${pending} listing${pending > 1 ? 's' : ''} awaiting approval. `}
            A listing is visible to buyers once verified.
          </p>
        </div>
      );
    }
    return (
      <div>
        <p style={{ fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
          No offers yet on your {approved} approved listing{approved > 1 ? 's' : ''}.
        </p>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          When interested buyers submit offers, they will appear here instantly for you to accept, counter, or reject.
        </p>
      </div>
    );
  }

  const filterOptions = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'ongoing', label: 'Ongoing', count: counts.ongoing },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  const STATUS_META = {
    pending: { badge: 'badge-orange', text: '⏳ Pending — awaiting your response' },
    countered: { badge: 'badge-blue', text: '💬 You countered' },
    accepted: { badge: 'badge-green', text: '✓ Accepted' },
    rejected: { badge: 'badge-red', text: '✕ Rejected' },
    withdrawn: { badge: 'badge-red', text: '↩ Withdrawn by buyer' },
  };

  return (
    <div>
      <PageHeader
        title="Negotiate"
        subtitle="Manage active price offers and negotiations with prospective buyers"
      />

      <div className="content-section">
        <PillFilters
          filters={filterOptions}
          active={filter}
          onChange={setFilter}
        />

        {loading ? (
          <LoadingState message="Loading buyer negotiations…" />
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', lineHeight: 1.6 }}>
            {getEmptyMessage()}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filtered.map((n) => {
              const meta = STATUS_META[n.status] || STATUS_META.pending;
              const location = [n.propertyCity, n.propertyState].filter(Boolean).join(', ') || 'Location pending';
              const canRespond = n.status === 'pending' || n.status === 'countered';

              return (
                <div key={n.id} className="card neg-card" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '3rem',
                          height: '3rem',
                          borderRadius: '0.5rem',
                          background: '#282828',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="22" height="22" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 600, fontSize: '1.05rem', color: '#fff', marginBottom: '0.2rem' }}>
                          {n.propertyTitle || 'Property'}
                        </h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>📍 {location}</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                          Buyer: <span style={{ color: '#fff', fontWeight: 500 }}>{n.buyerName || 'Unknown Buyer'}</span>
                        </p>
                      </div>
                    </div>
                    <span className={`status-badge ${meta.badge}`}>{meta.text}</span>
                  </div>

                  {/* Pricing Box */}
                  <div style={{ background: '#121212', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div className="info-label">Buyer's Offer</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1DB954' }}>
                          {fmtInrSeller(n.offerAmount)}
                        </div>
                      </div>
                      {n.counterAmount && (
                        <div style={{ textAlign: 'right' }}>
                          <div className="info-label">Your Counter Offer</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1DB954' }}>
                            {fmtInrSeller(n.counterAmount)}
                          </div>
                        </div>
                      )}
                    </div>
                    {n.message && (
                      <div
                        style={{
                          marginTop: '0.75rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          color: '#9ca3af',
                          fontSize: '0.825rem',
                          fontStyle: 'italic',
                        }}
                      >
                        "{n.message}"
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {canRespond && (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setActiveCounterNeg(n)}
                        style={{
                          padding: '0.625rem 1.25rem',
                          borderRadius: '0.5rem',
                          border: '2px solid #1DB954',
                          background: 'transparent',
                          color: '#1DB954',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s',
                        }}
                      >
                        Make Counter Offer
                      </button>

                      {n.status === 'pending' && (
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => handleAccept(n.id)}
                        >
                          Accept Offer
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-danger"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => { setRejectReason(''); setRejectTarget(n); }}
                      >
                        Reject Offer
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Counter Offer Modal */}
      {activeCounterNeg && (
        <CounterOfferModal
          negotiation={activeCounterNeg}
          onClose={() => setActiveCounterNeg(null)}
          onSuccess={() => loadData(true)}
        />
      )}

      {/* Reject Offer Modal */}
      {rejectTarget && (
        <Modal title="Reject Buyer's Offer" onClose={() => setRejectTarget(null)} maxWidth="440px">
          <form onSubmit={handleConfirmReject}>
            <p style={{ color: '#d1d5db', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Are you sure you want to reject the offer of {fmtInrSeller(rejectTarget.offerAmount)} on{' '}
              <strong>{rejectTarget.propertyTitle}</strong>?
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                Reason for Rejection (Optional — shown to buyer)
              </label>
              <textarea
                rows={3}
                className="form-control"
                placeholder="e.g. Expected price is closer to asking price; or property has multiple bids..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-outline"
                disabled={rejecting}
                onClick={() => setRejectTarget(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-danger"
                disabled={rejecting}
                style={{ background: '#ef4444', color: '#fff', border: 'none' }}
              >
                {rejecting ? 'Rejecting…' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
