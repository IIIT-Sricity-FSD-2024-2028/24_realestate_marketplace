/**
 * ui.jsx
 * Purpose: Small presentational building blocks reused across all dashboards
 *          (cards, badges, stat tiles, filter pills, page headers, empty states).
 * Inputs:  props documented on each component below.
 * Outputs: plain JSX — no state, no side effects.
 * API calls: none.
 */
import Icon from './Icon.jsx';
import { initials } from '../../utils/format.js';

/** Coloured pill label. tone: green | orange | red | blue | yellow | gray */
export function Badge({ tone = 'gray', children, className = '' }) {
  return <span className={'badge badge-' + tone + ' ' + className}>{children}</span>;
}

/** Dark rounded panel used for most content blocks. */
export function Card({ children, className = '', ...rest }) {
  return (
    <div className={'card ' + className} {...rest}>
      {children}
    </div>
  );
}

/**
 * Top-of-page heading bar.
 * Props: title, subtitle, icon (Icon name), actions (buttons on the right).
 */
export function PageHeader({ title, subtitle, icon, actions, children }) {
  return (
    <header className="page-header">
      <div className="page-header-main">
        {icon && (
          <span className="page-header-icon">
            <Icon name={icon} size="1.5rem" />
          </span>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

/**
 * Number tile. Props: label, value, icon, tone (icon colour), note (small text).
 */
export function StatCard({ label, value, icon, tone = 'green', note, valueClassName = '', children }) {
  return (
    <div className="stat-card">
      {icon && (
        <span className={'stat-icon tone-' + tone}>
          <Icon name={icon} size="1.4rem" />
        </span>
      )}
      <div className="stat-label">{label}</div>
      <div className={'stat-value ' + valueClassName}>{value}</div>
      {note && <div className="stat-note">{note}</div>}
      {children}
    </div>
  );
}

/**
 * Row of filter buttons.
 * Props: options [{ key, label, count? }], value (active key), onChange(key), label (aria).
 */
export function FilterPills({ options, value, onChange, label = 'Filter' }) {
  return (
    <div className="pill-row" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          className={'pill ' + (option.key === value ? 'pill-active' : '')}
          aria-pressed={option.key === value}
          onClick={() => onChange(option.key)}
        >
          {option.label}
          {option.count !== undefined && <span className="pill-count">{option.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Friendly "nothing here" box. Props: icon (emoji/text), title, children, action. */
export function EmptyState({ icon, title, children, action }) {
  return (
    <div className="empty-state">
      {icon && (
        <div className="empty-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      {title && <h3>{title}</h3>}
      {children && <div className="empty-text">{children}</div>}
      {action}
    </div>
  );
}

/** Loading / error line shared by every list. */
export function StatusLine({ loading, error, loadingText = 'Loading…' }) {
  if (loading)
    return (
      <p className="state-line" role="status">
        {loadingText}
      </p>
    );
  if (error)
    return (
      <p className="state-line state-error" role="alert">
        {error}
      </p>
    );
  return null;
}

/** Round initials badge. Props: name, color, size ('sm'|'md'|'lg'|'xl'). */
export function Avatar({ name, color, size = 'md', textColor }) {
  return (
    <span className={'avatar avatar-' + size} style={{ background: color, color: textColor }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

/** Label/value pair in a dark box (used in detail grids). */
export function Fact({ label, children, className = '' }) {
  return (
    <div className={'fact ' + className}>
      <div className="fact-label">{label}</div>
      <div className="fact-value">{children}</div>
    </div>
  );
}

/** Previous / Next pager. Props: page, totalPages, total, onPage(n). */
export function Pager({ page, totalPages, total, onPage }) {
  const pages = Math.max(totalPages || 1, 1);
  return (
    <nav className="pager" aria-label="Pagination">
      <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        ← Prev
      </button>
      <span className="text-secondary small" aria-live="polite">
        Page {page} of {pages}
        {total !== undefined ? ' (' + total + ' total)' : ''}
      </span>
      <button type="button" className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next →
      </button>
    </nav>
  );
}
