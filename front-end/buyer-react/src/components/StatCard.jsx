export default function StatCard({ value, label, note, color = '#1DB954', icon }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ color }}>{value}</div>
          {note && <div className="stat-note" style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>{note}</div>}
        </div>
        {icon && (
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
