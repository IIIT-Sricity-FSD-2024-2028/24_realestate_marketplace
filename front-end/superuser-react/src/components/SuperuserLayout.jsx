import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar, { Brand } from './Sidebar.jsx';
import Icon from './Icons.jsx';
import { clearUser } from '../api/session.js';
import { SessionProvider } from '../context/SessionContext.jsx';
import { SuperuserProfileProvider } from '../context/SuperuserProfileContext.jsx';

/**
 * Shell for the superuser dashboard: sidebar on the left, outlet on the right.
 * Responsive drawer on mobile screen widths (< 900px).
 */
export default function SuperuserLayout() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    clearUser();
    const target = window.location.pathname.startsWith('/superuser') ? '/superuser/login' : '/login';
    navigate(target, { replace: true });
  };

  return (
    <SessionProvider>
      <SuperuserProfileProvider>
        <div className="app-container">
          <Sidebar
            open={drawerOpen}
            onNavigate={() => setDrawerOpen(false)}
            onLogout={handleLogout}
          />
          {drawerOpen && (
            <div
              className="sidebar-backdrop"
              onClick={() => setDrawerOpen(false)}
            />
          )}

          <main className="main-content">
            <div className="mobile-topbar">
              <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
              >
                <Icon name="menu" size="1.5rem" />
              </button>
              <Brand />
            </div>

            <Outlet />
          </main>
        </div>
      </SuperuserProfileProvider>
    </SessionProvider>
  );
}
