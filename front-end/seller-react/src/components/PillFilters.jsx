export default function PillFilters({ filters, active, onChange }) {
  return (
    <div className="pill-filters" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      {filters.map((f) => {
        const isActive = active === f.id;
        return (
          <button
            key={f.id}
            type="button"
            className={`pill ${isActive ? 'pill-active' : 'pill-inactive'}`}
            onClick={() => onChange(f.id)}
          >
            <span>{f.label}</span>
            {f.count !== undefined && (
              <span className="count">{f.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
