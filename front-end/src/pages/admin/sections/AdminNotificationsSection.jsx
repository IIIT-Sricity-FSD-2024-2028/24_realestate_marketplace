/**
 * AdminNotificationsSection.jsx
 * Purpose: Admin "Notifications" — a live activity feed for this desk built
 *          from the real queues (the old page showed five invented messages).
 * Inputs (props): desk – shared listings, visits, negotiations, purchases
 * Outputs: ActivityFeed of the 50 most recent events.
 * API calls: none (uses desk data, refreshed every 15 s).
 */
import { PageHeader } from '../../../components/common/ui.jsx';
import ActivityFeed from '../../../components/notifications/ActivityFeed.jsx';
import { formatCompactINR, formatINR } from '../../../utils/format.js';

/** Turns the desk's queues into feed items (exported for unit tests). */
export function buildAdminFeed(desk) {
  const items = [];
  desk.listings
    .filter((l) => l.verificationStatus === 'pending')
    .forEach((l) =>
      items.push({
        id: 'l-' + l.id,
        icon: 'home',
        tone: 'yellow',
        title: 'Listing awaiting verification — ' + l.title,
        text: (l.sellerName || 'A seller') + ' submitted this listing in ' + (l.city || 'your city') + '.',
        time: l.createdAt,
        badge: 'Pending',
      }),
    );
  desk.visits
    .filter((v) => v.status === 'pending')
    .forEach((v) =>
      items.push({
        id: 'v-' + v.id,
        icon: 'calendar',
        tone: 'orange',
        title: 'New Visit Request — ' + (v.buyerName || 'Buyer'),
        text: 'Requested a site visit for ' + (v.propertyTitle || 'a property') + ' on ' + v.requestedDate + ' at ' + v.requestedSlot + '.',
        time: v.createdAt,
        badge: '⏳ Pending',
      }),
    );
  desk.negotiations
    .filter((n) => n.status === 'pending' || n.status === 'countered')
    .forEach((n) =>
      items.push({
        id: 'n-' + n.id,
        icon: 'chat',
        tone: 'purple',
        title: (n.status === 'countered' ? 'Seller countered — ' : 'New offer — ') + (n.propertyTitle || 'Property'),
        text:
          (n.buyerName || 'A buyer') +
          ' offered ' +
          formatCompactINR(n.offerAmount) +
          (n.counterAmount ? '; seller countered at ' + formatCompactINR(n.counterAmount) : '') +
          '.',
        time: n.updatedAt || n.createdAt,
        badge: n.status === 'countered' ? 'Countered' : 'New Offer',
      }),
    );
  desk.purchases.forEach((p) => {
    if (p.dealStatus === 'in_progress') {
      items.push({
        id: 'p-' + p.id,
        icon: p.awaitingCommission ? 'dollar' : 'checkSquare',
        tone: p.awaitingCommission ? 'yellow' : 'green',
        title: (p.awaitingCommission ? 'Commission outstanding — ' : 'Deal Step Updated — ') + (p.propertyTitle || 'Property'),
        text: p.awaitingCommission
          ? formatINR(p.commissionDue) + ' still owed before registration can be completed.'
          : 'Buyer ' + (p.buyerName || '') + ' — deal now at step ' + p.dealStep + ' of 5 (' + p.dealStepLabel + ').',
        time: p.updatedAt,
        badge: '⭐ In Progress',
      });
    } else if (p.dealStatus === 'completed') {
      items.push({
        id: 'p-' + p.id,
        icon: 'checkCircle',
        tone: 'green',
        title: 'Deal closed — ' + (p.propertyTitle || 'Property'),
        text: 'Registration completed for ' + (p.buyerName || 'the buyer') + ' at ' + formatCompactINR(p.agreedPrice) + '.',
        time: p.updatedAt,
        badge: '✅ Completed',
      });
    }
  });
  // Newest 50 only, so the page stays quick.
  return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 50);
}

export default function AdminNotificationsSection({ desk }) {
  return (
    <>
      <PageHeader title="Notifications" subtitle="Your latest updates & activity alerts" />
      <div className="content">
        <ActivityFeed items={buildAdminFeed(desk)} emptyText="New listings, visit requests, offers and deal updates in your city will appear here." />
      </div>
    </>
  );
}
