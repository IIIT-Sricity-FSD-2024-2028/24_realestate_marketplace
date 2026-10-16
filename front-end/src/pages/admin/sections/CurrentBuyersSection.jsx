/**
 * CurrentBuyersSection.jsx
 * Purpose: "Current Buyers" — everyone negotiating, visiting or purchasing a
 *          property on this desk, with what they are doing and an email link.
 * Inputs (props): desk – shared negotiations/visits/purchases
 * Outputs: one card per buyer.
 * API calls: none (aggregates the three review queues already loaded).
 */
import { Avatar, EmptyState, PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import { groupBuyers } from '../useAdminDesk.js';

export default function CurrentBuyersSection({ desk }) {
  const buyers = groupBuyers(desk.negotiations, desk.visits, desk.purchases);
  const loading = desk.loading.negotiations || desk.loading.visits || desk.loading.purchases;
  const error = desk.errors.negotiations || desk.errors.visits || desk.errors.purchases;

  return (
    <>
      <PageHeader title="Current Buyers" subtitle="Buyers currently negotiating, visiting, or purchasing any property" />
      <div className="content">
        <StatusLine loading={loading && !buyers.length} error={error} />
        {!loading && !error && buyers.length === 0 && <EmptyState icon="👥">No buyers are currently active on any property.</EmptyState>}
        {buyers.map((b) => (
          <article key={b.id} className="card">
            <div className="row-center gap-md">
              <Avatar name={b.name} color="#3b82f6" textColor="#fff" />
              <div className="grow">
                <h3 className="strong">{b.name}</h3>
                <p className="text-secondary small">{b.email}</p>
              </div>
              {b.email && (
                <a className="btn btn-secondary btn-sm" href={'mailto:' + b.email}>
                  ✉️ Email
                </a>
              )}
            </div>
            <ul className="activity-list">
              {b.activities.map((a, i) => (
                <li key={i}>
                  <span aria-hidden="true">{a.icon}</span> {a.text}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}
