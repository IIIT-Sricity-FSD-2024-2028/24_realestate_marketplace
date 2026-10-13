import { getUser } from '../api/session.js';

export default function SessionChangedOverlay() {
  const user = getUser();
  const who = user && user.name ? `${user.name} (${user.role})` : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          maxWidth: '26rem',
          width: '100%',
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.75rem' }}>
          This session changed
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
          {who ? (
            <>
              This tab is now signed in as <strong style={{ color: '#fff' }}>{who}</strong>,
              but it is still showing the seller dashboard, so actions would run as the wrong account.
            </>
          ) : (
            'You are no longer signed in on this tab.'
          )}
        </p>
        <button
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => window.location.reload()}
        >
          Reload this page
        </button>
      </div>
    </div>
  );
}
