import { useState, useEffect, useCallback } from 'react';
import { buyerApi } from '../api/buyerApi.js';
import { formatINR, shortDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import { useCheckout } from '../context/CheckoutContext.jsx';
import useLiveRefresh from '../hooks/useLiveRefresh.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';

export default function PaymentsPage() {
  const { showToast } = useToast();
  const { pay } = useCheckout();

  const [catalog, setCatalog] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const loadBillingData = useCallback(async () => {
    try {
      const [catRes, sumRes] = await Promise.all([
        buyerApi.getBillingCatalog(),
        buyerApi.getBillingSummary(),
      ]);
      setCatalog(catRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.warn('Failed to load billing:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  useLiveRefresh(loadBillingData, { intervalMs: 15000 });

  async function handlePayCommission(commissionId) {
    setPayingId(commissionId);
    try {
      const res = await pay({ purpose: 'commission', commissionId });
      if (!res) return;
      showToast(res.message || 'Payment completed successfully!');
      await loadBillingData();
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    } finally {
      setPayingId(null);
    }
  }

  const commissions = summary?.commissions || [];
  const payments = summary?.payments || [];
  const amountDue = summary?.amountDue || 0;
  const lifetimeSpend = summary?.lifetimeSpend || 0;

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Platform commission on your purchases, and your payment receipts"
        rightAction={
          catalog && (
            <span
              className={`status-badge ${catalog.isLive ? 'badge-green' : 'badge-orange'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              {catalog.isLive
                ? `Live payments · ${catalog.gateway}`
                : catalog.gateway === 'razorpay'
                ? 'Razorpay test mode'
                : 'Test mode · no real money'}
            </span>
          )
        }
      />

      <div className="content-section">
        {/* KPI Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <StatCard
            label="Outstanding Balance"
            value={formatINR(amountDue)}
            note={amountDue > 0 ? 'Due at the Registration step' : 'Nothing owed'}
            color={amountDue > 0 ? '#f59e0b' : '#1DB954'}
          />
          <StatCard
            label="Paid to truEstate"
            value={formatINR(lifetimeSpend)}
            note="Total lifetime settlement"
            color="#1DB954"
          />
        </div>

        {/* Commission Invoices Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            Commission Invoices
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5, maxWidth: '750px' }}>
            truEstate charges buyer-side brokerage once — at the <strong>Registration</strong> step of a purchase.
            Nothing is charged on an offer, a site visit, or a deal that falls through, and your legal registration
            finalizes once this is settled.
          </p>

          {commissions.length === 0 ? (
            <div
              style={{
                background: '#1a1a1a',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                color: '#9ca3af',
              }}
            >
              <div
                style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#1DB954',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                ₹
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                No commission charged yet
              </h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '460px', margin: '0 auto' }}>
                Buyer-side brokerage appears here when one of your purchases reaches the Registration stage — the final
                milestone of purchase tracking.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {commissions.map((c) => {
                const isDue = c.status === 'accrued';
                const statusLabels = {
                  accrued: 'Payment Due',
                  paid: 'Paid',
                  waived: 'Waived by truEstate',
                };

                return (
                  <div
                    key={c.id}
                    className="card"
                    style={{
                      borderLeft: isDue ? '4px solid #f59e0b' : '4px solid #1DB954',
                      padding: '1.5rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1.25rem',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                          {c.propertyTitle || 'Property Purchase'}
                        </h3>
                        <span
                          className={`status-badge ${isDue ? 'badge-orange' : 'badge-green'}`}
                          style={{ marginTop: '0.4rem' }}
                        >
                          {statusLabels[c.status] || c.status}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: isDue ? '#f59e0b' : '#1DB954' }}>
                          {formatINR(c.amount)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                          {isDue ? 'payable now' : c.settledAt ? `settled on ${shortDate(c.settledAt)}` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Matrix */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0.75rem',
                        background: '#121212',
                        borderRadius: '0.625rem',
                        padding: '1rem',
                        marginBottom: isDue ? '1.25rem' : 0,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>
                          Deal Value
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                          {formatINR(c.dealValue)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>
                          Buyer Rate
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                          {c.ratePercent}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>
                          Base Commission
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                          {formatINR(c.baseAmount)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>
                          GST (18%)
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                          {formatINR(c.taxAmount)}
                        </div>
                      </div>
                    </div>

                    {isDue && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem',
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          paddingTop: '1rem',
                        }}
                      >
                        <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0, maxWidth: '500px' }}>
                          Charged at the Registration step. Your official ownership transfer is finalized once this is paid.
                        </p>
                        <button
                          type="button"
                          onClick={() => handlePayCommission(c.id)}
                          disabled={payingId === c.id}
                          style={{
                            background: '#f59e0b',
                            color: '#111',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                          }}
                        >
                          {payingId === c.id ? 'Processing…' : `Pay ${formatINR(c.amount)}`}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Receipts History */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>Receipts</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Every payment and transaction receipt issued to your buyer account.
          </p>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Receipt</th>
                  <th style={{ textAlign: 'left' }}>Description</th>
                  <th style={{ textAlign: 'left' }}>Amount</th>
                  <th style={{ textAlign: 'left' }}>Status</th>
                  <th style={{ textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                      No payment receipts yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => {
                    const badge =
                      p.status === 'paid'
                        ? 'badge-green'
                        : p.status === 'failed'
                        ? 'badge-red'
                        : 'badge-orange';
                    return (
                      <tr key={p.id || p.receipt}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#9ca3af' }}>
                          {p.receipt}
                        </td>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{p.description}</td>
                        <td style={{ fontWeight: 700, color: '#1DB954' }}>{formatINR(p.amount)}</td>
                        <td>
                          <span className={`status-badge ${badge}`}>{p.status}</span>
                        </td>
                        <td style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>
                          {shortDate(p.paidAt || p.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
