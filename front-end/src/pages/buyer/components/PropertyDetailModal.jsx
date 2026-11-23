/**
 * PropertyDetailModal.jsx
 * Purpose: Buyer's full listing view — photo gallery (all uploads, with
 *          prev/next + thumbnails), price, specs, description and every action:
 *          Make an Offer, Under Consideration, Shortlist, Visit, phone, contact.
 * Inputs (props): card – listing in buyer card shape (optional; falls back to Redux detailCard)
 *                 actions – optional callbacks; falls back to Redux dispatch actions
 * Outputs: the dialog.
 * API calls: none directly (dispatches Redux actions).
 */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../../components/common/Modal.jsx';
import Icon from '../../../components/common/Icon.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import {
  selectDetailCard,
  selectBuyerShortlist,
  selectBuyerConsidering,
  closeDetailModal,
  openOfferModal,
  openVisitModal,
  openContactModal,
  toggleShortlist as toggleShortlistAction,
  addConsidering as addConsideringAction,
  savedMatches,
} from '../../../store/slices/buyerSlice.js';
import './PropertyDetailModal.css';

export default function PropertyDetailModal({ card, actions, onNavigate }) {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [photo, setPhoto] = useState(0); // index of the large photo

  const reduxCard = useSelector(selectDetailCard);
  const shortlist = useSelector(selectBuyerShortlist);
  const consideringList = useSelector(selectBuyerConsidering);

  const activeCard = card !== undefined ? card : reduxCard;

  useEffect(() => setPhoto(0), [activeCard]); // start at the first photo each time

  if (!activeCard) return <Modal open={false} />;

  const photos = activeCard.gallery;
  const many = photos.length > 1;
  const step = (delta) => setPhoto((i) => (i + delta + photos.length) % photos.length); // wraps around

  const isShortlisted = actions?.isShortlisted
    ? actions.isShortlisted(activeCard)
    : shortlist.some((e) => savedMatches(e, activeCard));

  const isConsidering = actions?.isConsidering
    ? actions.isConsidering(activeCard)
    : consideringList.some((e) => savedMatches(e, activeCard));

  const handleClose = () => {
    if (actions?.close) {
      actions.close();
    } else {
      dispatch(closeDetailModal());
    }
  };

  const handleMakeOffer = () => {
    if (actions?.makeOffer) {
      actions.makeOffer(activeCard);
    } else {
      dispatch(openOfferModal(activeCard));
    }
  };

  const handleConsider = () => {
    if (actions?.consider) {
      actions.consider(activeCard);
    } else {
      const already = consideringList.some((e) => savedMatches(e, activeCard));
      if (!already) {
        dispatch(addConsideringAction(activeCard));
        showToast('✅ ' + activeCard.title + ' added to Under Consideration!');
      } else {
        showToast('Already in Under Consideration');
      }
      dispatch(closeDetailModal());
      if (onNavigate) {
        onNavigate('under-consideration');
      }
    }
  };

  const handleShortlist = () => {
    if (actions?.shortlist) {
      actions.shortlist(activeCard);
    } else {
      dispatch(toggleShortlistAction(activeCard));
      showToast(isShortlisted ? 'Removed from Shortlist' : '♡ ' + activeCard.title + ' added to Shortlist!');
    }
  };

  const handleVisit = () => {
    if (actions?.visit) {
      actions.visit(activeCard);
    } else {
      dispatch(openVisitModal(activeCard));
    }
  };

  const handlePhone = () => {
    if (actions?.phone) {
      actions.phone(activeCard);
    } else {
      showToast("Phone numbers aren't shared publicly — request a site visit and the admin team will connect you.");
    }
  };

  const handleContact = () => {
    if (actions?.contact) {
      actions.contact(activeCard);
    } else {
      dispatch(openContactModal(activeCard));
    }
  };

  return (
    <Modal open={!!activeCard} onClose={handleClose} size="xl" className="property-modal">
      <div className="gallery">
        <img className="property-modal-hero" src={photos[photo]} alt={activeCard.title + ' — photo ' + (photo + 1)} />
        <span className="gallery-tag gallery-tag-top">{activeCard.listingType}</span>
        <span className="gallery-tag gallery-tag-bottom">{(activeCard.beds > 0 ? activeCard.beds + ' BHK ' : '') + activeCard.type}</span>
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
            <h2 className="property-modal-title">{activeCard.title}</h2>
            <p className="text-secondary icon-line">
              <Icon name="pin" size="1rem" className="text-brand" /> {activeCard.area}
            </p>
          </div>
          <div className="align-right">
            <div className="price-xl">{activeCard.priceFull}</div>
            <div className="text-secondary small">{activeCard.perSqft}</div>
          </div>
        </div>

        <div className="spec-grid">
          <div>
            <strong>{activeCard.beds || '—'}</strong>
            <span>Bedrooms</span>
          </div>
          <div>
            <strong>{activeCard.baths || '—'}</strong>
            <span>Bathrooms</span>
          </div>
          <div>
            <strong>{activeCard.sqft ? activeCard.sqft.toLocaleString('en-IN') : '—'}</strong>
            <span>sqft</span>
          </div>
          <div>
            <strong>{activeCard.photoCount}</strong>
            <span>Photos</span>
          </div>
        </div>

        <div className="detail-box">
          <h3 className="eyebrow">Property Details</h3>
          <dl className="detail-list">
            <div>
              <dt>Type</dt>
              <dd>{activeCard.type}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{activeCard.status}</dd>
            </div>
            <div>
              <dt>Transaction</dt>
              <dd>{activeCard.tx}</dd>
            </div>
            <div>
              <dt>Listing</dt>
              <dd>Verified by admin{activeCard.isFeatured ? ' · Featured' : ''}</dd>
            </div>
          </dl>
        </div>

        <div className="detail-box">
          <h3 className="eyebrow">Description</h3>
          <p className="prose pre-line">{activeCard.desc || 'No description provided.'}</p>
        </div>

        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={handleMakeOffer}>
          🏠 Make an Offer
        </button>
        <div className="button-grid-3">
          <button type="button" className={'btn ' + (isConsidering ? 'btn-secondary' : 'btn-primary')} onClick={handleConsider}>
            ✅ {isConsidering ? 'In Consideration' : 'Under Consideration'}
          </button>
          <button type="button" className="btn btn-outline" onClick={handleShortlist} aria-pressed={isShortlisted}>
            {isShortlisted ? '♥ Shortlisted' : '♡ Shortlist'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleVisit}>
            📅 Visit
          </button>
        </div>
        <div className="button-grid-2">
          <button type="button" className="btn btn-outline" onClick={handlePhone}>
            📞 Get Phone No.
          </button>
          <button type="button" className="btn btn-outline" onClick={handleContact}>
            💬 Contact Property Manager
          </button>
        </div>
      </div>
    </Modal>
  );
}
