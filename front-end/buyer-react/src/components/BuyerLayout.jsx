import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { LogoIcon } from './Icons.jsx';
import { useBuyerProfile } from '../context/BuyerProfileContext.jsx';

export default function BuyerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { initials } = useBuyerProfile();

  return (
    <div className="dashboard">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
        </button>

        <div className="mobile-logo">
          <div className="logo-icon small">
            <LogoIcon />
          </div>
          <span className="logo-text">
            <span className="bold">Tru</span>Estate
          </span>
        </div>

        <div className="user-avatar small">{initials}</div>
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop show"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Page Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
