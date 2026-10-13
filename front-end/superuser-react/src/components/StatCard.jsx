import Icon from './Icons.jsx';

/**
 * Modern stat KPI card used across the superuser dashboard & revenue screens.
 */
export default function StatCard({
  icon,
  iconType = 'primary', // 'primary' | 'info' | 'warning' | 'danger'
  value,
  label,
  trend,
  className = '',
}) {
  return (
    <div className={'stat-card ' + className}>
      <div className="stat-header">
        <div className={`stat-icon ${iconType}`}>
          <Icon name={icon} size="1.5rem" />
        </div>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
