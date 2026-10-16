/**
 * PurchaseTrackingSection.jsx
 * Purpose: "Purchase Tracking" — the admin walks each accepted deal through
 *          the five steps (verified offline). Registration cannot complete
 *          while platform commission is unpaid, so that button is disabled
 *          with the reason shown instead of failing with a 402.
 * Inputs (props): desk – shared purchases + reload
 * Outputs: status pills + deal cards with progress tracker.
 * API calls: PATCH /purchases/:id/advance, PATCH /purchases/:id/cancel,
 *            GET /purchases/review-queue (via desk.reload)
 */
import { useState } from 'react';
import { Badge, FilterPills, PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import DealProgress from '../../../components/deals/DealProgress.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { useDialog } from '../../../components/feedback/DialogProvider.jsx';
import { purchasesApi } from '../../../api/services.js';
import { formatCompactINR, formatINR, joinPlace } from '../../../utils/format.js';

const STATUS = {
  completed: { tone: 'green', text: '✅ Completed' },
  cancelled: { tone: 'red', text: '✕ Cancelled' },
  in_progress: { tone: 'orange', text: '⏳ In Progress' },
};

export default function PurchaseTrackingSection({ desk }) {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const list = filter === 'all' ? desk.purchases : desk.purchases.filter((p) => p.dealStatus === filter);

  const advance = async (p) => {
    setBusyId(p.id);
    try {
      await purchasesApi.advance(p.id);
      showToast('Purchase advanced');
      await desk.reload('purchases');
    } catch (err) {
      showToast(err.message || 'Failed to advance purchase', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (p) => {
    if (!(await confirm({ message: 'Cancel this purchase? This cannot be undone.', confirmText: 'Cancel purchase', cancelText: 'Keep it', danger: true })))
      return;
    setBusyId(p.id);
    try {
      await purchasesApi.cancel(p.id);
      showToast('Purchase cancelled');
      await desk.reload('purchases');
    } catch (err) {
      showToast(err.message || 'Failed to cancel purchase', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader title="Purchase Tracking" subtitle="Manage ongoing deal steps — verify offline, then mark done here" />
      <div className="content">
        <FilterPills
          label="Deal status"
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: 'All' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' },
          ]}
        />
        <StatusLine loading={desk.loading.purchases && !desk.purchases.length} error={desk.errors.purchases} />
        {!desk.loading.purchases && list.length === 0 && <p className="state-line">No purchases match.</p>}
        {list.map((p) => {
          const status = STATUS[p.dealStatus] || STATUS.in_progress;
          const blocked = !!p.awaitingCommission; // commission must clear first
          const unpaid = (p.commissions || []).filter((c) => c.status === 'accrued');
          return (
            <article key={p.id} className="card">
              <div className="space-between mb-3">
                <div>
                  <h3 className="strong">{p.propertyTitle || 'Property'}</h3>
                  <p className="text-secondary small">
                    Buyer: {p.buyerName || 'Unknown'} • 📍 {joinPlace(p.propertyCity, p.propertyState)}
                  </p>
                  <p className="text-secondary small">
                    Agreed Price: <span className="text-brand strong">{formatCompactINR(p.agreedPrice)}</span>
                  </p>
                </div>
                <Badge tone={status.tone}>{status.text}</Badge>
              </div>
              <DealProgress step={p.dealStep} status={p.dealStatus} />
              {blocked && (
                <div className="notice notice-amber">
                  <strong>Platform commission outstanding — {formatINR(p.commissionDue)}</strong>
                  <div>
                    This deal is at Registration, the final step. It cannot be marked complete until the buyer and seller have settled their commission from
                    their own dashboards. {unpaid.map((c) => c.side + ' owes ' + formatINR(c.amount)).join(' · ')}
                  </div>
                </div>
              )}
              <div className="button-row">
                {p.dealStatus === 'in_progress' ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary grow"
                      disabled={blocked || busyId === p.id}
                      title={blocked ? 'Commission outstanding' : undefined}
                      onClick={() => advance(p)}
                    >
                      {blocked ? 'Awaiting commission payment' : p.dealStep >= 5 ? 'Mark Registration Complete' : 'Advance to Next Step'}
                    </button>
                    <button type="button" className="btn btn-danger" disabled={busyId === p.id} onClick={() => cancel(p)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <span className="text-secondary small grow center">Deal {p.dealStatus}</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
