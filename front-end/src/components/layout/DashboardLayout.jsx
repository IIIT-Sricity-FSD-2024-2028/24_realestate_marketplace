/**
 * DashboardLayout.jsx
 * Purpose: The shared shell of all four dashboards — sidebar navigation with
 *          collapsible groups, signed-in user card, logout, and a mobile menu.
 * Inputs (props):
 *   badge        – text after the logo ("Buyer", "Seller", "Admin", "Super")
 *   logoIcon     – Icon name for the logo square (default 'home')
 *   nav          – [{ key, label, icon } | { group, label, icon, items: [{ key, label }] }]
 *   active       – key of the section on screen
 *   onNavigate   – called with a key when a nav item is clicked
 *   user         – { name, subtitle }
 *   onLogout     – sign-out handler
 *   sessionChanged, role – show the frozen overlay when the session changed
 *   children     – the active section's content
 * Outputs: the page frame.
 * API calls: none.
 */
import { useEffect, useState } from 'react';
import Icon from '../common/Icon.jsx';
import { Avatar } from '../common/ui.jsx';
import SessionChangedOverlay from './SessionChangedOverlay.jsx';

export default function DashboardLayout({ badge, logoIcon = 'home', nav, active, onNavigate, user, onLogout, sessionChanged, role, children }) {
  const [menuOpen, setMenuOpen] = useState(false); // mobile sidebar visibility
  // Every dropdown group starts open (as on the old pages).
  const [openGroups, setOpenGroups] = useState(() => new Set(nav.filter((n) => n.group).map((n) => n.group)));

  // Close the mobile menu whenever the section changes.
  useEffect(() => setMenuOpen(false), [active]);

  // Scroll the content area back to the top on section change.
  useEffect(() => {
    document.getElementById('dashboard-main')?.scrollTo?.(0, 0);
  }, [active]);

  const toggleGroup = (group) =>
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });

  /** One clickable nav entry (top-level or inside a group). */
  const renderItem = (item, nested = false) => {
    const isActive = item.key === active;
    return (
      <button
        key={item.key}
        type="button"
        className={(nested ? 'nav-subitem' : 'nav-item') + (isActive ? ' active' : '')}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => onNavigate(item.key)}
      >
        {item.icon && <Icon name={item.icon} />}
        <span className="nav-label">{item.label}</span>
        {item.count ? <span className="nav-count">{item.count}</span> : null}
        {isActive && !nested && <span className="nav-indicator" aria-hidden="true" />}
      </button>
    );
  };

  return (
    <div className={'dashboard' + (menuOpen ? ' menu-open' : '')}>
      {/* Mobile top bar (hidden on wide screens by CSS). */}
      <header className="mobile-bar">
        <button
          type="button"
          className="icon-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="dashboard-sidebar"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon name="menu" />
        </button>
        <span className="mobile-brand">
          <strong>Tru</strong>Estate <span className="logo-badge">{badge}</span>
        </span>
      </header>

      {/* Dark backdrop behind the open mobile menu. */}
      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

      <aside id="dashboard-sidebar" className="sidebar" aria-label="Dashboard navigation">
        <div className="logo-section">
          <span className="logo-icon">
            <Icon name={logoIcon} size="1.5rem" />
          </span>
          <span className="logo-text">
            <strong>Tru</strong>Estate <span className="logo-badge">{badge}</span>
          </span>
        </div>

        <nav className="nav">
          {nav.map((entry) =>
            entry.group ? (
              <div key={entry.group} className="nav-group">
                <button
                  type="button"
                  className="nav-item nav-group-toggle"
                  aria-expanded={openGroups.has(entry.group)}
                  onClick={() => toggleGroup(entry.group)}
                >
                  {entry.icon && <Icon name={entry.icon} />}
                  <span className="nav-label">{entry.label}</span>
                  <Icon name={openGroups.has(entry.group) ? 'chevronDown' : 'chevronRight'} size="1rem" />
                </button>
                {openGroups.has(entry.group) && <div className="nav-group-items">{entry.items.map((item) => renderItem(item, true))}</div>}
              </div>
            ) : (
              renderItem(entry)
            ),
          )}
        </nav>

        <div className="user-section">
          <div className="user-profile">
            <Avatar name={user.name} color="var(--brand)" textColor="#000" />
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-type">{user.subtitle}</div>
            </div>
          </div>
          <button type="button" className="logout-btn" onClick={onLogout}>
            <Icon name="logout" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main id="dashboard-main" className="main-content" tabIndex={-1}>
        {children}
      </main>

      {sessionChanged && <SessionChangedOverlay role={role} />}
    </div>
  );
}
