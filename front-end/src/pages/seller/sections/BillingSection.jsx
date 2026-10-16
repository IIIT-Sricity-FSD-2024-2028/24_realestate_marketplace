/**
 * BillingSection.jsx
 * Purpose: "Billing & Plans" — current plan and quota, buying / extending /
 *          cancelling a plan, promoting a verified listing, paying commission
 *          invoices, and the payment history. Every price comes from
 *          GET /billing/catalog, and the server re-prices at checkout, so the
 *          price shown and the price charged cannot drift apart.
 * Inputs (props): data – useSellerData() (catalog, billing, listings)
 * Outputs: the billing page.
 * API calls: payment flow via usePayment (checkout → gateway → verify),
 *            PATCH /billing/subscription/cancel,
 *            GET /billing/summary + /properties/mine (via data.reload)
 */
import { useEffect, useState } from 'react';
import { Badge, Card, PageHeader, StatCard, StatusLine } from '../../../components/common/ui.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { useDialog } from '../../../components/feedback/DialogProvider.jsx';
import { usePayment } from '../../../components/payments/PaymentProvider.jsx';
import { billingApi } from '../../../api/services.js';
import { formatINR, shortDate } from '../../../utils/format.js';
import { gatewayBadge } from '../../../utils/billing.js';
import './BillingSection.css';

export default function BillingSection({ data }) {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const { pay } = usePayment();
  const [cycle, setCycle] = useState('monthly'); // billing cycle toggle
  const [promoteId, setPromoteId] = useState(''); // listing chosen for promotion
  const [busy, setBusy] = useState(false); // blocks double-clicks during checkout
  const { catalog, billing } = data;

  const verified = ((billing && billing.listings) || []).filter((l) => l.verificationStatus === 'verified');
  // Keep the promote dropdown pointing at a real verified listing.
  useEffect(() => {
    if (!verified.some((l) => l.id === promoteId)) setPromoteId(verified[0] ? verified[0].id : '');
  }, [verified, promoteId]);

  /** Refresh the numbers a payment can change. */
  const refresh = () => Promise.all([data.reload('billing'), data.reload('listings'), data.reload('purchases')]);

  /** Shared runner for every paid action. */
  const checkout = async (request) => {
    setBusy(true);
    try {
      const result = await pay(request);
      if (!result) return; // customer closed the checkout
      showToast(result.message);
      await refresh();
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const cancelPlan = async () => {
    const ok = await confirm({
      message: 'Cancel your plan and drop back to the free Starter tier?',
      confirmText: 'Cancel plan',
      cancelText: 'Keep plan',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await billingApi.cancelSubscription();
      showToast(res.message);
      await refresh();
    } catch (err) {
      showToast(err.message || 'Could not cancel the plan', 'error');
    }
  };

  const badge = gatewayBadge(catalog);
  if (!catalog || !billing) {
    return (
      <>
        <PageHeader title="Billing & Plans" subtitle="Your listing plan, paid promotions and platform invoices" />
        <div className="content">
          <StatusLine loading={data.loading.billing} error={data.errors.billing} />
        </div>
      </>
    );
  }

  const plan = billing.plan || {};
  const used = plan.listingsUsed || 0;
  const quota = plan.listingQuota; // null = unlimited
  const pct = quota === null ? 100 : Math.min(100, Math.round((used / Math.max(quota, 1)) * 100));
  const fillClass = quota !== null && used >= quota ? ' at-limit' : pct >= 80 ? ' near-limit' : '';
  const currentTier = plan.tier || 'free';
  const months = (catalog.cycles.find((c) => c.key === cycle) || {}).months || 1;
  const commissions = billing.commissions || [];
  const payments = billing.payments || [];

  return (
    <>
      <PageHeader
        title="Billing & Plans"
        subtitle="Your listing plan, paid promotions and platform invoices"
        actions={<Badge tone={badge.tone}>{badge.text}</Badge>}
      />
      <div className="content">
        <div className="stats-grid">
          <StatCard
            label="Current plan"
            value={plan.planName || 'Starter'}
            note={plan.expiresAt ? plan.daysRemaining + ' day' + (plan.daysRemaining === 1 ? '' : 's') + ' remaining' : 'Free forever'}
            valueClassName="stat-value-md"
          />
          <StatCard label="Listing quota" value={quota === null ? used + ' / ∞' : used + ' / ' + quota} valueClassName="stat-value-md">
            <div className="quota-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Listing quota used">
              <div className={'quota-fill' + fillClass} style={{ width: pct + '%' }} />
            </div>
          </StatCard>
          <StatCard
            label="Outstanding commission"
            value={formatINR(billing.amountDue)}
            note={billing.amountDue > 0 ? 'Due on closed deals' : 'Nothing owed'}
            valueClassName="stat-value-md"
          />
          <StatCard label="Paid to truEstate" value={formatINR(billing.lifetimeSpend)} note="Lifetime" valueClassName="stat-value-md" />
        </div>

        {/* ── Plans ── */}
        <div className="space-between wrap mb-3">
          <h2 className="section-title-sm mb-0">Listing plans</h2>
          <div className="cycle-toggle" role="group" aria-label="Billing cycle">
            {catalog.cycles.map((c) => (
              <button
                key={c.key}
                type="button"
                className={'cycle-btn' + (c.key === cycle ? ' active' : '')}
                aria-pressed={c.key === cycle}
                onClick={() => setCycle(c.key)}
              >
                {c.label}
                {c.discountPct ? <span className="cycle-save">−{c.discountPct}%</span> : null}
              </button>
            ))}
          </div>
        </div>
        <div className="plan-grid">
          {catalog.plans.map((p) => {
            const price = p.pricing[cycle];
            const isCurrent = p.tier === currentTier;
            const isFree = p.pricePerMonth === 0;
            const perMonth = isFree ? 0 : Math.round(price.base / months); // effective monthly rate
            return (
              <div key={p.tier} className={'plan-card' + (isCurrent ? ' current' : '') + (p.tier === 'gold' ? ' recommended' : '')}>
                {isCurrent ? <span className="plan-flag">Your plan</span> : p.tier === 'gold' ? <span className="plan-flag muted">Best value</span> : null}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price">
                  {isFree ? 'Free' : formatINR(perMonth)}
                  {!isFree && <span className="plan-price-unit">/mo</span>}
                </div>
                <div className="plan-billed">{isFree ? 'No card needed' : formatINR(price.total) + ' billed ' + cycle + ' (incl. GST)'}</div>
                <ul className="plan-features">
                  {p.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                {isCurrent && isFree ? (
                  <button type="button" className="plan-btn" disabled>
                    Current plan
                  </button>
                ) : isCurrent ? (
                  <>
                    <button type="button" className="plan-btn" disabled={busy} onClick={() => checkout({ purpose: 'subscription', tier: p.tier, cycle })}>
                      Extend plan
                    </button>
                    <button type="button" className="plan-btn secondary mt-2" onClick={cancelPlan}>
                      Cancel plan
                    </button>
                  </>
                ) : isFree ? (
                  <button type="button" className="plan-btn secondary" disabled>
                    Included
                  </button>
                ) : (
                  <button type="button" className="plan-btn" disabled={busy} onClick={() => checkout({ purpose: 'subscription', tier: p.tier, cycle })}>
                    Choose {p.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Promotions ── */}
        <h2 className="section-title-sm mt-5">Promote a listing</h2>
        <p className="text-secondary small mb-3">Paid promotion puts a listing at the very top of buyer search results.</p>
        <Card>
          <div className="promote-row">
            <div className="form-group">
              <label className="form-label" htmlFor="promote-listing">
                Listing
              </label>
              <select
                id="promote-listing"
                className="form-control"
                value={promoteId}
                onChange={(e) => setPromoteId(e.target.value)}
                disabled={!verified.length}
              >
                {verified.length ? (
                  verified.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                      {l.isFeatured ? ' — featured until ' + shortDate(l.featuredUntil) : ''}
                    </option>
                  ))
                ) : (
                  <option value="">No verified listings yet</option>
                )}
              </select>
            </div>
            <div className="promote-packs">
              {catalog.featuredPacks.map((pack) => (
                <div key={pack.tier} className="pack-card">
                  <div className="pack-name">{pack.name}</div>
                  <div className="pack-price">{formatINR(pack.total)}</div>
                  <div className="pack-meta">
                    {pack.days} days · incl. GST
                    {pack.highlights.map((h) => (
                      <div key={h}>{h}</div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="pack-btn"
                    disabled={!verified.length || busy}
                    onClick={() =>
                      promoteId
                        ? checkout({ purpose: 'featured_listing', propertyId: promoteId, pack: pack.tier })
                        : showToast('Choose a listing to promote first', 'error')
                    }
                  >
                    {verified.length ? 'Promote listing' : 'Needs a verified listing'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Commission invoices ── */}
        <h2 className="section-title-sm mt-5">Commission invoices</h2>
        <p className="text-secondary small mb-3">Charged only when a deal actually closes — never on an offer that falls through.</p>
        <div className="table-card">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Property</th>
                  <th scope="col">Deal value</th>
                  <th scope="col">Rate</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No commission yet — it is charged only when one of your deals closes.
                    </td>
                  </tr>
                ) : (
                  commissions.map((c) => (
                    <tr key={c.id}>
                      <td>{c.propertyTitle || 'Property'}</td>
                      <td>{formatINR(c.dealValue)}</td>
                      <td>{c.ratePercent}%</td>
                      <td className="strong">{formatINR(c.amount)}</td>
                      <td>
                        <Badge tone={c.status === 'paid' ? 'green' : c.status === 'waived' ? 'blue' : 'orange'}>{c.status}</Badge>
                      </td>
                      <td className="align-right">
                        {c.status === 'accrued' ? (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={busy}
                            onClick={() => checkout({ purpose: 'commission', commissionId: c.id })}
                          >
                            Pay now
                          </button>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Payment history ── */}
        <h2 className="section-title-sm mt-5">Payment history</h2>
        <div className="table-card">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Receipt</th>
                  <th scope="col">For</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-empty">
                      No payments yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.receipt + (p.createdAt || '')}>
                      <td className="mono text-secondary">{p.receipt}</td>
                      <td>{p.description}</td>
                      <td className="strong">{formatINR(p.amount)}</td>
                      <td>
                        <Badge tone={p.status === 'paid' ? 'green' : p.status === 'failed' ? 'red' : 'orange'}>{p.status}</Badge>
                      </td>
                      <td className="text-secondary small">{shortDate(p.paidAt || p.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
