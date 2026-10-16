/**
 * ForgotPasswordModal.jsx
 * Purpose: "Forgot password?" dialog (old TruEstate.openForgotPasswordModal).
 *          Collects only the email; the server emails a NEW password and the
 *          old one stops working. Nothing secret is ever shown on screen.
 * Inputs (props): open, onClose, userType – 'buyer' | 'seller' | undefined
 *                 (picks the right account when one email owns both).
 * Outputs: the modal UI; a toast on success/failure.
 * API calls: POST /auth/forgot-password { email, userType? }
 */
import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import { FormField, TextInput } from '../forms/FormControls.jsx';
import { authApi } from '../../api/services.js';
import { useToast } from '../feedback/ToastProvider.jsx';
import { isEmail } from '../../utils/validation.js';

export default function ForgotPasswordModal({ open, onClose, userType }) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false); // disables the button while waiting
  const [sent, setSent] = useState(false); // switches to the "check your email" step
  const [error, setError] = useState('');

  // Start fresh every time the dialog opens.
  useEffect(() => {
    if (open) {
      setEmail('');
      setSent(false);
      setError('');
    }
  }, [open]);

  const submit = async (event) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) return setError('Please enter your email');
    if (!isEmail(value)) return setError('Please enter a valid email address');
    setError('');
    setSending(true);
    try {
      const body = { email: value };
      if (userType) body.userType = userType; // buyer vs seller account
      await authApi.forgotPassword(body);
      setSent(true);
      showToast('If that account exists, a new password has been emailed to it');
    } catch (err) {
      showToast(err.message || 'Failed to request password reset', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={sent ? 'Check your email' : 'Reset your password'} size="sm">
      {sent ? (
        <p className="text-secondary">
          If an account exists for that email, we&apos;ve emailed a new password to it. Check your inbox (and spam folder), log in with that password, then
          change it from your profile.
        </p>
      ) : (
        <form onSubmit={submit} noValidate>
          <p className="text-secondary small mb-3">
            Enter your account email and we&apos;ll email you a new password. Your current password will stop working.
          </p>
          <FormField id="forgot-email" label="Email" error={error}>
            <TextInput
              id="forgot-email"
              type="email"
              restrict="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onValueChange={setEmail}
              error={error}
            />
          </FormField>
          <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
            {sending ? 'Sending…' : 'Email me a new password'}
          </button>
        </form>
      )}
      <button type="button" className="btn btn-link btn-block" onClick={onClose}>
        {sent ? 'Close' : 'Cancel'}
      </button>
    </Modal>
  );
}
