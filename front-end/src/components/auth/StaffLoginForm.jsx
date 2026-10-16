/**
 * StaffLoginForm.jsx
 * Purpose: The login card shared by the Admin and Superuser portals
 *          (admin-login.html and superuser-login.html were near-identical).
 * Inputs (props): role – 'admin' | 'superuser' (account must have this role)
 *                 title, subtitle, icon, emailPlaceholder – wording/branding
 * Outputs: on success stores the session and opens that role's dashboard.
 * API calls: POST /auth/login { email, password }
 *            POST /auth/forgot-password (through ForgotPasswordModal)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import { FormField, PasswordInput, TextInput } from '../forms/FormControls.jsx';
import ForgotPasswordModal from './ForgotPasswordModal.jsx';
import { useToast } from '../feedback/ToastProvider.jsx';
import { authApi } from '../../api/services.js';
import { DASHBOARD_BY_ROLE, setUser } from '../../auth/session.js';
import { isEmail } from '../../utils/validation.js';

export default function StaffLoginForm({ role, title, subtitle, icon, emailPlaceholder }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invalid, setInvalid] = useState(false); // red borders after a failed login
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      showToast('Please enter both email and password', 'error');
      setInvalid(true);
      return;
    }
    if (!isEmail(cleanEmail)) {
      showToast('Please enter a valid email address', 'error');
      setInvalid(true);
      return;
    }
    setSubmitting(true);
    try {
      const result = await authApi.login({ email: cleanEmail, password });
      const account = result.data.user;
      // A valid account with the wrong role must not get into this portal.
      if (account.role !== role) {
        showToast('This account does not have ' + role + ' access', 'error');
        setSubmitting(false);
        return;
      }
      // city is kept so the admin desk can scope "Manage Listings" to its city.
      setUser({ id: account.id, name: account.name, email: account.email, role, city: account.city || null, token: result.data.accessToken });
      showToast('Login successful! Redirecting...');
      window.setTimeout(() => navigate(DASHBOARD_BY_ROLE[role]), 600);
    } catch (err) {
      showToast(err.message || 'Invalid ' + role + ' credentials', 'error');
      setInvalid(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="staff-login-page">
      <main className="staff-login-card">
        <div className="brand">
          <span className="logo-icon">
            <Icon name={icon} size="1.5rem" />
          </span>
          <span>
            <span className="brand-name">{title}</span>
            <span className="brand-tagline">{subtitle}</span>
          </span>
        </div>

        <form onSubmit={submit} noValidate>
          <FormField id={role + '-email'} label="Email">
            <TextInput
              id={role + '-email'}
              type="email"
              restrict="email"
              autoComplete="username"
              placeholder={emailPlaceholder}
              value={email}
              error={invalid}
              onValueChange={(v) => {
                setEmail(v);
                setInvalid(false);
              }}
            />
          </FormField>
          <FormField id={role + '-password'} label="Password">
            <PasswordInput
              id={role + '-password'}
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              error={invalid}
              onValueChange={(v) => {
                setPassword(v);
                setInvalid(false);
              }}
            />
          </FormField>
          <div className="align-right">
            <button type="button" className="btn btn-link" onClick={() => setForgotOpen(true)}>
              Forgot password?
            </button>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </main>
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}
