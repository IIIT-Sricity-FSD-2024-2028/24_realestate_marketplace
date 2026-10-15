import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { ProfileIcon } from '../components/Icons.jsx';
import { useBuyerProfile } from '../context/BuyerProfileContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { buyerApi } from '../api/buyerApi.js';

export default function ProfilePage() {
  const { profile, updateProfile, initials, fullName } = useBuyerProfile();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'male',
    location: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        fname: profile.fname || '',
        lname: profile.lname || '',
        email: profile.email || '',
        phone: profile.phone || '',
        dob: profile.dob || '',
        gender: profile.gender || 'male',
        location: profile.location || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!formData.fname.trim() || !formData.lname.trim()) {
      showToast('First and last names are required', 'error');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    updateProfile(formData);
    showToast('Personal info saved successfully!');
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all three password fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await buyerApi.changePassword(currentPassword, newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated successfully!');
    } catch (err) {
      const detail = err.errors && err.errors.length ? `: ${err.errors[0]}` : '';
      showToast(err.message ? `${err.message}${detail}` : 'Failed to update password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Account Profile"
        subtitle="Manage your personal details, location preferences, and account security"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Personal Information Form */}
        <div className="card">
          {/* Profile Header Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div
              style={{
                width: '4.5rem',
                height: '4.5rem',
                borderRadius: '50%',
                background: '#1DB954',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                boxShadow: '0 4px 20px rgba(29,185,84,0.3)',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                {fullName}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                <span>{formData.email}</span>
                <span>•</span>
                <span style={{ color: '#1DB954', fontWeight: 600 }}>Buyer Account</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#fff' }}>
              Personal Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="fname"
                  value={formData.fname}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. James"
                  required
                />
              </div>
              <div>
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lname"
                  value={formData.lname}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. Morgan"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="name@domain.com"
                  required
                />
              </div>
              <div>
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Primary Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Hyderabad, Telangana, India"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Security / Change Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>
              Account Security
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Keep your account safe by updating your password periodically.
            </p>

            <form onSubmit={handleUpdatePassword}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">New Password *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isUpdatingPassword}
                style={{ width: '100%', padding: '0.75rem' }}
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Quick Account Info Card */}
          <div className="card" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Session Info
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Role:</span>
                <span style={{ color: '#1DB954', fontWeight: 600 }}>Verified Buyer</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Session Scope:</span>
                <span>Isolated Per-Tab</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Status:</span>
                <span style={{ color: '#1DB954' }}>Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
