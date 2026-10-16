/**
 * OfferFormModal.jsx
 * Purpose: "Make an Offer" dialog — amount (with a live comparison against
 *          the listed price), payment mode and an optional message.
 * Inputs (props): card – listing (null = closed); onClose;
 *                 onSubmitted(card, amount) – called after the API accepts it
 * Outputs: the form; inline validation; toast on API errors.
 * API calls: POST /negotiations { propertyId, offerAmount, paymentMode, message? }
 */
import { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import { FormField, TextInput } from '../../../components/forms/FormControls.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { negotiationsApi } from '../../../api/services.js';
import { errorText } from '../../../api/client.js';
import { isPositiveNumber, toNumber } from '../../../utils/validation.js';

const PAY_MODES = ['Cash', 'Loan', 'Mixed'];

/** "↓ ₹5,00,000 below listed price (10% off)" style helper (exported for tests). */
export function offerDifference(amount, listed) {
  if (!amount || !listed) return null;
  const diff = amount - listed;
  if (diff < 0)
    return {
      tone: 'text-brand',
      text: '↓ ₹' + Math.abs(diff).toLocaleString('en-IN') + ' below listed price (' + Math.abs((diff / listed) * 100).toFixed(1) + '% off)',
    };
  if (diff > 0) return { tone: 'text-orange', text: '↑ ₹' + diff.toLocaleString('en-IN') + ' above listed price' };
  return { tone: 'text-secondary', text: '= Matches listed price' };
}

export default function OfferFormModal({ card, onClose, onSubmitted }) {
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('Cash');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  // Fresh form every time it opens.
  useEffect(() => {
    if (card) {
      setAmount('');
      setMode('Cash');
      setMessage('');
      setError('');
    }
  }, [card]);

  const submit = async (event) => {
    event.preventDefault();
    // Old tvValidateBuyerOffer: required + positive number.
    if (!amount.trim()) return setError('Please enter your offer amount');
    if (!isPositiveNumber(amount)) return setError('Please enter a valid offer amount');
    const value = toNumber(amount);
    setSending(true);
    try {
      await negotiationsApi.create({ propertyId: card.id, offerAmount: value, paymentMode: mode, message: message.trim() || undefined });
      onSubmitted(card, value);
    } catch (err) {
      showToast('⚠️ ' + errorText(err, 'Failed to submit offer'), 'error');
    } finally {
      setSending(false);
    }
  };

  const diff = card ? offerDifference(toNumber(amount), card.price) : null;
  return (
    <Modal open={!!card} onClose={onClose} title="Make an Offer">
      {card && (
        <form onSubmit={submit} noValidate>
          <p className="text-secondary small mb-3">
            {card.title} · {card.area}
          </p>
          <div className="price-strip">
            <span className="text-secondary">Listed Price</span>
            <strong>{card.priceFmt}</strong>
          </div>
          <FormField id="offer-amount" label="Your Offer Amount (₹)" error={error}>
            <TextInput
              id="offer-amount"
              restrict="number"
              inputMode="numeric"
              placeholder="Enter your offer amount"
              value={amount}
              error={error}
              onValueChange={(v) => {
                setAmount(v);
                setError('');
              }}
            />
            {diff && (
              <div className={'small mt-1 ' + diff.tone} aria-live="polite">
                {diff.text}
              </div>
            )}
          </FormField>
          <fieldset className="segmented segmented-3 mb-3">
            <legend className="form-label">Payment Mode</legend>
            {PAY_MODES.map((m) => (
              <button key={m} type="button" className={mode === m ? 'active' : ''} aria-pressed={mode === m} onClick={() => setMode(m)}>
                {m}
              </button>
            ))}
          </fieldset>
          <FormField id="offer-message" label="Message to the seller (optional)">
            <textarea
              id="offer-message"
              className="form-control"
              rows={3}
              maxLength={500}
              placeholder="Anything the seller should know about your offer…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </FormField>
          <div className="button-row">
            <button type="button" className="btn btn-secondary grow" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary grow-2" disabled={sending}>
              {sending ? 'Submitting…' : 'Submit Offer →'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
