import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { useSellerProfile } from '../context/SellerProfileContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { sellerApi } from '../api/sellerApi.js';

export default function Profile() {
  const { profile, fullName, initials, saveProfile } = useSellerProfile();
  const { showToast } = useToast();

  const [fname, setFname] = useState(profile.fname || '');
  const [lname, setLname] = useState(profile.lname || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [dob, setDob] = useState(profile.dob || '');
  const [gender, setGender] = useState(profile.gender || 'Male');
  const [location, setLocation] = useState(profile.location || '');

  const [curPassword, setCurPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [conPassword, setConPassword] = useState('');
  const [updatingPw, setUpdatingPw] = useState(false);

  function handleSaveProfile(e) {
    e.preventDefault();
    if (!fname.trim() || !lname.trim()) {
      showToast('Please enter both your first and last name.', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    saveProfile({
      fname: fname.trim(),
      lname: lname.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dob,
      gender,
      location: location.trim(),
    });

    showToast('Personal info saved successfully!', 'success');
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    if (!curPassword || !newPassword || !conPassword) {
      showToast('Please fill in all three password fields', 'error');
      return;
    }
    if (newPassword !== conPassword) {
      showToast('New password and confirmation do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    setUpdatingPw(true);
    try {
      await sellerApi.changePassword(curPassword, newPassword);
      setCurPassword('');
      setNewPassword('');
      setConPassword('');
      showToast('Password updated successfully!', 'success');
    } catch (err) {
      const detail = err.errors && err.errors.length ? `: ${err.errors[0]}` : '';
      showToast((err.message || 'Failed to update password') + detail, 'error');
    } finally {
      setUpdatingPw(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal details, seller account preferences, and security settings"
      />

      <div className="content-section" style={{ maxWidth: '900px' }}>
        {/* Profile Card Header */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1.75rem' }}>
          <div
            className="user-avatar"
            style={{ width: '4.5rem', height: '4.5rem', fontSize: '1.5rem', fontWeight: 800 }}
          >
            {initials}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {fullName}
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              {email || 'seller@example.com'} · <span style={{ color: '#1DB954', fontWeight: 600 }}>Verified Seller Account</span>
            </p>
          </div>
        </div>

        {/* Personal Information Form */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>
            Personal Information
          </h2>

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>First Name *</label>
                <input
                  id="prof-fname"
                  type="text"
                  className="form-control"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Last Name *</label>
                <input
                  id="prof-lname"
                  type="text"
                  className="form-control"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Email Address *</label>
                <input
                  id="prof-email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Phone Number</label>
                <input
                  id="prof-phone"
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Date of Birth</label>
                <input
                  id="prof-dob"
                  type="date"
                  className="form-control"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Gender</label>
                <select
                  id="prof-gender"
                  className="form-control"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Location / City</label>
                <input
                  id="prof-location"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Hyderabad, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
            Change Password
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Update your account login password
          </p>

          <form onSubmit={handleUpdatePassword}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Current Password *</label>
              <input
                id="seller-current-password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={curPassword}
                onChange={(e) => setCurPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>New Password *</label>
                <input
                  id="seller-new-password"
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Confirm New Password *</label>
                <input
                  id="seller-confirm-password"
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={conPassword}
                  onChange={(e) => setConPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '1.25rem' }}>
              Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&).
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={updatingPw}
                className="btn-primary"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                {updatingPw ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
