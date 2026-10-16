/**
 * OwnedPropertiesSection.jsx
 * Purpose: "Purchased Properties" (mode="sale") and "Rented Properties"
 *          (mode="rent") — the buyer's completed deals. (The old Rented page
 *          showed two invented leases; both pages now use real deals, and the
 *          deal reference is the real purchase id instead of a made-up number.)
 * Inputs (props): data – useBuyerData(); mode – 'sale' | 'rent'
 * Outputs: header with total + one card per completed deal.
 * API calls: none (uses GET /purchases/mine via shared data).
 */
import { Badge, EmptyState, PageHeader } from '../../../components/common/ui.jsx';
import { formatCompactINR, joinPlace, shortDate } from '../../../utils/format.js';
import { FALLBACK_PROPERTY_IMAGE } from '../../../utils/constants.js';

export default function OwnedPropertiesSection({ data, mode }) {
  const rent = mode === 'rent';
  // Older deals may not carry propertyListingType; those count as purchases.
  const deals = data.purchases.filter((p) => p.dealStatus === 'completed' && (rent ? p.propertyListingType === 'rent' : p.propertyListingType !== 'rent'));
  return (
    <>
      <PageHeader
        title={rent ? 'Rented Properties' : 'Purchased Properties'}
        subtitle={rent ? 'Properties currently rented by you' : 'Properties you own'}
        icon={rent ? 'table' : 'checkCircle'}
      >
        <Badge tone="green">Total: {deals.length}</Badge>
      </PageHeader>
      <div className="content">
        {deals.length === 0 ? (
          <EmptyState icon="🏠" title={rent ? 'No rented properties yet' : 'No purchased properties yet'}>
            {rent ? 'Completed rental deals appear here.' : 'Your officially completed deals will appear right here.'}
          </EmptyState>
        ) : (
          deals.map((p) => (
            <article key={p.id} className="compact-card">
              <div className="compact-media">
                <img src={p.propertyImage || FALLBACK_PROPERTY_IMAGE} alt={p.propertyTitle || 'Property'} loading="lazy" />
                <Badge tone="green" className="compact-media-badge">
                  {rent ? 'Rented' : 'Owned'}
                </Badge>
              </div>
              <div className="compact-body column">
                <div className="space-between">
                  <h3 className="strong">{p.propertyTitle || 'Property'}</h3>
                  <span className="text-secondary tiny mono">Deal #{p.id.slice(-8).toUpperCase()}</span>
                </div>
                <p className="text-secondary small">📍 {joinPlace(p.propertyCity, p.propertyState) || 'Unknown'}</p>
                <div className="space-between divider-top">
                  <div>
                    <div className="text-secondary tiny">{rent ? 'Monthly Rent' : 'Purchased Price'}</div>
                    <div className="price-md">{formatCompactINR(p.agreedPrice) + (rent ? '/mo' : '')}</div>
                  </div>
                  <div className="align-right">
                    <div className="text-secondary tiny">{rent ? 'Lease Registered' : 'Date of Registration'}</div>
                    <div className="strong">{shortDate(p.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
