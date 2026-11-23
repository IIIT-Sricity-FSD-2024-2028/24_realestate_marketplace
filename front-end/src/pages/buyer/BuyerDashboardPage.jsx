/**
 * BuyerDashboardPage.jsx  (was: "Buyer Dashboard - truEstate.html")
 * Purpose: The buyer's workspace — explore listings, shortlist, under
 *          consideration, site visits, offers, purchase tracking, completed
 *          purchases/rentals, payments, notifications and profile.
 * Inputs:  URL section (/buyer/:section), the signed-in buyer session.
 * Outputs: DashboardLayout + active section + the shared property dialogs.
 * State:   Managed centrally via Redux (buyerSlice).
 */
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useDashboardSection } from '../../hooks/useDashboardSection.js';
import { useLiveRefresh } from '../../hooks/useLiveRefresh.js';
import { clearUser, logoutPathForRole } from '../../auth/session.js';
import { useAccountProfile } from '../../components/profile/ProfileSections.jsx';
import Modal from '../../components/common/Modal.jsx';
import { useBuyerData } from './useBuyerData.js';
import {
  selectDetailCard,
  selectOfferCard,
  selectVisitCard,
  selectContactCard,
  selectOfferDoneMessage,
  closeOfferDoneModal,
} from '../../store/slices/buyerSlice.js';
import PropertyDetailModal from './components/PropertyDetailModal.jsx';
import OfferFormModal from './components/OfferFormModal.jsx';
import ScheduleVisitModal from './components/ScheduleVisitModal.jsx';
import ContactManagerModal from './components/ContactManagerModal.jsx';
import ExploreSection from './sections/ExploreSection.jsx';
import ShortlistSection from './sections/ShortlistSection.jsx';
import VisitStatusSection from './sections/VisitStatusSection.jsx';
import UnderConsiderationSection from './sections/UnderConsiderationSection.jsx';
import BuyerNegotiationsSection from './sections/BuyerNegotiationsSection.jsx';
import PurchaseInitiationSection from './sections/PurchaseInitiationSection.jsx';
import OwnedPropertiesSection from './sections/OwnedPropertiesSection.jsx';
import BuyerPaymentsSection from './sections/BuyerPaymentsSection.jsx';
import BuyerNotificationsSection from './sections/BuyerNotificationsSection.jsx';
import BuyerProfileSection from './sections/BuyerProfileSection.jsx';

const NAV = [
  { key: 'explore', label: 'Explore', icon: 'globe' },
  { key: 'shortlist', label: 'Shortlist', icon: 'heart' },
  { key: 'visit-status', label: 'Visit Status', icon: 'checkCircle' },
  {
    group: 'myOffers',
    label: 'My Offers',
    icon: 'file',
    items: [
      { key: 'under-consideration', label: 'Under Consideration' },
      { key: 'negotiate', label: 'Negotiate' },
      { key: 'purchase-initiation', label: 'Purchase Initiation' },
    ],
  },
  {
    group: 'completed',
    label: 'Completed Purchases',
    icon: 'file',
    items: [
      { key: 'rented', label: 'Rented Properties' },
      { key: 'purchased', label: 'Purchased Properties' },
    ],
  },
  { key: 'payments', label: 'Payments', icon: 'card' },
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];
const KEYS = NAV.flatMap((n) => (n.items ? n.items.map((i) => i.key) : [n.key]));

export default function BuyerDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [active, goTo] = useDashboardSection('/buyer', 'buyer', KEYS, 'explore');
  const data = useBuyerData();
  const account = useAccountProfile('buyerProfile');

  // Shared modal state from Redux
  const detail = useSelector(selectDetailCard);
  const offerFor = useSelector(selectOfferCard);
  const visitFor = useSelector(selectVisitCard);
  const contactFor = useSelector(selectContactCard);
  const offerDone = useSelector(selectOfferDoneMessage);

  // A seller's reply, an admin confirming a visit or advancing a deal shows up on its own.
  const { sessionChanged } = useLiveRefresh(data.reloadAll, { role: 'buyer', intervalMs: 15000 });

  /** After a visit request: switch to visit-status section. */
  const visitRequested = () => {
    goTo('visit-status');
  };

  const logout = () => {
    clearUser();
    navigate(logoutPathForRole('buyer'));
  };

  const sections = {
    explore: <ExploreSection />,
    shortlist: <ShortlistSection />,
    'visit-status': <VisitStatusSection />,
    'under-consideration': <UnderConsiderationSection />,
    negotiate: <BuyerNegotiationsSection goTo={goTo} />,
    'purchase-initiation': <PurchaseInitiationSection />,
    rented: <OwnedPropertiesSection mode="rent" />,
    purchased: <OwnedPropertiesSection mode="sale" />,
    payments: <BuyerPaymentsSection />,
    notifications: <BuyerNotificationsSection />,
    profile: <BuyerProfileSection account={account} />,
  };

  return (
    <DashboardLayout
      badge="Buyer"
      nav={NAV}
      active={active}
      onNavigate={goTo}
      user={{ name: account.fullName, subtitle: 'Buyer Account' }}
      onLogout={logout}
      sessionChanged={sessionChanged}
      role="buyer"
    >
      {sections[active]}

      <PropertyDetailModal card={detail} onNavigate={goTo} />
      <OfferFormModal card={offerFor} />
      <ScheduleVisitModal card={visitFor} onRequested={visitRequested} />
      <ContactManagerModal card={contactFor} />

      <Modal open={!!offerDone} onClose={() => dispatch(closeOfferDoneModal())} size="sm" title="Offer Submitted!">
        <div className="success-check" aria-hidden="true">
          ✓
        </div>
        <p className="text-secondary center">{offerDone}</p>
        <p className="text-muted small center mb-3">The seller or admin will review your offer and get back to you shortly.</p>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => {
            dispatch(closeOfferDoneModal());
            goTo('negotiate');
          }}
        >
          View My Offers →
        </button>
        <button type="button" className="btn btn-secondary btn-block mt-2" onClick={() => dispatch(closeOfferDoneModal())}>
          Stay Here
        </button>
      </Modal>
    </DashboardLayout>
  );
}
