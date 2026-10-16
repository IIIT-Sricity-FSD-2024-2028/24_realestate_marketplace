/**
 * AdminOverview.jsx
 * Purpose: Admin "Dashboard" — headline counts for this city desk. The old
 *          page printed fixed numbers (3 / 2 / 12, "+12%"); these are now
 *          counted from the live queues.
 * Inputs (props): desk – shared queues from useAdminDesk; goTo(section)
 * Outputs: stat cards and "needs attention" shortcuts.
 * API calls: none (uses desk data).
 */
import { PageHeader, StatCard } from '../../../components/common/ui.jsx';
import { groupBuyers, groupSellers } from '../useAdminDesk.js';

export default function AdminOverview({ desk, goTo }) {
  const buyers = groupBuyers(desk.negotiations, desk.visits, desk.purchases);
  const sellers = groupSellers(desk.listings);
  const closed = desk.purchases.filter((p) => p.dealStatus === 'completed').length;
  // Work waiting for this admin right now.
  const pendingListings = desk.listings.filter((l) => l.verificationStatus === 'pending').length;
  const pendingVisits = desk.visits.filter((v) => v.status === 'pending').length;
  const activeDeals = desk.purchases.filter((p) => p.dealStatus === 'in_progress').length;
  const loading = desk.loading.listings || desk.loading.purchases;

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Manage your buyers, sellers, and property deals" />
      <div className="content">
        <div className="stats-grid stats-3">
          <StatCard label="Current Buyers" value={loading ? '…' : buyers.length} icon="users" />
          <StatCard label="Current Sellers" value={loading ? '…' : sellers.size} icon="user" tone="orange" />
          <StatCard label="Deals Closed" value={loading ? '…' : closed} icon="checkCircle" />
        </div>
        <h2 className="section-title-sm">Needs your attention</h2>
        <div className="quick-grid">
          <button type="button" className="quick-card" onClick={() => goTo('property-mgmt')}>
            <strong>{pendingListings}</strong>
            <span>listing{pendingListings === 1 ? '' : 's'} awaiting verification</span>
          </button>
          <button type="button" className="quick-card" onClick={() => goTo('schedule')}>
            <strong>{pendingVisits}</strong>
            <span>visit request{pendingVisits === 1 ? '' : 's'} to confirm</span>
          </button>
          <button type="button" className="quick-card" onClick={() => goTo('purchase-tracking')}>
            <strong>{activeDeals}</strong>
            <span>deal{activeDeals === 1 ? '' : 's'} in progress</span>
          </button>
        </div>
      </div>
    </>
  );
}
