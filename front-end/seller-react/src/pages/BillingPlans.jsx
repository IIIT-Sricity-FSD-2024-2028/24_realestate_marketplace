import { useState, useEffect, useCallback, useMemo } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { sellerApi } from '../api/sellerApi.js';
import { formatINR, shortDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import { useCheckout } from '../context/CheckoutContext.jsx';
import useLiveRefresh from '../hooks/useLiveRefresh.js';
import { LoadingState } from '../components/StateMessage.jsx';

export default function BillingPlans() {
  const { showToast } = useToast();
  const { pay } = useCheckout();

  const [catalog, setCatalog] = useState(null);
  const [summary, setSummary] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPromoteProp, setSelectedPromoteProp] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [catRes, sumRes] = await Promise.all([
        catalog ? Promise.resolve({ data: catalog }) : sellerApi.getBillingCatalog(),
        sellerApi.getBillingSummary(),
      ]);
      setCatalog(catRes.data);
      setSummary(sumRes.data);

      // Auto-select first verified property for promote panel if none selected
      const verifiedListings = (sumRes.data?.listings || []).filter(
        (l) => l.verificationStatus === 'verified'
      );
      if (verifiedListings.length && !selectedPromoteProp) {
        setSelectedPromoteProp(verifiedListings[0].id);
      }
    } catch (err) {
      if (!silent) showToast(err.message || 'Could not load billing details', 'error');
    } finally {
      setLoading(false);
    }
  }, [catalog, selectedPromoteProp, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useLiveRefresh(() => loadData(true));

  async function handleBuyPlan(tier) {
    try {
      const result = await pay({ purpose: 'subscription', tier, cycle: billingCycle });
      if (!result) return;
      showToast(result.message || 'Subscription updated successfully!');
      loadData(true);
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    }
  }

  async function handleCancelPlan() {
    if (!confirm('Cancel your plan and drop back to the free Starter tier (2 active listings)?')) return;
    try {
      const res = await sellerApi.cancelSubscription();
      showToast(res.message || 'Subscription cancelled');
      loadData(true);
    } catch (err) {
      showToast(err.message || 'Could not cancel the plan', 'error');
    }
  }

  async function handleBuyPromotion(pack) {
    if (!selectedPromoteProp) {
      showToast('Choose a verified listing to promote first', 'error');
      return;
    }
    try {
      const result = await pay({
        purpose: 'featured_listing',
        propertyId: selectedPromoteProp,
        pack,
      });
      if (!result) return;
      showToast(result.message || 'Listing promoted successfully!');
      loadData(true);
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    }
  }

  async function handlePayCommission(commissionId) {
    try {
      const result = await pay({ purpose: 'commission', commissionId });
      if (!result) return;
      showToast(result.message || 'Commission invoice settled!');
      loadData(true);
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    }
  }

  const plan = summary?.plan;
  const currentTier = plan?.tier || 'free';
  const cycles = catalog?.cycles || [
    { key: 'monthly', label: 'Monthly', discountPct: 0, months: 1 },
    { key: 'quarterly', label: 'Quarterly', discountPct: 10, months: 3 },
    { key: 'annual', label: 'Annual', discountPct: 20, months: 12 },
  ];
  const activeCycleObj = cycles.find((c) => c.key === billingCycle) || cycles[0];
  const months = activeCycleObj.months || 1;

  const verifiedListings = useMemo(() => {
    return (summary?.listings || []).filter((l) => l.verificationStatus === 'verified');
  }, [summary]);

  const quotaUsed = plan?.listingsUsed ?? 0;
  const quotaTotal = plan?.listingQuota;
  const quotaPct = quotaTotal === null ? 100 : Math.min(100, Math.round((quotaUsed / quotaTotal) * 100));

  return (
    <div>
      <PageHeader
        title="Billing &amp; Plans"
        subtitle="Manage your listing plan tier, featured promotions, and commission settlements"
        action={
          catalog && (
            <span
              className={`status-badge ${catalog.isLive ? 'badge-green' : 'badge-orange'}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              {catalog.isLive
                ? `● Live Payments · ${catalog.gateway}`
                : `● Test Mode · No Real Money`}
            </span>
          )
        }
      />

      <div className="content-section">
        {loading ? (
          <LoadingState message="Loading your billing profile…" />
        ) : (
          <>
            {/* Plan KPI Overview Card */}
            <div className="card" style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                <div>
                  <div className="stat-label">Current Plan</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                    {plan?.planName || 'Starter'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                    {plan?.expiresAt
                      ? `${plan.daysRemaining} day${plan.daysRemaining === 1 ? '' : 's'} remaining`
                      : 'Free forever'}
                  </div>
                </div>

                <div>
                  <div className="stat-label">Listing Quota</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1DB954' }}>
                    {quotaTotal === null ? `${quotaUsed} / ∞` : `${quotaUsed} / ${quotaTotal}`}
                  </div>
                  <div className="quota-bar" style={{ width: '100%', maxWidth: '14rem' }}>
                    <div
                      className={`quota-fill ${quotaTotal !== null && quotaUsed >= quotaTotal ? 'at-limit' : quotaPct >= 80 ? 'near-limit' : ''}`}
                      style={{ width: `${quotaPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="stat-label">Outstanding Balance</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: summary?.amountDue > 0 ? '#f59e0b' : '#fff' }}>
                    {formatINR(summary?.amountDue || 0)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                    {summary?.amountDue > 0 ? 'Due on closed deals' : 'Nothing owed'}
                  </div>
                </div>

                <div>
                  <div className="stat-label">Lifetime Spend</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                    {formatINR(summary?.lifetimeSpend || 0)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                    All plans &amp; services
                  </div>
                </div>
              </div>
            </div>

            {/* Plans Section */}
            <div className="billing-section-head">
              <div>
                <h2 className="billing-h2">Listing Plans</h2>
                <p className="billing-sub">Increase your active listing portfolio with higher tiers</p>
              </div>

              {/* Cycle Toggle */}
              <div className="cycle-toggle">
                {cycles.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className={`cycle-btn ${billingCycle === c.key ? 'active' : ''}`}
                    onClick={() => setBillingCycle(c.key)}
                  >
                    {c.label}
                    {c.discountPct > 0 && <span className="cycle-save">−{c.discountPct}%</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Cards Grid */}
            <div className="plan-grid" style={{ marginBottom: '3rem' }}>
              {(catalog?.plans || []).map((p) => {
                const pricing = p.pricing[billingCycle] || {};
                const isCurrent = p.tier === currentTier;
                const isFree = p.pricePerMonth === 0;
                const perMonth = isFree ? 0 : Math.round((pricing.base || 0) / months);

                return (
                  <div
                    key={p.tier}
                    className={`plan-card ${isCurrent ? 'current' : ''} ${p.tier === 'gold' ? 'recommended' : ''}`}
                  >
                    {isCurrent ? (
                      <span className="plan-flag">Your Plan</span>
                    ) : p.tier === 'gold' ? (
                      <span className="plan-flag muted">Best Value</span>
                    ) : null}

                    <div className="plan-name">{p.name}</div>
                    <div className="plan-price">
                      {isFree ? 'Free' : formatINR(perMonth)}
                      {!isFree && <span className="plan-price-unit">/mo</span>}
                    </div>
                    <div className="plan-billed">
                      {isFree
                        ? 'No credit card needed'
                        : `${formatINR(pricing.total)} billed ${billingCycle} (incl. GST)`}
                    </div>

                    <ul className="plan-features">
                      {p.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>

                    {isCurrent && isFree ? (
                      <button className="plan-btn" disabled>Current Plan</button>
                    ) : isCurrent ? (
                      <>
                        <button className="plan-btn" onClick={() => handleBuyPlan(p.tier)}>
                          Extend Plan
                        </button>
                        <button
                          className="plan-btn secondary"
                          style={{ marginTop: '0.5rem' }}
                          onClick={handleCancelPlan}
                        >
                          Cancel Plan
                        </button>
                      </>
                    ) : isFree ? (
                      <button className="plan-btn secondary" disabled>Included</button>
                    ) : (
                      <button className="plan-btn" onClick={() => handleBuyPlan(p.tier)}>
                        Choose {p.name}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Promote a Listing Section */}
            <div style={{ marginBottom: '3rem' }}>
              <div className="billing-section-head">
                <div>
                  <h2 className="billing-h2">Promote a Listing</h2>
                  <p className="billing-sub">Boost your listing with top-of-feed placement and badge</p>
                </div>
              </div>

              <div className="card">
                <div className="promote-row">
                  <div className="promote-field">
                    <label className="form-label" style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
                      Select Verified Property to Boost
                    </label>
                    <select
                      className="form-control"
                      value={selectedPromoteProp}
                      onChange={(e) => setSelectedPromoteProp(e.target.value)}
                    >
                      {verifiedListings.length === 0 ? (
                        <option value="">No verified listings available</option>
                      ) : (
                        verifiedListings.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.title} {l.isFeatured ? `(Boosted until ${shortDate(l.featuredUntil)})` : ''}
                          </option>
                        ))
                      )}
                    </select>
                    <p style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                      Only admin-approved verified properties can receive featured listing boosts.
                    </p>
                  </div>

                  <div className="promote-packs">
                    {(catalog?.featuredPacks || []).map((pack) => (
                      <div key={pack.tier} className="pack-card">
                        <div className="pack-name">{pack.name}</div>
                        <div className="pack-price">{formatINR(pack.total)}</div>
                        <div className="pack-meta">
                          {pack.days} days duration · incl. GST
                          <br />
                          {pack.highlights.join(' · ')}
                        </div>
                        <button
                          type="button"
                          className="pack-btn"
                          disabled={!verifiedListings.length || !selectedPromoteProp}
                          onClick={() => handleBuyPromotion(pack.tier)}
                        >
                          {verifiedListings.length ? 'Promote Listing' : 'Needs Verified Listing'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Commission Invoices Section */}
            <div style={{ marginBottom: '3rem' }}>
              <div className="billing-section-head">
                <div>
                  <h2 className="billing-h2">Commission Invoices</h2>
                  <p className="billing-sub">Platform commission owed upon deal completion at registration</p>
                </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Deal Value</th>
                        <th>Rate %</th>
                        <th>Commission Amount</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!(summary?.commissions?.length) ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                            No commission invoices yet — fees apply only when one of your property deals closes.
                          </td>
                        </tr>
                      ) : (
                        summary.commissions.map((c) => {
                          const isPaid = c.status === 'paid';
                          const isAccrued = c.status === 'accrued';
                          const badge = isPaid ? 'badge-green' : isAccrued ? 'badge-orange' : 'badge-blue';

                          return (
                            <tr key={c.id}>
                              <td style={{ color: '#fff', fontWeight: 600 }}>{c.propertyTitle || 'Property'}</td>
                              <td style={{ color: '#9ca3af' }}>{formatINR(c.dealValue)}</td>
                              <td style={{ color: '#9ca3af' }}>{c.ratePercent}%</td>
                              <td style={{ color: '#1DB954', fontWeight: 700 }}>{formatINR(c.amount)}</td>
                              <td>
                                <span className={`status-badge ${badge}`}>{c.status}</span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {isAccrued ? (
                                  <button
                                    className="btn-primary"
                                    style={{ padding: '0.45rem 1rem', fontSize: '0.825rem' }}
                                    onClick={() => handlePayCommission(c.id)}
                                  >
                                    Pay Now
                                  </button>
                                ) : (
                                  <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>—</span>
                                )}
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

            {/* Payment History Receipts */}
            <div>
              <div className="billing-section-head">
                <div>
                  <h2 className="billing-h2">Payment History &amp; Receipts</h2>
                  <p className="billing-sub">Record of verified transactions on your account</p>
                </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Receipt ID</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!(summary?.payments?.length) ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                            No payment history recorded yet.
                          </td>
                        </tr>
                      ) : (
                        summary.payments.map((p) => {
                          const isPaid = p.status === 'paid';
                          const badge = isPaid ? 'badge-green' : p.status === 'failed' ? 'badge-red' : 'badge-orange';

                          return (
                            <tr key={p.id}>
                              <td style={{ fontFamily: 'monospace', color: '#9ca3af', fontSize: '0.825rem' }}>
                                {p.receipt || p.id.slice(-8).toUpperCase()}
                              </td>
                              <td style={{ color: '#fff' }}>{p.description}</td>
                              <td style={{ color: '#1DB954', fontWeight: 700 }}>{formatINR(p.amount)}</td>
                              <td>
                                <span className={`status-badge ${badge}`}>{p.status}</span>
                              </td>
                              <td style={{ color: '#9ca3af', fontSize: '0.825rem' }}>
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
          </>
        )}
      </div>
    </div>
  );
}
