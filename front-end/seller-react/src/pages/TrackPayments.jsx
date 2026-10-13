import { useState, useEffect, useCallback, useMemo } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import PillFilters from '../components/PillFilters.jsx';
import { sellerApi } from '../api/sellerApi.js';
import { fmtInrSeller, formatINR, shortDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import { useCheckout } from '../context/CheckoutContext.jsx';
import useLiveRefresh from '../hooks/useLiveRefresh.js';
import { LoadingState } from '../components/StateMessage.jsx';
import { MoneyIcon, ClockIcon, SoldIcon } from '../components/Icons.jsx';

const PTRACK_STEPS_SELLER = [
  'Offer Accepted',
  'Document Verification',
  'Token Payment',
  'Full Payment',
  'Registration',
];

export default function TrackPayments() {
  const { showToast } = useToast();
  const { pay } = useCheckout();

  const [purchases, setPurchases] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadPurchases = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await sellerApi.getSellerPurchases();
      setPurchases(res.data?.items || []);
    } catch (err) {
      if (!silent) showToast(err.message || "Couldn't load purchases", 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  useLiveRefresh(() => loadPurchases(true));

  // Metrics
  const stats = useMemo(() => {
    const completed = purchases.filter((p) => p.dealStatus === 'completed');
    const inProgress = purchases.filter((p) => p.dealStatus === 'in_progress');
    const nonCancelled = purchases.filter((p) => p.dealStatus !== 'cancelled');

    const totalReceived = completed.reduce((s, p) => s + (p.agreedPrice || 0), 0);
    const pendingValue = inProgress.reduce((s, p) => s + (p.agreedPrice || 0), 0);
    const totalDealValue = nonCancelled.reduce((s, p) => s + (p.agreedPrice || 0), 0);

    return {
      totalReceived: fmtInrSeller(totalReceived),
      pendingPayments: fmtInrSeller(pendingValue),
      dealsInProgress: String(inProgress.length),
      totalDealValue: fmtInrSeller(totalDealValue),
    };
  }, [purchases]);

  const counts = useMemo(() => {
    return {
      all: purchases.length,
      ongoing: purchases.filter((p) => p.dealStatus === 'in_progress').length,
      completed: purchases.filter((p) => p.dealStatus === 'completed').length,
      rejected: purchases.filter((p) => p.dealStatus === 'cancelled').length,
    };
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    if (filter === 'ongoing') return purchases.filter((p) => p.dealStatus === 'in_progress');
    if (filter === 'completed') return purchases.filter((p) => p.dealStatus === 'completed');
    if (filter === 'rejected') return purchases.filter((p) => p.dealStatus === 'cancelled');
    return purchases;
  }, [purchases, filter]);

  async function handlePayCommission(commissionId) {
    try {
      const result = await pay({ purpose: 'commission', commissionId });
      if (!result) return;
      showToast(result.message || 'Commission paid successfully!');
      loadPurchases(true);
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    }
  }

  const filterOptions = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'ongoing', label: 'Ongoing', count: counts.ongoing },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'rejected', label: 'Cancelled', count: counts.rejected },
  ];

  return (
    <div>
      <PageHeader
        title="Track Payments"
        subtitle="Monitor deal progression, milestone payments, and closing settlements"
      />

      <div className="content-section">
        {/* KPI Stats */}
        <div className="stats-grid">
          <StatCard
            label="Total Received"
            value={stats.totalReceived}
            icon={<SoldIcon size={22} />}
            iconBg="rgba(29,185,84,0.2)"
            iconColor="#1DB954"
          />
          <StatCard
            label="Pending Payments"
            value={stats.pendingPayments}
            icon={<ClockIcon size={22} />}
            iconBg="rgba(249,115,22,0.2)"
            iconColor="#f97316"
          />
          <StatCard
            label="Deals In Progress"
            value={stats.dealsInProgress}
            icon={<ClockIcon size={22} />}
            iconBg="rgba(29,185,84,0.2)"
            iconColor="#1DB954"
          />
          <StatCard
            label="Total Deal Value"
            value={stats.totalDealValue}
            icon={<MoneyIcon size={22} />}
            iconBg="rgba(29,185,84,0.2)"
            iconColor="#1DB954"
          />
        </div>

        {/* Filter Pills */}
        <PillFilters
          filters={filterOptions}
          active={filter}
          onChange={setFilter}
        />

        {/* Purchases Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <LoadingState message="Loading payment records…" />
          ) : filteredPurchases.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '3rem 1.5rem' }}>
              <p>No purchases found in this category.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Deal ID</th>
                    <th>Property</th>
                    <th>Buyer</th>
                    <th>Agreed Price</th>
                    <th>Date</th>
                    <th>Status / Step</th>
                  </tr>
                </thead>
                <tbody id="payments-table">
                  {filteredPurchases.map((p) => {
                    const isCompleted = p.dealStatus === 'completed';
                    const isCancelled = p.dealStatus === 'cancelled';
                    const badgeClass = isCompleted ? 'badge-green' : isCancelled ? 'badge-red' : 'badge-orange';
                    const stepLabel = isCompleted
                      ? '● Completed'
                      : isCancelled
                      ? '● Cancelled'
                      : `● ${PTRACK_STEPS_SELLER[p.dealStep - 1] || 'In Progress'}`;

                    const mine = (p.commissions || []).find(
                      (c) => c.side === 'seller' && c.status === 'accrued'
                    );

                    return (
                      <tr key={p.id} style={{ borderBottom: p.awaitingCommission ? 'none' : undefined }}>
                        <td style={{ color: '#9ca3af', fontFamily: 'monospace' }}>
                          {p.id.slice(-8).toUpperCase()}
                        </td>
                        <td style={{ color: '#fff', fontWeight: 600 }}>
                          {p.propertyTitle || 'Property'}
                        </td>
                        <td style={{ color: '#9ca3af' }}>{p.buyerName || 'Unknown'}</td>
                        <td style={{ color: '#1DB954', fontWeight: 700 }}>
                          {fmtInrSeller(p.agreedPrice)}
                        </td>
                        <td style={{ color: '#9ca3af' }}>{shortDate(p.createdAt)}</td>
                        <td>
                          <span className={`status-badge ${badgeClass}`}>{stepLabel}</span>
                          {/* If parked awaiting commission, render row-level banner */}
                          {p.awaitingCommission && (
                            <div className="commission-due-banner" style={{ marginTop: '0.75rem' }}>
                              <div className="commission-due-text">
                                <strong>Registration is waiting on platform commission payment.</strong>
                                {mine ? (
                                  <>
                                    Your seller-side commission is{' '}
                                    <span style={{ color: '#fff', fontWeight: 600 }}>{formatINR(mine.amount)}</span>{' '}
                                    ({mine.ratePercent}% of {formatINR(mine.dealValue)}, incl. GST).
                                  </>
                                ) : (
                                  'Your seller share is settled — awaiting buyer fee payment.'
                                )}
                              </div>
                              {mine && (
                                <button
                                  type="button"
                                  className="commission-due-btn"
                                  onClick={() => handlePayCommission(mine.id)}
                                >
                                  Pay {formatINR(mine.amount)}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
