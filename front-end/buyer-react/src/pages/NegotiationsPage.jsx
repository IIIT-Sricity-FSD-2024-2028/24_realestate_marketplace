import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../api/buyerApi.js';
import { formatOfferAmount, shortDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import useLiveRefresh from '../hooks/useLiveRefresh.js';
import PageHeader from '../components/PageHeader.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { ChatIcon } from '../components/Icons.jsx';

export default function NegotiationsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const fetchNegotiations = useCallback(async () => {
    try {
      const res = await buyerApi.getMineNegotiations();
      setNegotiations(res.data || []);
    } catch (err) {
      console.error('Failed to load negotiations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNegotiations();
  }, [fetchNegotiations]);

  useLiveRefresh(fetchNegotiations, { intervalMs: 15000 });

  const activeNegotiations = useMemo(() => {
    return negotiations.filter((n) => n.status !== 'withdrawn');
  }, [negotiations]);

  async function handleAcceptCounter(id) {
    setActingId(id);
    try {
      await buyerApi.acceptCounterOffer(id);
      showToast('🎉 Offer accepted! Moving to Purchase Initiation...');
      await fetchNegotiations();
      setTimeout(() => {
        const target = window.location.pathname.startsWith('/buyer') ? '/buyer/purchase-initiation' : '/purchase-initiation';
        navigate(target);
      }, 1000);
    } catch (err) {
      showToast(err.message || 'Failed to accept counter offer', 'error');
    } finally {
      setActingId(null);
    }
  }

  async function handleWithdraw(id) {
    if (!window.confirm('Are you sure you want to withdraw this offer?')) return;
    setActingId(id);
    try {
      await buyerApi.withdrawOffer(id);
      showToast('Offer withdrawn');
      await fetchNegotiations();
    } catch (err) {
      showToast(err.message || 'Failed to withdraw offer', 'error');
    } finally {
      setActingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Negotiations"
        subtitle="Review seller responses, counter-offers & deal agreements"
      />

      <div className="content-section">
        {loading ? (
          <StateMessage type="loading" title="Loading negotiations…" message="Fetching active offers with property sellers." />
        ) : activeNegotiations.length === 0 ? (
          <StateMessage
            type="empty"
            icon="💬"
            title="No negotiations yet"
            message="Make an offer on a property to start price negotiations with its seller."
            actionLabel="Explore Properties"
            onAction={() => {
              const target = window.location.pathname.startsWith('/buyer') ? '/buyer/explore' : '/explore';
              navigate(target);
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activeNegotiations.map((o) => {
              const offerFmt = formatOfferAmount(o.offerAmount);
              const img =
                o.propertyImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80';
              const location = [o.propertyCity, o.propertyState].filter(Boolean).join(', ') || 'Location pending';

              let statusColor = '#f97316';
              let statusLabel = '⏳ Pending Seller Response';
              if (o.status === 'accepted') {
                statusColor = '#1DB954';
                statusLabel = '✓ Accepted';
              } else if (o.status === 'rejected') {
                statusColor = '#ef4444';
                statusLabel = '✕ Rejected';
              } else if (o.status === 'countered') {
                statusColor = '#3b82f6';
                statusLabel = '💬 Counter Offer Received';
              }

              const isActing = actingId === o.id;

              return (
                <div
                  key={o.id}
                  className="card"
                  style={{
                    borderLeft: `4px solid ${statusColor}`,
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={img}
                        alt={o.propertyTitle}
                        style={{
                          width: '3.75rem',
                          height: '3.75rem',
                          borderRadius: '0.75rem',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                          {o.propertyTitle || 'Property'}
                        </h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                          📍 {location} · {o.paymentMode || 'Cash'}
                        </p>
                      </div>
                    </div>

                    <span
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: statusColor,
                        padding: '0.375rem 0.85rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                      }}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Negotiation Details Box */}
                  <div
                    style={{
                      background: '#121212',
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      marginBottom: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Your Submitted Offer
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1DB954', marginTop: '0.2rem' }}>
                          {offerFmt}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#6b7280' }}>
                        Submitted on: {shortDate(o.createdAt)}
                      </div>
                    </div>

                    {o.message && (
                      <div
                        style={{
                          marginTop: '0.85rem',
                          paddingTop: '0.85rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                          color: '#9ca3af',
                          fontSize: '0.825rem',
                          fontStyle: 'italic',
                        }}
                      >
                        "{o.message}"
                      </div>
                    )}

                    {/* Rejection Reason if any */}
                    {o.status === 'rejected' && o.rejectionReason && (
                      <div
                        style={{
                          marginTop: '1rem',
                          paddingTop: '1rem',
                          borderTop: '1px dashed rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, marginBottom: '0.25rem' }}>
                          REJECTION REASON FROM SELLER
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>{o.rejectionReason}</div>
                      </div>
                    )}

                    {/* Counter Offer Box if any */}
                    {o.counterAmount && (
                      <div
                        style={{
                          marginTop: '1rem',
                          paddingTop: '1rem',
                          borderTop: '1px dashed rgba(59, 130, 246, 0.3)',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700, marginBottom: '0.25rem' }}>
                          SELLER'S COUNTER OFFER
                        </div>
                        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff' }}>
                          {formatOfferAmount(o.counterAmount)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Helper Notification Banner */}
                  <div
                    style={{
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                  >
                    <ChatIcon style={{ width: '1rem', height: '1rem', color: '#3b82f6', flexShrink: 0 }} />
                    <span style={{ color: '#d1d5db', fontSize: '0.8rem' }}>
                      {o.status === 'countered'
                        ? 'The seller has sent a counter-offer. You can accept it to initiate purchase or withdraw your offer.'
                        : o.status === 'pending'
                        ? "The seller will review and respond directly. You'll be notified of any price updates."
                        : o.status === 'accepted'
                        ? 'Price agreed with the seller! Proceed to Purchase Initiation to track legal and payment milestones.'
                        : 'This negotiation is closed.'}
                    </span>
                  </div>

                  {/* Actions */}
                  {(o.status === 'pending' || o.status === 'countered') && (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {o.status === 'countered' && (
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => handleAcceptCounter(o.id)}
                          disabled={isActing}
                          style={{ flex: 1, minWidth: '180px' }}
                        >
                          {isActing ? 'Accepting…' : 'Accept Counter Offer'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleWithdraw(o.id)}
                        disabled={isActing}
                        style={{ flex: 1, minWidth: '140px', padding: '0.75rem' }}
                      >
                        Withdraw Offer
                      </button>
                    </div>
                  )}

                  {o.status === 'accepted' && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        const target = window.location.pathname.startsWith('/buyer') ? '/buyer/purchase-initiation' : '/purchase-initiation';
                        navigate(target);
                      }}
                      style={{ width: '100%', padding: '0.85rem' }}
                    >
                      🏠 Track Deal in Purchase Initiation →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
