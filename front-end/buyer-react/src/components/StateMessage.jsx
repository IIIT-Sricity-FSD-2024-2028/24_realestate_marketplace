export default function StateMessage({
  type = 'empty', // 'empty' | 'loading' | 'error'
  icon = '🔍',
  title = 'No items found',
  message = 'Nothing to display right now.',
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        color: '#9ca3af',
        backgroundColor: '#161616',
        borderRadius: '0.75rem',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        margin: '1rem 0',
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
      <h3 style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            backgroundColor: '#1DB954',
            color: '#000',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.625rem 1.5rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
