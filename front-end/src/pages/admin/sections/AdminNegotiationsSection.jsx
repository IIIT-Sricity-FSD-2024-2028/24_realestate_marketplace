/**
 * AdminNegotiationsSection.jsx
 * Purpose: "Negotiations" — read-only oversight of offers on this desk.
 *          Price is settled between buyer and seller; the admin takes over
 *          after acceptance (Purchase Tracking). Offers on listings with no
 *          seller are flagged loudly, since nobody can answer them.
 * Inputs (props): desk – shared negotiations
 * Outputs: status pills + negotiation cards.
 * API calls: none (uses GET /negotiations/review-queue via desk).
 */
import { useState } from 'react';
import { Badge, FilterPills, PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import { formatCompactINR, joinPlace } from '../../../utils/format.js';

const STATUS_META = {
  pending: { tone: 'yellow', text: '⏳ Pending' },
  countered: { tone: 'blue', text: '💬 Countered' },
  accepted: { tone: 'green', text: '✓ Accepted' },
  rejected: { tone: 'red', text: '✕ Rejected' },
  withdrawn: { tone: 'gray', text: '↩ Withdrawn' },
};

/** The explanatory note under each card. */
function noteFor(n) {
  const open = n.status === 'pending' || n.status === 'countered';
  if (open && n.propertyHasSeller === false) return { cls: 'text-orange', text: '⚠ This listing has no seller — nobody can answer this offer.' };
  if (open) return { cls: 'text-secondary', text: 'Awaiting the seller’s response — buyer & seller settle the price' };
  if (n.status === 'accepted') return { cls: 'text-brand', text: 'Accepted — track the deal under Purchase Tracking' };
  return { cls: 'text-secondary', text: 'Closed — no admin action' };
}

export default function AdminNegotiationsSection({ desk }) {
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? desk.negotiations : desk.negotiations.filter((n) => n.status === filter);

  return (
    <>
      <PageHeader
        title="Negotiations"
        subtitle="Negotiation happens directly between buyer and seller — mostly view-only here, except admin-listed properties (no seller), which any admin can negotiate directly."
      />
      <div className="content">
        <FilterPills
          label="Negotiation status"
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'countered', label: 'Countered' },
            { key: 'accepted', label: 'Accepted' },
            { key: 'rejected', label: 'Rejected' },
          ]}
        />
        <StatusLine loading={desk.loading.negotiations && !desk.negotiations.length} error={desk.errors.negotiations} />
        {!desk.loading.negotiations && list.length === 0 && <p className="state-line">No negotiations match.</p>}
        <div className="card-grid-2">
          {list.map((n) => {
            const meta = STATUS_META[n.status] || STATUS_META.pending;
            const note = noteFor(n);
            return (
              <article key={n.id} className="card">
                <div className="space-between mb-2">
                  <div>
                    <h3 className="strong">{n.propertyTitle || 'Property'}</h3>
                    <p className="text-secondary small">
                      Buyer: {n.buyerName || 'Unknown'} ({n.buyerEmail || ''})
                    </p>
                  </div>
                  <Badge tone={meta.tone}>{meta.text}</Badge>
                </div>
                <p className="text-secondary small">📍 {joinPlace(n.propertyCity, n.propertyState)}</p>
                <p className="text-secondary small">
                  Offered: <span className="text-orange strong">{formatCompactINR(n.offerAmount)}</span>
                  {n.counterAmount ? (
                    <>
                      {' '}
                      • Countered: <span className="text-info strong">{formatCompactINR(n.counterAmount)}</span>
                    </>
                  ) : null}
                </p>
                {n.message && <p className="text-secondary small italic mt-2">&ldquo;{n.message}&rdquo;</p>}
                {n.status === 'rejected' && n.rejectionReason && <p className="text-danger small mt-2">⚠ {n.rejectionReason}</p>}
                <p className={'small center mt-3 ' + note.cls}>{note.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
