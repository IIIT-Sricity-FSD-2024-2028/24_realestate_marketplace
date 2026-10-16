/**
 * SellerNotificationsSection.jsx - Page Construction & Architecture Plan
 * ============================================================================
 * [PURPOSE]: Seller "Notifications" feed — derives real chronological events
 *          from listings, offers, deal milestones, and billing commissions.
 * [INPUTS]:  data - from useSellerData(): { listings, negotiations, purchases }
 * [OUTPUTS]: ActivityFeed component with contextual notification badges & times.
 * [APIs]:    Shared seller state polling data.
 *
 * [EVENT FEED GENERATION LOGIC (buildSellerFeed)]:
 * 1. Listings Events:
 *    - verified: { icon: "checkCircle", tone: "green", title: "Listing approved" }
 *    - pending:  { icon: "clock", tone: "orange", title: "Pending review" }
 *    - rejected: { icon: "xCircle", tone: "red", title: "Listing rejected" }
 * 2. Negotiations / Offers Events:
 *    - pending:   { icon: "user", tone: "blue", title: "New offer", badge: "Respond" }
 *    - withdrawn: { icon: "chat", tone: "gray", title: "Offer withdrawn" }
 * 3. Purchase / Deal Milestone Events:
 *    - awaitingCommission: { icon: "dollar", tone: "yellow", title: "Commission due" }
 *    - completed:          { icon: "dollar", tone: "green", title: "Deal completed" }
 *    - in_progress:        { icon: "activity", tone: "blue", title: "Deal in progress" }
 * 4. Chronological Sorting & Timestamps:
 *    - Each event includes time (updatedAt || createdAt) and a unique item id.
 *
 * [COMPONENT & UI STRUCTURE]:
 * 1. Page Header:
 *    - <PageHeader title="Notifications" />
 * 2. Content Container (<div className="content">):
 *    - <ActivityFeed items={items} emptyText="..." />
 *    - Renders empty placeholder if no events exist yet.
 *
 * [FEED ITEM SPECIFICATION]:
 * - id: unique string key (e.g. "l-101", "n-204", "p-302")
 * - icon: semantic icon identifier ("checkCircle", "clock", "xCircle", "user", "dollar")
 * - tone: badge color palette token ("green", "orange", "red", "blue", "yellow", "gray")
 * - title: concise event headline
 * - text: detailed explanation with property title or offer details
 * - time: ISO date timestamp for relative time calculation
 * - badge: optional call-to-action badge label (e.g. "Respond")
 *
 * [SORTING & TIME ORDERING]:
 * - Feed items are sorted descending: (a, b) => new Date(b.time) - new Date(a.time)
 * - Relative formatting handles "Just now", minutes ago, hours ago, or dates.
 *
 * [EMPTY STATE DESIGN]:
 * - Displays friendly bell illustration when notifications list is empty.
 * - Text: "Listing reviews, buyer offers and deal updates will appear here."
 *
 * [PERFORMANCE OPTIMIZATIONS]:
 * - Memoize feed generation with useMemo([listings, negotiations, purchases]).
 * - Prevent unneeded re-renders when data references remain stable.
 * - Limit initial visible items to avoid DOM overload if events exceed 50.
 * - Lazy load subsequent notification pages on user scroll.
 *
 * [CONSTRUCTION CHECKLIST]:
 * [ ] Step 1: Import PageHeader from common/ui.jsx.
 * [ ] Step 2: Import ActivityFeed component from notifications/ActivityFeed.jsx.
 * [ ] Step 3: Implement buildSellerFeed data transformer function.
 * [ ] Step 4: Process listings into verified, pending, and rejected timeline cards.
 * [ ] Step 5: Process negotiations for incoming buyer offers and withdrawn offers.
 * [ ] Step 6: Process purchase progress including current deal step and commission.
 * [ ] Step 7: Pass formatted feed array to ActivityFeed with informative empty state.
 * [ ] Step 8: Ensure null-safe operations when data arrays are empty or undefined.
 * ============================================================================
 */
import { PageHeader } from "../../../components/common/ui.jsx";
import ActivityFeed from "../../../components/notifications/ActivityFeed.jsx";

/**
 * Builds feed items from listings, offers and deals (exported for tests & parent usage).
 * @param {Object} params - { listings, negotiations, purchases }
 * @returns {Array} List of formatted notification feed item objects.
 */
export function buildSellerFeed({ listings = [], negotiations = [], purchases = [] } = {}) {
  const items = [];
  // Step 1: Iterate over listings to create approval/review status notifications
  listings.forEach((l) => {
    if (l.verificationStatus === "verified") {
      items.push({ id: "l-" + l.id, icon: "checkCircle", tone: "green", title: "Listing approved", text: l.title, time: l.updatedAt || l.createdAt });
    } else if (l.verificationStatus === "pending") {
      items.push({ id: "l-" + l.id, icon: "clock", tone: "orange", title: "Pending review", text: l.title, time: l.createdAt });
    }
  });
  // Step 2: Iterate over buyer negotiations for incoming offers
  negotiations.forEach((n) => {
    if (n.status === "pending") {
      items.push({ id: "n-" + n.id, icon: "user", tone: "blue", title: "New offer", text: n.buyerName, time: n.createdAt });
    }
  });
  // Step 3: Iterate over purchase milestones and deal progression
  purchases.forEach((p) => {
    if (p.dealStatus === "completed") {
      items.push({ id: "p-" + p.id, icon: "dollar", tone: "green", title: "Deal completed", text: p.propertyTitle, time: p.updatedAt });
    }
  });
  return items;
}

export default function SellerNotificationsSection({ data }) {
  const feedItems = buildSellerFeed(data || {});
  return (
    <>
      <PageHeader title="Notifications (Plan)" />
      <div className="content" data-plan="seller-notifications">
        <ActivityFeed items={feedItems} emptyText="Listing reviews, buyer offers and deal updates will appear here." />
      </div>
    </>
  );
}
