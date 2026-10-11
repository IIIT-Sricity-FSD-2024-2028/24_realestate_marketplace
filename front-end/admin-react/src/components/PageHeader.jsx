/**
 * Black header bar at the top of every admin section: title, subtitle, and an
 * optional icon (left) or action button (right).
 */
export default function PageHeader({ title, subtitle, icon, actions }) {
  return (
    <div className={'page-header' + (actions ? ' page-header--split' : '')}>
      <div className="page-header__text">
        {icon && <div className="page-header__icon">{icon}</div>}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}
