/**
 * billing.js
 * Purpose: Billing display helpers shared by the seller and buyer dashboards.
 * Inputs:  the GET /billing/catalog payload.
 * Outputs: badge text + colour for the active payment gateway.
 * API calls: none.
 */

/** "Live payments · razorpay" / "Razorpay test mode" / "Test mode · no real money". */
export function gatewayBadge(catalog) {
  if (!catalog) return { tone: 'orange', text: 'Loading…' };
  if (catalog.isLive) return { tone: 'green', text: 'Live payments · ' + catalog.gateway };
  return { tone: 'orange', text: catalog.gateway === 'razorpay' ? 'Razorpay test mode' : 'Test mode · no real money' };
}
