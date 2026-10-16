/**
 * PropertyDetailModal.jsx
 * Purpose: Buyer's full listing view — photo gallery (all uploads, with
 *          prev/next + thumbnails), price, specs, description and every action:
 *          Make an Offer, Under Consideration, Shortlist, Visit, phone, contact.
 * Inputs (props): card – listing in buyer card shape (null = closed)
 *                 actions – { close, makeOffer, consider, shortlist, visit,
 *                             phone, contact, isConsidering, isShortlisted }
 * Outputs: the dialog.
 * API calls: none directly (actions call the API).
 */
import { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Icon from '../../../components/common/Icon.jsx';
import './PropertyDetailModal.css';

export default function PropertyDetailModal({ card, actions }) {
  const [photo, setPhoto] = useState(0); // index of the large photo
  useEffect(() => setPhoto(0), [card]); // start at the first photo each time

  if (!card) return <Modal open={false} />;
  const photos = card.gallery;
  const many = photos.length > 1;
  const step = (delta) => setPhoto((i) => (i + delta + photos.length) % photos.length); // wraps around
  const considering = actions.isConsidering(card);
  const shortlisted = actions.isShortlisted(card);

  return (
    <Modal open={!!card} onClose={actions.close} size="xl" className="property-modal">
      <div className="gallery">
        <img className="property-modal-hero" src={photos[photo]} alt={card.title + ' — photo ' + (photo + 1)} />
        <span className="gallery-tag gallery-tag-top">{card.listingType}</span>
        <span className="gallery-tag gallery-tag-bottom">{(card.beds > 0 ? card.beds + ' BHK ' : '') + card.type}</span>
        {many && (
          <>
            <button type="button" className="gallery-nav gallery-prev" onClick={() => step(-1)} aria-label="Previous photo">
              ‹
            </button>
            <button type="button" className="gallery-nav gallery-next" onClick={() => step(1)} aria-label="Next photo">
              ›
            </button>
            <span className="gallery-counter" aria-live="polite">
              {photo + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {many && (
        <div className="thumb-strip" role="group" aria-label="Choose photo">
          {photos.map((url, i) => (
            <button
              key={url + i}
              type="button"
              className={'thumb-btn' + (i === photo ? ' active' : '')}
              onClick={() => setPhoto(i)}
              aria-label={'Show photo ' + (i + 1)}
              aria-pressed={i === photo}
            >
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}

      <div className="property-modal-body">
        <div className="space-between wrap gap-md mb-3">
          <div>
            <h2 className="property-modal-title">{card.title}</h2>
            <p className="text-secondary icon-line">
              <Icon name="pin" size="1rem" className="text-brand" /> {card.area}
            </p>
          </div>
          <div className="align-right">
            <div className="price-xl">{card.priceFull}</div>
            <div className="text-secondary small">{card.perSqft}</div>
          </div>
        </div>

        <div className="spec-grid">
          <div>
            <strong>{card.beds || '—'}</strong>
            <span>Bedrooms</span>
          </div>
          <div>
            <strong>{card.baths || '—'}</strong>
            <span>Bathrooms</span>
          </div>
          <div>
            <strong>{card.sqft ? card.sqft.toLocaleString('en-IN') : '—'}</strong>
            <span>sqft</span>
          </div>
          <div>
            <strong>{card.photoCount}</strong>
            <span>Photos</span>
          </div>
        </div>

        <div className="detail-box">
          <h3 className="eyebrow">Property Details</h3>
          <dl className="detail-list">
            <div>
              <dt>Type</dt>
              <dd>{card.type}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{card.status}</dd>
            </div>
            <div>
              <dt>Transaction</dt>
              <dd>{card.tx}</dd>
            </div>
            <div>
              <dt>Listing</dt>
              <dd>Verified by admin{card.isFeatured ? ' · Featured' : ''}</dd>
            </div>
          </dl>
        </div>

        <div className="detail-box">
          <h3 className="eyebrow">Description</h3>
          <p className="prose pre-line">{card.desc || 'No description provided.'}</p>
        </div>

        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => actions.makeOffer(card)}>
          🏠 Make an Offer
        </button>
        <div className="button-grid-3">
          <button type="button" className={'btn ' + (considering ? 'btn-secondary' : 'btn-primary')} onClick={() => actions.consider(card)}>
            ✅ {considering ? 'In Consideration' : 'Under Consideration'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => actions.shortlist(card)} aria-pressed={shortlisted}>
            {shortlisted ? '♥ Shortlisted' : '♡ Shortlist'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => actions.visit(card)}>
            📅 Visit
          </button>
        </div>
        <div className="button-grid-2">
          <button type="button" className="btn btn-outline" onClick={() => actions.phone(card)}>
            📞 Get Phone No.
          </button>
          <button type="button" className="btn btn-outline" onClick={() => actions.contact(card)}>
            💬 Contact Property Manager
          </button>
        </div>
      </div>
    </Modal>
  );
}
