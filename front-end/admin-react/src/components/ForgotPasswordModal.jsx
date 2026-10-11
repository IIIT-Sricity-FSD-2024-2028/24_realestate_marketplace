import { useState } from 'react';
import Modal from './Modal.jsx';
import { forgotPassword } from '../api/adminApi.js';
import { useToast } from '../context/ToastContext.jsx';

/**
 * "Forgot password?" dialog (port of TruEstate.openForgotPasswordModal).
 * Calls POST /auth/forgot-password; the backend emails a new password to the
 * account. The response never says whether the email exists.
 */
export default function ForgotPasswordModal({ open, onClose }) {
  const showToast = useToast();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const close = () => { setEmail(''); setSent(false); onClose(); };

  const submit = async () => {
    const value = email.trim();
    if (!value) { showToast('Please enter your email', 'error'); return; }
    setSending(true);
    try {
      await forgotPassword(value);
      setSent(true);
      showToast('If that account exists, a new password has been emailed to it');
    } catch (err) {
      showToast(err.message || 'Failed to request password reset', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Reset your password">
      <p className="muted-text" style={{ marginBottom: '1.5rem' }}>
        {sent ? 'Check your email' : "Enter your account email and we'll email you a new password. Your current password will stop working."}
      </p>
      {sent ? (
        <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
          If an account exists for that email, we&apos;ve emailed a new password to it. Check your inbox (and spam folder), log in with that password, then change it from Settings.
        </p>
      ) : (
        <>
          <label className="field-label field-label--lg">Email</label>
          <input
            className="input input--lg"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          <button type="button" className="btn btn-primary btn-block" disabled={sending} onClick={submit}>
            {sending ? 'Sending…' : 'Email me a new password'}
          </button>
        </>
      )}
      <button type="button" className="btn-link-muted" onClick={close}>{sent ? 'Close' : 'Cancel'}</button>
    </Modal>
  );
}
