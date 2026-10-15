import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar, { Brand } from './Sidebar.jsx';
import Icon from './Icons.jsx';
import { clearUser } from '../api/session.js';
import { SessionProvider } from '../context/SessionContext.jsx';
import { AdminProfileProvider } from '../context/AdminProfileContext.jsx';

/**
 * Shell of the admin dashboard: sidebar on the left, the active page
 * (<Outlet />) on the right. Below 900px the sidebar becomes a drawer opened
 * from a top bar. Also provides the session watcher and the profile context.
 */
export default function AdminLayout() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Logout = drop the stored session and return to the login page (TruEstate.logout('admin')).
  const logout = () => {
    clearUser();
    const target = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    navigate(target, { replace: true });
  };

  return (
    <SessionProvider>
      <AdminProfileProvider>
        <div className="admin-shell">
          <Sidebar open={drawerOpen} onNavigate={() => setDrawerOpen(false)} onLogout={logout} />
          {drawerOpen && <div className="sidebar-backdrop" onClick={() => setDrawerOpen(false)} />}

          <main className="admin-main">
            <div className="topbar">
              <button type="button" className="topbar__menu" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
                <Icon name="menu" />
              </button>
              <Brand />
            </div>
            <Outlet />
          </main>
        </div>
      </AdminProfileProvider>
    </SessionProvider>
  );
}
