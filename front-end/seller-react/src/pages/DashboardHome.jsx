import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { PropertyIcon, SoldIcon, ClockIcon, MoneyIcon, PlusIcon, ChatIcon } from '../components/Icons.jsx';
import { sellerApi } from '../api/sellerApi.js';
import { fmtInrSeller, formatINR } from '../utils/format.js';
import useLiveRefresh from '../hooks/useLiveRefresh.js';
import { LoadingState } from '../components/StateMessage.jsx';
import { useSellerProfile } from '../context/SellerProfileContext.jsx';

export default function DashboardHome() {
  const navigate = useNavigate();
  const { fullName } = useSellerProfile();

  const [listings, setListings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [negotiations, setNegotiations] = useState([]);
  const [billingSummary, setBillingSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [listRes, purRes, negRes, billRes] = await Promise.all([
        sellerApi.getMyListings().catch(() => ({ data: [] })),
        sellerApi.getSellerPurchases().catch(() => ({ data: { items: [] } })),
        sellerApi.getSellerNegotiations().catch(() => ({ data: { items: [] } })),
        sellerApi.getBillingSummary().catch(() => ({ data: null })),
      ]);
      setListings(listRes.data || []);
      setPurchases(purRes.data?.items || []);
      setNegotiations(negRes.data?.items || []);
      setBillingSummary(billRes.data || null);
    } catch (err) {
      console.warn('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useLiveRefresh(() => loadData(true));

  // Calculations
  const stats = useMemo(() => {
    const sold = purchases.filter((p) => p.dealStatus === 'completed' && p.propertyListingType === 'sale');
    const soldRentedIds = new Set(
      purchases
        .filter((p) => p.dealStatus === 'completed')
        .map((p) => String(p.propertyId))
    );

    const pending = listings.filter((p) => p.verificationStatus === 'pending');
    const active = listings.filter(
      (p) => p.verificationStatus === 'verified' && !soldRentedIds.has(String(p.id))
    );
    const saleRevenue = sold.reduce((sum, d) => sum + (d.agreedPrice || 0), 0);

    return {
      total: listings.length,
      active: active.length,
      pending: pending.length,
      revenue: fmtInrSeller(saleRevenue),
    };
  }, [listings, purchases]);

  const pendingOffers = useMemo(() => {
    return negotiations.filter((n) => n.status === 'pending');
  }, [negotiations]);

  const plan = billingSummary?.plan;
  const quotaUsed = plan?.listingsUsed ?? listings.length;
  const quotaTotal = plan?.listingQuota;
  const quotaFull = quotaTotal !== null && quotaTotal !== undefined && quotaUsed >= quotaTotal;

  return (
    <div>
      <PageHeader
        title="Seller Dashboard"
        subtitle={`Welcome back, ${fullName}! Here's your portfolio overview`}
      />

      <div className="content-section">
        {/* Quota Notice if near or at limit */}
        {plan && (
          <div className={`quota-notice ${quotaFull ? 'full' : ''}`} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="quota-notice-main">
                  <strong>{plan.planName} Plan</strong> ·{' '}
                  {quotaTotal === null
                    ? 'Unlimited properties'
                    : `${quotaUsed} of ${quotaTotal} properties listed ${quotaFull ? '— limit reached' : `· ${quotaTotal - quotaUsed} remaining`}`}
                </div>
                {quotaFull && (
                  <span className="quota-notice-sub">
                    Upgrade your plan to list more properties or delete inactive listings.
                  </span>
                )}
              </div>
              <button
                className={quotaFull ? 'quota-notice-btn' : 'btn-outline'}
                onClick={() => navigate('/billing')}
                style={{ margin: 0, padding: '0.45rem 1rem', fontSize: '0.8125rem' }}
              >
                {quotaFull ? 'Upgrade Plan' : 'Manage Subscription'}
              </button>
            </div>
          </div>
        )}

        {/* Pending Negotiations Alert */}
        {pendingOffers.length > 0 && (
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(29,185,84,0.15) 0%, rgba(26,26,26,0.9) 100%)',
              border: '1px solid rgba(29,185,84,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              padding: '1.25rem 1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.5rem',
                  background: '#1DB954',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                }}
              >
                <ChatIcon size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                  {pendingOffers.length} New Buyer Offer{pendingOffers.length > 1 ? 's' : ''} Awaiting Response!
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>
                  Review and accept, counter, or reject buyer offers in the negotiation hub.
                </div>
              </div>
            </div>
            <button className="btn-primary" onClick={() => navigate('/negotiate')}>
              View Offers →
            </button>
          </div>
        )}

        {/* KPI Stats Grid */}
        <div className="stats-grid">
          <StatCard
            label="Total Listings"
            value={stats.total}
            icon={<PropertyIcon size={22} />}
            iconBg="rgba(29,185,84,0.2)"
            iconColor="#1DB954"
          />
          <StatCard
            label="Active Listings"
            value={stats.active}
            icon={<SoldIcon size={22} />}
            iconBg="rgba(29,185,84,0.2)"
            iconColor="#1DB954"
          />
          <StatCard
            label="Pending Review"
            value={stats.pending}
            icon={<ClockIcon size={22} />}
            iconBg="rgba(249,115,22,0.2)"
            iconColor="#f97316"
          />
          <StatCard
            label="Total Revenue"
            value={stats.revenue}
            icon={<MoneyIcon size={22} />}
            iconBg="rgba(29,185,84,0.2)"
            iconColor="#1DB954"
          />
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Listings</h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-outline" onClick={() => navigate('/my-listings')}>
              View All Listings
            </button>
            <button className="btn-primary" onClick={() => navigate('/add-property')}>
              <PlusIcon size={18} /> Add New Property
            </button>
          </div>
        </div>

        {/* Recent Listings Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <LoadingState message="Loading your listings…" />
          ) : listings.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '3rem 1.5rem' }}>
              <p style={{ marginBottom: '1rem', fontSize: '1rem' }}>No listings yet — add your first property to get started.</p>
              <button className="btn-primary" onClick={() => navigate('/add-property')}>
                <PlusIcon size={18} /> Add Property
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Location</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.slice(0, 5).map((prop) => {
                    const isApproved = prop.verificationStatus === 'verified';
                    const isRejected = prop.verificationStatus === 'rejected';
                    const badgeClass = isApproved ? 'badge-green' : isRejected ? 'badge-red' : 'badge-orange';
                    const label = isApproved ? '● Approved' : isRejected ? '● Rejected' : '● Pending Review';

                    return (
                      <tr key={prop.id}>
                        <td style={{ color: '#fff', fontWeight: 500 }}>
                          {prop.title}
                          {prop.isFeatured && (
                            <span className="featured-flag" style={{ marginLeft: '0.5rem' }}>
                              ★ FEATURED
                            </span>
                          )}
                        </td>
                        <td style={{ color: '#9ca3af' }}>{prop.city}</td>
                        <td style={{ color: '#fff', fontWeight: 600 }}>{formatINR(prop.price)}</td>
                        <td>
                          <span className={`status-badge ${badgeClass}`}>{label}</span>
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
