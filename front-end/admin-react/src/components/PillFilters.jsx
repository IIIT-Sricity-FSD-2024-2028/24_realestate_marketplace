/**
 * Row of pill-shaped filter buttons (All / Pending / Verified …).
 * options: [{ value, label, count?, countBg? }] — `count` renders a small bubble.
 */
export default function PillFilters({ options, value, onChange }) {
  return (
    <div className="pill-row">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={'pill-btn' + (value === opt.value ? ' active' : '')}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span className="pill-count" style={{ background: opt.countBg || 'rgba(255,255,255,0.2)' }}>{opt.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
