/**
 * TrackPaymentsSection.jsx
 * Purpose: "Track Payments" — the seller's deals (created when an offer is
 *          accepted) with live step status. A deal stuck at Registration
 *          because commission is unpaid shows the seller's share and a Pay
 *          button right on its row. (The old page shipped fake demo rows.)
 * Inputs (props): data – useSellerData()
 * Outputs: stats, filter pills, payments table.
 * API calls: payment flow via usePayment (POST /billing/checkout, /verify…),
 *            GET /purchases/seller-queue + /billing/summary (via data.reload)
 */
import { Fragment, useState } from 'react';
import { Badge, FilterPills, PageHeader, StatCard } from '../../../components/common/ui.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { usePayment } from '../../../components/payments/PaymentProvider.jsx';
import { formatCompactINR, formatINR, shortDate } from '../../../utils/format.js';
import { DEAL_STEPS } from '../../../utils/constants.js';
import './TrackPaymentsSection.css';

/** dealStatus → filter bucket used by the pills. */
const bucketOf = (p) => (p.dealStatus === 'completed' ? 'completed' : p.dealStatus === 'cancelled' ? 'rejected' : 'ongoing');

export default function TrackPaymentsSection({ data }) {
  const { showToast } = useToast();
  const { pay } = usePayment();
  const [filter, setFilter] = useState('all');
  const purchases = data.purchases;

  const completed = purchases.filter((p) => p.dealStatus === 'completed');
  const inProgress = purchases.filter((p) => p.dealStatus === 'in_progress');
  const sum = (list) => list.reduce((s, p) => s + (p.agreedPrice || 0), 0);
  const visible = filter === 'all' ? purchases : purchases.filter((p) => bucketOf(p) === filter);

  /** Pays this seller's commission line on a deal. */
  const payCommission = async (commissionId) => {
    try {
      const result = await pay({ purpose: 'commission', commissionId });
      if (!result) return; // closed the checkout
      showToast(result.message);
      await Promise.all([data.reload('purchases'), data.reload('billing')]);
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    }
  };

  return (
    <>
      <PageHeader title="Track Payments" subtitle="Monitor and manage all your property sale payments" />
      <div className="content">
        <div className="stats-grid">
          <StatCard label="Total Received" value={formatCompactINR(sum(completed))} icon="dollar" />
          <StatCard label="Pending Payments" value={formatCompactINR(sum(inProgress))} icon="clock" tone="orange" />
          <StatCard label="Deals In Progress" value={inProgress.length} icon="activity" tone="blue" />
          <StatCard label="Total Deal Value" value={formatCompactINR(sum(purchases.filter((p) => p.dealStatus !== 'cancelled')))} icon="checkCircle" />
        </div>
        <FilterPills
          label="Payment status"
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: 'All', count: purchases.length },
            { key: 'ongoing', label: 'Ongoing', count: inProgress.length },
            { key: 'completed', label: 'Completed', count: completed.length },
            { key: 'rejected', label: 'Cancelled', count: purchases.filter((p) => p.dealStatus === 'cancelled').length },
          ]}
        />
        <h2 className="section-title-sm">Payment History</h2>
        <div className="table-card">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Transaction ID</th>
                  <th scope="col">Property</th>
                  <th scope="col">Buyer</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.loading.purchases ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      Loading…
                    </td>
                  </tr>
                ) : data.errors.purchases ? (
                  <tr>
                    <td colSpan={6} className="table-empty text-danger">
                      {data.errors.purchases}
                    </td>
                  </tr>
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      {purchases.length ? 'No deals in this category.' : "No purchases yet — they appear here once you accept a buyer's offer."}
                    </td>
                  </tr>
                ) : (
                  visible.map((p) => {
                    const tone = p.dealStatus === 'completed' ? 'green' : p.dealStatus === 'cancelled' ? 'red' : 'orange';
                    const label =
                      p.dealStatus === 'completed' ? 'Completed' : p.dealStatus === 'cancelled' ? 'Cancelled' : DEAL_STEPS[p.dealStep - 1] || 'In Progress';
                    // This seller's unpaid commission line on this deal, if any.
                    const mine = (p.commissions || []).find((c) => c.side === 'seller' && c.status === 'accrued');
                    return (
                      <Fragment key={p.id}>
                        <tr>
                          <td className="mono text-secondary">{p.id.slice(-8).toUpperCase()}</td>
                          <td>{p.propertyTitle || 'Property'}</td>
                          <td className="text-secondary">{p.buyerName || 'Unknown'}</td>
                          <td className="text-brand strong">{formatCompactINR(p.agreedPrice)}</td>
                          <td className="text-secondary">{shortDate(p.createdAt)}</td>
                          <td>
                            <Badge tone={tone}>● {label}</Badge>
                          </td>
                        </tr>
                        {p.awaitingCommission && (
                          <tr className="commission-due-row">
                            <td colSpan={6}>
                              <div className="commission-due-banner">
                                <div className="commission-due-text">
                                  <strong>Registration is waiting on the platform commission.</strong>
                                  {mine
                                    ? 'Your seller-side share is ' +
                                      formatINR(mine.amount) +
                                      ' (' +
                                      mine.ratePercent +
                                      '% of ' +
                                      formatINR(mine.dealValue) +
                                      ', incl. GST). The deal completes once both sides have paid.'
                                    : 'Your side is settled — waiting on the buyer to pay theirs.'}
                                </div>
                                {mine && (
                                  <button type="button" className="commission-due-btn" onClick={() => payCommission(mine.id)}>
                                    Pay {formatINR(mine.amount)}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
