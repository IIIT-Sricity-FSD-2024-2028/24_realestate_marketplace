import Modal from './Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { fmtInr, initials, monthYear } from '../utils/format.js';

/**
 * Contact card for a seller (opened from Current Sellers): phone, email, the
 * listings they have in this city and a review summary. The main button calls
 * (tel:) or emails (mailto:) the seller, depending on what is on file.
 */
export default function SellerContactModal({ seller, color, onClose }) {
  const showToast = useToast();
  if (!seller) return null;

  const byStatus = { verified: 0, pending: 0, rejected: 0 };
  seller.listings.forEach((l) => { if (byStatus[l.verificationStatus] !== undefined) byStatus[l.verificationStatus] += 1; });
  const totalValue = seller.listings.reduce((sum, l) => sum + (Number(l.price) || 0), 0);

  let action;
  if (seller.phone) action = { label: '📞 Call ' + seller.phone, run: () => { window.location.href = 'tel:' + seller.phone; } };
  else if (seller.email) action = { label: '✉️ Email ' + seller.email, run: () => { window.location.href = 'mailto:' + seller.email; } };
  else action = { label: 'No contact details on file', run: () => showToast('This seller has not provided a phone number or email.') };

  const rows = [
    { icon: '📞', k: 'PHONE', v: seller.phone || 'Not provided' },
    { icon: '✉️', k: 'EMAIL', v: seller.email || 'Not provided' },
    { icon: '🏠', k: 'PROPERTIES LISTED', v: `${seller.listings.length} in your city (${seller.listings.map((l) => l.title).join(', ')})` },
    { icon: '📋', k: 'Review Queue', v: byStatus.pending ? byStatus.pending + ' awaiting your review' : 'Nothing awaiting review', green: true },
  ];

  return (
    <Modal open onClose={onClose} maxWidth="440px" showClose>
      <div className="person-row" style={{ marginBottom: '1.5rem' }}>
        <div className="avatar avatar--xl" style={{ background: color }}>{initials(seller.name)}</div>
        <div>
          <h3 className="bold" style={{ fontSize: '1.125rem' }}>{seller.name}</h3>
          <p className="muted small">Seller · listing with you since {monthYear(seller.since)}</p>
        </div>
      </div>

      <div className="contact-list">
        {rows.map((r) => (
          <div key={r.k} className="contact-row">
            <span className="contact-row__icon">{r.icon}</span>
            <div>
              <div className="contact-row__k">{r.k}</div>
              <div className="contact-row__v" style={r.green ? { color: '#1DB954' } : undefined}>{r.v}</div>
            </div>
          </div>
        ))}
        <div className="contact-row contact-row--block">
          <div className="contact-row__k">📝 LISTING SUMMARY</div>
          <p className="contact-row__summary">
            {byStatus.verified} approved · {byStatus.pending} pending · {byStatus.rejected} rejected · total listed value {fmtInr(totalValue)}
          </p>
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn btn-primary btn-grow btn-round" onClick={action.run}>{action.label}</button>
        <button type="button" className="btn btn-secondary btn-grow btn-round" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
