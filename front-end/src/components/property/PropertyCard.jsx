/**
 * PropertyCard.jsx
 * Purpose: Grid card for one listing on the public landing page
 *          (the card markup index.html built with template strings).
 * Inputs (props): property – a listing from GET /properties
 *                 onOpen(property) – opens the detail dialog
 * Outputs: a clickable, keyboard-accessible card.
 * API calls: none.
 */
import Icon from '../common/Icon.jsx';
import { capitalize, formatINR, joinPlace } from '../../utils/format.js';
import { FALLBACK_PROPERTY_IMAGE } from '../../utils/constants.js';
import './PropertyCard.css';

/** Listing price, with "/ mo" for rentals. */
export function listingPrice(property) {
  return formatINR(property.price) + (property.listingType === 'rent' ? ' / mo' : '');
}

/** First uploaded photo or the shared fallback image. */
export function listingImage(property) {
  return (property.images && property.images[0]) || FALLBACK_PROPERTY_IMAGE;
}

export default function PropertyCard({ property, onOpen }) {
  return (
    <article className="listing-card">
      {/* The whole card is one button so keyboard users can open it too. */}
      <button type="button" className="listing-card-button" onClick={() => onOpen(property)}>
        <div className="listing-card-media">
          <img src={listingImage(property)} alt={property.title} loading="lazy" />
          <span className="listing-tag listing-tag-left">{capitalize(property.type)}</span>
          <span className="listing-tag listing-tag-right">{property.listingType === 'rent' ? 'Rent' : 'Sale'}</span>
          {property.isFeatured && <span className="listing-tag listing-tag-featured">★ {String(property.featuredTier || 'featured').toUpperCase()}</span>}
        </div>
        <div className="listing-card-body">
          <h4 className="listing-card-title">{property.title}</h4>
          <p className="listing-card-place">
            <Icon name="pin" size="1rem" className="text-brand" /> {joinPlace(property.city, property.state)}
          </p>
          <div className="listing-card-specs">
            <span>{property.bedrooms} bd</span>
            <span>{property.bathrooms} ba</span>
            <span>{Number(property.areaSqft).toLocaleString('en-IN')} sqft</span>
          </div>
          <div className="listing-card-foot">
            <span className="listing-card-price">{listingPrice(property)}</span>
            <span className="btn btn-secondary btn-sm" aria-hidden="true">
              View Details
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
