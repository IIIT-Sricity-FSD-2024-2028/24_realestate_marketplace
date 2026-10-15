import { tsUserGet, tsUserSet } from '../api/session.js';
import { useEffect } from 'react';

export default function ManagerNotifiedModal({ property, onClose }) {
  useEffect(() => {
    if (!property) return;
    // Log buyer contact request for admin/manager oversight
    try {
      const reqs = tsUserGet('buyerRequests', []);
      if (!reqs.find((x) => String(x.propId) === String(property.id))) {
        const currentUser = tsUserGet('buyerProfile', {
          fname: 'Guest',
          lname: 'User',
          phone: '+91 98765 43210',
          email: 'buyer@truestate.com',
        });
        reqs.push({
          id: Date.now().toString(),
          propId: String(property.id),
          property: property.title,
          location: property.area,
          buyerName: `${currentUser.fname || ''} ${currentUser.lname || ''}`.trim() || 'Buyer',
          phone: currentUser.phone || '+91 98765 43210',
          email: currentUser.email || 'buyer@truestate.com',
          budget: property.priceFmt,
          status: 'new',
          note: 'Requested contact directly from Buyer Portal.',
        });
        tsUserSet('buyerRequests', reqs);
      }
    } catch (_) {}
  }, [property]);

  if (!property) return null;

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
            fontSize: '1.85rem',
            margin: '0 auto 1.25rem',
          }}
        >
          💬
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
          Property Manager Alerted!
        </h2>

        <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          The assigned truEstate property manager has received your interest in{' '}
          <strong style={{ color: '#fff' }}>"{property.title}"</strong>. They will reach out to you directly
          via call or email with complete property verification documents and inspection times.
        </p>

        <button
          onClick={onClose}
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
          Got it
        </button>
      </div>
    </div>
  );
}
