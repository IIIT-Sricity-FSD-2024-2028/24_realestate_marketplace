import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../api/buyerApi.js';
import { formatOfferAmount, formatINR } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import { useCheckout } from '../context/CheckoutContext.jsx';
import useLiveRefresh from '../hooks/useLiveRefresh.js';
import PageHeader from '../components/PageHeader.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { PurchasesIcon } from '../components/Icons.jsx';

const STEPS = [
  'Offer Accepted',
  'Document Verification',
  'Token Payment',
  'Full Payment',
  'Registration',
];

export default function PurchaseInitiationPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { pay } = useCheckout();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await buyerApi.getMinePurchases();
      setPurchases(res.data || []);
    } catch (err) {
      console.error('Failed to load purchases:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  useLiveRefresh(fetchPurchases, { intervalMs: 15000 });

  const activePurchases = useMemo(() => {
    return purchases.filter((p) => p.dealStatus !== 'cancelled');
  }, [purchases]);

  async function handlePayCommission(commissionId) {
    try {
      const result = await pay({ purpose: 'commission', commissionId });
      if (!result) return;
      showToast(result.message || 'Platform commission paid successfully!');
      await fetchPurchases();
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    }
  }

  return (
    <div>
      <PageHeader
        title="Purchase Initiation"
        subtitle="Track your ongoing property purchases — all steps managed by your assigned property manager"
      />

      <div className="content-section">
        {/* Info Banner */}
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '9999px',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            i
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
              How Purchase Initiation Works
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
              The property payment and all legal deeds take place <strong style={{ color: '#fff' }}>offline</strong>.
              Your assigned property manager verifies documents physically and updates the pipeline status here once
              confirmed. The only online fee is the <strong style={{ color: '#fff' }}>platform commission at the final Registration step</strong> —
              your deal completes once that is settled.
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Active Deal Progress ({activePurchases.length})
        </h2>

        {loading ? (
          <StateMessage type="loading" title="Loading purchase tracking…" message="Checking status with city managers." />
        ) : activePurchases.length === 0 ? (
          <StateMessage
            type="empty"
            icon="🏠"
            title="No active purchases yet"
            message="Once a seller accepts your offer, it will appear here with live milestone progress."
            actionLabel="View My Offers"
            onAction={() => {
              const target = window.location.pathname.startsWith('/buyer') ? '/buyer/negotiate' : '/negotiate';
              navigate(target);
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {activePurchases.map((p) => {
              const currentStep = Math.min(5, Math.max(1, p.dealStep || 1));
              const isCompleted = p.dealStatus === 'completed';
              const location = [p.propertyCity, p.propertyState].filter(Boolean).join(', ') || 'Location pending';

              // Commission line for buyer
              const buyerComm = (p.commissions || []).find(
                (c) => c.side === 'buyer' && c.status === 'accrued'
              );
              const sellerComm = (p.commissions || []).find(
                (c) => c.side === 'seller' && c.status === 'accrued'
              );

              return (
                <div
                  key={p.id}
                  className="card"
                  style={{
                    borderLeft: `4px solid ${isCompleted ? '#1DB954' : '#1DB954'}`,
                    padding: '1.5rem',
                  }}
                >
                  {/* Deal Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1.5rem',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '3.5rem',
                          height: '3.5rem',
                          borderRadius: '0.75rem',
                          background: '#121212',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1DB954',
                        }}
                      >
                        <PurchasesIcon style={{ width: '2rem', height: '2rem' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                          {p.propertyTitle || 'Property Deal'}
                        </h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                          📍 {location} · Agreed Price:{' '}
                          <span style={{ color: '#1DB954', fontWeight: 700 }}>
                            {formatOfferAmount(p.agreedPrice)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <span
                      style={{
                        backgroundColor: isCompleted
                          ? 'rgba(29, 185, 84, 0.15)'
                          : 'rgba(249, 115, 22, 0.15)',
                        color: isCompleted ? '#1DB954' : '#f97316',
                        padding: '0.4rem 0.9rem',
                        borderRadius: '0.4rem',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                      }}
                    >
                      {isCompleted ? '✅ Completed' : '⏳ In Progress'}
                    </span>
                  </div>

                  {/* 5-Step Stepper Component */}
                  <div
                    style={{
                      background: '#121212',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      PURCHASE PROGRESS PIPELINE
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      {STEPS.map((stepName, i) => {
                        const stepNum = i + 1;
                        const isDone = stepNum < currentStep || isCompleted;
                        const isCurrent = stepNum === currentStep && !isCompleted;

                        let circleBg = '#282828';
                        let circleColor = '#9ca3af';
                        let circleBorder = '2px solid rgba(255,255,255,0.1)';
                        let labelColor = '#9ca3af';

                        if (isDone) {
                          circleBg = '#1DB954';
                          circleColor = '#000';
                          circleBorder = 'none';
                          labelColor = '#1DB954';
                        } else if (isCurrent) {
                          circleBg = '#f97316';
                          circleColor = '#000';
                          circleBorder = 'none';
                          labelColor = '#f97316';
                        }

                        return (
                          <div
                            key={stepName}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              flex: i < STEPS.length - 1 ? 1 : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
                              <div
                                style={{
                                  width: '2.25rem',
                                  height: '2.25rem',
                                  borderRadius: '9999px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  background: circleBg,
                                  color: circleColor,
                                  border: circleBorder,
                                  marginBottom: '0.35rem',
                                  boxShadow: isCurrent ? '0 0 0 4px rgba(249,115,22,0.2)' : 'none',
                                }}
                              >
                                {isDone ? '✓' : stepNum}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: labelColor, textAlign: 'center', lineHeight: 1.2, fontWeight: 600 }}>
                                {stepName}
                              </div>
                            </div>

                            {i < STEPS.length - 1 && (
                              <div
                                style={{
                                  height: '2px',
                                  flex: 1,
                                  background: stepNum < currentStep ? '#1DB954' : 'rgba(255,255,255,0.08)',
                                  margin: '0 0.5rem',
                                  marginTop: '-1rem',
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Commission / Status Milestone Panel */}
                  {p.awaitingCommission || buyerComm ? (
                    <div
                      style={{
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '0.75rem',
                        padding: '1.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: buyerComm ? '1.15rem' : '0' }}>
                        <div
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            background: '#f59e0b',
                            borderRadius: '9999px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            color: '#000',
                            flexShrink: 0,
                          }}
                        >
                          ₹
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '0.2rem' }}>
                            Final step — platform commission due
                          </div>
                          <div style={{ color: '#d1d5db', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                            Registration is the final milestone of your property purchase. Deal registration is officially completed
                            once the buyer-side brokerage on this transaction is cleared.
                          </div>
                        </div>
                      </div>

                      {buyerComm ? (
                        <div style={{ background: '#121212', borderRadius: '0.6rem', padding: '1rem 1.15rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                              <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                                Your share (buyer-side brokerage)
                              </div>
                              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>
                                {formatINR(buyerComm.amount)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                {buyerComm.ratePercent}% of {formatINR(buyerComm.dealValue)} · incl. {formatINR(buyerComm.taxAmount)} GST
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePayCommission(buyerComm.id)}
                              style={{
                                background: '#f59e0b',
                                color: '#111',
                                border: 'none',
                                borderRadius: '0.5rem',
                                padding: '0.8rem 1.5rem',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                              }}
                            >
                              Pay {formatINR(buyerComm.amount)}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ background: '#121212', borderRadius: '0.6rem', padding: '1rem 1.15rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                            <span
                              style={{
                                width: '1.35rem',
                                height: '1.35rem',
                                borderRadius: '9999px',
                                background: 'rgba(29,185,84,0.15)',
                                color: '#1DB954',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                              }}
                            >
                              ✓
                            </span>
                            <span style={{ color: '#1DB954', fontWeight: 700, fontSize: '0.875rem' }}>
                              Your share is settled{p.commissionPaid ? ` — ${formatINR(p.commissionPaid)} received` : ''}
                            </span>
                          </div>
                          <div style={{ color: '#9ca3af', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                            Waiting on the seller to settle their invoice
                            {sellerComm ? ` of ${formatINR(sellerComm.amount)}` : ''} before registration can be finalized. This page updates in real-time.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        background: 'rgba(29, 185, 84, 0.08)',
                        border: '1px solid rgba(29, 185, 84, 0.2)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                      }}
                    >
                      <div
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          background: '#1DB954',
                          borderRadius: '9999px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          color: '#000',
                          fontSize: '0.9rem',
                          flexShrink: 0,
                        }}
                      >
                        {isCompleted ? '✓' : currentStep}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>
                          {isCompleted
                            ? 'All steps complete — registration done.'
                            : `Current step: ${STEPS[currentStep - 1]}`}
                        </div>
                        <div style={{ color: '#1DB954', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                          {isCompleted && p.commissionPaid
                            ? `Platform commission of ${formatINR(p.commissionPaid)} settled.`
                            : 'Your city property manager advances each physical milestone — this tracker updates live.'}
                        </div>
                      </div>
                    </div>
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
