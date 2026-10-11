import PageHeader from '../components/PageHeader.jsx';
import StateMessage, { DataState } from '../components/StateMessage.jsx';
import { getNegotiationQueue, getPurchaseQueue, getVisitQueue } from '../api/adminApi.js';
import useAdminData from '../hooks/useAdminData.js';
import { initials } from '../utils/format.js';

const NEG_LABELS = { pending: 'Awaiting seller', countered: 'Seller countered', accepted: 'Accepted', rejected: 'Rejected', withdrawn: 'Withdrawn' };
const VISIT_LABELS = { pending: 'awaiting confirmation', confirmed: 'confirmed', rescheduled: 'rescheduled', completed: 'completed', cancelled: 'cancelled' };

/**
 * Groups every negotiation, visit and purchase by buyer:
 * buyerId → { name, email, activities[] }. No dedicated "buyers" endpoint is
 * needed — this is the same client-side aggregation the old page did.
 */
function groupByBuyer(negotiations, visits, purchases) {
  const buyers = new Map();
  const touch = (id, name, email) => {
    if (!buyers.has(id)) buyers.set(id, { id, name: name || 'Unknown', email: email || '', activities: [] });
    return buyers.get(id);
  };
  negotiations.forEach((n) => touch(n.buyerId, n.buyerName, n.buyerEmail).activities.push(
    { icon: '💬', text: `Offered on ${n.propertyTitle || 'a property'} — ${NEG_LABELS[n.status] || n.status}` }));
  visits.forEach((v) => touch(v.buyerId, v.buyerName, v.buyerEmail).activities.push(
    { icon: '📅', text: `Visit to ${v.propertyTitle || 'a property'} — ${VISIT_LABELS[v.status] || v.status}` }));
  purchases.forEach((p) => touch(p.buyerId, p.buyerName, p.buyerEmail).activities.push(
    { icon: '🏠', text: `Purchasing ${p.propertyTitle || 'a property'} — ${p.dealStatus === 'in_progress' ? p.dealStepLabel : p.dealStatus}` }));
  return [...buyers.values()];
}

/**
 * Current Buyers (was data-section="current-buyers").
 * API: GET /negotiations/review-queue, /visits/review-queue and
 *      /purchases/review-queue, fetched in parallel.
 */
export default function CurrentBuyers() {
  const { status, data, error } = useAdminData(async () => {
    const [neg, visits, purchases] = await Promise.all([getNegotiationQueue(), getVisitQueue(), getPurchaseQueue()]);
    return groupByBuyer(neg.data.items, visits.data.items, purchases.data.items);
  });

  return (
    <>
      <PageHeader title="Current Buyers" subtitle="Buyers currently negotiating, visiting, or purchasing any property" />
      <div className="page-body">
        <DataState status={status} error={error} fallbackError="Couldn't load buyers." />
        {status === 'ready' && data.length === 0 && <StateMessage>No buyers are currently active on any property.</StateMessage>}
        {status === 'ready' && data.map((b) => (
          <div key={b.id} className="card card-pad list-card">
            <div className="person-row">
              <div className="avatar avatar--lg" style={{ background: '#3b82f6', color: '#fff' }}>{initials(b.name)}</div>
              <div className="person-row__text">
                <h3 className="strong">{b.name}</h3>
                <p className="muted small-plus">{b.email}</p>
              </div>
              {b.email && <a className="btn btn-secondary btn-md" href={'mailto:' + b.email}>✉️ Email</a>}
            </div>
            {b.activities.map((a, i) => (
              <p key={i} className="muted small-plus" style={{ marginTop: '0.25rem' }}>{a.icon} {a.text}</p>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
