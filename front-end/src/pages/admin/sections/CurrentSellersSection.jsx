/**
 * CurrentSellersSection.jsx
 * Purpose: "Current Sellers Under Me" — sellers grouped from this city's
 *          review queue, each with their listings, a listing details dialog
 *          (photos + documents) and a contact dialog (call / email).
 * Inputs (props): desk – shared listings (review queue)
 * Outputs: seller cards + two dialogs.
 * API calls: none (uses desk.listings from GET /properties/review-queue).
 */
import { useState } from 'react';
import { Avatar, Badge, EmptyState, PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import Modal from '../../../components/common/Modal.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { groupSellers } from '../useAdminDesk.js';
import { capitalize, formatCompactINR, formatINR, monthYear } from '../../../utils/format.js';
import { AVATAR_COLORS } from '../../../utils/constants.js';

// Seller-facing wording for each verification state.
const SELLER_STATUS = {
  verified: { label: 'Approved', tone: 'green' },
  pending: { label: 'Pending Review', tone: 'yellow' },
  rejected: { label: 'Rejected', tone: 'red' },
};

/** "Jubilee Hills, Hyderabad" + city "Hyderabad" → no duplicated city. */
function uniquePlace(...parts) {
  return parts
    .filter(Boolean)
    .filter((part, i, all) => !all.slice(0, i).some((earlier) => earlier.toLowerCase().includes(part.toLowerCase())))
    .join(', ');
}

export default function CurrentSellersSection({ desk }) {
  const { showToast } = useToast();
  const sellers = [...groupSellers(desk.listings).values()];
  const [listing, setListing] = useState(null); // listing details dialog
  const [contact, setContact] = useState(null); // { seller, color } contact dialog

  /** "Share with Buyer" copies the listing summary so it can be pasted to a buyer. */
  const shareListing = async (l) => {
    const text = l.title + ' — ' + formatINR(l.price) + ' — ' + uniquePlace(l.address, l.city, l.state);
    try {
      await navigator.clipboard.writeText(text);
      showToast('Listing details copied — paste them to the buyer.');
    } catch {
      showToast('Could not access the clipboard: ' + text, 'error');
    }
  };

  return (
    <>
      <PageHeader title="Current Sellers Under Me" subtitle="Sellers you are currently managing — view their listed properties" />
      <div className="content">
        <StatusLine loading={desk.loading.listings && !sellers.length} error={desk.errors.listings} />
        {!desk.loading.listings && !desk.errors.listings && sellers.length === 0 && (
          <EmptyState icon="🏠">
            No sellers have listed a property in your city yet. A seller appears here as soon as they submit their first listing.
          </EmptyState>
        )}
        {sellers.map((seller, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const pending = seller.listings.filter((l) => l.verificationStatus === 'pending').length;
          return (
            <article key={seller.id} className="card">
              <div className="row-center gap-md mb-3">
                <Avatar name={seller.name} color={color} textColor="#000" />
                <div className="grow">
                  <h3 className="strong">{seller.name}</h3>
                  <p className="text-secondary small">{[seller.email, seller.phone].filter(Boolean).join(' • ') || 'No contact details on file'}</p>
                  <p className="text-secondary small">
                    Since: <span className="text-white">{monthYear(seller.since)}</span> • Listed Properties:{' '}
                    <span className="text-brand strong">{seller.listings.length}</span>
                  </p>
                </div>
                {pending ? <Badge tone="yellow">{pending} awaiting review</Badge> : <Badge tone="green">Active</Badge>}
              </div>
              {seller.listings.map((l) => {
                const st = SELLER_STATUS[l.verificationStatus] || SELLER_STATUS.pending;
                const spec = [l.bedrooms ? l.bedrooms + ' BHK' : null, l.areaSqft ? Number(l.areaSqft).toLocaleString('en-IN') + ' sq ft' : null]
                  .filter(Boolean)
                  .join(' • ');
                return (
                  <div key={l.id} className="sub-card">
                    <div className="sub-card-head">
                      <div>
                        <div className="strong">{l.title}</div>
                        <div className="text-secondary small">
                          📍 {l.address || l.city || ''}
                          {spec ? ' • ' + spec : ''}
                        </div>
                      </div>
                      <div className="align-right">
                        <div className="text-brand strong">{formatINR(l.price)}</div>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </div>
                    </div>
                    <div className="button-row">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => setListing(l)}>
                        View Property Details
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setContact({ seller, color })}>
                        📞 Contact Seller
                      </button>
                    </div>
                  </div>
                );
              })}
            </article>
          );
        })}
      </div>

      {/* Listing details */}
      <Modal open={!!listing} onClose={() => setListing(null)} title={listing ? listing.title : ''}>
        {listing && (
          <>
            <p className="text-secondary mb-3">
              📍 {uniquePlace(listing.address, listing.city, listing.state)}
              {listing.sellerName ? ' • Seller: ' + listing.sellerName : ''}
            </p>
            <div className="price-strip">
              <div>
                <div className="text-secondary small">Listed Price</div>
                <div className="price-lg">{formatINR(listing.price)}</div>
              </div>
              <Badge tone={(SELLER_STATUS[listing.verificationStatus] || SELLER_STATUS.pending).tone}>
                {(SELLER_STATUS[listing.verificationStatus] || SELLER_STATUS.pending).label}
              </Badge>
            </div>
            <div className="fact-grid fact-grid-3">
              {[
                ['Type', listing.type ? capitalize(listing.type) : '—'],
                ['Listed For', listing.listingType === 'rent' ? 'Rent' : 'Sale'],
                ['BHK', listing.bedrooms ? listing.bedrooms + ' BHK' : '—'],
                ['Bathrooms', listing.bathrooms || '—'],
                ['Area', listing.areaSqft ? Number(listing.areaSqft).toLocaleString('en-IN') + ' sq ft' : '—'],
                ['Status', listing.status ? listing.status.replace('_', ' ') : '—'],
              ].map(([label, value]) => (
                <div key={label} className="fact center">
                  <div className="fact-label">{label}</div>
                  <div className="fact-value capitalize">{value}</div>
                </div>
              ))}
            </div>
            <h3 className="section-label">DESCRIPTION</h3>
            <p className="text-secondary prose mb-3">{listing.description || 'No description provided.'}</p>
            <h3 className="section-label">PHOTOS &amp; DOCUMENTS</h3>
            <div className="chip-row mb-3">
              {(listing.images || []).map((url, i) => (
                <a key={url} className="doc-chip" href={url} target="_blank" rel="noopener noreferrer">
                  🖼 Photo {i + 1}
                </a>
              ))}
              {(listing.documents || []).map((d) => (
                <a key={d.url} className="doc-chip" href={d.url} target="_blank" rel="noopener noreferrer">
                  📎 {d.originalName || 'Document'}
                </a>
              ))}
              {!(listing.images || []).length && !(listing.documents || []).length && (
                <span className="text-secondary small">No photos or documents uploaded.</span>
              )}
            </div>
            <div className="button-row">
              <button type="button" className="btn btn-primary grow" onClick={() => shareListing(listing)}>
                Share with Buyer
              </button>
              <button type="button" className="btn btn-secondary grow" onClick={() => setListing(null)}>
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Seller contact */}
      <Modal open={!!contact} onClose={() => setContact(null)} size="sm">
        {contact && <SellerContact seller={contact.seller} color={contact.color} onClose={() => setContact(null)} />}
      </Modal>
    </>
  );
}

/** Contact card body: phone, email, listing summary and a call/email button. */
function SellerContact({ seller, color, onClose }) {
  const by = { verified: 0, pending: 0, rejected: 0 };
  seller.listings.forEach((l) => {
    if (by[l.verificationStatus] !== undefined) by[l.verificationStatus] += 1;
  });
  const total = seller.listings.reduce((sum, l) => sum + (Number(l.price) || 0), 0);
  // Prefer a phone call, fall back to email.
  const action = seller.phone
    ? { href: 'tel:' + seller.phone, label: '📞 Call ' + seller.phone }
    : seller.email
      ? { href: 'mailto:' + seller.email, label: '✉️ Email ' + seller.email }
      : null;
  return (
    <>
      <div className="row-center gap-md mb-3">
        <Avatar name={seller.name} color={color} textColor="#000" size="lg" />
        <div>
          <h2 className="modal-title mb-0">{seller.name}</h2>
          <p className="text-secondary small">Seller · listing with you since {monthYear(seller.since)}</p>
        </div>
      </div>
      <div className="stack-sm mb-3">
        <div className="fact">
          <div className="fact-label">📞 PHONE</div>
          <div className="fact-value">{seller.phone || 'Not provided'}</div>
        </div>
        <div className="fact">
          <div className="fact-label">✉️ EMAIL</div>
          <div className="fact-value">{seller.email || 'Not provided'}</div>
        </div>
        <div className="fact">
          <div className="fact-label">🏠 PROPERTIES LISTED</div>
          <div className="fact-value">
            {seller.listings.length} in your city ({seller.listings.map((l) => l.title).join(', ')})
          </div>
        </div>
        <div className="fact">
          <div className="fact-label">📋 REVIEW QUEUE</div>
          <div className="fact-value text-brand">{by.pending ? by.pending + ' awaiting your review' : 'Nothing awaiting review'}</div>
        </div>
        <div className="fact">
          <div className="fact-label">📝 LISTING SUMMARY</div>
          <div className="small">
            {by.verified} approved · {by.pending} pending · {by.rejected} rejected · total listed value {formatCompactINR(total)}
          </div>
        </div>
      </div>
      <div className="button-row">
        {action ? (
          <a className="btn btn-primary grow" href={action.href}>
            {action.label}
          </a>
        ) : (
          <span className="text-secondary small grow">No contact details on file</span>
        )}
        <button type="button" className="btn btn-secondary grow" onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
}
