import { useState, useEffect } from 'react';
import { PinIcon, PhoneIcon, ChatIcon } from './Icons.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useBuyerProfile } from '../context/BuyerProfileContext.jsx';

export default function PropertyDetailModal({
  property,
  onClose,
  onOpenOffer,
  onOpenScheduleVisit,
  onNotifyManager,
}) {
  const { showToast } = useToast();
  const { isShortlisted, toggleShortlist, isUnderConsideration, addToConsideration, removeFromConsideration } =
    useBuyerProfile();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    setActivePhotoIdx(0);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [property]);

  if (!property) return null;

  const photos =
    property.gallery && property.gallery.length > 0
      ? property.gallery
      : property.img
      ? [property.img]
      : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'];

  const inShortlist = isShortlisted(property.id);
  const inConsideration = isUnderConsideration(property.id);

  function handlePrevPhoto() {
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  }

  function handleNextPhoto() {
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  }

  function handleConsiderationToggle() {
    if (inConsideration) {
      removeFromConsideration(property.id);
      showToast('Removed from Under Consideration');
    } else {
      addToConsideration(property.id);
      showToast(`✅ ${property.title} added to Under Consideration!`);
    }
  }

  function handleShortlistToggle() {
    toggleShortlist(property.id);
    showToast(inShortlist ? 'Removed from Shortlist' : `♡ ${property.title} added to Shortlist!`);
  }

  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner property-modal-dialog">
        {/* Photo Hero with Gallery Controls */}
        <div className="modal-hero">
          <img src={photos[activePhotoIdx]} alt={property.title} className="modal-hero-img" />

          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>

          <div className="modal-badge-type">{property.type || 'Property'}</div>
          <div className="modal-badge-tx">{property.listingType || 'Buy'}</div>

          {photos.length > 1 && (
            <>
              <button className="modal-gallery-arrow prev" onClick={handlePrevPhoto} aria-label="Previous image">
                ‹
              </button>
              <button className="modal-gallery-arrow next" onClick={handleNextPhoto} aria-label="Next image">
                ›
              </button>
              <div className="modal-gallery-counter">
                {activePhotoIdx + 1} / {photos.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Carousel */}
        {photos.length > 1 && (
          <div className="modal-thumbs">
            {photos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Photo ${i + 1}`}
                className={`modal-thumb-item ${i === activePhotoIdx ? 'active' : ''}`}
                onClick={() => setActivePhotoIdx(i)}
              />
            ))}
          </div>
        )}

        <div className="modal-body-content">
          {/* Header & Price */}
          <div className="modal-header-row">
            <div>
              <h2 className="modal-prop-title">{property.title}</h2>
              <p className="modal-prop-location">
                <PinIcon style={{ width: '1rem', height: '1rem', color: '#1DB954' }} />
                <span>{property.area}</span>
              </p>
            </div>
            <div className="modal-price-box">
              <div className="modal-price-amount">{property.priceFmt}</div>
              {property.perSqft && <div className="modal-price-persqft">{property.perSqft}</div>}
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="modal-specs-grid">
            <div className="modal-spec-col">
              <div className="spec-val">{property.beds || '—'}</div>
              <div className="spec-lbl">Bedrooms</div>
            </div>
            <div className="modal-spec-col">
              <div className="spec-val">{property.baths || '—'}</div>
              <div className="spec-lbl">Bathrooms</div>
            </div>
            <div className="modal-spec-col">
              <div className="spec-val">
                {property.sqft ? Number(property.sqft).toLocaleString('en-IN') : '—'}
              </div>
              <div className="spec-lbl">sqft Area</div>
            </div>
            <div className="modal-spec-col">
              <div className="spec-val">{property.floor || '—'}</div>
              <div className="spec-lbl">Floor</div>
            </div>
            <div className="modal-spec-col">
              <div className="spec-val">{property.parking || '—'}</div>
              <div className="spec-lbl">Parking</div>
            </div>
          </div>

          {/* Details & Amenities 2-Column Section */}
          <div className="modal-2col-grid">
            <div className="modal-card-box">
              <h4 className="box-title">Property Details</h4>
              <div className="box-rows">
                <div className="box-row">
                  <span className="row-k">Type</span>
                  <span className="row-v">{property.type}</span>
                </div>
                <div className="box-row">
                  <span className="row-k">Status</span>
                  <span className="row-v">{property.status}</span>
                </div>
                <div className="box-row">
                  <span className="row-k">Transaction</span>
                  <span className="row-v">{property.tx}</span>
                </div>
                <div className="box-row">
                  <span className="row-k">Furnishing</span>
                  <span className="row-v">{property.furnish || '—'}</span>
                </div>
                <div className="box-row">
                  <span className="row-k">Builder / Lister</span>
                  <span className="row-v">{property.builder || 'Verified Seller'}</span>
                </div>
              </div>
            </div>

            <div className="modal-card-box">
              <h4 className="box-title">Amenities & Features</h4>
              <div className="amenities-container">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((a, i) => (
                    <span key={i} className="amenity-pill">
                      {a}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                    Gym, 24/7 Security, Power Backup, Lift, Reserved Parking
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="modal-card-box" style={{ marginBottom: '1.5rem' }}>
            <h4 className="box-title">Description</h4>
            <p className="desc-text">{property.desc || 'A premium verified property listing on truEstate.'}</p>
          </div>

          {/* PRIMARY ACTION: Make an offer */}
          <button
            className="btn-primary modal-action-btn-large"
            onClick={() => {
              onClose();
              onOpenOffer(property);
            }}
          >
            🏠 Make an Offer
          </button>

          {/* Secondary Actions 3-Buttons */}
          <div className="modal-3actions-row">
            <button
              className={`btn-action-pill ${inConsideration ? 'active' : ''}`}
              onClick={handleConsiderationToggle}
            >
              {inConsideration ? '✅ In Consideration' : '✅ Under Consideration'}
            </button>

            <button
              className={`btn-action-pill ${inShortlist ? 'active' : ''}`}
              onClick={handleShortlistToggle}
            >
              {inShortlist ? '♥ Shortlisted' : '♡ Shortlist'}
            </button>

            <button
              className="btn-action-pill"
              onClick={() => {
                onClose();
                onOpenScheduleVisit(property);
              }}
              title="Request Site Visit"
            >
              📅 Request Site Visit
            </button>
          </div>

          {/* Contact Actions 2-Buttons */}
          <div className="modal-contact-row">
            <button
              className="btn-outline-pill"
              onClick={() => showToast('📞 Property Contact: +91 98765 43210')}
            >
              <PhoneIcon style={{ width: '0.9rem', height: '0.9rem' }} />
              <span>Get Phone No.</span>
            </button>

            <button
              className="btn-outline-pill"
              onClick={() => {
                onClose();
                onNotifyManager(property);
              }}
            >
              <ChatIcon style={{ width: '0.9rem', height: '0.9rem' }} />
              <span>Contact Property Manager</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
