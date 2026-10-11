import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import FormField from '../components/FormField.jsx';
import { useAdminProfile } from '../context/AdminProfileContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { DOB_MIN, dobMax, dobYearError, isAllZeros, validate } from '../utils/validation.js';

// Same required fields as tvValidateAdminWorkflowProfile in form-validation.js.
const RULES = [
  { field: 'name', label: 'Full Name', required: true },
  { field: 'phone', label: 'Phone', required: true, type: 'phone' },
  { field: 'email', label: 'Email', required: true, type: 'email' },
  { field: 'location', label: 'Location', required: true },
  { field: 'dob', label: 'Date of Birth', required: true },
];

// Figures that were hard-coded in the old Profile section (no API behind them).
const STATS = [
  { value: '2', label: 'Current Buyers', color: '#1DB954' },
  { value: '2', label: 'Current Sellers', color: '#f97316' },
  { value: '2', label: 'Active Deals', color: '#3b82f6' },
  { value: '124', label: 'Deals Closed', color: '#1DB954' },
  { value: '4.8 ★', label: 'Client Rating', color: '#eab308' },
  { value: '8 Yrs', label: 'Experience', color: '#1DB954' },
];

/**
 * Profile (was data-section="profile").
 * Header card + editable details. Name and email start from the logged-in
 * account; everything is saved to localStorage ("adminProfile") as before —
 * the backend has no admin-profile endpoint. Save validates first (required
 * fields, phone and email format, DOB between 1900 and today).
 */
export default function Profile() {
  const showToast = useToast();
  const { profile, formValues, avatarText, reload, save } = useAdminProfile();
  const [values, setValues] = useState(formValues);
  const [errors, setErrors] = useState({});

  // Re-sync the form whenever the stored profile changes (save / cancel).
  useEffect(() => { setValues(formValues); setErrors({}); }, [formValues]);

  // Typing in a field clears its error (old tvAttachLiveClearing).
  const set = (field) => (value) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  // Phone may never be all zeros (old blur guard).
  const checkPhone = () => {
    if (isAllZeros(values.phone)) {
      setValues((v) => ({ ...v, phone: '' }));
      setErrors((e) => ({ ...e, phone: 'Phone number cannot be all zeros' }));
    }
  };

  // DOB year must be 4 digits and between 1900 and this year (old tvApplyDobRestrictions).
  const changeDob = (value) => {
    const err = dobYearError(value);
    if (err) {
      showToast(err, 'error');
      set('dob')('');
      return;
    }
    set('dob')(value);
  };

  const onSave = () => {
    const found = validate(RULES, values);
    if (Object.keys(found).length) {
      setErrors(found);
      showToast('Please complete all required profile fields.', 'error');
      return;
    }
    if (!save(values)) { showToast('Full name is required', 'error'); return; }
    showToast('✅ Profile updated successfully!');
  };

  const onCancel = () => {
    reload();
    setValues(formValues);
    setErrors({});
    showToast('Changes discarded.');
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Your admin account & performance overview" />
      <div className="page-body">
        <div className="card profile-card">
          <div className="profile-head">
            <div className="avatar avatar--xxl">{avatarText}</div>
            <div className="profile-head__text">
              <h2>{profile.name || 'Admin User'}</h2>
              <p className="muted small-md">{profile.email || ''}</p>
              <p className="muted small-md">{(profile.phone || '—') + '  •  ' + (profile.location || '—')}</p>
            </div>
            <span className="status-chip" style={{ background: 'rgba(29,185,84,0.12)', color: '#1DB954' }}>⭐ Active Admin</span>
          </div>

          <div className="grid grid-3 grid-tight profile-section">
            {STATS.map((s) => (
              <div key={s.label} className="mini-stat">
                <div className="mini-stat__value" style={{ color: s.color }}>{s.value}</div>
                <div className="mini-stat__label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* RERA info (read-only) */}
          <div className="grid grid-2 grid-tight profile-section">
            <div className="mini-stat mini-stat--left">
              <div className="mini-stat__caption">RERA ID</div>
              <div className="strong small-md" style={{ color: '#1DB954' }}>ADMIN-2024-HYD-1234</div>
            </div>
            <div className="mini-stat mini-stat--left">
              <div className="mini-stat__caption">RERA Valid Until</div>
              <div className="strong small-md">December 2026</div>
            </div>
          </div>

          <div className="profile-form">
            <p className="muted small-plus" style={{ marginBottom: '1.25rem' }}>
              Update your profile details below and click <strong style={{ color: '#fff' }}>Save Changes</strong>.
            </p>
            <div className="form-stack form-stack--tight">
              <div className="grid grid-2 grid-tight">
                <FormField label="Full Name" variant="soft" labelClassName="field-label--sm" restrict="alpha"
                  value={values.name} error={errors.name} onValueChange={set('name')} />
                <FormField label="Phone" type="tel" variant="soft" labelClassName="field-label--sm" restrict="number"
                  value={values.phone} error={errors.phone} onValueChange={set('phone')} onBlur={checkPhone} />
              </div>
              <FormField label="Email" type="email" variant="soft" labelClassName="field-label--sm" restrict="email"
                value={values.email} error={errors.email} onValueChange={set('email')} />
              <FormField label="Location" variant="soft" labelClassName="field-label--sm" restrict="alpha"
                value={values.location} error={errors.location} onValueChange={set('location')} />
              <FormField label={<>Date of Birth <span style={{ color: '#ef4444' }}>*</span></>} type="date" min={DOB_MIN} max={dobMax()}
                variant="soft" labelClassName="field-label--sm" value={values.dob} error={errors.dob} onValueChange={changeDob} />
              <FormField label="Coverage Area" variant="soft" labelClassName="field-label--sm" restrict="alphaList"
                value={values.area} onValueChange={set('area')} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary btn-grow" onClick={onCancel}>Cancel</button>
              <button type="button" className="btn btn-primary btn-grow" onClick={onSave}>💾 Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
