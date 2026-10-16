/**
 * SellerNotificationsSection.jsx
 * Purpose: Seller "Notifications" — real events from this seller's data:
 *          listing approved / pending / rejected, new offers, deal progress,
 *          commission due. (The old page showed five invented messages.)
 * Inputs (props): data – useSellerData()
 * Outputs: ActivityFeed.
 * API calls: none (uses shared data, refreshed every 15 s).
 */
import { PageHeader } from '../../../components/common/ui.jsx';
import ActivityFeed from '../../../components/notifications/ActivityFeed.jsx';
import { formatCompactINR, formatINR } from '../../../utils/format.js';

/** Builds feed items from listings, offers and deals (exported for tests). */
export function buildSellerFeed({ listings, negotiations, purchases }) {
  const items = [];
  listings.forEach((l) => {
    if (l.verificationStatus === 'verified')
      items.push({
        id: 'l-' + l.id,
        icon: 'checkCircle',
        tone: 'green',
        title: 'Listing approved',
        text: 'Your property ' + l.title + ' has been approved by admin and is visible to buyers.',
        time: l.updatedAt || l.createdAt,
      });
    else if (l.verificationStatus === 'pending')
      items.push({
        id: 'l-' + l.id,
        icon: 'clock',
        tone: 'orange',
        title: 'Pending review',
        text: 'Property ' + l.title + ' is pending admin review.',
        time: l.createdAt,
      });
    else if (l.verificationStatus === 'rejected')
      items.push({
        id: 'l-' + l.id,
        icon: 'xCircle',
        tone: 'red',
        title: 'Listing rejected',
        text: l.title + ' was rejected' + (l.rejectionReason ? ': ' + l.rejectionReason : '.'),
        time: l.updatedAt || l.createdAt,
      });
  });
  negotiations.forEach((n) => {
    if (n.status === 'pending')
      items.push({
        id: 'n-' + n.id,
        icon: 'user',
        tone: 'blue',
        title: 'New offer',
        text: (n.buyerName || 'A buyer') + ' offered ' + formatCompactINR(n.offerAmount) + ' for ' + (n.propertyTitle || 'your property') + '.',
        time: n.createdAt,
        badge: 'Respond',
      });
    else if (n.status === 'withdrawn')
      items.push({
        id: 'n-' + n.id,
        icon: 'chat',
        tone: 'gray',
        title: 'Offer withdrawn',
        text: (n.buyerName || 'The buyer') + ' withdrew their offer on ' + (n.propertyTitle || 'your property') + '.',
        time: n.updatedAt,
      });
  });
  purchases.forEach((p) => {
    if (p.awaitingCommission)
      items.push({
        id: 'p-' + p.id,
        icon: 'dollar',
        tone: 'yellow',
        title: 'Commission due',
        text:
          'Registration for ' + (p.propertyTitle || 'your property') + ' is waiting on platform commission (' + formatINR(p.commissionDue) + ' outstanding).',
        time: p.updatedAt,
      });
    else if (p.dealStatus === 'completed')
      items.push({
        id: 'p-' + p.id,
        icon: 'dollar',
        tone: 'green',
        title: 'Deal completed',
        text: (p.propertyTitle || 'Property') + ' closed with ' + (p.buyerName || 'the buyer') + ' at ' + formatCompactINR(p.agreedPrice) + '.',
        time: p.updatedAt,
      });
    else if (p.dealStatus === 'in_progress')
      items.push({
        id: 'p-' + p.id,
        icon: 'activity',
        tone: 'blue',
        title: 'Deal in progress',
        text: (p.propertyTitle || 'Property') + ' is at step ' + p.dealStep + ' of 5: ' + p.dealStepLabel + '.',
        time: p.updatedAt,
      });
  });
  return items;
}

export default function SellerNotificationsSection({ data }) {
  return (
    <>
      <PageHeader title="Notifications" />
      <div className="content">
        <ActivityFeed items={buildSellerFeed(data)} emptyText="Listing reviews, buyer offers and deal updates will appear here." />
      </div>
    </>
  );
}
