import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../api/buyerApi.js';
import { setUser } from '../api/session.js';
import { useToast } from '../context/ToastContext.jsx';
import { LogoIcon } from '../components/Icons.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!password) throw new Error('Please enter a password');
        if (password.length < 8) throw new Error('Password must be at least 8 characters long');
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
          throw new Error('Password must include uppercase, lowercase, digit, and special character (@$!%*?&)');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const res = await buyerApi.register(name.trim(), email.trim(), password);
        const token = res.data?.accessToken || res.data?.token;
        const userObj = {
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: 'buyer',
          userType: 'buyer',
          token: token,
          accessToken: token,
        };
        setUser(userObj);
        showToast('🎉 Account created successfully! Welcome to truEstate.');
      } else {
        const res = await buyerApi.login(email.trim(), password);
        const token = res.data?.accessToken || res.data?.token;
        const userObj = {
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: 'buyer',
          userType: 'buyer',
          token: token,
          accessToken: token,
        };
        setUser(userObj);
        showToast('Login successful!');
      }
      const target = window.location.pathname.startsWith('/buyer') ? '/buyer/explore' : '/explore';
      navigate(target);
    } catch (err) {
      const detail = err.errors && err.errors.length ? ': ' + err.errors[0] : '';
      const msg = err.message + detail;
      setError(msg);
      showToast('⚠️ ' + msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await buyerApi.forgotPassword(forgotEmail.trim());
      setForgotSent(true);
      showToast('Temporary password has been sent to your email.');
    } catch (err) {
      showToast('⚠️ ' + (err.message || 'Failed to send reset email'), 'error');
    } finally {
      setForgotLoading(false);
    }
  }

  function fillDemoBuyer() {
    setEmail('james.morgan@email.com');
    setPassword('Password123!');
  }

  const handleBack = () => {
    try {
      if (window.location.port === '5173' || window.location.pathname.startsWith('/buyer')) {
        navigate('/');
      } else {
        window.location.href = '../index.html';
      }
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to home"
          title="Back to home"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            fontSize: '1.25rem',
            lineHeight: 1,
            cursor: 'pointer',
            width: '2rem',
            height: '2rem',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s, background-color 0.2s',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#9ca3af';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ✕
        </button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '3.25rem',
              height: '3.25rem',
              borderRadius: '0.75rem',
              background: '#1DB954',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <LogoIcon style={{ width: '1.75rem', height: '1.75rem' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            truEstate <span style={{ color: '#1DB954', fontSize: '0.875rem' }}>Buyer Portal</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {isRegister ? 'Create an account to explore & buy verified homes' : 'Sign in to access your buyer dashboard'}
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#121212',
            padding: '0.25rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            style={{
              background: !isRegister ? '#282828' : 'transparent',
              color: !isRegister ? '#fff' : '#9ca3af',
              border: 'none',
              padding: '0.6rem',
              borderRadius: '0.375rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            style={{
              background: isRegister ? '#282828' : 'transparent',
              color: isRegister ? '#fff' : '#9ca3af',
              border: 'none',
              padding: '0.6rem',
              borderRadius: '0.375rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.825rem',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.4rem', fontWeight: 600 }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="James Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: '#121212',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.4rem', fontWeight: 600 }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="buyer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                background: '#121212',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Password with Show/Hide Toggle */}
          <div style={{ marginBottom: isRegister ? '1rem' : '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>Password</label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: showPassword ? '#1DB954' : '#9ca3af',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1DB954',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot?
                  </button>
                )}
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#121212',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  padding: '0.75rem 2.5rem 0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: showPassword ? '#1DB954' : '#6b7280',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {isRegister && (
              <div style={{ marginTop: '0.35rem', fontSize: '0.72rem', color: '#9ca3af' }}>
                Must be at least 8 characters with upper, lower, number & special char (@$!%*?&)
              </div>
            )}
          </div>

          {/* Confirm Password (Register only) */}
          {isRegister && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>Confirm Password</label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: showConfirmPassword ? '#1DB954' : '#9ca3af',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#121212',
                    border: confirmPassword
                      ? password === confirmPassword
                        ? '1px solid #1DB954'
                        : '1px solid #ef4444'
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    padding: '0.75rem 2.5rem 0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: showConfirmPassword ? '#1DB954' : '#6b7280',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword && (
                <div
                  style={{
                    marginTop: '0.35rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: password === confirmPassword ? '#1DB954' : '#ef4444',
                  }}
                >
                  {password === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#1DB954',
              color: '#000',
              fontWeight: 800,
              padding: '0.85rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.925rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Please wait…' : isRegister ? 'Create Buyer Account' : 'Sign In as Buyer'}
          </button>
        </form>

        {/* Quick demo credentials helper */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
          }}
        >
          <span style={{ color: '#6b7280', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
            Quick fill demo account:
          </span>
          <button
            type="button"
            onClick={fillDemoBuyer}
            style={{
              background: '#282828',
              color: '#1DB954',
              border: '1px solid rgba(29, 185, 84, 0.3)',
              borderRadius: '0.375rem',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Use Demo Buyer (James Morgan)
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          className="modal-overlay show"
          onClick={(e) => {
            if (e.target === e.currentTarget) setForgotOpen(false);
          }}
        >
          <div className="modal-box" style={{ maxWidth: '400px', padding: '2rem', background: '#1a1a1a', borderRadius: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Reset Password</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
              Enter your email and we'll send a temporary password to regain access.
            </p>

            {forgotSent ? (
              <div>
                <p style={{ color: '#1DB954', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  ✓ If an account exists, a new password has been emailed. Check your inbox and spam folder.
                </p>
                <button
                  onClick={() => {
                    setForgotOpen(false);
                    setForgotSent(false);
                  }}
                  style={{
                    width: '100%',
                    background: '#1DB954',
                    color: '#000',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: '#121212',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                  }}
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    background: '#1DB954',
                    color: '#000',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontWeight: 700,
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {forgotLoading ? 'Sending…' : 'Email Temporary Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    padding: '0.6rem',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                  }}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
