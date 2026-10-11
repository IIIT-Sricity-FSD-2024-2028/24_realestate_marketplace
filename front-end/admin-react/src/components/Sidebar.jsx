import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Icon from './Icons.jsx';
import { useAdminProfile } from '../context/AdminProfileContext.jsx';

// Main navigation — same order and labels as the old sidebar.
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/users', label: 'User Management', icon: 'users' },
  { to: '/property-verification', label: 'Property Verification', icon: 'home' },
  { to: '/listings', label: 'Manage Listings', icon: 'table' },
  { to: '/buyers', label: 'Buyers', icon: 'users' },
  { group: 'Sellers', icon: 'seller', children: [{ to: '/sellers', label: 'Current Sellers' }] },
  { to: '/visits', label: 'Scheduled Visits', icon: 'calendar' },
  { to: '/negotiations', label: 'Negotiations', icon: 'chat' },
  { to: '/purchases', label: 'Purchase Tracking', icon: 'checkSquare' },
  { to: '/notifications', label: 'Notifications', icon: 'bell' },
  { to: '/profile', label: 'Profile', icon: 'user' },
];

/** Logo block shared by the sidebar and the mobile top bar. */
export function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark"><Icon name="home" size="1.5rem" color="#000" /></div>
      <div className="brand-name"><strong>Tru</strong><span>Estate</span><span className="brand-tag">Admin</span></div>
    </div>
  );
}

/**
 * Left navigation. Highlights the active section (grey background + green
 * indicator bar), holds the collapsible "Sellers" group, shows the signed-in
 * admin and the Logout button. On small screens it slides in as a drawer.
 */
export default function Sidebar({ open, onNavigate, onLogout }) {
  const location = useLocation();
  const { displayName, avatarText, cityLabel } = useAdminProfile();
  const [openGroups, setOpenGroups] = useState({});

  // Keep a group expanded while one of its pages is active.
  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      if (item.children && item.children.some((c) => location.pathname.startsWith(c.to))) {
        setOpenGroups((g) => ({ ...g, [item.group]: true }));
      }
    });
  }, [location.pathname]);

  const linkClass = ({ isActive }) => 'nav-item' + (isActive ? ' active' : '');

  return (
    <aside className={'sidebar' + (open ? ' sidebar--open' : '')}>
      <div className="sidebar__brand"><Brand /></div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          if (item.children) {
            const isOpen = !!openGroups[item.group];
            return (
              <div key={item.group}>
                <button
                  type="button"
                  className={'nav-item drop-toggle' + (isOpen ? ' open' : '')}
                  onClick={() => setOpenGroups((g) => ({ ...g, [item.group]: !isOpen }))}
                  aria-expanded={isOpen}
                >
                  <Icon name={item.icon} /><span>{item.group}</span>
                  <Icon name="chevron" size="1rem" className="chevron" style={{ marginLeft: 'auto' }} />
                </button>
                <div className={'admin-drop' + (isOpen ? ' open' : '')}>
                  {item.children.map((child) => (
                    <NavLink key={child.to} to={child.to} className={({ isActive }) => 'nav-subitem' + (isActive ? ' active' : '')} onClick={onNavigate}>
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={onNavigate}>
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} /><span>{item.label}</span>
                  {isActive && <div className="nav-ind" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="avatar avatar--md">{avatarText}</div>
          <div>
            <div className="sidebar__user-name">{displayName}</div>
            <div className="sidebar__user-city">{cityLabel}</div>
          </div>
        </div>
        <button type="button" className="logout-btn" onClick={onLogout}>
          <Icon name="logout" /><span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
