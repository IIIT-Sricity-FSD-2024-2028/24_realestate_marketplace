import { useState as useToggleState } from 'react';
import { NavLink as NavigationLink, useNavigate as useRouterNavigate, useLocation } from 'react-router-dom';
import { clearUser as clearSessionUser } from '../api/session.js';
import { useSellerProfile as useSellerDetails } from '../context/SellerProfileContext.jsx';
import {
  DashboardIcon as DashboardSymbol,
  PropertyIcon as PropertySymbol,
  BuyerMgmtIcon as BuyerManagementSymbol,
  SoldIcon as SoldSymbol,
  BillingIcon as BillingSymbol,
  BellIcon as NotificationSymbol,
  UserIcon as ProfileSymbol,
  LogoutIcon as LogoutSymbol,
  ChevronDown as ExpandDownSymbol,
  ChevronRight as ExpandRightSymbol,
} from './Icons.jsx';

export default function Sidebar({
  mobileOpen: isMobileSidebarOpen = false,
  onCloseMobile: closeMobileSidebar = () => {},
}) {
  const navigateToRoute = useRouterNavigate();
  const location = useLocation();
  const prefix = location.pathname.startsWith('/seller') ? '/seller' : '';
  const { fullName: sellerFullName, initials: sellerInitials } = useSellerDetails();

  // Maintain independent expansion states for each navigation group.
  const [isPropertiesExpanded, setPropertiesExpanded] = useToggleState(true);
  const [isBuyerManagementExpanded, setBuyerManagementExpanded] = useToggleState(true);
  const [isSoldRentedExpanded, setSoldRentedExpanded] = useToggleState(true);

  function performLogout() {
    clearSessionUser();
    navigateToRoute(prefix ? `${prefix}/login` : '/login');
  }

  function closeSidebarAfterNavigation() {
    closeMobileSidebar();
  }

  return (
    <aside className={`sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
      <div className="logo-section">
        <div className="logo-icon">
          <svg
            fill="none"
            stroke="#000000"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            width="22"
            height="22"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>

        <div className="logo-text">
          <span className="bold">Tru</span>
          <span>Estate</span>
          <span className="logo-badge">Seller</span>
        </div>
      </div>

      <nav className="nav">
        <NavigationLink
          to={`${prefix}/dashboard`}
          onClick={closeSidebarAfterNavigation}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <DashboardSymbol />
          <span>Dashboard</span>
          <div className="nav-indicator" />
        </NavigationLink>

        {/* Properties Dropdown */}
        <button
          type="button"
          className={`dropdown-btn ${isPropertiesExpanded ? 'active' : ''}`}
          onClick={() => setPropertiesExpanded((previousState) => !previousState)}
        >
          <PropertySymbol />
          <span style={{ flex: 1, textAlign: 'left' }}>Properties</span>
          {isPropertiesExpanded ? (
            <ExpandDownSymbol size={14} />
          ) : (
            <ExpandRightSymbol size={14} />
          )}
        </button>

        <div className={`dropdown-content ${isPropertiesExpanded ? 'open' : ''}`}>
          <NavigationLink
            to={`${prefix}/my-listings`}
            onClick={closeSidebarAfterNavigation}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
          >
            <span>My Listings</span>
          </NavigationLink>

          <NavigationLink
            to={`${prefix}/add-property`}
            onClick={closeSidebarAfterNavigation}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
          >
            <span>+ Add Property</span>
          </NavigationLink>
        </div>

        {/* Buyer Management Dropdown */}
        <button
          type="button"
          className={`dropdown-btn ${isBuyerManagementExpanded ? 'active' : ''}`}
          onClick={() => setBuyerManagementExpanded((previousState) => !previousState)}
        >
          <BuyerManagementSymbol />
          <span style={{ flex: 1, textAlign: 'left' }}>Buyer Management</span>
          {isBuyerManagementExpanded ? (
            <ExpandDownSymbol size={14} />
          ) : (
            <ExpandRightSymbol size={14} />
          )}
        </button>

        <div className={`dropdown-content ${isBuyerManagementExpanded ? 'open' : ''}`}>
          <NavigationLink
            to={`${prefix}/negotiate`}
            onClick={closeSidebarAfterNavigation}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
          >
            <span>Negotiate</span>
          </NavigationLink>

          <NavigationLink
            to={`${prefix}/track-payment`}
            onClick={closeSidebarAfterNavigation}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
          >
            <span>Track Payment</span>
          </NavigationLink>
        </div>

        {/* Sold / Rented Dropdown */}
        <button
          type="button"
          className={`dropdown-btn ${isSoldRentedExpanded ? 'active' : ''}`}
          onClick={() => setSoldRentedExpanded((previousState) => !previousState)}
        >
          <SoldSymbol />
          <span style={{ flex: 1, textAlign: 'left' }}>Sold/Rented</span>
          {isSoldRentedExpanded ? (
            <ExpandDownSymbol size={14} />
          ) : (
            <ExpandRightSymbol size={14} />
          )}
        </button>

        <div className={`dropdown-content ${isSoldRentedExpanded ? 'open' : ''}`}>
          <NavigationLink
            to={`${prefix}/sold`}
            onClick={closeSidebarAfterNavigation}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
          >
            <span>Sold Properties</span>
          </NavigationLink>

          <NavigationLink
            to={`${prefix}/rent-given`}
            onClick={closeSidebarAfterNavigation}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
          >
            <span>Rent Given Properties</span>
          </NavigationLink>
        </div>

        {/* Single Navigation Items */}
        <NavigationLink
          to={`${prefix}/billing`}
          onClick={closeSidebarAfterNavigation}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <BillingSymbol />
          <span>Billing &amp; Plans</span>
          <div className="nav-indicator" />
        </NavigationLink>

        <NavigationLink
          to={`${prefix}/notifications`}
          onClick={closeSidebarAfterNavigation}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <NotificationSymbol />
          <span>Notifications</span>
          <div className="nav-indicator" />
        </NavigationLink>

        <NavigationLink
          to={`${prefix}/profile`}
          onClick={closeSidebarAfterNavigation}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <ProfileSymbol />
          <span>Profile</span>
          <div className="nav-indicator" />
        </NavigationLink>
      </nav>

      {/* User Information and Logout Footer */}
      <div className="user-section">
        <div
          className="user-profile"
          onClick={() => {
            navigateToRoute(`${prefix}/profile`);
            closeMobileSidebar();
          }}
        >
          <div className="user-avatar">{sellerInitials}</div>

          <div className="user-info">
            <div className="user-name" id="sidebar-user-name">
              {sellerFullName}
            </div>
            <div className="user-type">Seller Account</div>
          </div>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={performLogout}
        >
          <LogoutSymbol size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}