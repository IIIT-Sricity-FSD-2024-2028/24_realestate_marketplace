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
import ScheduleVisitModal from '../components/ScheduleVisitModal.jsx';
import ManagerNotifiedModal from '../components/ManagerNotifiedModal.jsx';
import { PinIcon } from '../components/Icons.jsx';

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

export default function ShortlistPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { shortlistIds, toggleShortlist, addToConsideration } = useBuyerProfile();

  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [detailProperty, setDetailProperty] = useState(null);
  const [offerProperty, setOfferProperty] = useState(null);
  const [visitProperty, setVisitProperty] = useState(null);
  const [notifiedProperty, setNotifiedProperty] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const items = await buyerApi.fetchEveryListing();
        setAllProperties(items.map(mapBackendPropertyToCard));
      } catch (err) {
        console.error('Failed to load properties for shortlist:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const shortlistedProperties = useMemo(() => {
    return allProperties.filter((p) => shortlistIds.some((x) => String(x) === String(p.id)));
  }, [allProperties, shortlistIds]);

  return (
    <div>
      <PageHeader
        title="My Shortlist"
        subtitle={`${shortlistedProperties.length} propert${shortlistedProperties.length === 1 ? 'y' : 'ies'} saved`}
      />

      <div className="content-section">
        {loading ? (
          <StateMessage type="loading" title="Loading shortlist…" message="Retrieving your saved listings." />
        ) : shortlistedProperties.length === 0 ? (
          <StateMessage
            type="empty"
            icon="♡"
            title="Shortlist is empty"
            message="Click the heart icon on any property in Explore to bookmark it here for later review."
            actionLabel="Browse Properties"
            onAction={() => {
              const target = window.location.pathname.startsWith('/buyer') ? '/buyer/explore' : '/explore';
              navigate(target);
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {shortlistedProperties.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  position: 'relative',
                  minHeight: '200px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Remove shortlist button */}
                <button
                  type="button"
                  onClick={() => {
                    toggleShortlist(p.id);
                    showToast('Removed from Shortlist');
                  }}
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.75)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                  title="Remove from shortlist"
                >
                  ✕
                </button>

                {/* Left image */}
                <div
                  style={{
                    width: '230px',
                    minHeight: '200px',
                    background: '#111',
                    flexShrink: 0,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={p.img}
                    alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      left: '0.75rem',
                      background: '#1DB954',
                      color: '#000',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.65rem',
                      borderRadius: '0.25rem',
                    }}
                  >
                    {p.type}
                  </span>
                </div>

                {/* Right details */}
                <div
                  style={{
                    flex: 1,
                    minWidth: '300px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                        {p.title}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Saved</span>
                    </div>

                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <PinIcon style={{ width: '0.85rem', height: '0.85rem', color: '#1DB954' }} />
                      {p.area}
                    </p>

                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                      {p.beds > 0 && (
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Bedrooms</div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{p.beds} BHK</div>
                        </div>
                      )}
                      {p.baths > 0 && (
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Bathrooms</div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{p.baths}</div>
                        </div>
                      )}
                      {p.sqft > 0 && (
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Super Area</div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{p.sqft} sqft</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Price</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1DB954' }}>{p.priceFmt}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setVisitProperty(p)}
                        style={{
                          background: 'transparent',
                          border: '2px solid #1DB954',
                          color: '#1DB954',
                          padding: '0.5rem 1rem',
                          borderRadius: '2rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        Request Site Visit
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          addToConsideration(p.id);
                          showToast(`✅ ${p.title} added to Under Consideration!`);
                        }}
                        style={{
                          background: 'transparent',
                          border: '2px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          padding: '0.5rem 1rem',
                          borderRadius: '2rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        Under Consideration
                      </button>

                      <button
                        type="button"
                        onClick={() => setNotifiedProperty(p)}
                        style={{
                          background: 'transparent',
                          border: '2px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          padding: '0.5rem 1rem',
                          borderRadius: '2rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        Contact Manager
                      </button>

                      <button
                        type="button"
                        onClick={() => setDetailProperty(p)}
                        style={{
                          background: '#1DB954',
                          color: '#000',
                          padding: '0.5rem 1.25rem',
                          borderRadius: '2rem',
                          border: 'none',
                          fontWeight: 800,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        View Details
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
          onNotifyManager={(p) => setNotifiedProperty(p)}
        />
      )}

      {offerProperty && (
        <MakeOfferModal
          property={offerProperty}
          onClose={() => setOfferProperty(null)}
          onSuccess={() => {
            const target = window.location.pathname.startsWith('/buyer') ? '/buyer/negotiate' : '/negotiate';
            navigate(target);
          }}
        />
      )}

      {visitProperty && (
        <ScheduleVisitModal
          property={visitProperty}
          onClose={() => setVisitProperty(null)}
        />
      )}

      {notifiedProperty && (
        <ManagerNotifiedModal
          property={notifiedProperty}
          onClose={() => setNotifiedProperty(null)}
        />
      )}
    </div>
  );
}
