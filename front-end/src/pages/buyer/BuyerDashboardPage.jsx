/**
 * BuyerDashboardPage.jsx  (was: "Buyer Dashboard - truEstate.html")
 * Purpose: The buyer's workspace — explore listings, shortlist, under
 *          consideration, site visits, offers, purchase tracking, completed
 *          purchases/rentals, payments, notifications and profile.
 * Inputs:  URL section (/buyer/:section), the signed-in buyer session.
 * Outputs: DashboardLayout + active section + the shared property dialogs.
 * API calls: shared data in useBuyerData (refreshed every 15 s), offer and
 *            visit requests inside the dialogs (see their headers).
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useDashboardSection } from '../../hooks/useDashboardSection.js';
import { useLiveRefresh } from '../../hooks/useLiveRefresh.js';
import { clearUser, logoutPathForRole } from '../../auth/session.js';
import { useAccountProfile } from '../../components/profile/ProfileSections.jsx';
import { useToast } from '../../components/feedback/ToastProvider.jsx';
import Modal from '../../components/common/Modal.jsx';
import { formatCompactINR } from '../../utils/format.js';
import { savedMatches, useBuyerData } from './useBuyerData.js';
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
  const { showToast } = useToast();
  const [active, goTo] = useDashboardSection('/buyer', 'buyer', KEYS, 'explore');
  const data = useBuyerData();
  const account = useAccountProfile('buyerProfile');
  // A seller's reply, an admin confirming a visit or advancing a deal shows up on its own.
  const { sessionChanged } = useLiveRefresh(data.reloadAll, { role: 'buyer', intervalMs: 15000 });

  // Which dialog is open, and for which listing.
  const [detail, setDetail] = useState(null);
  const [offerFor, setOfferFor] = useState(null);
  const [visitFor, setVisitFor] = useState(null);
  const [contactFor, setContactFor] = useState(null);
  const [offerDone, setOfferDone] = useState(null); // success popup text

  // Everything a section (or the detail dialog) can do with a listing.
  const actions = {
    open: (card) => setDetail(card),
    close: () => setDetail(null),
    makeOffer: (card) => {
      setDetail(null);
      setOfferFor(card);
    },
    visit: (card) => {
      setDetail(null);
      setContactFor(null);
      setVisitFor(card);
    },
    contact: (card) => setContactFor(card),
    // No public phone numbers exist — say so and point to the real channel.
    phone: () => showToast("Phone numbers aren't shared publicly — request a site visit and the admin team will connect you."),
    isShortlisted: (card) => data.shortlist.some((e) => savedMatches(e, card)),
    isConsidering: (card) => data.considering.some((e) => savedMatches(e, card)),
    shortlist: (card) => {
      const added = data.toggleShortlist(card);
      showToast(added ? '♡ ' + card.title + ' added to Shortlist!' : 'Removed from Shortlist');
    },
    consider: (card) => {
      const added = data.addConsidering(card);
      showToast(added ? '✅ ' + card.title + ' added to Under Consideration!' : 'Already in Under Consideration');
      setDetail(null);
      goTo('under-consideration');
    },
  };

  /** After a successful offer: keep it under consideration, refresh, celebrate. */
  const offerSubmitted = async (card, amount) => {
    data.addConsidering(card);
    setOfferFor(null);
    setOfferDone('Your offer of ' + formatCompactINR(amount) + ' for ' + card.title + ' has been submitted!');
    await data.reload('deals');
  };

  /** After a visit request: refresh visits and show the "Requested" tab. */
  const visitRequested = async () => {
    setVisitFor(null);
    await data.reload('visits');
    goTo('visit-status');
  };

  const logout = () => {
    clearUser();
    navigate(logoutPathForRole('buyer'));
  };

  const props = { data, actions, goTo, account };
  const sections = {
    explore: <ExploreSection {...props} />,
    shortlist: <ShortlistSection {...props} />,
    'visit-status': <VisitStatusSection {...props} />,
    'under-consideration': <UnderConsiderationSection {...props} />,
    negotiate: <BuyerNegotiationsSection {...props} />,
    'purchase-initiation': <PurchaseInitiationSection {...props} />,
    rented: <OwnedPropertiesSection {...props} mode="rent" />,
    purchased: <OwnedPropertiesSection {...props} mode="sale" />,
    payments: <BuyerPaymentsSection {...props} />,
    notifications: <BuyerNotificationsSection {...props} />,
    profile: <BuyerProfileSection {...props} />,
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

      <PropertyDetailModal card={detail} actions={actions} />
      <OfferFormModal card={offerFor} onClose={() => setOfferFor(null)} onSubmitted={offerSubmitted} />
      <ScheduleVisitModal card={visitFor} onClose={() => setVisitFor(null)} onRequested={visitRequested} />
      <ContactManagerModal card={contactFor} onClose={() => setContactFor(null)} onRequestVisit={actions.visit} />

      <Modal open={!!offerDone} onClose={() => setOfferDone(null)} size="sm" title="Offer Submitted!">
        <div className="success-check" aria-hidden="true">
          ✓
        </div>
        <p className="text-secondary center">{offerDone}</p>
        <p className="text-muted small center mb-3">The seller or admin will review your offer and get back to you shortly.</p>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => {
            setOfferDone(null);
            goTo('negotiate');
          }}
        >
          View My Offers →
        </button>
        <button type="button" className="btn btn-secondary btn-block mt-2" onClick={() => setOfferDone(null)}>
          Stay Here
        </button>
      </Modal>
    </DashboardLayout>
  );
}
