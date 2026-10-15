import { forceSignOut } from '../api/client.js';

export default function SessionChangedOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            margin: '0 auto 1.25rem',
          }}
        >
          🔒
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
          Session Expired or Changed
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Your signed-in account changed or was signed out in another tab. Please log in again to continue.
        </p>
        <button
          onClick={() => forceSignOut('Session changed')}
          style={{
            width: '100%',
            backgroundColor: '#1DB954',
            color: '#000',
            fontWeight: 700,
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.75rem 1.25rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Return to Sign In
        </button>
      </div>
    </div>
  );
}
