/**
 * SellerOverview.jsx - Page Construction & Architecture Plan
 * ============================================================================
 * [PURPOSE]: Main Seller Workspace overview — live KPIs and recent listings.
 * [INPUTS]:  data - from useSellerData(); account - seller profile information.
 * [OUTPUTS]: Welcome header, 4 metric stat cards, and recent listings table.
 * [APIs]:    GET /properties/mine, GET /purchases/seller-queue.
 *
 * [METRIC DERIVATIONS & COMPUTATIONS]:
 * 1. Completed deals: extract closed sales and rentals from data.purchases.
 * 2. Closed IDs: create Set of property IDs that have concluded deals.
 * 3. Active Listings: listings where verificationStatus === "verified" and not closed.
 * 4. Pending Review: listings where verificationStatus === "pending".
 * 5. Total Revenue: sum of agreedPrice for all completed sale deals.
 * 6. Loading state: extract data.loading.listings for skeleton/spinner states.
 *
 * [UI COMPONENT HIERARCHY]:
 * 1. Page Header:
 *    - <PageHeader title="Seller Dashboard" subtitle="Welcome back..." />
 *    - Right action: <Avatar name={account.fullName} color="var(--brand)" />
 * 2. Main Content Container (<div className="content">):
 *    - Statistics Grid (<div className="stats-grid">):
 *      * Card 1: Total Listings (icon="home")
 *      * Card 2: Active Listings (icon="file")
 *      * Card 3: Pending Review (icon="clock", tone="orange")
 *      * Card 4: Total Revenue (icon="dollar")
 *    - Section Subheading: <h2 className="section-title-sm">Recent Listings</h2>
 *    - Table Card (<div className="table-card"><div className="table-scroll">):
 *      * <table className="data-table">
 *      * Table Header: Property, Location, Price, Status
 *      * Table Body States: Loading row, Empty row, or Listing rows (slice 0..4)
 *      * Status Badges: Verified (green), Pending (orange), Rejected (red)
 *
 * [TABLE RENDERING LOGIC]:
 * - Loading: single row spanning 4 columns showing "Loading…".
 * - Empty: single row spanning 4 columns with empty guidance prompt.
 * - Populated: maximum 4 rows displaying title, city, formatted price, and status badge.
 * - Badge Styling: mapped from VERIFICATION_DISPLAY constants.
 *
 * [DATA REFRESH & CACHING]:
 * - State is re-synchronized every 15 seconds through the parent useLiveRefresh hook.
 * - If an offer is accepted or listing is verified, metrics update reactively.
 *
 * [INTERNATIONALIZATION & FORMATTING]:
 * - Prices format in Indian Rupee format (INR) via formatINR.
 * - Compact amounts (Lakhs / Crores) format via formatCompactINR.
 *
 * [SECURITY & ACCESS CONTROL]:
 * - Restrict section viewing to authenticated users with role="seller".
 * - Sanitize dynamic listing attributes before inserting into DOM.
 * - Guard against cross-site script injection via listing titles or notes.
 *
 * [EDGE CASE HANDLING]:
 * - Handle network disconnections with friendly offline indicators.
 * - Fallback gracefully when profile name or avatar is missing.
 * - Support zero-state styling when all listings have been archived.
 * - Ensure proper currency formatting when prices are null or undefined.
 * - Retain layout stability during async data revalidation.
 *
 * [CONSTRUCTION STEPS]:
 * [ ] Step 1: Import PageHeader, StatCard, Avatar, Badge from ui.jsx.
 * [ ] Step 2: Import formatINR, formatCompactINR, and VERIFICATION_DISPLAY map.
 * [ ] Step 3: Compute active, pending, revenue, and loading variables defensively.
 * [ ] Step 4: Construct header with personalized welcome subtitle and seller avatar.
 * [ ] Step 5: Render 4-card KPI grid with dynamic values or loading ellipsis ("…").
 * [ ] Step 6: Construct responsive table with scroll wrapper and standard styling.
 * [ ] Step 7: Map the 4 most recent listings with title, city, formatted price, and badge.
 * [ ] Step 8: Handle edge cases where account profile or listings data is still loading.
 * ============================================================================
 */
export default function SellerOverview({ data, account }) {
  const listingsCount = data?.listings?.length || 0;
  const sellerName = account?.fullName || "Seller";
  return (
    <div className="content" data-plan="seller-overview" data-user={sellerName}>
      <div className="page-header-plan">
        <h2>Seller Dashboard (Construction Plan)</h2>
        <p>Welcome back, {sellerName}! Total Listings in state: {listingsCount}</p>
      </div>
      <div className="plan-kpi-preview">
        <span>Planned KPIs: Total Listings | Active | Pending Review | Revenue</span>
      </div>
      {/* Planned: PageHeader, 4 StatCards, Recent Listings Data Table */}
    </div>
  );
}
