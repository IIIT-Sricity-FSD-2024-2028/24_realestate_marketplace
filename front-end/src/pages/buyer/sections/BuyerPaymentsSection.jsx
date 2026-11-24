/**
 * BuyerPaymentsSection.jsx
 * Purpose: Buyer "Payments" — outstanding commission, lifetime spend,
 *          commission invoice cards (with the arithmetic shown) and receipts.
 * Inputs (props): data – useBuyerData() (billing + catalogInfo)
 * Outputs: the payments page.
 * API calls: payment flow via usePayment, GET /billing/summary (via data.reload)
 */
import { Badge, PageHeader, StatCard, StatusLine } from '../../../components/common/ui.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { usePayment } from '../../../components/payments/PaymentProvider.jsx';
import { formatINR, shortDate } from '../../../utils/format.js';
import { gatewayBadge } from '../../../utils/billing.js';

const STATUS_LABEL = { accrued: 'Payment due', paid: 'Paid', waived: 'Waived by truEstate' };

export default function BuyerPaymentsSection({ data }) {
  const { showToast } = useToast();
  const { pay } = usePayment();
  const billing = data.billing;
  const badge = gatewayBadge(data.catalogInfo);

  const payCommission = async (commissionId) => {
    try {
      const result = await pay({ purpose: 'commission', commissionId });
      if (!result) return;
      showToast(result.message);
      await Promise.all([data.reload('billing'), data.reload('deals')]);
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Platform commission on your purchases, and your receipts"
        actions={<Badge tone={badge.tone}>{badge.text}</Badge>}
      />
      <div className="content">
        <StatusLine loading={data.loading.billing && !billing} error={!billing ? data.errors.billing : ''} />
        {billing && (
          <>
            <div className="stats-grid stats-2">
              <StatCard
                label="Outstanding"
                value={formatINR(billing.amountDue)}
                note={billing.amountDue > 0 ? 'Due at the Registration step' : 'Nothing owed'}
                valueClassName="stat-value-md"
              />
              <StatCard label="Paid to truEstate" value={formatINR(billing.lifetimeSpend)} note="Lifetime" valueClassName="stat-value-md" />
            </div>

            <h2 className="section-title-sm">Commission invoices</h2>
            <p className="text-secondary small mb-3 measure">
              truEstate charges buyer-side brokerage once — at the <strong>Registration</strong> step of a purchase. Nothing is charged on an offer, a site
              visit, or a deal that falls through, and your registration only completes once this is settled.
            </p>
            {(billing.commissions || []).length === 0 ? (
              <div className="commission-empty">
                <div className="commission-empty-icon" aria-hidden="true">
                  ₹
                </div>
                <h3>No commission charged yet</h3>
                <p>Buyer-side brokerage appears here when one of your purchases reaches the Registration step — the final stage of purchase tracking.</p>
              </div>
            ) : (
              billing.commissions.map((c) => {
                const due = c.status === 'accrued';
                return (
                  <article key={c.id} className={'commission-card' + (due ? ' due' : '')}>
                    <div className="commission-card-head">
                      <div className="commission-card-title">
                        <span className="commission-card-property">{c.propertyTitle || 'Property'}</span>
                        <span className={'commission-status ' + c.status}>{STATUS_LABEL[c.status] || c.status}</span>
                      </div>
                      <div className="commission-card-amount">
                        <span className="commission-amount-value">{formatINR(c.amount)}</span>
                        <span className="commission-amount-note">{due ? 'payable now' : c.settledAt ? 'settled ' + shortDate(c.settledAt) : ''}</span>
                      </div>
                    </div>
                    {/* The arithmetic, so the total is visibly derived. */}
                    <dl className="commission-breakdown">
                      <div className="commission-fact">
                        <dt className="commission-fact-label">Deal value</dt>
                        <dd className="commission-fact-value">{formatINR(c.dealValue)}</dd>
                      </div>
                      <div className="commission-fact">
                        <dt className="commission-fact-label">Buyer rate</dt>
                        <dd className="commission-fact-value">{c.ratePercent}%</dd>
                      </div>
                      <div className="commission-fact">
                        <dt className="commission-fact-label">Commission</dt>
                        <dd className="commission-fact-value">{formatINR(c.baseAmount)}</dd>
                      </div>
                      <div className="commission-fact">
                        <dt className="commission-fact-label">GST (18%)</dt>
                        <dd className="commission-fact-value">{formatINR(c.taxAmount)}</dd>
                      </div>
                    </dl>
                    {due && (
                      <div className="commission-card-foot">
                        <p className="commission-card-note">Charged at the Registration step. Your purchase is completed once this is paid.</p>
                        <button type="button" className="commission-pay-btn" onClick={() => payCommission(c.id)}>
                          Pay {formatINR(c.amount)}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })
            )}

            <h2 className="section-title-sm mt-5">Receipts</h2>
            <p className="text-secondary small mb-3">Every payment you have made to truEstate.</p>
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
                    {(billing.payments || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="table-empty">
                          No payments yet.
                        </td>
                      </tr>
                    ) : (
                      billing.payments.map((p) => (
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
          </>
        )}
      </div>
    </>
  );
}
