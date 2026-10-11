import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import PillFilters from '../components/PillFilters.jsx';
import StateMessage, { DataState } from '../components/StateMessage.jsx';
import { getNegotiationQueue } from '../api/adminApi.js';
import useAdminData from '../hooks/useAdminData.js';
import { fmtInr } from '../utils/format.js';

const STATUS_META = {
  pending: { className: 'badge--yellow', text: '⏳ Pending' },
  countered: { className: 'badge--blue', text: '💬 Countered' },
  accepted: { className: 'badge--green', text: '✓ Accepted' },
  rejected: { className: 'badge--red', text: '✕ Rejected' },
  withdrawn: { className: 'badge--grey', text: '↩ Withdrawn' },
};

/**
 * Negotiations (was data-section="negotiations") — READ-ONLY oversight.
 * API: GET /negotiations/review-queue.
 * Buyer and seller settle the price between themselves; the admin watches here
 * and takes over after acceptance under Purchase Tracking, so no action buttons.
 */
export default function Negotiations() {
  const { status, data, error } = useAdminData(async () => (await getNegotiationQueue()).data.items);
  const [filter, setFilter] = useState('all');
  const visible = (data || []).filter((n) => filter === 'all' || n.status === filter);

  return (
    <>
      <PageHeader
        title="Negotiations"
        subtitle="Negotiation happens directly between buyer and seller — mostly view-only here, except admin-listed properties (no seller), which any admin can negotiate directly."
      />
      <div className="page-body">
        <div className="section-gap-sm">
          <PillFilters
            value={filter}
            onChange={setFilter}
            options={['all', 'pending', 'countered', 'accepted', 'rejected'].map((s) => ({
              value: s, label: s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1),
            }))}
          />
        </div>
        <div className="grid grid-2">
          <DataState status={status} error={error} fallbackError="Couldn't load negotiations." fullRow />
          {status === 'ready' && visible.length === 0 && <StateMessage fullRow>No negotiations match.</StateMessage>}
          {status === 'ready' && visible.map((n) => <NegotiationCard key={n.id} n={n} />)}
        </div>
      </div>
    </>
  );
}

function NegotiationCard({ n }) {
  const meta = STATUS_META[n.status] || STATUS_META.pending;
  const open = n.status === 'pending' || n.status === 'countered';

  // The only thing worth flagging: an open offer on a listing with no seller —
  // nobody can answer it until one is assigned.
  let note;
  if (open && n.propertyHasSeller === false) note = <span style={{ color: '#f97316' }}>⚠ This listing has no seller — nobody can answer this offer.</span>;
  else if (open) note = 'Awaiting the seller’s response — buyer & seller settle the price';
  else if (n.status === 'accepted') note = <span style={{ color: '#1DB954' }}>Accepted — track the deal under Purchase Tracking</span>;
  else note = 'Closed — no admin action';

  return (
    <div className="card card-pad">
      <div className="card-head">
        <div>
          <h3 className="strong" style={{ marginBottom: '0.25rem' }}>{n.propertyTitle || 'Property'}</h3>
          <p className="muted small-plus">Buyer: {n.buyerName || 'Unknown'} ({n.buyerEmail || ''})</p>
        </div>
        <span className={'badge ' + meta.className}>{meta.text}</span>
      </div>
      <p className="muted small-md" style={{ marginBottom: '0.5rem' }}>📍 {n.propertyCity || ''}, {n.propertyState || ''}</p>
      <p className="muted small-md">
        Offered: <span className="strong" style={{ color: '#f97316' }}>{fmtInr(n.offerAmount)}</span>
        {n.counterAmount ? <> • Countered: <span className="strong" style={{ color: '#3b82f6' }}>{fmtInr(n.counterAmount)}</span></> : null}
      </p>
      {n.message && <p className="quote">&quot;{n.message}&quot;</p>}
      {n.status === 'rejected' && n.rejectionReason && <p className="small-plus" style={{ color: '#ef4444', marginTop: '0.5rem' }}>⚠ {n.rejectionReason}</p>}
      <div className="card-note">{note}</div>
    </div>
  );
}
