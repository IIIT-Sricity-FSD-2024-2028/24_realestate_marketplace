/**
 * ClosedDealsSection.jsx
 * Purpose: "Sold Properties" (mode="sale") and "Rent Given Properties"
 *          (mode="rent") — the seller's completed deals with real totals.
 *          (The old pages showed invented portfolios such as "24 sold".)
 * Inputs (props): data – useSellerData(); mode – 'sale' | 'rent'
 * Outputs: four stat cards + one card per closed deal.
 * API calls: none (uses GET /purchases/seller-queue via shared data).
 */
import { Badge, EmptyState, StatCard } from '../../../components/common/ui.jsx';
import { formatCompactINR, joinPlace, shortDate } from '../../../utils/format.js';
import { FALLBACK_PROPERTY_IMAGE } from '../../../utils/constants.js';
import { completedDeals } from '../useSellerData.js';

export default function ClosedDealsSection({ data, mode }) {
  const rent = mode === 'rent';
  const deals = completedDeals(data.purchases, mode);
  const total = deals.reduce((sum, d) => sum + (d.agreedPrice || 0), 0);
  const thisYear = new Date().getFullYear();
  const yearCount = deals.filter((d) => new Date(d.updatedAt).getFullYear() === thisYear).length;

  return (
    <div className="content">
      <h1 className="page-title">{rent ? 'Rent Given Properties' : 'Sold Properties'}</h1>
      <div className="stats-grid">
        <StatCard label={rent ? 'Total Rented Properties' : 'Total Properties Sold'} value={deals.length} icon={rent ? 'home' : 'checkCircle'} />
        <StatCard label={rent ? 'Monthly Revenue' : 'Total Revenue'} value={formatCompactINR(total)} icon="dollar" tone="orange" />
        <StatCard label={rent ? 'Avg Rent' : 'Avg Sale Price'} value={formatCompactINR(deals.length ? total / deals.length : 0)} icon="activity" tone="blue" />
        <StatCard label={rent ? 'Leased This Year' : 'This Year'} value={yearCount} icon="calendar" tone="orange" />
      </div>
      {deals.length === 0 ? (
        <EmptyState icon={rent ? '🔑' : '🏷️'}>
          {rent
            ? 'No properties rented out yet. A rental listing appears here once its deal is completed.'
            : "No sales closed yet. A property lands here once you accept a buyer's offer and the admin completes every step of the deal."}
        </EmptyState>
      ) : (
        <div className="card-grid-3">
          {deals.map((d) => {
            const price = formatCompactINR(d.agreedPrice) + (rent ? '/mo' : '');
            return (
              <article key={d.id} className="card card-flush">
                <div className="deal-media">
                  <img src={d.propertyImage || FALLBACK_PROPERTY_IMAGE} alt={d.propertyTitle || 'Property'} />
                  <Badge tone="green" className="deal-media-badge">
                    {rent ? '🔑 RENTED' : '✓ SOLD'}
                  </Badge>
                  <span className="deal-media-price">{price}</span>
                </div>
                <div className="card-pad">
                  <h3 className="strong">{d.propertyTitle || 'Property'}</h3>
                  <p className="text-secondary small mb-2">📍 {joinPlace(d.propertyCity, d.propertyState) || '—'}</p>
                  <div className="space-between small">
                    <span className="text-secondary">{rent ? 'Monthly Rent:' : 'Sale Price:'}</span>
                    <span className="text-brand strong">{price}</span>
                  </div>
                  <p className="text-secondary small">
                    👤 {rent ? 'Tenant' : 'Buyer'}: <span className="text-white">{d.buyerName || 'Unknown'}</span>
                  </p>
                  <p className="text-secondary small">
                    📅 Closed: <span className="text-white">{shortDate(d.updatedAt)}</span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
