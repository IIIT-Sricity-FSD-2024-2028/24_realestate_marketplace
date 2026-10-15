import { useState } from 'react';
import { buyerApi } from '../api/buyerApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { useBuyerProfile } from '../context/BuyerProfileContext.jsx';

export default function MakeOfferModal({ property, onClose, onSuccess }) {
  const { showToast } = useToast();
  const { addToConsideration } = useBuyerProfile();

  const [offerAmount, setOfferAmount] = useState('');
  const [payMode, setPayMode] = useState('Cash');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!property) return null;

  const listedPrice = Number(property.price) || 0;
  const numOffer = parseFloat(offerAmount);

  // Live diff calculation
  let diffBadge = null;
  if (!isNaN(numOffer) && numOffer > 0 && listedPrice > 0) {
    const diff = numOffer - listedPrice;
    const pct = Math.abs((diff / listedPrice) * 100).toFixed(1);
    if (diff < 0) {
      diffBadge = (
        <span style={{ color: '#1DB954', fontWeight: 600, fontSize: '0.8rem' }}>
          ↓ ₹{Math.abs(diff).toLocaleString('en-IN')} below listed price ({pct}% off)
        </span>
      );
    } else if (diff > 0) {
      diffBadge = (
        <span style={{ color: '#f97316', fontWeight: 600, fontSize: '0.8rem' }}>
          ↑ ₹{diff.toLocaleString('en-IN')} above listed price ({pct}% premium)
        </span>
      );
    } else {
      diffBadge = (
        <span style={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.8rem' }}>
          = Matches listed price exactly
        </span>
      );
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!numOffer || numOffer <= 0) {
      showToast('⚠️ Please enter a valid offer amount', 'error');
      return;
    }
    if (!property.realId) {
      showToast('⚠️ This property listing is not linked to a live backend record yet.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await buyerApi.createOffer(property.realId, numOffer, message, payMode);
      addToConsideration(property.id);
      showToast('Offer submitted successfully!');
      onClose();
      if (onSuccess) onSuccess({ property, amount: numOffer });
    } catch (err) {
      const detail = err.errors && err.errors.length ? ': ' + err.errors[0] : '';
      showToast('⚠️ ' + (err.message || 'Failed to submit offer') + detail, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(6px)',
        zIndex: 4000,
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
          maxWidth: '520px',
          width: '100%',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        }}
      >
        <button
          onClick={onClose}
          disabled={submitting}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '1.25rem',
          }}
          aria-label="Close"
        >
          ✕
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              background: 'rgba(29, 185, 84, 0.15)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #1DB954',
              color: '#1DB954',
              fontSize: '1.35rem',
            }}
          >
            🏠
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#fff' }}>Make an Offer</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.8125rem', margin: '0.2rem 0 0' }}>
              {property.title} · {property.area}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Listed Price reference */}
          <div
            style={{
              background: '#121212',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Listed Price</span>
            <span style={{ color: '#1DB954', fontWeight: 700, fontSize: '1.1rem' }}>
              {property.priceFmt}
            </span>
          </div>

          {/* Offer Amount Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.45rem',
                fontWeight: 600,
              }}
            >
              Your Offer Amount (₹) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 4200000"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              required
              min="1000"
              style={{
                width: '100%',
                background: '#282828',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                fontWeight: 700,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {diffBadge && <div style={{ marginTop: '0.4rem' }}>{diffBadge}</div>}
          </div>

          {/* Payment Mode */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                fontWeight: 600,
              }}
            >
              Preferred Payment Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {['Cash', 'Home Loan', 'Bank Transfer'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPayMode(mode)}
                  style={{
                    padding: '0.625rem',
                    borderRadius: '0.5rem',
                    border: '1px solid',
                    borderColor: payMode === mode ? '#1DB954' : 'rgba(255, 255, 255, 0.1)',
                    background: payMode === mode ? 'rgba(29, 185, 84, 0.15)' : '#282828',
                    color: payMode === mode ? '#1DB954' : '#fff',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Message */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.45rem',
                fontWeight: 600,
              }}
            >
              Message to Seller (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Pre-approved for bank loan, ready to close within 3 weeks..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                background: '#282828',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              background: '#1DB954',
              color: '#000',
              border: 'none',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Submitting Offer…' : 'Submit Offer to Seller'}
          </button>
        </form>
      </div>
    </div>
  );
}
