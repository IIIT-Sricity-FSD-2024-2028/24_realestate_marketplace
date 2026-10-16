/**
 * SellerDashboardPage.jsx - Comprehensive Construction & Architecture Specification
 * =========================================================================================
 * [PAGE ROLE & SYSTEM POSITION]:
 *   Top-level shell and orchestrator for the entire authenticated Seller workspace.
 *   - Manages top-level routing, persistent sidebar navigation, and header chrome.
 *   - Coordinates background real-time data polling (15-second heartbeat).
 *   - Handles session invalidation and programmatic logout.
 *   - Conditionally mounts the active section view based on URL route parameters.
 *
 * [INPUTS & ROUTING CONTRACT]:
 *   - Base URL Pattern: `/seller/:section`
 *   - Allowed Section Keys (KEYS):
 *       'dashboard', 'my-listings', 'negotiate', 'track-payment', 'sold',
 *       'rent-given', 'billing', 'notifications', 'profile', 'add-property'
 *   - Default Section: 'dashboard'
 *   - Auth Session: Requires valid JWT token stored in browser session storage.
 *
 * [SYSTEM ARCHITECTURE & COMPONENT TREE DIAGRAM]:
 * ┌────────────────────────────────────────────────────────────────────────────────────────┐
 * │ SellerDashboardPage (Root Orchestrator)                                                │
 * │  ├── Hooks Orchestration Layer:                                                        │
 * │  │    ├── useNavigate()           -> Programmatic route redirection on logout          │
 * │  │    ├── useDashboardSection()   -> Syncs URL path with `active` state & `goTo`       │
 * │  │    ├── useSellerData()         -> Central store: listings, offers, deals, billing   │
 * │  │    ├── useAccountProfile()     -> Seller name, email, credentials, and avatar       │
 * │  │    └── useLiveRefresh()        -> 15s interval polling & sessionChanged indicator   │
 * │  └── UI Shell: DashboardLayout                                                         │
 * │       ├── Sidebar Navigation (NAV Menu):                                               │
 * │       │    ├── Group: (top-level)  -> Dashboard [icon: grid]                          │
 * │       │    ├── Group: Properties   -> My Listings [icon: home]                         │
 * │       │    ├── Group: Buyer Mgmt   -> Negotiate, Track Payment [icon: users]           │
 * │       │    ├── Group: Sold/Rented  -> Sold Properties, Rent Given [icon: checkCircle]  │
 * │       │    ├── Group: (top-level)  -> Billing & Plans [icon: card]                     │
 * │       │    ├── Group: (top-level)  -> Notifications [icon: bell]                       │
 * │       │    └── Group: (top-level)  -> Profile [icon: user]                             │
 * │       ├── Header Chrome (User profile avatar, role badge="Seller", logout button)      │
 * │       └── Dynamic Main Viewport: sections[active] router lookup:                       │
 * │            ├── 'dashboard'      ──> <SellerOverview {...props} />                     │
 * │            ├── 'my-listings'    ──> <MyListingsSection {...props} />                  │
 * │            ├── 'add-property'   ──> <AddPropertySection {...props} />                 │
 * │            ├── 'negotiate'      ──> <SellerNegotiationsSection {...props} />          │
 * │            ├── 'track-payment'  ──> <TrackPaymentsSection {...props} />               │
 * │            ├── 'sold'           ──> <ClosedDealsSection {...props} mode="sale" />     │
 * │            ├── 'rent-given'     ──> <ClosedDealsSection {...props} mode="rent" />     │
 * │            ├── 'billing'        ──> <BillingSection {...props} />                     │
 * │            ├── 'notifications'  ──> <SellerNotificationsSection {...props} />         │
 * │            └── 'profile'        ──> <SellerProfileSection {...props} />               │
 * └────────────────────────────────────────────────────────────────────────────────────────┘
 *
 * [NAVIGATION CONFIGURATION SPECIFICATION (NAV)]:
 *   const NAV = [
 *     { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
 *     { group: 'properties', label: 'Properties', icon: 'home', items: [{ key: 'my-listings', label: 'My Listings' }] },
 *     { group: 'buyerMgmt', label: 'Buyer Management', icon: 'users', items: [
 *         { key: 'negotiate', label: 'Negotiate' },
 *         { key: 'track-payment', label: 'Track Payment' },
 *     ]},
 *     { group: 'soldRented', label: 'Sold/Rented', icon: 'checkCircle', items: [
 *         { key: 'sold', label: 'Sold Properties' },
 *         { key: 'rent-given', label: 'Rent Given Properties' },
 *     ]},
 *     { key: 'billing', label: 'Billing & Plans', icon: 'card' },
 *     { key: 'notifications', label: 'Notifications', icon: 'bell' },
 *     { key: 'profile', label: 'Profile', icon: 'user' },
 *   ];
 *
 * [SPECIAL ROUTING LOGIC]:
 *   - "add-property" has no dedicated menu entry in the sidebar; it is entered from
 *     a primary action button inside "My Listings".
 *   - When `active === 'add-property'`, the sidebar highlights "My Listings" (`my-listings`).
 *
 * [STEP-BY-STEP IMPLEMENTATION CHECKLIST]:
 * [ ] Step 1: Import React Router useNavigate hook.
 * [ ] Step 2: Import DashboardLayout from components/layout/DashboardLayout.jsx.
 * [ ] Step 3: Import custom hooks: useDashboardSection, useLiveRefresh, useAccountProfile, useSellerData.
 * [ ] Step 4: Import auth helpers: clearUser and logoutPathForRole.
 * [ ] Step 5: Configure NAV array with semantic group headers and icon identifiers.
 * [ ] Step 6: Construct valid URL KEYS array including top-level, grouped, and hidden sub-routes.
 * [ ] Step 7: Initialize useDashboardSection hook with base path '/seller' and fallback 'dashboard'.
 * [ ] Step 8: Initialize useLiveRefresh polling data.reloadAll with 15000ms interval for role 'seller'.
 * [ ] Step 9: Define logout handler that clears user session and redirects to logoutPathForRole('seller').
 * [ ] Step 10: Assemble shared props object `{ data, goTo, account }` passed to each active section.
 * [ ] Step 11: Construct section router map and render selected component inside DashboardLayout.
 * [ ] Step 12: Test responsive off-canvas mobile drawer navigation and tab switching.
 * =========================================================================================
 */
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useDashboardSection } from '../../hooks/useDashboardSection.js';
import { useLiveRefresh } from '../../hooks/useLiveRefresh.js';
import { clearUser, logoutPathForRole } from '../../auth/session.js';
import { useAccountProfile } from '../../components/profile/ProfileSections.jsx';
import { useSellerData } from './useSellerData.js';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { group: 'properties', label: 'Properties', icon: 'home', items: [{ key: 'my-listings', label: 'My Listings' }] },
  { group: 'buyerMgmt', label: 'Buyer Management', icon: 'users', items: [{ key: 'negotiate', label: 'Negotiate' }, { key: 'track-payment', label: 'Track Payment' }] },
  { group: 'soldRented', label: 'Sold/Rented', icon: 'checkCircle', items: [{ key: 'sold', label: 'Sold Properties' }, { key: 'rent-given', label: 'Rent Given Properties' }] },
  { key: 'billing', label: 'Billing & Plans', icon: 'card' },
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];
const KEYS = [...NAV.flatMap((n) => (n.items ? n.items.map((i) => i.key) : [n.key])), 'add-property'];

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const [active, goTo] = useDashboardSection('/seller', 'seller', KEYS, 'dashboard');
  const data = useSellerData();
  const account = useAccountProfile('sellerProfile');
  const { sessionChanged } = useLiveRefresh(data.reloadAll, { role: 'seller', intervalMs: 15000 });

  const logout = () => {
    clearUser();
    navigate(logoutPathForRole('seller'));
  };

  return (
    <DashboardLayout
      badge="Seller"
      nav={NAV}
      active={active === 'add-property' ? 'my-listings' : active}
      onNavigate={goTo}
      user={{ name: account.fullName, subtitle: 'Seller Account' }}
      onLogout={logout}
      sessionChanged={sessionChanged}
      role="seller"
    >
      <div className="content" data-plan="seller-dashboard-shell">
        <h2>Active Section: {active} (Architecture Plan)</h2>
        <p>Seller Workspace Orchestrator Shell</p>
        <p>Live session synchronization: {sessionChanged ? 'Update pending' : 'Active'}</p>
      </div>
    </DashboardLayout>
  );
}
