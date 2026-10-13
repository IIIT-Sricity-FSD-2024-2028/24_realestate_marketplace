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

  const payButtonText = loading
    ? 'Processing…'
    : `Pay ${formatINR(order.amount)}`;

  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div
        className="modal-box checkout-modal-box"
        style={{ maxWidth: '420px', padding: 0, overflow: 'hidden' }}
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
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '0.5rem',
                background: '#1DB954',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#000',
                fontSize: '1.1rem',
              }}
            >
              t
            </div>

            <div>
              <div
                style={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  lineHeight: 1.2,
                }}
              >
                truEstate
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                Secure checkout
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
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              lineHeight: 1.4,
            }}
          >
            {order.description}
          </div>

          <div
            style={{
              background: '#0d0d0d',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.6rem',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.825rem',
                color: '#9ca3af',
                marginBottom: '0.5rem',
              }}
            >
              <span>Amount</span>
              <span style={{ color: '#d1d5db' }}>
                {formatINR(order.baseAmount)}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.825rem',
                color: '#9ca3af',
                marginBottom: '0.65rem',
              }}
            >
              <span>GST (18%)</span>
              <span style={{ color: '#d1d5db' }}>
                {formatINR(order.taxAmount)}
              </span>
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.08)',
                paddingTop: '0.65rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span
                style={{
                  color: '#fff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                Total payable
              </span>

              <span
                style={{
                  color: '#1DB954',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                }}
              >
                {formatINR(order.amount)}
              </span>
            </div>
          </div>

          {error && (
            <div
              style={{
                color: '#ef4444',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                padding: '0.5rem',
                background: 'rgba(239,68,68,0.1)',
                borderRadius: '0.375rem',
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              color: '#6b7280',
              fontSize: '0.7rem',
              lineHeight: 1.6,
              marginBottom: '1.25rem',
            }}
          >
            Receipt <span style={{ color: '#9ca3af' }}>{order.receipt}</span>
            <br />
            Order <span style={{ color: '#9ca3af' }}>{order.orderId}</span>
            <br />
            This is the built-in offline gateway that verifies orders with server HMAC signatures.
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
              padding: '0.85rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background 0.2s',
            }}
          >
            {payButtonText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              padding: '0.7rem',
              marginTop: '0.35rem',
              cursor: loading ? 'default' : 'pointer',
              fontSize: '0.825rem',
            }}
          >
            Cancel payment
          </button>
        </div>
      </div>
    </div>
  );
}