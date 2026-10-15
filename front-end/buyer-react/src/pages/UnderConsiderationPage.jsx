import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../api/buyerApi.js';
import { cardIdForRealId, formatIndianPriceFmt, firstDisplayImage, allDisplayImages } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import { useBuyerProfile } from '../context/BuyerProfileContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StateMessage from '../components/StateMessage.jsx';
import PropertyDetailModal from '../components/PropertyDetailModal.jsx';
import MakeOfferModal from '../components/MakeOfferModal.jsx';
import OfferSuccessModal from '../components/OfferSuccessModal.jsx';
import ScheduleVisitModal from '../components/ScheduleVisitModal.jsx';

const STATUS_LABELS = { available: 'Available', sold: 'Sold', rented: 'Rented' };

function mapBackendPropertyToCard(rp) {
  const price = rp.price || 0;
  const typeLabel = rp.type ? rp.type.charAt(0).toUpperCase() + rp.type.slice(1) : 'Property';
  const displayImage = firstDisplayImage(rp);
  const gallery = allDisplayImages(rp);
  const cid = cardIdForRealId(rp.id);

  return {
    id: cid,
    realId: rp.id,
    title: rp.title,
    builder: 'Verified Seller Listing',
    type: typeLabel,
    listingType: rp.listingType === 'rent' ? 'Rent' : 'Buy',
    location: rp.city,
    area: rp.address ? `${rp.address}, ${rp.city}` : rp.city || '',
    price: price,
    priceLabel: 'Rs\n' + price.toLocaleString('en-IN'),
    priceFmt: formatIndianPriceFmt(price),
    perSqft: rp.areaSqft ? `Rs ${Math.round(price / rp.areaSqft).toLocaleString('en-IN')} per sqft` : 'N/A',
    beds: rp.bedrooms || 0,
    baths: rp.bathrooms || 0,
    sqft: rp.areaSqft || 0,
    balcony: null,
    floor: null,
    parking: null,
    furnish: null,
    status: STATUS_LABELS[rp.status] || 'Available',
    tx: rp.listingType === 'rent' ? 'For Rent' : 'For Sale',
    img: displayImage,
    gallery: gallery,
    photoCount: gallery.length || 1,
    desc: rp.description || 'A verified property listing on truEstate.',
  };
}

export default function UnderConsiderationPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { considerationIds, removeFromConsideration } = useBuyerProfile();

  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [detailProperty, setDetailProperty] = useState(null);
  const [offerProperty, setOfferProperty] = useState(null);
  const [offerSuccessData, setOfferSuccessData] = useState(null);
  const [visitProperty, setVisitProperty] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const items = await buyerApi.fetchEveryListing();
        setAllProperties(items.map(mapBackendPropertyToCard));
      } catch (err) {
        console.error('Failed to load properties for consideration:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const considerationProperties = useMemo(() => {
    return allProperties.filter((p) => considerationIds.some((x) => String(x) === String(p.id)));
  }, [allProperties, considerationIds]);

  return (
    <div>
      <PageHeader
        title="Under Consideration"
        subtitle="Properties you are actively evaluating before submitting an offer"
      />

      <div className="content-section">
        {loading ? (
          <StateMessage type="loading" title="Loading properties…" message="Retrieving your shortlisted evaluations." />
        ) : considerationProperties.length === 0 ? (
          <StateMessage
            type="empty"
            icon="📋"
            title="No properties in consideration"
            message="Browse properties in Explore and click 'Under Consideration' to review them together here."
            actionLabel="Explore Properties"
            onAction={() => {
              const target = window.location.pathname.startsWith('/buyer') ? '/buyer/explore' : '/explore';
              navigate(target);
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {considerationProperties.map((p) => (
              <div
                key={p.id}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  display: 'flex',
                  transition: 'border-color 0.2s',
                  flexWrap: 'wrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1DB954';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <img
                  src={p.img}
                  alt={p.title}
                  style={{ width: '180px', height: '140px', objectFit: 'cover', flexShrink: 0 }}
                />

                <div
                  style={{
                    padding: '1.25rem',
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: '0.25rem' }}>
                      {p.title}
                    </h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                      📍 {p.area}
                    </p>
                    <span
                      style={{
                        background: 'rgba(29,185,84,0.15)',
                        color: '#1DB954',
                        padding: '0.2rem 0.7rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Under Consideration
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1DB954', marginBottom: '0.75rem' }}>
                      {p.priceFmt}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setDetailProperty(p)}
                        style={{
                          background: '#282828',
                          color: '#fff',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() => setOfferProperty(p)}
                        style={{
                          background: '#1DB954',
                          color: '#000',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        🏠 Make Offer
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          removeFromConsideration(p.id);
                          showToast('Removed from Under Consideration');
                        }}
                        style={{
                          background: 'rgba(239,68,68,0.12)',
                          color: '#ef4444',
                          border: '1px solid rgba(239,68,68,0.3)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {detailProperty && (
        <PropertyDetailModal
          property={detailProperty}
          onClose={() => setDetailProperty(null)}
          onOpenOffer={(p) => setOfferProperty(p)}
          onOpenScheduleVisit={(p) => setVisitProperty(p)}
          onNotifyManager={() => {}}
        />
      )}

      {offerProperty && (
        <MakeOfferModal
          property={offerProperty}
          onClose={() => setOfferProperty(null)}
          onSuccess={({ property, amount }) => {
            setOfferSuccessData({ property, amount });
          }}
        />
      )}

      {offerSuccessData && (
        <OfferSuccessModal
          property={offerSuccessData.property}
          amount={offerSuccessData.amount}
          onClose={() => setOfferSuccessData(null)}
        />
      )}

      {visitProperty && (
        <ScheduleVisitModal
          property={visitProperty}
          onClose={() => setVisitProperty(null)}
        />
      )}
    </div>
  );
}
