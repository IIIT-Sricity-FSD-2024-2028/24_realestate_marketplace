import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { useSellerProfile } from '../context/SellerProfileContext.jsx';

export default function SellerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { initials } = useSellerProfile();

  return (
    <div className="dashboard">
      {/* Mobile Top Bar */}
      <div className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label="Toggle Navigation"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="logo-text" style={{ fontSize: '1.1rem' }}>
          <span className="bold">Tru</span>
          <span>Estate</span>
          <span className="logo-badge">Seller</span>
        </div>
        <div className="user-avatar" style={{ width: '2rem', height: '2rem', fontSize: '0.75rem' }}>
          {initials}
        </div>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
