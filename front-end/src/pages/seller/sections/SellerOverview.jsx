/**
 * SellerOverview.jsx
 * Purpose: Seller "Dashboard" — counts derived from this seller's own
 *          listings and completed deals (a brand-new account correctly shows 0),
 *          plus the four most recent listings.
 * Inputs (props): data – useSellerData(); account – profile (for the name)
 * Outputs: welcome header, stat cards, recent listings table.
 * API calls: none (uses shared data).
 */
import { Avatar, Badge, PageHeader, StatCard } from '../../../components/common/ui.jsx';
import { formatCompactINR, formatINR } from '../../../utils/format.js';
import { VERIFICATION_DISPLAY } from '../../../utils/constants.js';
import { completedDeals } from '../useSellerData.js';

export default function SellerOverview({ data, account }) {
  const { listings, purchases } = data;
  const sold = completedDeals(purchases, 'sale');
  const closedIds = new Set([...sold, ...completedDeals(purchases, 'rent')].map((d) => String(d.propertyId)));
  // "Active" = approved and still on the market.
  const active = listings.filter((p) => p.verificationStatus === 'verified' && !closedIds.has(String(p.id)));
  const pending = listings.filter((p) => p.verificationStatus === 'pending');
  const revenue = sold.reduce((sum, d) => sum + (d.agreedPrice || 0), 0);
  const loading = data.loading.listings;

  return (
    <>
      <PageHeader
        title="Seller Dashboard"
        subtitle={'Welcome back, ' + account.fullName + "! Here's your overview"}
        actions={<Avatar name={account.fullName} color="var(--brand)" textColor="#000" />}
      />
      <div className="content">
        <div className="stats-grid">
          <StatCard label="Total Listings" value={loading ? '…' : listings.length} icon="home" />
          <StatCard label="Active Listings" value={loading ? '…' : active.length} icon="file" />
          <StatCard label="Pending Review" value={loading ? '…' : pending.length} icon="clock" tone="orange" />
          <StatCard label="Total Revenue" value={formatCompactINR(revenue)} icon="dollar" />
        </div>
        <h2 className="section-title-sm">Recent Listings</h2>
        <div className="table-card">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Property</th>
                  <th scope="col">Location</th>
                  <th scope="col">Price</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      Loading…
                    </td>
                  </tr>
                ) : listings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      No listings yet — add your first property to see it here.
                    </td>
                  </tr>
                ) : (
                  listings.slice(0, 4).map((p) => {
                    const st = VERIFICATION_DISPLAY[p.verificationStatus] || VERIFICATION_DISPLAY.pending;
                    return (
                      <tr key={p.id}>
                        <td>{p.title}</td>
                        <td className="text-secondary">{p.city}</td>
                        <td>{formatINR(p.price)}</td>
                        <td>
                          <Badge tone={st.tone}>● {st.label}</Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
