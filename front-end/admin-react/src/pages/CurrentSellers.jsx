import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import StateMessage, { DataState } from '../components/StateMessage.jsx';
import PropertyDetailsModal from '../components/PropertyDetailsModal.jsx';
import SellerContactModal from '../components/SellerContactModal.jsx';
import useAdminSellers from '../hooks/useAdminSellers.js';
import { useToast } from '../context/ToastContext.jsx';
import { AVATAR_COLORS, initials, monthYear, rupees } from '../utils/format.js';
import { SELLER_STATUS } from '../utils/sellerStatus.js';

/**
 * Current Sellers Under Me (was data-section="current-sellers").
 * API: GET /properties/review-queue (+ GET /users) via useAdminSellers.
 * One card per seller with each of their listings; "View Property Details"
 * and "Contact Seller" open dialogs built from the same loaded data.
 */
export default function CurrentSellers() {
  const showToast = useToast();
  const { status, data, error, reload } = useAdminSellers();
  const [propertyId, setPropertyId] = useState(null);
  const [sellerId, setSellerId] = useState(null);

  const sellers = data ? data.sellers : [];
  const sellerIndex = sellers.findIndex((s) => s.id === sellerId);
  const listing = data && propertyId ? data.listingsById.get(propertyId) : null;

  // If a refresh removed the item meanwhile, say so and reload (as before).
  const openProperty = (id) => {
    if (!data.listingsById.has(id)) { showToast('That listing is no longer on your desk — refreshing.'); reload(); return; }
    setPropertyId(id);
  };
  const openSeller = (id) => {
    if (!sellers.some((s) => s.id === id)) { showToast('That seller is no longer on your desk — refreshing.'); reload(); return; }
    setSellerId(id);
  };

  return (
    <>
      <PageHeader title="Current Sellers Under Me" subtitle="Sellers you are currently managing — view their listed properties" />
      <div className="page-body">
        <DataState status={status} error={error} fallbackError="Couldn't load sellers." />
        {status === 'ready' && sellers.length === 0 && (
          <StateMessage>No sellers have listed a property in your city yet. A seller appears here as soon as they submit their first listing.</StateMessage>
        )}
        {status === 'ready' && sellers.map((seller, i) => {
          const pending = seller.listings.filter((l) => l.verificationStatus === 'pending').length;
          const contact = [seller.email, seller.phone].filter(Boolean).join('  •  ');
          return (
            <div key={seller.id} className="card card-pad seller-card">
              <div className="person-row" style={{ marginBottom: '1rem' }}>
                <div className="avatar avatar--lg" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{initials(seller.name)}</div>
                <div className="person-row__text">
                  <h3 className="bold">{seller.name}</h3>
                  <p className="muted small-plus">{contact || 'No contact details on file'}</p>
                  <p className="muted small-plus">
                    Since: <span style={{ color: '#fff' }}>{monthYear(seller.since)}</span>
                    {'  •  '}Listed Properties: <span className="strong" style={{ color: '#1DB954' }}>{seller.listings.length}</span>
                  </p>
                </div>
                {pending
                  ? <span className="status-chip status-chip--sm" style={{ background: 'rgba(234,179,8,0.12)', color: '#eab308' }}>{pending} awaiting review</span>
                  : <span className="status-chip status-chip--sm" style={{ background: 'rgba(29,185,84,0.12)', color: '#1DB954' }}>Active</span>}
              </div>

              {seller.listings.map((l) => {
                const st = SELLER_STATUS[l.verificationStatus] || SELLER_STATUS.pending;
                const spec = [l.bedrooms ? l.bedrooms + ' BHK' : null, l.areaSqft ? Number(l.areaSqft).toLocaleString('en-IN') + ' sq ft' : null]
                  .filter(Boolean).join('  •  ');
                return (
                  <div key={l.id} className="listing-row">
                    <div className="listing-row__top">
                      <div>
                        <div className="strong">{l.title}</div>
                        <div className="muted small">📍 {l.address || l.city || ''}{spec ? '  •  ' + spec : ''}</div>
                      </div>
                      <div className="listing-row__price">
                        <div className="bold" style={{ color: '#1DB954' }}>{rupees(l.price)}</div>
                        <span className="mini-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                    </div>
                    <div className="row-actions">
                      <button type="button" className="btn btn-primary btn-xs" onClick={() => openProperty(l.id)}>View Property Details</button>
                      <button type="button" className="btn btn-secondary btn-xs" onClick={() => openSeller(seller.id)}>📞 Contact Seller</button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <PropertyDetailsModal listing={listing} onClose={() => setPropertyId(null)} />
      <SellerContactModal
        seller={sellerIndex >= 0 ? sellers[sellerIndex] : null}
        color={AVATAR_COLORS[Math.max(sellerIndex, 0) % AVATAR_COLORS.length]}
        onClose={() => setSellerId(null)}
      />
    </>
  );
}
