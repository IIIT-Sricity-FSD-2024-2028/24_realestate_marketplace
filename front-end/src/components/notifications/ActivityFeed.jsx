/**
 * ActivityFeed.jsx
 * Purpose: The "Notifications" page body for every dashboard. The old pages
 *          showed hard-coded sample messages; this lists real events derived
 *          from data the dashboard already loaded from the API (visits,
 *          offers, deals, listings) — newest first.
 * Inputs (props): items – [{ id, icon, tone, title, text, time (ISO), badge? }]
 *                 emptyText – shown when there is nothing yet
 * Outputs: a list of notification cards.
 * API calls: none (callers pass data they fetched).
 */
import Icon from '../common/Icon.jsx';
import { Badge, EmptyState } from '../common/ui.jsx';
import { timeAgo } from '../../utils/format.js';

export default function ActivityFeed({ items, emptyText }) {
  if (!items.length) {
    return (
      <EmptyState icon="🔔" title="You're all caught up">
        {emptyText}
      </EmptyState>
    );
  }
  // Newest event first.
  const sorted = [...items].sort((a, b) => new Date(b.time) - new Date(a.time));
  return (
    <ul className="feed" aria-label="Notifications">
      {sorted.map((item) => (
        <li key={item.id} className={'feed-item tone-border-' + (item.tone || 'green')}>
          <span className={'feed-icon tone-' + (item.tone || 'green')}>
            <Icon name={item.icon || 'bell'} />
          </span>
          <div className="feed-body">
            <h3 className="feed-title">{item.title}</h3>
            <p className="feed-text">{item.text}</p>
            <time className="feed-time" dateTime={item.time}>
              {timeAgo(item.time)}
            </time>
          </div>
          {item.badge && <Badge tone={item.tone || 'green'}>{item.badge}</Badge>}
        </li>
      ))}
    </ul>
  );
}
