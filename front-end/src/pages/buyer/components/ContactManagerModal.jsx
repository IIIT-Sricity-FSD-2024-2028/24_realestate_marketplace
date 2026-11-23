/**
 * ContactManagerModal.jsx
 * Purpose: "Contact Property Manager". On truEstate the property manager is
 *          the city admin team, and the platform does not publish phone
 *          numbers — the way to reach them is a site-visit request, which goes
 *          straight to the admin desk.
 * Inputs (props): card – listing (optional; falls back to Redux contactCard);
 *                 onClose – callback (optional; falls back to Redux closeContactModal);
 *                 onRequestVisit(card) – callback (optional; falls back to Redux openVisitModal)
 * Outputs: explanatory dialog with a real next step.
 * API calls: none (the visit request itself is POST /visits).
 */
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../../components/common/Modal.jsx';
import { selectContactCard, closeContactModal, openVisitModal } from '../../../store/slices/buyerSlice.js';

export default function ContactManagerModal({ card, onClose, onRequestVisit }) {
  const dispatch = useDispatch();
  const reduxCard = useSelector(selectContactCard);
  const activeCard = card !== undefined ? card : reduxCard;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      dispatch(closeContactModal());
    }
  };

  const handleRequestVisit = () => {
    if (onRequestVisit) {
      onRequestVisit(activeCard);
    } else {
      dispatch(closeContactModal());
      dispatch(openVisitModal(activeCard));
    }
  };

  return (
    <Modal open={!!activeCard} onClose={handleClose} title="Contact the property manager" size="sm">
      {activeCard && (
        <>
          <p className="text-secondary mb-3">
            Listings in {activeCard.location || 'each city'} are managed by truEstate&apos;s city admin team. Phone numbers are not shared publicly — send a
            site-visit request for <strong className="text-white">{activeCard.title}</strong> and the admin team will confirm a time with you and accompany you on the
            visit.
          </p>
          <div className="button-row">
            <button type="button" className="btn btn-secondary grow" onClick={handleClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary grow" onClick={handleRequestVisit}>
              📅 Request a site visit
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
