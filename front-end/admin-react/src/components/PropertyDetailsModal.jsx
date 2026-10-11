import Modal from './Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { capitalize, rupees } from '../utils/format.js';
import { SELLER_STATUS } from '../utils/sellerStatus.js';

/**
 * Read-only details of one listing from the review queue (opened from
 * Current Sellers): location, price, status, key facts, description and the
 * seller's uploaded photos/documents. No extra API call — it uses the
 * listing object that was already loaded.
 */
export default function PropertyDetailsModal({ listing, onClose }) {
  const showToast = useToast();
  if (!listing) return null;

  const st = SELLER_STATUS[listing.verificationStatus] || SELLER_STATUS.pending;
  // Sellers often type the city into the address, so skip parts already shown
  // (avoids "…, Hyderabad, Hyderabad").
  const place = [listing.address, listing.city, listing.state].filter(Boolean).filter((part, i, all) =>
    !all.slice(0, i).some((earlier) => earlier.toLowerCase().includes(part.toLowerCase())));

  const details = [
    { k: 'Type', v: listing.type ? capitalize(listing.type) : '—' },
    { k: 'Listed For', v: listing.listingType === 'rent' ? 'Rent' : 'Sale' },
    { k: 'BHK', v: listing.bedrooms ? listing.bedrooms + ' BHK' : '—' },
    { k: 'Bathrooms', v: listing.bathrooms || '—' },
    { k: 'Area', v: listing.areaSqft ? Number(listing.areaSqft).toLocaleString('en-IN') + ' sq ft' : '—' },
    { k: 'Status', v: listing.status ? listing.status.replace('_', ' ') : '—' },
  ];

  const attachments = []
    .concat((listing.images || []).map((url, i) => ({ label: '🖼 Photo ' + (i + 1), url })))
    .concat((listing.documents || []).map((d) => ({ label: '📎 ' + (d.originalName || 'Document'), url: d.url })));

  return (
    <Modal open onClose={onClose} maxWidth="560px" showClose>
      <h3 className="modal-title" style={{ marginBottom: '0.25rem' }}>{listing.title}</h3>
      <p className="muted small-md" style={{ marginBottom: '1.5rem' }}>
        📍 {place.join(', ')}{listing.sellerName ? `  •  Seller: ${listing.sellerName}` : ''}
      </p>

      <div className="price-banner">
        <div>
          <div className="muted small">Listed Price</div>
          <div className="price-banner__value">{rupees(listing.price)}</div>
        </div>
        <span className="status-chip" style={{ background: st.bg, color: st.color }}>{st.label}</span>
      </div>

      <div className="detail-grid">
        {details.map((x) => (
          <div key={x.k} className="detail-tile">
            <div className="detail-tile__k">{x.k}</div>
            <div className="detail-tile__v">{String(x.v)}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div className="section-label">DESCRIPTION</div>
        <p className="body-text">{listing.description || 'No description provided.'}</p>
      </div>

      {/* The schema has no amenities, so this row shows the uploaded files instead. */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-label">AMENITIES</div>
        <div className="chip-row">
          {attachments.length ? attachments.map((a) => (
            <a key={a.url + a.label} className="chip-link" href={a.url} target="_blank" rel="noopener noreferrer">{a.label}</a>
          )) : <span className="muted small">No photos or documents uploaded.</span>}
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn btn-primary btn-grow btn-round" onClick={() => { showToast('Sharing property link...'); onClose(); }}>Share with Buyer</button>
        <button type="button" className="btn btn-secondary btn-grow btn-round" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
