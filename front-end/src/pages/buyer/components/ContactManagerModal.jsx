/**
 * ContactManagerModal.jsx
 * Purpose: "Contact Property Manager". On truEstate the property manager is
 *          the city admin team, and the platform does not publish phone
 *          numbers — the way to reach them is a site-visit request, which goes
 *          straight to the admin desk. (The old popup showed a made-up phone
 *          number and only saved a note in the browser that no one read.)
 * Inputs (props): card – listing (null = closed); onClose; onRequestVisit(card)
 * Outputs: explanatory dialog with a real next step.
 * API calls: none (the visit request itself is POST /visits).
 */
import Modal from '../../../components/common/Modal.jsx';

export default function ContactManagerModal({ card, onClose, onRequestVisit }) {
  return (
    <Modal open={!!card} onClose={onClose} title="Contact the property manager" size="sm">
      {card && (
        <>
          <p className="text-secondary mb-3">
            Listings in {card.location || 'each city'} are managed by truEstate&apos;s city admin team. Phone numbers are not shared publicly — send a
            site-visit request for <strong className="text-white">{card.title}</strong> and the admin team will confirm a time with you and accompany you on the
            visit.
          </p>
          <div className="button-row">
            <button type="button" className="btn btn-secondary grow" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary grow" onClick={() => onRequestVisit(card)}>
              📅 Request a site visit
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
