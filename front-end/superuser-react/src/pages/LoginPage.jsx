import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/superuserApi.js';
import { setUser } from '../api/session.js';
import { errorText } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(trimmedEmail, password);
      const account = result.data.user;

      if (account.role !== 'superuser') {
        throw new Error('This account does not have superuser privileges');
      }

      setUser({
        id: account.id,
        name: account.name,
        email: account.email,
        role: 'superuser',
        token: result.data.accessToken,
      });

      try {
        const users = JSON.parse(localStorage.getItem('globalUsers')) || [];
        const existing = users.find((u) => u.email === account.email);
        if (existing) {
          existing.name = account.name;
          existing.status = 'Active';
        } else {
          users.push({
            id: account.id,
            name: account.name,
            email: account.email,
            role: 'Superuser',
            status: 'Active',
          });
        }
        localStorage.setItem('globalUsers', JSON.stringify(users));
      } catch {
        /* storage safe */
      }

      showToast('Login successful! Redirecting…');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (err) {
      const msg = errorText(err, 'Invalid superuser credentials');
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-card">
        <div className="login-brand">
          <div className="login-badge-icon">
            <svg
              style={{ width: '1.5rem', height: '1.5rem', color: '#000' }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="login-title">truEstate Superuser</h1>
            <p className="login-subtitle">System administration login</p>
          </div>
        </div>

        {error && <div className="form-alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="superuser-email"
              type="email"
              autoComplete="username"
              placeholder="superuser@gmail.com"
              className={'form-control' + (error ? ' form-control--invalid' : '')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="superuser-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              className={'form-control' + (error ? ' form-control--invalid' : '')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
            style={{ marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </main>
    </div>
  );
}
