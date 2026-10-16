/**
 * SuperuserDashboardPage.jsx  (was: superuser-dashboard.html)
 * Purpose: Platform-wide control panel — overview, user CRUD, property
 *          operations, revenue, system logs and settings.
 * Inputs:  URL section (/superuser/:section), the signed-in superuser session.
 * Outputs: DashboardLayout with the active section.
 * API calls: made by each section component (see their headers).
 */
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useDashboardSection } from '../../hooks/useDashboardSection.js';
import { clearUser, getUser, logoutPathForRole } from '../../auth/session.js';
import SuperuserOverview from './sections/SuperuserOverview.jsx';
import UserManagementSection from './sections/UserManagementSection.jsx';
import PropertyOperationsSection from './sections/PropertyOperationsSection.jsx';
import RevenueSection from './sections/RevenueSection.jsx';
import SystemLogsSection from './sections/SystemLogsSection.jsx';
import SettingsSection from './sections/SettingsSection.jsx';

// Sidebar entries (key = URL segment).
const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { key: 'users', label: 'User Management', icon: 'users' },
  { key: 'properties', label: 'Property Operations', icon: 'home' },
  { key: 'revenue', label: 'Revenue', icon: 'dollar' },
  { key: 'logs', label: 'System Logs', icon: 'fileText' },
  { key: 'settings', label: 'System Settings', icon: 'shield' },
];
const KEYS = NAV.map((n) => n.key); // module-level so the hook's deps stay stable

// Which component renders each section.
const SECTIONS = {
  dashboard: SuperuserOverview,
  users: UserManagementSection,
  properties: PropertyOperationsSection,
  revenue: RevenueSection,
  logs: SystemLogsSection,
  settings: SettingsSection,
};

export default function SuperuserDashboardPage() {
  const navigate = useNavigate();
  const [active, goTo] = useDashboardSection('/superuser', 'superuser', KEYS, 'dashboard');
  const user = getUser() || {};
  const Section = SECTIONS[active];

  const logout = () => {
    clearUser(); // forget the token
    navigate(logoutPathForRole('superuser'));
  };

  return (
    <DashboardLayout
      badge="Super"
      nav={NAV}
      active={active}
      onNavigate={goTo}
      user={{ name: user.name || 'Super Admin', subtitle: 'System Creator' }}
      onLogout={logout}
      role="superuser"
    >
      {/* key={active} remounts the section so it fetches fresh data each visit. */}
      <Section key={active} />
    </DashboardLayout>
  );
}
