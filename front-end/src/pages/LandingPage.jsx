import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = '/api/v1';
const SESSION_KEY = 'truEstate_user';

export default function LandingPage({ openLoginOnMount = false, initialRole = 'buyer' }) {
  const navigate = useNavigate();

  // Authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Modal state
  const [authModalOpen, setAuthModalOpen] = useState(openLoginOnMount);
  const [authRole, setAuthRole] = useState(initialRole); // 'buyer' | 'seller'
  const [isSignup, setIsSignup] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Property Search & Listings
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [buyRent, setBuyRent] = useState('All');
  const [city, setCity] = useState('');
  const [propType, setPropType] = useState('');
  const [priceRange, setPriceRange] = useState('');

  // Toast alert
  const [toastMessage, setToastMessage] = useState(null);

  function triggerToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  // Fetch properties on mount
  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoadingProps(true);
        const res = await fetch(`${API_BASE}/properties?limit=50`);
        if (!res.ok) throw new Error('Failed to load listings');
        const json = await res.json();
        const items = json.data?.items || json.data || [];
        setProperties(Array.isArray(items) ? items : []);
      } catch (err) {
        console.warn('Could not load properties from backend, continuing:', err.message);
        setProperties([]);
      } finally {
        setLoadingProps(false);
      }
    }
    fetchProperties();
  }, []);

  // Filter properties based on requirements in landing page
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // 1. Purpose (Buy / Rent)
      if (buyRent && buyRent !== 'All') {
        const lt = (p.listingType || '').toLowerCase();
        if (buyRent === 'Buy' && lt !== 'sale' && lt !== 'buy') return false;
        if (buyRent === 'Rent' && lt !== 'rent') return false;
      }

      // 2. Location (City)
      if (city) {
        const c = (p.city || '').toLowerCase();
        const addr = (p.address || '').toLowerCase();
        const targetCity = city.toLowerCase();
        if (c !== targetCity && !addr.includes(targetCity)) return false;
      }

      // 3. Property Type
      if (propType) {
        const pt = ((p.type || p.propertyType) || '').toLowerCase();
        if (pt !== propType.toLowerCase()) return false;
      }

      // 4. Budget (Price Range)
      if (priceRange) {
        const price = Number(p.price) || 0;
        if (priceRange === '0-50' && price > 5000000) return false;
        if (priceRange === '50-100' && (price < 5000000 || price > 10000000)) return false;
        if (priceRange === '100-500' && (price < 10000000 || price > 50000000)) return false;
        if (priceRange === '500+' && price < 50000000) return false;
      }

      return true;
    });
  }, [properties, buyRent, city, propType, priceRange]);

  const hasActiveFilters = (buyRent && buyRent !== 'All') || !!city || !!propType || !!priceRange;

  // Handle Login / Registration
  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isSignup) {
        if (!authName.trim()) throw new Error('Please enter your full name');
        if (!authEmail.trim()) throw new Error('Please enter your email address');
        if (!authPassword) throw new Error('Please enter a password');
        if (authPassword.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(authPassword)) {
          throw new Error('Password must include uppercase, lowercase, digit, and special character (@$!%*?&)');
        }
        if (authPassword !== authConfirmPassword) {
          throw new Error('Passwords do not match. Please verify your confirm password.');
        }

        // Clean optional phone number
        let formattedPhone = authPhone.trim();
        if (formattedPhone) {
          if (/^\d{10}$/.test(formattedPhone)) {
            formattedPhone = `+91${formattedPhone}`;
          } else if (!formattedPhone.startsWith('+')) {
            formattedPhone = `+${formattedPhone}`;
          }
        }

        const payload = {
          name: authName.trim(),
          email: authEmail.trim(),
          password: authPassword,
          userType: authRole,
        };
        if (formattedPhone) {
          payload.phone = formattedPhone;
        }

        const registerRes = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const regBody = await registerRes.json();
        if (!registerRes.ok) {
          const detailedErr = Array.isArray(regBody.errors) && regBody.errors.length
            ? regBody.errors.join('; ')
            : regBody.message;
          throw new Error(detailedErr || 'Registration failed');
        }

        const returnedUser = regBody.data?.user || {};
        const userObj = {
          id: returnedUser.id || regBody.data?.id,
          name: returnedUser.name || authName.trim(),
          email: returnedUser.email || authEmail.trim(),
          role: returnedUser.role || 'user',
          userType: returnedUser.userType || authRole,
          token: regBody.data?.accessToken || regBody.data?.token,
        };

        sessionStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
        localStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
        setCurrentUser(userObj);
        triggerToast('Account created successfully!');
        setAuthModalOpen(false);

        if (authRole === 'seller') {
          navigate('/seller/dashboard');
        } else {
          navigate('/buyer/explore');
        }
      } else {
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail.trim(),
            password: authPassword,
            userType: authRole,
          }),
        });
        const loginBody = await loginRes.json();
        if (!loginRes.ok) {
          const detailedErr = Array.isArray(loginBody.errors) && loginBody.errors.length
            ? loginBody.errors.join('; ')
            : loginBody.message;
          throw new Error(detailedErr || 'Invalid email or password');
        }

        const user = loginBody.data?.user || {};
        const userObj = {
          id: user.id || loginBody.data?.id,
          name: user.name || authEmail.split('@')[0],
          email: user.email || authEmail.trim(),
          role: user.role || 'user',
          userType: user.userType || authRole,
          token: loginBody.data?.accessToken || loginBody.data?.token,
        };

        sessionStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
        localStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
        setCurrentUser(userObj);
        triggerToast('Login successful!');
        setAuthModalOpen(false);

        if (userObj.userType === 'seller' || userObj.role === 'seller') {
          navigate('/seller/dashboard');
        } else if (userObj.userType === 'buyer' || userObj.role === 'buyer' || userObj.role === 'user') {
          navigate('/buyer/explore');
        } else if (userObj.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (userObj.role === 'superuser') {
          navigate('/superuser/dashboard');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  }

  function handleDashboardRedirect() {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const role = currentUser.role || currentUser.userType;
    if (role === 'buyer') navigate('/buyer/explore');
    else if (role === 'seller') navigate('/seller/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'superuser') navigate('/superuser/dashboard');
    else navigate('/buyer/explore');
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    triggerToast('Logged out successfully');
  }

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#ffffff' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '1.5rem',
            backgroundColor: '#1DB954',
            color: '#000000',
            fontWeight: 700,
            padding: '0.75rem 1.25rem',
            borderRadius: '0.5rem',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link to="/" className="brand-link">
            <div className="brand-badge-box">
              <svg width="22" height="22" fill="none" stroke="#000000" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h1 className="brand-title">truEstate</h1>
              <p className="brand-sub">Unified Real Estate Marketplace</p>
            </div>
          </Link>

          <div className="portal-links">
            <Link to="/buyer/explore" className="portal-link">Buyer</Link>
            <Link to="/seller/dashboard" className="portal-link">Seller</Link>
            <Link to="/admin/login" className="portal-link">Admin</Link>
            <Link to="/superuser/login" className="portal-link">Superuser</Link>

            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleDashboardRedirect}
                  className="login-btn-top"
                >
                  Dashboard ({currentUser.name?.split(' ')[0] || 'My Account'})
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#9ca3af',
                    padding: '0.625rem 1rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setAuthModalOpen(true); setAuthError(null); }}
                className="login-btn-top"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', lineHeight: 1.2 }}>
            Welcome to <span style={{ color: '#1DB954' }}>truEstate</span>
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '1.25rem', marginBottom: '2.5rem' }}>
            Browse verified listings, schedule visits, make offers, and close deals securely
          </p>

          {/* Search Filter Box */}
          <div
            style={{
              maxWidth: '56rem',
              margin: '0 auto',
              backgroundColor: '#1a1a1a',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PURPOSE
                </label>
                <select
                  value={buyRent}
                  onChange={(e) => setBuyRent(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#282828', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.75rem' }}
                >
                  <option value="All">All Purposes</option>
                  <option value="Buy">Buy</option>
                  <option value="Rent">Rent</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  LOCATION
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#282828', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.75rem' }}
                >
                  <option value="">All Locations</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kochi">Kochi</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PROPERTY TYPE
                </label>
                <select
                  value={propType}
                  onChange={(e) => setPropType(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#282828', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.75rem' }}
                >
                  <option value="">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  BUDGET
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#282828', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.75rem' }}
                >
                  <option value="">All Prices</option>
                  <option value="0-50">Under ₹50 Lac</option>
                  <option value="50-100">₹50 Lac – 1 Cr</option>
                  <option value="100-500">₹1 Cr – 5 Cr</option>
                  <option value="500+">Above ₹5 Cr</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('featured-listings');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#1DB954',
                  color: '#000000',
                  fontWeight: 700,
                  padding: '0.85rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                Explore
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setBuyRent('All');
                    setCity('');
                    setPropType('');
                    setPriceRange('');
                  }}
                  style={{
                    backgroundColor: '#282828',
                    color: '#9ca3af',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Platform Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', maxWidth: '64rem', margin: '0 auto 4rem' }}>
          <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1a1a1a', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: '#1DB954', fontSize: '2rem', fontWeight: 800 }}>Buyer Portal</div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>Browse, Heart &amp; Offer</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1a1a1a', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: '#1DB954', fontSize: '2rem', fontWeight: 800 }}>Seller Portal</div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>List, Promote &amp; Sell</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1a1a1a', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: '#1DB954', fontSize: '2rem', fontWeight: 800 }}>Admin Portal</div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>Verify &amp; Advance Deals</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1a1a1a', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: '#1DB954', fontSize: '2rem', fontWeight: 800 }}>Superuser</div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>Platform Oversight &amp; Logs</div>
          </div>
        </div>

        {/* Live Catalog Preview */}
        <div id="featured-listings" style={{ marginBottom: '4rem', scrollMarginTop: '6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
                  {hasActiveFilters ? 'Filtered Listings' : 'Featured Live Listings'}
                </h3>
                <span style={{ backgroundColor: '#1DB954', color: '#000', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                  {filteredProperties.length} available
                </span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                {hasActiveFilters
                  ? 'Showing verified properties matching your requirements in landing page'
                  : 'Real verified properties fetched from the backend catalog'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setBuyRent('All');
                    setCity('');
                    setPropType('');
                    setPriceRange('');
                  }}
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#9ca3af', padding: '0.5rem 0.85rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/buyer/explore')}
                style={{ background: 'none', border: '1px solid #1DB954', color: '#1DB954', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
              >
                Open Full Catalog in Buyer Portal &rarr;
              </button>
            </div>
          </div>

          {loadingProps ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Loading properties from server…</div>
          ) : filteredProperties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#181818', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
              <h4 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                No properties match your filter requirements
              </h4>
              <p style={{ color: '#9ca3af', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                Try relaxing your purpose, location, property type, or budget filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setBuyRent('All');
                  setCity('');
                  setPropType('');
                  setPriceRange('');
                }}
                style={{
                  backgroundColor: '#1DB954',
                  color: '#000000',
                  padding: '0.625rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {filteredProperties.map((p) => {
                const img = (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';
                const isRent = (p.listingType || '').toLowerCase() === 'rent';
                const price = isRent
                  ? `₹${(p.price || 0).toLocaleString('en-IN')}/mo`
                  : p.price >= 10000000
                    ? `₹${(p.price / 10000000).toFixed(2)} Cr`
                    : `₹${(p.price / 100000).toFixed(1)} Lac`;
                const typeDisplay = p.type ? p.type.charAt(0).toUpperCase() + p.type.slice(1) : (p.propertyType || 'Apartment');

                return (
                  <div
                    key={p.id || p._id}
                    onClick={() => navigate('/buyer/explore')}
                    style={{
                      backgroundColor: '#181818',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                      <img src={img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', backgroundColor: '#1DB954', color: '#000', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                        {isRent ? 'Rent' : 'Buy'}
                      </span>
                      <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                        {typeDisplay}
                      </span>
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1DB954', marginBottom: '0.25rem' }}>
                        {price}
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: '0 0 0.5rem' }}>
                        {p.title}
                      </h4>
                      <p style={{ color: '#9ca3af', fontSize: '0.8125rem', margin: 0 }}>
                        📍 {p.city || 'Hyderabad'} · {p.bedrooms ? `${p.bedrooms} BHK` : ''} · {p.areaSqft ? `${p.areaSqft} sq.ft` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Unified Auth Modal */}
      {authModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setAuthModalOpen(false); }}
        >
          <div
            style={{
              backgroundColor: '#181818',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '28rem',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthModalOpen(false);
                if (window.location.pathname === '/login') {
                  navigate('/');
                }
              }}
              aria-label="Close modal"
              title="Close modal"
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
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

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                {isSignup ? 'Create Your Account' : 'Welcome to truEstate'}
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                Choose your role and continue to your dashboard
              </p>
            </div>

            {/* Role Switcher */}
            <div style={{ display: 'flex', backgroundColor: '#282828', padding: '0.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setAuthRole('buyer')}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: authRole === 'buyer' ? '#1DB954' : 'transparent',
                  color: authRole === 'buyer' ? '#000000' : '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setAuthRole('seller')}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: authRole === 'seller' ? '#1DB954' : 'transparent',
                  color: authRole === 'seller' ? '#000000' : '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Seller
              </button>
            </div>

            {authError && (
              <div style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {isSignup && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Enter your name"
                    style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#282828', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: '0.5rem' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#282828', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: '0.5rem' }}
                />
              </div>

              {isSignup && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#282828', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: '0.5rem' }}
                  />
                </div>
              )}

              {/* Password Field with Show/Hide Toggle */}
              <div style={{ marginBottom: isSignup ? '1rem' : '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: showPassword ? '#1DB954' : '#9ca3af',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: 0,
                    }}
                  >
                    {showPassword ? (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Enter password (e.g. Password123!)"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#282828',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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

                {/* Password requirement guide for sign up */}
                {isSignup && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: '#9ca3af', lineHeight: '1.4' }}>
                    Must contain: 8+ characters, uppercase, lowercase, number, and special character (@$!%*?&)
                  </div>
                )}
              </div>

              {/* Confirm Password Field (Signup only) */}
              {isSignup && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
                      Confirm Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: showConfirmPassword ? '#1DB954' : '#9ca3af',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: 0,
                      }}
                    >
                      {showConfirmPassword ? (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        backgroundColor: '#282828',
                        border: authConfirmPassword
                          ? authPassword === authConfirmPassword
                            ? '1px solid #1DB954'
                            : '1px solid #ef4444'
                          : '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
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

                  {/* Password match indicator */}
                  {authConfirmPassword && (
                    <div
                      style={{
                        marginTop: '0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: authPassword === authConfirmPassword ? '#1DB954' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      {authPassword === authConfirmPassword ? (
                        <><span>✓</span> Passwords match</>
                      ) : (
                        <><span>✕</span> Passwords do not match</>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  width: '100%',
                  backgroundColor: '#1DB954',
                  color: '#000000',
                  fontWeight: 700,
                  padding: '0.85rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: authLoading ? 'default' : 'pointer',
                  opacity: authLoading ? 0.7 : 1,
                  fontSize: '1rem',
                  marginBottom: '1rem',
                }}
              >
                {authLoading ? 'Signing in…' : isSignup ? 'Sign Up' : 'Log In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
              {isSignup ? (
                <>Already have an account? <span onClick={() => { setIsSignup(false); setAuthError(null); }} style={{ color: '#1DB954', cursor: 'pointer', fontWeight: 600 }}>Log In</span></>
              ) : (
                <>New to truEstate? <span onClick={() => { setIsSignup(true); setAuthError(null); }} style={{ color: '#1DB954', cursor: 'pointer', fontWeight: 600 }}>Create an account</span></>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '1.5rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <Link to="/admin/login" onClick={() => setAuthModalOpen(false)} style={{ color: '#9ca3af', textDecoration: 'none' }}>
                &rarr; Admin Login
              </Link>
              <Link to="/superuser/login" onClick={() => setAuthModalOpen(false)} style={{ color: '#9ca3af', textDecoration: 'none' }}>
                &rarr; Superuser Login
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '3rem 2rem', backgroundColor: '#0a0a0a' }}>
        <div className="landing-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.25rem', color: '#fff', fontSize: '1rem' }}>truEstate</h4>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.8125rem' }}>&copy; 2026 truEstate. All rights reserved.</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
            <Link to="/buyer/explore" style={{ color: '#9ca3af', textDecoration: 'none' }}>Buyer Portal</Link>
            <Link to="/seller/dashboard" style={{ color: '#9ca3af', textDecoration: 'none' }}>Seller Portal</Link>
            <Link to="/admin/login" style={{ color: '#9ca3af', textDecoration: 'none' }}>City Admin</Link>
            <Link to="/superuser/login" style={{ color: '#9ca3af', textDecoration: 'none' }}>Superuser Desk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
