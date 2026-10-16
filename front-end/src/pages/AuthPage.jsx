/**
 * AuthPage.jsx  (was: index.html — #auth-page)
 * Purpose: Buyer / Seller login and sign-up form.
 * Inputs:  none.
 * Outputs: on success stores the session and opens the right dashboard.
 * API calls:
 *   POST /auth/login    { email, password, userType }
 *   POST /auth/register { name, email, password, userType }
 *   POST /auth/forgot-password (through ForgotPasswordModal)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon.jsx';
import { FormField, PasswordInput, PasswordMatchHint, TextInput } from '../components/forms/FormControls.jsx';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal.jsx';
import { useToast } from '../components/feedback/ToastProvider.jsx';
import { authApi } from '../api/services.js';
import { DASHBOARD_BY_ROLE, setUser } from '../auth/session.js';
import { validateAuthForm } from '../utils/validation.js';

// The two account types a member of the public can sign in as.
const ROLES = [
  { key: 'buyer', label: 'Buyer', icon: 'user' },
  { key: 'seller', label: 'Seller', icon: 'home' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('buyer'); // selected account type
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [remember, setRemember] = useState(true); // seed new tabs with this login
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState(''); // inline message under the form
  const [forgotOpen, setForgotOpen] = useState(false);
  const isSignup = tab === 'signup';

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setProblem(''); // clear the error as soon as the user edits
  };

  const submit = async (event) => {
    event.preventDefault();
    // 1) Friendly client-side checks (same messages as form-validation.js).
    const message = validateAuthForm({ isSignup, ...form });
    if (message) {
      setProblem(message);
      showToast(message, 'error');
      return;
    }
    setSubmitting(true);
    try {
      // 2) Real backend auth — returns { accessToken, user }.
      const email = form.email.trim();
      const result = isSignup
        ? await authApi.register({ name: form.name.trim(), email, password: form.password, userType: role })
        : await authApi.login({ email, password: form.password, userType: role });
      const account = result.data.user;
      // Staff accounts keep their role; buyer/seller dashboards follow the account's own userType.
      const uiRole = account.role === 'admin' || account.role === 'superuser' ? account.role : account.userType || role;
      setUser(
        { id: account.id, name: account.name, email: account.email, role: uiRole, city: account.city || null, token: result.data.accessToken },
        { remember },
      );
      showToast((isSignup ? 'Account created' : 'Login successful') + '! Redirecting...');
      // Short pause so the toast is readable, as before.
      window.setTimeout(() => navigate(DASHBOARD_BY_ROLE[uiRole] || '/'), 800);
    } catch (err) {
      const detail = err.errors && err.errors.length ? ': ' + err.errors[0] : '';
      // The server is deliberately vague on bad logins; hint at the chosen tab.
      const text = !isSignup && err.status === 401 ? 'No ' + role + ' account found for that email, or the password is wrong.' : err.message + detail;
      setProblem('⚠️ ' + text);
      showToast('⚠️ ' + text, 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <button type="button" className="btn btn-secondary auth-back" onClick={() => navigate('/')}>
        <Icon name="arrowLeft" className="text-brand" /> Back
      </button>

      {/* Left: brand panel */}
      <section className="auth-aside" aria-hidden="false">
        <div className="brand brand-lg">
          <span className="logo-icon">
            <Icon name="home" size="2rem" />
          </span>
          <span>
            <span className="brand-name">truEstate</span>
            <span className="brand-tagline">Premium Real Estate Platform</span>
          </span>
        </div>
        <h1 className="auth-headline">
          Find Your Dream Property <span className="text-brand">With Confidence</span>
        </h1>
        <ul className="auth-points">
          <li>✓ Every listing is verified by a city admin before buyers see it</li>
          <li>✓ Offers, site visits and deal tracking in one place</li>
          <li>✓ Secure payments with GST receipts</li>
        </ul>
      </section>

      {/* Right: the form */}
      <section className="auth-main">
        <div className="auth-card">
          <h2 className="auth-title">Welcome to truEstate</h2>
          <p className="text-secondary center">Your journey to finding the perfect property starts here</p>

          <div className="segmented" role="tablist" aria-label="Login or sign up">
            {['login', 'signup'].map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={tab === key ? 'active' : ''}
                onClick={() => {
                  setTab(key);
                  setProblem('');
                }}
              >
                {key === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} noValidate className="auth-form">
            <h3 className="auth-form-heading">{isSignup ? 'Create a Buyer or Seller account' : 'Login with your email address'}</h3>

            {isSignup && (
              <FormField id="signup-name" label="Full Name">
                <TextInput
                  id="signup-name"
                  restrict="alpha"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onValueChange={set('name')}
                />
              </FormField>
            )}
            <FormField id="auth-email" label="Email">
              <TextInput
                id="auth-email"
                type="email"
                restrict="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={form.email}
                onValueChange={set('email')}
              />
            </FormField>
            <FormField
              id="auth-password"
              label="Password"
              hint={isSignup ? '8–32 characters with upper & lower case, a number and a special character (@$!%*?&).' : undefined}
            >
              <PasswordInput
                id="auth-password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                placeholder="Enter your password"
                value={form.password}
                onValueChange={set('password')}
              />
            </FormField>
            {isSignup && (
              <FormField id="auth-confirm" label="Confirm Password">
                <PasswordInput
                  id="auth-confirm"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onValueChange={set('confirmPassword')}
                />
                <PasswordMatchHint password={form.password} confirm={form.confirmPassword} />
              </FormField>
            )}

            <fieldset className="role-picker">
              <legend className="form-label">{isSignup ? 'Sign up as' : 'Login as'}</legend>
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className={'role-btn' + (role === r.key ? ' active' : '')}
                  aria-pressed={role === r.key}
                  onClick={() => setRole(r.key)}
                >
                  <Icon name={r.icon} />
                  <span>{r.label}</span>
                </button>
              ))}
            </fieldset>

            <div className="auth-row">
              <label className="checkbox">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>Remember me</span>
              </label>
              {!isSignup && (
                <button type="button" className="btn btn-link" onClick={() => setForgotOpen(true)}>
                  Forgot password?
                </button>
              )}
            </div>

            {problem && (
              <p className="form-problem" role="alert">
                {problem}
              </p>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? (isSignup ? 'Creating account...' : 'Logging in...') : isSignup ? 'Create Account' : 'Login'}
            </button>
          </form>
        </div>
      </section>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} userType={role} />
    </div>
  );
}
