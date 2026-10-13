import { useState, useEffect, useCallback, useMemo } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { sellerApi } from '../api/sellerApi.js';
import { fmtInrSeller, shortDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import useLiveRefresh from '../hooks/useLiveRefresh.js';
import { LoadingState, EmptyState } from '../components/StateMessage.jsx';
import { SoldIcon, MoneyIcon, ClockIcon } from '../components/Icons.jsx';

export default function SoldProperties() {
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await sellerApi.getSellerPurchases();
      setPurchases(res.data?.items || []);
    } catch (err) {
      if (!silent) showToast(err.message || 'Failed to load sold properties', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useLiveRefresh(() => loadData(true));

  const soldDeals = useMemo(() => {
    return purchases.filter(
      (p) => p.dealStatus === 'completed' && p.propertyListingType === 'sale'
    );
  }, [purchases]);

  const stats = useMemo(() => {
    const totalRev = soldDeals.reduce((sum, d) => sum + (d.agreedPrice || 0), 0);
    const thisYear = new Date().getFullYear();
    const soldThisYear = soldDeals.filter(
      (d) => new Date(d.updatedAt || d.createdAt).getFullYear() === thisYear
    ).length;

    return {
      totalSold: String(soldDeals.length),
      revenue: fmtInrSeller(totalRev),
      avgPrice: fmtInrSeller(soldDeals.length ? totalRev / soldDeals.length : 0),
      thisYear: String(soldThisYear),
    };
  }, [soldDeals]);

  return (
    <div>
      <PageHeader
        title="Sold Properties"
        subtitle="Completed sale transactions closed on truEstate"
      />

      <div className="content-section">
        {/* KPI Stats */}
        <div className="stats-grid">
          <StatCard
            label="Total Properties Sold"
            value={stats.totalSold}
            icon={<SoldIcon size={22} />}
            iconBg="rgba(29,185,84,0.2)"
            iconColor="#1DB954"
          />
          <StatCard
            label="Total Sale Revenue"
            value={stats.revenue}
            icon={<MoneyIcon size={22} />}
            iconBg="rgba(249,115,22,0.2)"
            iconColor="#f97316"
          />
          <StatCard
            label="Avg Sale Price"
            value={stats.avgPrice}
            icon={<MoneyIcon size={22} />}
            iconBg="rgba(29,185,84,0.2)"
            iconColor="#1DB954"
          />
          <StatCard
            label="Sold This Year"
            value={stats.thisYear}
            icon={<ClockIcon size={22} />}
            iconBg="rgba(59,130,246,0.2)"
            iconColor="#3b82f6"
          />
        </div>

        {/* Sold Cards Grid */}
        {loading ? (
          <LoadingState message="Loading completed sales…" />
        ) : soldDeals.length === 0 ? (
          <EmptyState
            message="No sales closed yet. A property lands here once you accept a buyer's offer and the deal reaches final registration."
            icon="🏆"
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
              gap: '1.5rem',
            }}
          >
            {soldDeals.map((deal) => {
              const location = [deal.propertyCity, deal.propertyState].filter(Boolean).join(', ');
              return (
                <div key={deal.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '12rem',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      background: '#161616',
                    }}
                  >
                    {deal.propertyImage ? (
                      <img
                        src={deal.propertyImage}
                        alt={deal.propertyTitle || 'Property'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '3rem', opacity: 0.5 }}>🏠</span>
                    )}
                    <span
                      className="status-badge badge-green"
                      style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}
                    >
                      ✓ SOLD
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '0.75rem',
                        left: '0.75rem',
                        background: '#1DB954',
                        color: '#000',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      {fmtInrSeller(deal.agreedPrice)}
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontWeight: 600, fontSize: '1.05rem', color: '#fff', marginBottom: '0.35rem' }}>
                      {deal.propertyTitle || 'Property'}
                    </h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      📍 {location || '—'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#9ca3af' }}>Sale Price:</span>
                      <span style={{ color: '#1DB954', fontWeight: 600 }}>{fmtInrSeller(deal.agreedPrice)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#9ca3af' }}>Buyer:</span>
                      <span style={{ color: '#fff' }}>{deal.buyerName || 'Unknown'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#9ca3af' }}>Closed On:</span>
                      <span style={{ color: '#d1d5db' }}>{shortDate(deal.updatedAt || deal.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
