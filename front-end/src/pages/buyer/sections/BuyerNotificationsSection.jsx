/**
 * BuyerNotificationsSection.jsx
 * Purpose: Buyer "Notifications" — real events from my visits, offers and
 *          deals (the old page showed four invented messages with a fixed
 *          "3 unread" badge).
 * Inputs (props): data – useBuyerData()
 * Outputs: ActivityFeed.
 * API calls: none (uses shared data, refreshed every 15 s).
 */
import { PageHeader } from '../../../components/common/ui.jsx';
import ActivityFeed from '../../../components/notifications/ActivityFeed.jsx';
import { formatCompactINR, formatINR } from '../../../utils/format.js';

const VISIT_TEXT = {
  pending: {
    title: 'Visit requested',
    tone: 'orange',
    icon: 'calendar',
    text: (v) => 'Your site visit for ' + v.propertyTitle + ' on ' + v.requestedDate + ' at ' + v.requestedSlot + ' is awaiting admin confirmation.',
  },
  confirmed: {
    title: 'Visit Confirmed',
    tone: 'green',
    icon: 'checkCircle',
    text: (v) => 'Your site visit for ' + v.propertyTitle + ' is confirmed for ' + v.requestedDate + ' at ' + v.requestedSlot + '.',
  },
  rescheduled: {
    title: 'Visit Rescheduled',
    tone: 'blue',
    icon: 'calendar',
    text: (v) => 'The admin moved your visit to ' + v.propertyTitle + ' to ' + v.requestedDate + ' at ' + v.requestedSlot + '.',
  },
  completed: { title: 'Visit Completed', tone: 'green', icon: 'checkCircle', text: (v) => 'Your visit to ' + v.propertyTitle + ' is complete.' },
  cancelled: {
    title: 'Visit Cancelled',
    tone: 'red',
    icon: 'xCircle',
    text: (v) => 'The visit to ' + v.propertyTitle + ' was cancelled' + (v.cancelReason ? ': ' + v.cancelReason : '.'),
  },
};
const OFFER_TEXT = {
  pending: {
    title: 'Offer Submitted',
    tone: 'green',
    text: (n) => 'Your offer of ' + formatCompactINR(n.offerAmount) + ' for ' + n.propertyTitle + ' is with the seller.',
  },
  countered: {
    title: 'Counter Offer Received',
    tone: 'blue',
    text: (n) => 'The seller countered at ' + formatCompactINR(n.counterAmount) + ' for ' + n.propertyTitle + '.',
  },
  accepted: { title: 'Offer Accepted', tone: 'green', text: (n) => 'Your offer on ' + n.propertyTitle + ' was accepted — track it under Purchase Initiation.' },
  rejected: {
    title: 'Offer Rejected',
    tone: 'red',
    text: (n) => 'Your offer on ' + n.propertyTitle + ' was rejected' + (n.rejectionReason ? ': ' + n.rejectionReason : '.'),
  },
};

/** Builds feed items from visits, offers and deals (exported for tests). */
export function buildBuyerFeed({ visits, negotiations, purchases }) {
  const items = [];
  visits.forEach((v) => {
    const meta = VISIT_TEXT[v.status];
    if (meta)
      items.push({
        id: 'v-' + v.id,
        icon: meta.icon,
        tone: meta.tone,
        title: meta.title,
        text: meta.text({ ...v, propertyTitle: v.propertyTitle || 'a property' }),
        time: v.updatedAt || v.createdAt,
      });
  });
  negotiations.forEach((n) => {
    const meta = OFFER_TEXT[n.status];
    if (meta)
      items.push({
        id: 'n-' + n.id,
        icon: 'chat',
        tone: meta.tone,
        title: meta.title,
        text: meta.text({ ...n, propertyTitle: n.propertyTitle || 'a property' }),
        time: n.updatedAt || n.createdAt,
      });
  });
  purchases.forEach((p) => {
    const title = p.propertyTitle || 'your property';
    if (p.awaitingCommission)
      items.push({
        id: 'p-' + p.id,
        icon: 'dollar',
        tone: 'yellow',
        title: 'Commission due',
        text: 'Registration for ' + title + ' needs the platform commission (' + formatINR(p.commissionDue) + ' outstanding).',
        time: p.updatedAt,
        badge: 'Action needed',
      });
    else if (p.dealStatus === 'completed')
      items.push({
        id: 'p-' + p.id,
        icon: 'home',
        tone: 'green',
        title: 'Purchase complete',
        text: 'Registration for ' + title + ' is done.',
        time: p.updatedAt,
      });
    else if (p.dealStatus === 'in_progress')
      items.push({
        id: 'p-' + p.id,
        icon: 'activity',
        tone: 'blue',
        title: 'Deal step updated',
        text: title + ' is at step ' + p.dealStep + ' of 5: ' + p.dealStepLabel + '.',
        time: p.updatedAt,
      });
  });
  return items;
}

export default function BuyerNotificationsSection({ data }) {
  const items = buildBuyerFeed(data);
  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={items.length + ' update' + (items.length === 1 ? '' : 's') + ' from your visits, offers and purchases'}
        icon="bell"
      />
      <div className="content">
        <ActivityFeed items={items} emptyText="Visit confirmations, seller replies and deal progress will appear here." />
      </div>
    </>
  );
}
