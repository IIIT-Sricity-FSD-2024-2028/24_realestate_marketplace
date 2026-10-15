import { useNavigate } from 'react-router-dom';
import { formatOfferAmount } from '../utils/format.js';

export default function OfferSuccessModal({ property, amount, onClose }) {
  const navigate = useNavigate();

  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="modal-box"
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '2rem',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        }}
      >
        <div
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(29, 185, 84, 0.15)',
            border: '2px solid #1DB954',
            color: '#1DB954',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 1.25rem',
          }}
        >
          ✓
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
          Offer Sent to Seller!
        </h2>

        <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Your offer of{' '}
          <strong style={{ color: '#1DB954' }}>{formatOfferAmount(amount)}</strong> for{' '}
          <strong style={{ color: '#fff' }}>{property?.title || 'this property'}</strong> has been submitted.
          The seller can accept, counter, or decline.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => {
              onClose();
              const target = window.location.pathname.startsWith('/buyer') ? '/buyer/negotiate' : '/negotiate';
              navigate(target);
            }}
            style={{
              backgroundColor: '#1DB954',
              color: '#000',
              fontWeight: 700,
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.8rem 1.25rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Go to Negotiations
          </button>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: '#9ca3af',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              padding: '0.65rem 1.25rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
