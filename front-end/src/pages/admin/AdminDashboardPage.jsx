/**
 * AdminDashboardPage.jsx  (was: admin-dashboard.html)
 * Purpose: The city admin's desk — users, listing verification, listings,
 *          buyers, sellers, site visits, negotiations (view-only), purchase
 *          tracking, notifications and profile.
 * Inputs:  URL section (/admin/:section), the signed-in admin session.
 * Outputs: DashboardLayout + the active section.
 * API calls: the shared queues in useAdminDesk (refreshed every 15 s, like
 *            before) plus each section's own calls (see their headers).
 */
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useDashboardSection } from '../../hooks/useDashboardSection.js';
import { useLiveRefresh } from '../../hooks/useLiveRefresh.js';
import { clearUser, getUser, logoutPathForRole } from '../../auth/session.js';
import { useAdminDesk } from './useAdminDesk.js';
import { useAdminProfile } from './sections/AdminProfileSection.jsx';
import AdminOverview from './sections/AdminOverview.jsx';
import AdminUsersSection from './sections/AdminUsersSection.jsx';
import PropertyVerificationSection from './sections/PropertyVerificationSection.jsx';
import ManageListingsSection from './sections/ManageListingsSection.jsx';
import CurrentBuyersSection from './sections/CurrentBuyersSection.jsx';
import CurrentSellersSection from './sections/CurrentSellersSection.jsx';
import ExploreSellersSection from './sections/ExploreSellersSection.jsx';
import ScheduledVisitsSection from './sections/ScheduledVisitsSection.jsx';
import AdminNegotiationsSection from './sections/AdminNegotiationsSection.jsx';
import PurchaseTrackingSection from './sections/PurchaseTrackingSection.jsx';
import AdminNotificationsSection from './sections/AdminNotificationsSection.jsx';
import AdminProfileSection from './sections/AdminProfileSection.jsx';

// Sidebar structure (same order as the old page).
const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { key: 'users', label: 'User Management', icon: 'users' },
  { key: 'property-mgmt', label: 'Property Verification', icon: 'home' },
  { key: 'properties-crud', label: 'Manage Listings', icon: 'table' },
  { key: 'current-buyers', label: 'Buyers', icon: 'users' },
  {
    group: 'sellers',
    label: 'Sellers',
    icon: 'user',
    items: [
      { key: 'current-sellers', label: 'Current Sellers' },
      { key: 'explore-sellers', label: 'Explore Sellers' },
    ],
  },
  { key: 'schedule', label: 'Scheduled Visits', icon: 'calendar' },
  { key: 'negotiations', label: 'Negotiations', icon: 'chat' },
  { key: 'purchase-tracking', label: 'Purchase Tracking', icon: 'checkSquare' },
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];
// Flat list of every section key (groups contribute their items).
const KEYS = NAV.flatMap((n) => (n.items ? n.items.map((i) => i.key) : [n.key]));

const SECTIONS = {
  dashboard: AdminOverview,
  users: AdminUsersSection,
  'property-mgmt': PropertyVerificationSection,
  'properties-crud': ManageListingsSection,
  'current-buyers': CurrentBuyersSection,
  'current-sellers': CurrentSellersSection,
  'explore-sellers': ExploreSellersSection,
  schedule: ScheduledVisitsSection,
  negotiations: AdminNegotiationsSection,
  'purchase-tracking': PurchaseTrackingSection,
  notifications: AdminNotificationsSection,
  profile: AdminProfileSection,
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [active, goTo] = useDashboardSection('/admin', 'admin', KEYS, 'dashboard');
  const desk = useAdminDesk(); // shared, city-scoped queues
  const profile = useAdminProfile(); // name shown in the sidebar
  const user = getUser() || {};

  // New visit requests / offers / seller responses arrive on their own.
  const { sessionChanged } = useLiveRefresh(desk.reloadAll, { role: 'admin', intervalMs: 15000 });

  const logout = () => {
    clearUser();
    navigate(logoutPathForRole('admin'));
  };

  const Section = SECTIONS[active];
  return (
    <DashboardLayout
      badge="Admin"
      nav={NAV}
      active={active}
      onNavigate={goTo}
      // Every queue here is scoped to this admin's city, so say which desk this is.
      user={{ name: profile.profile.name || user.name || 'Admin User', subtitle: user.city ? user.city + ' Admin' : 'Admin Account' }}
      onLogout={logout}
      sessionChanged={sessionChanged}
      role="admin"
    >
      <Section desk={desk} goTo={goTo} profile={profile} />
    </DashboardLayout>
  );
}
