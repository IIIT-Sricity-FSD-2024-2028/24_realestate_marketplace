import { useState } from 'react';
import { formatINR } from '../utils/format.js';
import { api } from '../api/client.js';

export default function CheckoutModal({ order, onResolve, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!order) return null;

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const res = await api(`/billing/demo-checkout/${encodeURIComponent(order.orderId)}`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      onResolve(res.data);
    } catch (err) {
      setError(err.message || 'Payment failed');
      setLoading(false);
    }
  }

  const payButtonText = loading ? 'Processing…' : `Pay ${formatINR(order.amount)}`;

  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
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
        className="modal-box checkout-modal-box"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        }}
      >
        <div
          style={{
            background: '#f59e0b',
            color: '#111',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textAlign: 'center',
            padding: '0.45rem',
          }}
        >
          TEST MODE · NO REAL MONEY MOVES
        </div>

        <div style={{ padding: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.5rem',
                background: '#1DB954',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#000',
                fontSize: '1.2rem',
              }}
            >
              ₹
            </div>

            <div>
              <div
                style={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  lineHeight: 1.2,
                }}
              >
                truEstate
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                Secure Payment Checkout
              </div>
            </div>
          </div>

          <div
            style={{
              color: '#9ca3af',
              fontSize: '0.8rem',
              marginBottom: '0.35rem',
            }}
          >
            You are paying for
          </div>

          <div
            style={{
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              lineHeight: 1.4,
            }}
          >
            {order.description || 'Platform Commission Invoice'}
          </div>

          <div
            style={{
              background: '#121212',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '0.6rem',
              padding: '0.9rem 1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: '#9ca3af',
                marginBottom: '0.45rem',
              }}
            >
              <span>Base amount</span>
              <span style={{ color: '#d1d5db' }}>{formatINR(order.baseAmount)}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: '#9ca3af',
                marginBottom: '0.65rem',
              }}
            >
              <span>GST (18%)</span>
              <span style={{ color: '#d1d5db' }}>{formatINR(order.taxAmount)}</span>
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '0.65rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                Total payable
              </span>
              <span style={{ color: '#1DB954', fontSize: '1.35rem', fontWeight: 800 }}>
                {formatINR(order.amount)}
              </span>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              color: '#6b7280',
              fontSize: '0.68rem',
              lineHeight: 1.6,
              marginBottom: '1.25rem',
            }}
          >
            Order ID: <span style={{ color: '#9ca3af' }}>{order.orderId}</span>
            <br />
            Receipt: <span style={{ color: '#9ca3af' }}>{order.receipt}</span>
            <br />
            Signed securely by truEstate Payment Gateway.
          </div>

          <button
            onClick={handlePay}
            disabled={loading}
            style={{
              width: '100%',
              background: '#1DB954',
              color: '#000',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.875rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background 0.2s',
            }}
          >
            {payButtonText}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              padding: '0.7rem',
              marginTop: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Cancel payment
          </button>
        </div>
      </div>
    </div>
  );
}
