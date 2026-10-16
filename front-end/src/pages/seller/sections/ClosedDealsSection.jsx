/**
 * ClosedDealsSection.jsx - Page Construction & Architecture Plan
 * ============================================================================
 * [PURPOSE]: Displays closed sales ("Sold Properties") or rentals ("Rent Given").
 * [INPUTS]:  data - from useSellerData(); mode - "sale" | "rent".
 * [OUTPUTS]: 4 KPI summary cards + responsive grid of completed deal cards.
 * [APIs]:    GET /purchases/seller-queue (supplied via data.purchases).
 *
 * [DATA PROCESSING & DERIVED METRICS]:
 * 1. Determine rental flag: const rent = mode === "rent";
 * 2. Filter completed deals using completedDeals(data.purchases, mode).
 * 3. Compute total revenue by summing d.agreedPrice across all completed deals.
 * 4. Compute closed this year by comparing d.updatedAt year with current year.
 * 5. Compute average price/rent: total / (deals.length || 1).
 *
 * [COMPONENT & UI STRUCTURE]:
 * 1. Root Container:
 *    - <div className="content">
 * 2. Section Heading:
 *    - <h1 className="page-title">{rent ? "Rent Given Properties" : "Sold Properties"}</h1>
 * 3. Metric KPI Cards (<div className="stats-grid">):
 *    - StatCard #1: Total count (icon="checkCircle" or "home")
 *    - StatCard #2: Total / Monthly Revenue (icon="dollar", tone="orange")
 *    - StatCard #3: Avg Price / Rent (icon="activity", tone="blue")
 *    - StatCard #4: Closed This Year (icon="calendar", tone="orange")
 * 4. Conditional Content:
 *    - If deals.length === 0: Render <EmptyState> with helpful contextual guidance.
 *    - Else: Render <div className="card-grid-3"> iterating over deals.
 * 5. Deal Article Card (<article className="card card-flush">):
 *    - Media container with property image, status badge, and price overlay.
 *    - Card body with property title, location pin, price, counterparty, and close date.
 *
 * [FIELD MAPPING REFERENCE]:
 * - Property Image: d.propertyImage || FALLBACK_PROPERTY_IMAGE
 * - Property Title: d.propertyTitle || "Property"
 * - Location: joinPlace(d.propertyCity, d.propertyState) || "—"
 * - Price Display: formatCompactINR(d.agreedPrice) + (rent ? "/mo" : "")
 * - Counterparty: rent ? "Tenant: " + d.buyerName : "Buyer: " + d.buyerName
 * - Completion Date: shortDate(d.updatedAt)
 *
 * [RESPONSIVE BEHAVIOR]:
 * - stats-grid collapses from 4 columns to 2 on tablets, and 1 on mobile screens.
 * - card-grid-3 collapses to single column on mobile devices (<=640px).
 *
 * [IMPLEMENTATION CHECKLIST]:
 * [ ] Step 1: Import StatCard, Badge, EmptyState from ui.jsx and format utilities.
 * [ ] Step 2: Implement completedDeals helper to filter purchases by dealStatus and mode.
 * [ ] Step 3: Compute aggregations (total, yearCount, avgPrice) with defensive fallbacks.
 * [ ] Step 4: Render responsive statistics grid with appropriate tone colors.
 * [ ] Step 5: Implement deal card image thumbnail with fallback image handling.
 * [ ] Step 6: Format currency with formatCompactINR and dates with shortDate.
 * [ ] Step 7: Test responsive breakpoints (mobile grid collapsing to single column).
 * [ ] Step 8: Validate accessibility (proper alt text on images and semantic headings).
 * [ ] Step 9: Verify empty state transitions gracefully when deals are completed.
 * [ ] Step 10: Test keyboard navigation across all generated deal cards.
 * [ ] Step 11: Validate correct currency symbol and abbreviation formatting.
 * ============================================================================
 */
export default function ClosedDealsSection({ data, mode }) {
  const rent = mode === "rent";
  const dealsCount = data?.purchases?.length || 0;
  return (
    <div className="content" data-plan="closed-deals" data-mode={mode} data-count={dealsCount}>
      <h1 className="page-title">{rent ? "Rent Given Properties (Plan)" : "Sold Properties (Plan)"}</h1>
      <div className="plan-stats-preview">
        <p>Mode: {mode} | Recorded Deals in State: {dealsCount}</p>
      </div>
      {/* Planned: StatsGrid (4 StatCards), EmptyState or CardGrid3 with Deal Cards */}
    </div>
  );
}
