import { useState } from 'react';
import Modal from './Modal.jsx';
import { fmtInrSeller } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import { sellerApi } from '../api/sellerApi.js';

export default function CounterOfferModal({ negotiation, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!negotiation) return null;

  const location = [negotiation.propertyCity, negotiation.propertyState].filter(Boolean).join(', ') || 'Location pending';

  async function handleSubmit(e) {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) {
      showToast('Please enter a valid counter offer amount.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await sellerApi.counterNegotiation(negotiation.id, num);
      showToast(`Counter offer of ${fmtInrSeller(num)} submitted successfully!`);
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to submit counter offer', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Make Counter Offer" onClose={onClose} maxWidth="480px">
      <div
        style={{
          background: '#121212',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
          {negotiation.propertyTitle || 'Property'}
        </h3>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
          📍 {location}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Buyer's Offer
            </div>
            <div style={{ fontWeight: 700, color: '#1DB954', fontSize: '1.15rem' }}>
              {fmtInrSeller(negotiation.offerAmount)}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            How much will you offer?
          </label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 4350000"
            required
            autoFocus
            style={{
              width: '100%',
              background: '#121212',
              border: '2px solid #1DB954',
              borderRadius: '0.5rem',
              padding: '0.875rem 1rem',
              color: '#fff',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', marginBottom: '0.75rem' }}
        >
          {submitting ? 'Submitting…' : 'Submit Counter Offer'}
        </button>
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8125rem' }}>
          The buyer will be notified of your counter offer
        </p>
      </form>
    </Modal>
  );
}
