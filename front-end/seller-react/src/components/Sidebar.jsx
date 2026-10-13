import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearUser } from '../api/session.js';
import { useSellerProfile } from '../context/SellerProfileContext.jsx';
import {
  DashboardIcon,
  PropertyIcon,
  BuyerMgmtIcon,
  SoldIcon,
  BillingIcon,
  BellIcon,
  UserIcon,
  LogoutIcon,
  ChevronDown,
  ChevronRight,
} from './Icons.jsx';

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const navigate = useNavigate();
  const { fullName, initials } = useSellerProfile();

  // Dropdown states for submenus
  const [openProperties, setOpenProperties] = useState(true);
  const [openBuyerMgmt, setOpenBuyerMgmt] = useState(true);
  const [openSoldRented, setOpenSoldRented] = useState(true);

  function handleLogout() {
    clearUser();
    const target = window.location.port === '5175'
      ? 'http://127.0.0.1:3000/index.html#login'
      : '../index.html#login';
    window.location.href = target;
  }

  function handleNavClick() {
    onCloseMobile();
  }

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="logo-section">
        <div className="logo-icon">
          <svg fill="none" stroke="#000000" strokeWidth="2.5" viewBox="0 0 24 24" width="22" height="22">
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
        <NavLink
          to="/dashboard"
          onClick={handleNavClick}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <DashboardIcon />
          <span>Dashboard</span>
          <div className="nav-indicator" />
        </NavLink>

        {/* Properties Dropdown */}
        <button
          type="button"
          className={`dropdown-btn ${openProperties ? 'active' : ''}`}
          onClick={() => setOpenProperties((v) => !v)}
        >
          <PropertyIcon />
          <span style={{ flex: 1, textAlign: 'left' }}>Properties</span>
          {openProperties ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className={`dropdown-content ${openProperties ? 'open' : ''}`}>
          <NavLink
            to="/my-listings"
            onClick={handleNavClick}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
          >
            <span>My Listings</span>
          </NavLink>
          <NavLink
            to="/add-property"
            onClick={handleNavClick}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
          >
            <span>+ Add Property</span>
          </NavLink>
        </div>

        {/* Buyer Management Dropdown */}
        <button
          type="button"
          className={`dropdown-btn ${openBuyerMgmt ? 'active' : ''}`}
          onClick={() => setOpenBuyerMgmt((v) => !v)}
        >
          <BuyerMgmtIcon />
          <span style={{ flex: 1, textAlign: 'left' }}>Buyer Management</span>
          {openBuyerMgmt ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className={`dropdown-content ${openBuyerMgmt ? 'open' : ''}`}>
          <NavLink
            to="/negotiate"
            onClick={handleNavClick}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
          >
            <span>Negotiate</span>
          </NavLink>
          <NavLink
            to="/track-payment"
            onClick={handleNavClick}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
          >
            <span>Track Payment</span>
          </NavLink>
        </div>

        {/* Sold / Rented Dropdown */}
        <button
          type="button"
          className={`dropdown-btn ${openSoldRented ? 'active' : ''}`}
          onClick={() => setOpenSoldRented((v) => !v)}
        >
          <SoldIcon />
          <span style={{ flex: 1, textAlign: 'left' }}>Sold/Rented</span>
          {openSoldRented ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className={`dropdown-content ${openSoldRented ? 'open' : ''}`}>
          <NavLink
            to="/sold"
            onClick={handleNavClick}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
          >
            <span>Sold Properties</span>
          </NavLink>
          <NavLink
            to="/rent-given"
            onClick={handleNavClick}
            className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
          >
            <span>Rent Given Properties</span>
          </NavLink>
        </div>

        {/* Single Navigation items */}
        <NavLink
          to="/billing"
          onClick={handleNavClick}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <BillingIcon />
          <span>Billing &amp; Plans</span>
          <div className="nav-indicator" />
        </NavLink>

        <NavLink
          to="/notifications"
          onClick={handleNavClick}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <BellIcon />
          <span>Notifications</span>
          <div className="nav-indicator" />
        </NavLink>

        <NavLink
          to="/profile"
          onClick={handleNavClick}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <UserIcon />
          <span>Profile</span>
          <div className="nav-indicator" />
        </NavLink>
      </nav>

      {/* User info & logout footer */}
      <div className="user-section">
        <div className="user-profile" onClick={() => { navigate('/profile'); onCloseMobile(); }}>
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name" id="sidebar-user-name">{fullName}</div>
            <div className="user-type">Seller Account</div>
          </div>
        </div>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          <LogoutIcon size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
