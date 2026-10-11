import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import PillFilters from '../components/PillFilters.jsx';
import StateMessage, { DataState } from '../components/StateMessage.jsx';
import DealProgress from '../components/DealProgress.jsx';
import { advancePurchase, cancelPurchase, getPurchaseQueue } from '../api/adminApi.js';
import { useToast } from '../context/ToastContext.jsx';
import useAdminData from '../hooks/useAdminData.js';
import { fmtInr, formatINR } from '../utils/format.js';

const STATUS_STYLE = {
  completed: { color: '#1DB954', rgb: '29,185,84', text: '✅ Completed' },
  cancelled: { color: '#ef4444', rgb: '239,68,68', text: '✕ Cancelled' },
  in_progress: { color: '#f97316', rgb: '249,115,22', text: '⏳ In Progress' },
};

/**
 * Purchase Tracking (was data-section="purchase-tracking").
 * API: GET /purchases/review-queue, PATCH /purchases/:id/advance, PATCH /purchases/:id/cancel.
 * The admin verifies each deal step offline and advances it here. The final
 * step is blocked while platform commission is still owed (server returns 402).
 */
export default function PurchaseTracking() {
  const showToast = useToast();
  const { status, data, error, reload } = useAdminData(async () => (await getPurchaseQueue()).data.items);
  const [filter, setFilter] = useState('all');
  const visible = (data || []).filter((p) => filter === 'all' || p.dealStatus === filter);

  const advance = async (id) => {
    try {
      await advancePurchase(id);
      showToast('Purchase advanced');
      reload();
    } catch (err) {
      showToast(err.message || 'Failed to advance purchase', 'error');
    }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this purchase? This cannot be undone.')) return;
    try {
      await cancelPurchase(id);
      showToast('Purchase cancelled');
      reload();
    } catch (err) {
      showToast(err.message || 'Failed to cancel purchase', 'error');
    }
  };

  return (
    <>
      <PageHeader title="Purchase Tracking" subtitle="Manage ongoing deal steps — verify offline, then mark done here" />
      <div className="page-body">
        <div className="section-gap-sm">
          <PillFilters
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>
        <DataState status={status} error={error} fallbackError="Couldn't load purchases." />
        {status === 'ready' && visible.length === 0 && <StateMessage>No purchases match.</StateMessage>}
        {status === 'ready' && visible.map((p) => <PurchaseCard key={p.id} p={p} onAdvance={advance} onCancel={cancel} />)}
      </div>
    </>
  );
}

function PurchaseCard({ p, onAdvance, onCancel }) {
  const style = STATUS_STYLE[p.dealStatus] || STATUS_STYLE.in_progress;
  // Registration can't close until the buyer/seller pay commission, so the
  // button is disabled with the reason instead of failing with a 402.
  const blocked = !!p.awaitingCommission;
  const advanceLabel = p.dealStep >= 5 ? 'Mark Registration Complete' : 'Advance to Next Step';

  return (
    <div className="card card-pad purchase-card">
      <div className="card-head card-head--center">
        <div>
          <h3 className="purchase-card__title">{p.propertyTitle || 'Property'}</h3>
          <p className="muted small-md">Buyer: {p.buyerName || 'Unknown'} • 📍 {p.propertyCity || ''}, {p.propertyState || ''}</p>
          <p className="muted small-md">Agreed Price: <span className="strong" style={{ color: '#1DB954' }}>{fmtInr(p.agreedPrice)}</span></p>
        </div>
        <span className="status-chip" style={{ background: `rgba(${style.rgb},0.12)`, color: style.color }}>{style.text}</span>
      </div>

      <DealProgress step={p.dealStep} dealStatus={p.dealStatus} />

      {blocked && (
        <div className="alert alert--amber">
          <div className="alert__title">Platform commission outstanding — {formatINR(p.commissionDue)}</div>
          <div className="muted small-plus" style={{ lineHeight: 1.6 }}>
            This deal is at Registration, the final step. It cannot be marked complete until the
            buyer and seller have settled their commission from their own dashboards.{' '}
            {(p.commissions || []).filter((c) => c.status === 'accrued').map((c) => c.side + ' owes ' + formatINR(c.amount)).join(' · ')}
          </div>
        </div>
      )}

      <div className="modal-actions">
        {p.dealStatus === 'in_progress' ? (
          <>
            <button
              type="button"
              className={'btn btn-grow ' + (blocked ? 'btn-disabled' : 'btn-primary')}
              disabled={blocked}
              title={blocked ? 'Commission outstanding' : undefined}
              onClick={() => onAdvance(p.id)}
            >
              {blocked ? 'Awaiting commission payment' : advanceLabel}
            </button>
            <button type="button" className="btn btn-danger-soft" onClick={() => onCancel(p.id)}>Cancel</button>
          </>
        ) : <div className="btn-grow center muted small-plus">Deal {p.dealStatus}</div>}
      </div>
    </div>
  );
}
