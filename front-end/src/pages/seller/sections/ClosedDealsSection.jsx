/**
 * ClosedDealsSection.jsx - Comprehensive Construction & Architecture Specification
 * =========================================================================================
 * [PAGE ROLE & DOMAIN]:
 *   Dedicated analytics and registry for a seller's finalized real estate transactions:
 *   - Mode "sale": "Sold Properties" (completed purchase contracts).
 *   - Mode "rent": "Rent Given Properties" (completed rental/lease agreements).
 *   Displays high-level KPI cards (count, revenue, average price, closed this year)
 *   followed by an interactive card catalogue of closed property deals.
 *
 * [INPUT PROPERTIES & CONTRACT]:
 *   @param {Object} props.data - Shared state produced by useSellerData()
 *     - data.purchases: Array<PurchaseDealRecord>
 *     - data.loading.purchases: boolean
 *     - data.reloadAll: () => Promise<void>
 *   @param {string} props.mode - Transaction filter mode: 'sale' | 'rent'
 *
 * [API ENDPOINTS & SOURCE CONTRACT]:
 *   - GET /purchases/seller-queue
 *     Returns all purchases/deals where the authenticated user is the seller.
 *     Fields consumed per deal:
 *       * id: string (deal UUID)
 *       * propertyId: string (referenced property id)
 *       * propertyTitle: string (title of the listing)
 *       * propertyImage: string (cover image URL or fallback)
 *       * propertyCity, propertyState: string (geographic location)
 *       * agreedPrice: number (final agreed sale price or monthly rent)
 *       * buyerName: string (buyer or tenant full name)
 *       * dealStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled'
 *       * propertyListingType: 'sale' | 'rent'
 *       * updatedAt, createdAt: ISO date string
 *
 * [COMPONENT ARCHITECTURE & HIERARCHY DIAGRAM]:
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ ClosedDealsSection                                                     │
 * │  └── div.content                                                       │
 * │       ├── h1.page-title ("Sold Properties" | "Rent Given Properties")  │
 * │       ├── div.stats-grid (4 Responsive Stat Cards)                     │
 * │       │    ├── StatCard 1: Total Count (icon: checkCircle / home)      │
 * │       │    ├── StatCard 2: Total / Monthly Revenue (icon: dollar)      │
 * │       │    ├── StatCard 3: Avg Sale Price / Avg Rent (icon: activity)  │
 * │       │    └── StatCard 4: Deals Closed This Year (icon: calendar)     │
 * │       └── Conditional Deal Catalogue:                                  │
 * │            ├── [If deals.length === 0]                                 │
 * │            │    └── EmptyState (Contextual icon, header, advice prompt)│
 * │            └── [If deals.length > 0]                                   │
 * │                 └── div.card-grid-3 (3-Column Responsive Grid)         │
 * │                      └── article.card.card-flush (Iterated deal card)  │
 * │                           ├── div.deal-media                           │
 * │                           │    ├── img (property cover thumbnail)      │
 * │                           │    ├── Badge (tone="green", SOLD / RENTED) │
 * │                           │    └── span.deal-media-price (agreed price)│
 * │                           └── div.card-pad                             │
 * │                                ├── h3.strong (propertyTitle)           │
 * │                                ├── p (location: city, state)           │
 * │                                ├── Price row (formatted currency)      │
 * │                                ├── Counterparty info (buyer/tenant name│
 * │                                └── Closed date (shortDate formatted)   │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * [DEAL LIFECYCLE & STATE TRANSITION DIAGRAM]:
 *   [Buyer Makes Offer] ──> [Seller Accepts Offer] ──> [Admin Deal Initialized]
 *                                                               │
 *   ┌───────────────────────────────────────────────────────────┘
 *   ▼
 *   Step 1: Token Deposit ──> Step 2: Document Verification ──> Step 3: Registration
 *                                                                        │
 *   ┌────────────────────────────────────────────────────────────────────┘
 *   ▼
 *   Step 4: Final Settlement ──> Step 5: Possession Handover ──> [dealStatus = "completed"]
 *                                                                        │
 *   ┌────────────────────────────────────────────────────────────────────┘
 *   ▼
 *   Filter matches: completedDeals(data.purchases, mode) ──> Appears in ClosedDealsSection!
 *
 * [DATA AGGREGATION & DERIVATION SPECIFICATIONS]:
 *   1. Rental Flag:
 *        const rent = mode === 'rent';
 *   2. Filtered Set:
 *        const deals = completedDeals(data.purchases, mode);
 *   3. Total Revenue:
 *        const total = deals.reduce((sum, d) => sum + (d.agreedPrice || 0), 0);
 *   4. Current Year Tally:
 *        const currentYear = new Date().getFullYear();
 *        const yearCount = deals.filter(d => new Date(d.updatedAt).getFullYear() === currentYear).length;
 *   5. Average Price per Unit:
 *        const avgPrice = deals.length ? total / deals.length : 0;
 *
 * [RESPONSIVE BEHAVIOR & MEDIA QUERIES]:
 *   - Desktop (>900px): 4-column metric grid (`.stats-grid`), 3-column deal cards (`.card-grid-3`).
 *   - Tablet (641px - 900px): 2-column metrics grid, 2-column deal card layout.
 *   - Mobile (<=640px): 1-column metrics grid, 1-column deal cards; full-width thumbnails.
 *
 * [STEP-BY-STEP IMPLEMENTATION CHECKLIST]:
 * [ ] Step 1: Import StatCard, Badge, EmptyState from components/common/ui.jsx.
 * [ ] Step 2: Import formatCompactINR, joinPlace, shortDate from utils/format.js.
 * [ ] Step 3: Import FALLBACK_PROPERTY_IMAGE from utils/constants.js.
 * [ ] Step 4: Import completedDeals filter utility from ../useSellerData.js.
 * [ ] Step 5: Derive `rent`, `deals`, `total`, `yearCount`, and `avgPrice` with defensive fallbacks.
 * [ ] Step 6: Render semantic page title dynamically reflecting `mode`.
 * [ ] Step 7: Construct 4 StatCards with tailored color tones ("orange", "blue", "green").
 * [ ] Step 8: Implement conditional EmptyState with distinct copy for sales vs. rentals.
 * [ ] Step 9: Iterate through deals inside `.card-grid-3` rendering `.deal-media` and `.card-pad`.
 * [ ] Step 10: Attach image error fallback to avoid broken image icons on deleted external URLs.
 * [ ] Step 11: Ensure responsive grid behavior at <=900px and <=640px breakpoints.
 * [ ] Step 12: Verify keyboard accessibility and proper heading level hierarchy (h1 -> h3).
 * =========================================================================================
 */
export default function ClosedDealsSection({ data, mode }) {
  const rent = mode === 'rent';
  const dealsCount = data?.purchases?.length || 0;
  return (
    <div className="content" data-plan="closed-deals" data-mode={mode} data-count={dealsCount}>
      <h1 className="page-title">{rent ? 'Rent Given Properties (Architecture Plan)' : 'Sold Properties (Architecture Plan)'}</h1>
      <div className="plan-stats-preview">
        <p>Active Mode: {mode} | Recorded Transactions in State: {dealsCount}</p>
      </div>
      {/* Planned: StatsGrid (4 StatCards), EmptyState or CardGrid3 with Deal Cards */}
    </div>
  );
}
