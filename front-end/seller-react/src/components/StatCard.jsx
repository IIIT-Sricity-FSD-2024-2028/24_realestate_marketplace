export default function StatCard({ label, value, icon, iconBg = 'rgba(29,185,84,0.2)', iconColor = '#1DB954' }) {
  return (
    <div className="stat-card">
      {icon && (
        <div className="stat-icon-box" style={{ backgroundColor: iconBg, color: iconColor }}>
          {icon}
        </div>
      )}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
