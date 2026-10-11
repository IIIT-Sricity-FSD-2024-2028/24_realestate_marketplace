import Icon from './Icons.jsx';

/**
 * Dashboard KPI card: coloured icon tile, a trend label, the value and caption.
 * `color` drives the icon stroke, its tinted background and the trend text.
 */
export function StatCard({ icon, color, tint, trend, value, label }) {
  return (
    <div className="card stat-card">
      <div className="stat-card__top">
        <div className="stat-icon" style={{ background: tint }}><Icon name={icon} size="1.5rem" color={color} /></div>
        {trend && <span className="stat-card__trend" style={{ color }}>{trend}</span>}
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

/**
 * Summary card used on Property Verification: caption + big number on the left,
 * small tinted icon on the right.
 */
export function SummaryCard({ icon, color, tint, value, label }) {
  return (
    <div className="card summary-card">
      <div>
        <div className="summary-card__label">{label}</div>
        <div className="summary-card__value" style={{ color }}>{value}</div>
      </div>
      <div className="summary-card__icon" style={{ background: tint }}>
        <Icon name={icon} color={color === '#fff' ? '#9ca3af' : color} />
      </div>
    </div>
  );
}
