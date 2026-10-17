/**
 * SellerOverview.jsx - Comprehensive Construction & Architecture Specification
 * =========================================================================================
 * [PAGE ROLE & DOMAIN]:
 *   Primary dashboard landing view for authenticated sellers:
 *   - Aggregates high-impact portfolio telemetry (Total Listings, Active, Pending, Revenue).
 *   - Displays personalized greeting with seller avatar initials.
 *   - Presents quick-reference data table containing the 4 most recent property listings.
 *   - Provides direct visual indicators for listing approval statuses.
 *
 * [INPUT PROPERTIES & CONTRACT]:
 *   @param {Object} props.data - Output of useSellerData()
 *     - data.listings: Array<PropertyListing>
 *     - data.purchases: Array<PurchaseDealRecord>
 *     - data.loading: { listings: boolean, purchases: boolean, ... }
 *   @param {Object} props.account - Output of useAccountProfile('sellerProfile')
 *     - account.fullName: string (seller's display name)
 *
 * [API ENDPOINTS & SOURCE CONTRACT]:
 *   - GET /properties/mine
 *     Returns listings created by the authenticated seller.
 *     Fields: id, title, city, price, verificationStatus ('verified'|'pending'|'rejected'), createdAt.
 *   - GET /purchases/seller-queue
 *     Returns deals involving this seller, used to calculate completed revenue and filter closed units.
 *
 * [COMPONENT ARCHITECTURE & HIERARCHY DIAGRAM]:
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ SellerOverview                                                         │
 * │  ├── PageHeader                                                        │
 * │  │    ├── Title: "Seller Dashboard"                                    │
 * │  │    ├── Subtitle: "Welcome back, {fullName}! Here's your overview"   │
 * │  │    └── Action: Avatar (name, brand background, contrast text)       │
 * │  └── div.content                                                       │
 * │       ├── div.stats-grid (4 Metric Stat Cards)                         │
 * │       │    ├── StatCard 1: Total Listings (icon: home)                 │
 * │       │    ├── StatCard 2: Active Listings (icon: file)                │
 * │       │    ├── StatCard 3: Pending Review (icon: clock, tone: orange)  │
 * │       │    └── StatCard 4: Total Revenue (icon: dollar)                │
 * │       ├── h2.section-title-sm ("Recent Listings")                      │
 * │       └── div.table-card > div.table-scroll                            │
 * │            └── table.data-table                                        │
 * │                 ├── thead (Headers: Property, Location, Price, Status) │
 * │                 └── tbody (State-dependent rows)                       │
 * │                      ├── [If loading]  -> 1 row spanning 4 cols: "…"   │
 * │                      ├── [If empty]    -> 1 row spanning 4 cols: empty │
 * │                      └── [If populated]-> slice(0, 4) listing rows:    │
 * │                           ├── td (title)                               │
 * │                           ├── td.text-secondary (city)                 │
 * │                           ├── td (formatINR price)                     │
 * │                           └── td > Badge (tone & label from status)    │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * [METRIC DERIVATION & PIPELINE FLOW]:
 *   data.purchases ──> completedDeals('sale') ──> soldListings
 *                                                       │
 *                          ┌────────────────────────────┴───────────────────────────┐
 *                          ▼                                                        ▼
 *                   Total Revenue                                            Closed Property IDs
 *          (sum of agreedPrice in sold)                               (Set of closed property IDs)
 *                                                                                   │
 *   data.listings ──────────────────────────────────────────────────────────────────┤
 *         │                                                                         │
 *         ├─► Total Count: listings.length                                          ▼
 *         ├─► Active Count: verified status AND NOT in Closed IDs (on active market)
 *         └─► Pending Count: pending admin review status
 *
 * [STATUS BADGE MAPPING SPECIFICATION (VERIFICATION_DISPLAY)]:
 *   - 'verified': { label: 'Verified', tone: 'green' }
 *   - 'pending':  { label: 'Pending Review', tone: 'orange' }
 *   - 'rejected': { label: 'Rejected', tone: 'red' }
 *
 * [RESPONSIVE BEHAVIOR & BREAKPOINTS]:
 *   - Desktop (>900px): 4-column metrics grid; full table layout.
 *   - Tablet (641px - 900px): 2x2 grid for metrics; horizontally scrollable table (`.table-scroll`).
 *   - Mobile (<=640px): 1-column metrics grid; compacted table font size and padding.
 *
 * [STEP-BY-STEP IMPLEMENTATION CHECKLIST]:
 * [ ] Step 1: Import PageHeader, StatCard, Avatar, Badge from components/common/ui.jsx.
 * [ ] Step 2: Import formatINR, formatCompactINR from utils/format.js.
 * [ ] Step 3: Import VERIFICATION_DISPLAY constants from utils/constants.js.
 * [ ] Step 4: Import completedDeals helper from ../useSellerData.js.
 * [ ] Step 5: Derive closedIds Set combining both sold and rented purchase records.
 * [ ] Step 6: Filter active listings: status is 'verified' and id is not in closedIds.
 * [ ] Step 7: Filter pending listings: status is 'pending'.
 * [ ] Step 8: Calculate total sale revenue summing agreedPrice across sold deals.
 * [ ] Step 9: Render PageHeader with seller's full name and circular Avatar.
 * [ ] Step 10: Render stats-grid with 4 StatCards, handling loading state with "…".
 * [ ] Step 11: Construct Recent Listings table rendering slice(0, 4) items.
 * [ ] Step 12: Attach status badges with correct semantic colors (green/orange/red).
 * [ ] Step 13: Implement robust table empty state with prompt to add first listing.
 * =========================================================================================
 */
export default function SellerOverview({ data, account }) {
  const listingsCount = data?.listings?.length || 0;
  const sellerName = account?.fullName || 'Seller';
  return (
    <div className="content" data-plan="seller-overview" data-user={sellerName}>
      <div className="page-header-plan">
        <h2>Seller Dashboard (Architecture Plan)</h2>
        <p>Welcome back, {sellerName}! Total Listings in state: {listingsCount}</p>
      </div>
      <div className="plan-kpi-preview">
        <span>Planned Telemetry: Total Listings | Active | Pending Review | Revenue</span>
      </div>
      {/* Planned: PageHeader, 4 StatCards, Recent Listings Data Table */}
    </div>
  );
}
