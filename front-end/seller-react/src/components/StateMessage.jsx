export function LoadingState({ message = 'Loading…' }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#9ca3af' }}>
      <div className="spinner" style={{ margin: '0 auto 1rem' }} />
      <p>{message}</p>
    </div>
  );
}

export function EmptyState({ message, action, icon = '🏠' }) {
  return (
    <div className="card empty-card" style={{ textAlign: 'center', color: '#9ca3af', padding: '3rem 1.5rem', lineHeight: 1.6 }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.7 }}>{icon}</div>
      <div style={{ fontSize: '0.95rem', marginBottom: action ? '1.5rem' : 0 }}>{message}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="card error-card" style={{ textAlign: 'center', color: '#ef4444', padding: '2.5rem 1.5rem' }}>
      <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Failed to load data</p>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        {typeof error === 'string' ? error : error?.message || 'Network or server error'}
      </p>
      {onRetry && (
        <button className="btn-outline" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
