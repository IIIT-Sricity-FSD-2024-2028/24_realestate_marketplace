import { NavLink, useLocation } from 'react-router-dom';
import Icon from './Icons.jsx';
import { useSuperuserProfile } from '../context/SuperuserProfileContext.jsx';

export function Brand() {
  return (
    <div className="sidebar-header">
      <div className="logo-icon">
        <Icon name="home" size="1.5rem" color="#000" />
      </div>
      <div className="logo-text">
        <span className="logo-text-bold">Tru</span>Estate
        <span className="logo-badge">Super</span>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/users', label: 'User Management', icon: 'users' },
  { to: '/properties', label: 'Property Operations', icon: 'home' },
  { to: '/revenue', label: 'Revenue', icon: 'revenue' },
  { to: '/logs', label: 'System Logs', icon: 'logs' },
  { to: '/settings', label: 'System Settings', icon: 'shield' },
];

export default function Sidebar({ open = false, onNavigate, onLogout }) {
  const { profile } = useSuperuserProfile();
  const location = useLocation();
  const prefix = location.pathname.startsWith('/superuser') ? '/superuser' : '';

  return (
    <aside className={'sidebar' + (open ? ' sidebar--open' : '')}>
      <Brand />

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={prefix + item.to}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            onClick={onNavigate}
          >
            <Icon name={item.icon} size="1.25rem" />
            <span>{item.label}</span>
            <div className="nav-indicator" />
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-mini">
          <div className="user-avatar">{profile?.initials || 'SU'}</div>
          <div className="user-info-mini">
            <div className="name">{profile?.name || 'Super Admin'}</div>
            <div className="role">{profile?.title || 'System Creator'}</div>
          </div>
        </div>
        <button
          type="button"
          id="btn-logout"
          className="logout-btn"
          onClick={onLogout}
        >
          <Icon name="logout" size="1.25rem" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
