import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LogoIcon,
  ExploreIcon,
  HeartIcon,
  VisitIcon,
  OffersIcon,
  PurchasesIcon,
  PaymentsIcon,
  NotificationsIcon,
  ProfileIcon,
  LogoutIcon,
  ChevronDown,
} from './Icons.jsx';
import { useBuyerProfile } from '../context/BuyerProfileContext.jsx';
import { forceSignOut } from '../api/client.js';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const prefix = location.pathname.startsWith('/buyer') ? '/buyer' : '';
  const { fullName, initials } = useBuyerProfile();

  // Dropdown states for My Offers and Completed Purchases
  const isOffersActive = [
    `${prefix}/under-consideration`, `${prefix}/negotiate`, `${prefix}/purchase-initiation`,
    '/under-consideration', '/negotiate', '/purchase-initiation'
  ].includes(location.pathname);
  const isCompletedActive = [
    `${prefix}/rented`, `${prefix}/purchased`,
    '/rented', '/purchased'
  ].includes(location.pathname);

  const [offersOpen, setOffersOpen] = useState(true);
  const [completedOpen, setCompletedOpen] = useState(true);

  function handleLogout() {
    forceSignOut('User clicked logout');
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="logo-section">
        <div className="logo-icon">
          <LogoIcon />
        </div>
        <div className="logo-text">
          <span className="bold">Tru</span>
          <span>Estate</span>
          <span className="logo-badge">Buyer</span>
        </div>
        {onClose && (
          <button className="sidebar-mobile-close" onClick={onClose} aria-label="Close sidebar">
            ×
          </button>
        )}
      </div>

      <nav className="nav">
        <NavLink
          to={`${prefix}/explore`}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <ExploreIcon />
          <span>Explore</span>
          <div className="nav-indicator" />
        </NavLink>

        <NavLink
          to={`${prefix}/shortlist`}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <HeartIcon />
          <span>Shortlist</span>
          <div className="nav-indicator" />
        </NavLink>

        <NavLink
          to={`${prefix}/visit-status`}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <VisitIcon />
          <span>Visit Status</span>
          <div className="nav-indicator" />
        </NavLink>

        {/* My Offers Dropdown */}
        <button
          type="button"
          className={`dropdown-btn ${isOffersActive ? 'active' : ''}`}
          onClick={() => setOffersOpen(!offersOpen)}
        >
          <OffersIcon style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: 'left' }}>My Offers</span>
          <div
            style={{
              transform: offersOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
              display: 'flex',
            }}
          >
            <ChevronDown style={{ width: '1rem', height: '1rem' }} />
          </div>
        </button>
        <div className={`dropdown-content ${offersOpen ? 'open' : ''}`}>
          <NavLink
            to={`${prefix}/under-consideration`}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>Under Consideration</span>
          </NavLink>
          <NavLink
            to={`${prefix}/negotiate`}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>Negotiate</span>
          </NavLink>
          <NavLink
            to={`${prefix}/purchase-initiation`}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>Purchase Initiation</span>
          </NavLink>
        </div>

        {/* Completed Purchases Dropdown */}
        <button
          type="button"
          className={`dropdown-btn ${isCompletedActive ? 'active' : ''}`}
          onClick={() => setCompletedOpen(!completedOpen)}
        >
          <PurchasesIcon style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: 'left' }}>Completed Purchases</span>
          <div
            style={{
              transform: completedOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
              display: 'flex',
            }}
          >
            <ChevronDown style={{ width: '1rem', height: '1rem' }} />
          </div>
        </button>
        <div className={`dropdown-content ${completedOpen ? 'open' : ''}`}>
          <NavLink
            to={`${prefix}/rented`}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>Rented Properties</span>
          </NavLink>
          <NavLink
            to={`${prefix}/purchased`}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>Purchased Properties</span>
          </NavLink>
        </div>

        <NavLink
          to={`${prefix}/payments`}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <PaymentsIcon />
          <span>Payments</span>
          <div className="nav-indicator" />
        </NavLink>

        <NavLink
          to={`${prefix}/notifications`}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <NotificationsIcon />
          <span>Notifications</span>
          <div className="nav-indicator" />
        </NavLink>

        <NavLink
          to={`${prefix}/profile`}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <ProfileIcon />
          <span>Profile</span>
          <div className="nav-indicator" />
        </NavLink>
      </nav>

      {/* User info & Logout */}
      <div className="user-section">
        <NavLink to={`${prefix}/profile`} className="user-profile" style={{ textDecoration: 'none' }} onClick={onClose}>
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{fullName}</div>
            <div className="user-type">Buyer Account</div>
          </div>
        </NavLink>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          <LogoutIcon style={{ width: '1.25rem', height: '1.25rem' }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
