import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icons.jsx';
import ForgotPasswordModal from '../components/ForgotPasswordModal.jsx';
import { login } from '../api/adminApi.js';
import { setUser } from '../api/session.js';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Admin login (was admin-login.html).
 * 1. POST /auth/login with the email + password.
 * 2. Reject any account whose role is not "admin" (RBAC on the client side;
 *    the backend also checks the role on every admin endpoint).
 * 3. Store the session (same shape/key as before) and open the dashboard.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(cleanEmail, password);
      const account = result.data.user;

      if (account.role !== 'admin') {
        showToast('This account does not have admin access', 'error');
        return;
      }

      setUser({
        id: account.id,
        name: account.name,
        email: account.email,
        role: 'admin',
        token: result.data.accessToken,
      });

      // Kept from the old page: a local "globalUsers" roster other pages read.
      try {
        const users = JSON.parse(localStorage.getItem('globalUsers')) || [];
        const existing = users.find((u) => u.email === account.email);
        if (existing) {
          existing.name = account.name;
          existing.status = 'Active';
        } else {
          users.push({ id: account.id, name: account.name, email: account.email, role: 'Admin', status: 'Active' });
        }
        localStorage.setItem('globalUsers', JSON.stringify(users));
      } catch { /* storage unavailable */ }

      showToast('Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard', { replace: true }), 600);
    } catch (err) {
      showToast(err.message || 'Invalid admin credentials', 'error');
      setInvalid(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-card">
        <div className="login-card__brand">
          <div className="brand-mark brand-mark--lg"><Icon name="home" size="1.5rem" color="#000" /></div>
          <div>
            <h1 className="login-card__title">truEstate Admin</h1>
            <p className="login-card__subtitle">Admin workspace login</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="field-label field-label--lg" htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              className={'input input--lg' + (invalid ? ' input--invalid' : '')}
              type="email"
              autoComplete="username"
              placeholder="adminhyd@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label field-label--lg" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              className={'input input--lg' + (invalid ? ' input--invalid' : '')}
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="button" className="forgot-link" onClick={() => setForgotOpen(true)}>Forgot password?</button>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </main>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}
