/**
 * Consistent section header for superuser pages.
 */
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="section-header">
      <div className="section-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
}
