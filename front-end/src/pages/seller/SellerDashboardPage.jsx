/**
 * SellerDashboardPage.jsx  (was: seller-dashboard.html)
 * Purpose: The seller's workspace — overview, listings, add property,
 *          offers, deal payments, sold / rented, billing & plans,
 *          notifications and profile.
 * Inputs:  URL section (/seller/:section), the signed-in seller session.
 * Outputs: DashboardLayout + the active section.
 * API calls: shared data in useSellerData (refreshed every 15 s, like before)
 *            plus each section's own calls (see their headers).
 */
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useDashboardSection } from '../../hooks/useDashboardSection.js';
import { useLiveRefresh } from '../../hooks/useLiveRefresh.js';
import { clearUser, logoutPathForRole } from '../../auth/session.js';
import { useAccountProfile } from '../../components/profile/ProfileSections.jsx';
import { useSellerData } from './useSellerData.js';
import SellerOverview from './sections/SellerOverview.jsx';
import MyListingsSection from './sections/MyListingsSection.jsx';
import AddPropertySection from './sections/AddPropertySection.jsx';
import SellerNegotiationsSection from './sections/SellerNegotiationsSection.jsx';
import TrackPaymentsSection from './sections/TrackPaymentsSection.jsx';
import ClosedDealsSection from './sections/ClosedDealsSection.jsx';
import BillingSection from './sections/BillingSection.jsx';
import SellerNotificationsSection from './sections/SellerNotificationsSection.jsx';
import SellerProfileSection from './sections/SellerProfileSection.jsx';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { group: 'properties', label: 'Properties', icon: 'home', items: [{ key: 'my-listings', label: 'My Listings' }] },
  {
    group: 'buyerMgmt',
    label: 'Buyer Management',
    icon: 'users',
    items: [
      { key: 'negotiate', label: 'Negotiate' },
      { key: 'track-payment', label: 'Track Payment' },
    ],
  },
  {
    group: 'soldRented',
    label: 'Sold/Rented',
    icon: 'checkCircle',
    items: [
      { key: 'sold', label: 'Sold Properties' },
      { key: 'rent-given', label: 'Rent Given Properties' },
    ],
  },
  { key: 'billing', label: 'Billing & Plans', icon: 'card' },
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];
// "add-property" has no menu entry (reached from My Listings) but is a valid URL.
const KEYS = [...NAV.flatMap((n) => (n.items ? n.items.map((i) => i.key) : [n.key])), 'add-property'];

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const [active, goTo] = useDashboardSection('/seller', 'seller', KEYS, 'dashboard');
  const data = useSellerData();
  const account = useAccountProfile('sellerProfile'); // name/avatar/profile page

  // Buyer offers, admin approvals and deal steps show up without a reload.
  const { sessionChanged } = useLiveRefresh(data.reloadAll, { role: 'seller', intervalMs: 15000 });

  const logout = () => {
    clearUser();
    navigate(logoutPathForRole('seller'));
  };

  // Shared props every section receives.
  const props = { data, goTo, account };
  const sections = {
    dashboard: <SellerOverview {...props} />,
    'my-listings': <MyListingsSection {...props} />,
    'add-property': <AddPropertySection {...props} />,
    negotiate: <SellerNegotiationsSection {...props} />,
    'track-payment': <TrackPaymentsSection {...props} />,
    sold: <ClosedDealsSection {...props} mode="sale" />,
    'rent-given': <ClosedDealsSection {...props} mode="rent" />,
    billing: <BillingSection {...props} />,
    notifications: <SellerNotificationsSection {...props} />,
    profile: <SellerProfileSection {...props} />,
  };

  return (
    <DashboardLayout
      badge="Seller"
      nav={NAV}
      // The add-property form highlights "My Listings" in the menu.
      active={active === 'add-property' ? 'my-listings' : active}
      onNavigate={goTo}
      user={{ name: account.fullName, subtitle: 'Seller Account' }}
      onLogout={logout}
      sessionChanged={sessionChanged}
      role="seller"
    >
      {sections[active]}
    </DashboardLayout>
  );
}
