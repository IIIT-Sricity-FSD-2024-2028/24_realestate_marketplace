/**
 * PublicPropertyModal.jsx
 * Purpose: Listing detail dialog on the public landing page
 *          (old #property-detail-modal in index.html).
 * Inputs (props): property – listing to show (null = closed)
 *                 onClose – close handler
 *                 onBuy – "Buy Now" (sends visitors to log in)
 * Outputs: modal with photo, specs, description and price.
 * API calls: none (data comes from GET /properties already loaded).
 */
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import { joinPlace } from '../../utils/format.js';
import { listingImage, listingPrice } from './PropertyCard.jsx';
import './PublicPropertyModal.css';

export default function PublicPropertyModal({ property, onClose, onBuy }) {
  return (
    <Modal open={!!property} onClose={onClose} size="lg" className="property-modal">
      {property && (
        <>
          <img className="property-modal-hero" src={listingImage(property)} alt={property.title} />
          <div className="property-modal-body">
            <h2 className="property-modal-title">{property.title}</h2>
            <p className="text-secondary icon-line">
              <Icon name="pin" size="1.1rem" className="text-brand" /> {joinPlace(property.address, property.city, property.state)}
            </p>
            <div className="spec-strip">
              <span>
                <Icon name="bed" className="text-brand" /> <strong>{property.bedrooms}</strong> Beds
              </span>
              <span>
                <Icon name="bath" className="text-brand" /> <strong>{property.bathrooms}</strong> Baths
              </span>
              <span>
                <Icon name="area" className="text-brand" /> <strong>{Number(property.areaSqft).toLocaleString('en-IN')}</strong> sqft
              </span>
            </div>
            <h3 className="section-label">About this property</h3>
            <p className="text-secondary prose">{property.description}</p>
            <div className="property-modal-foot">
              <div>
                <span className="eyebrow">Price</span>
                <div className="price-xl">{listingPrice(property)}</div>
              </div>
              <div className="button-row">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Close
                </button>
                <button type="button" className="btn btn-primary" onClick={onBuy}>
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
