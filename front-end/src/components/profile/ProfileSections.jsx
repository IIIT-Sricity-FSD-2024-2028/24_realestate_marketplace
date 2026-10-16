/**
 * ProfileSections.jsx
 * Purpose: Buyer & seller "My Profile" building blocks:
 *   useAccountProfile – loads the profile (name/email from the real account,
 *                       extra fields kept per-account in localStorage as before)
 *   ProfileSummary    – avatar, name, email, "member since" (from /auth/me)
 *   PersonalInfoForm  – editable personal details with validation
 *   ChangePasswordCard – real password change + "forgot current password?"
 * Inputs:  props documented on each export.
 * Outputs: JSX + the profile object for the sidebar name.
 * API calls: GET /auth/me (member-since date, phone), PATCH /auth/change-password,
 *            POST /auth/forgot-password (through ForgotPasswordModal).
 *
 * Note: the backend has no endpoint for phone/DOB/gender/location edits, so —
 * exactly like the original pages — those are stored in this browser only.
 */
import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../../api/services.js';
import { errorText } from '../../api/client.js';
import { getUser, readUserData, writeUserData } from '../../auth/session.js';
import { monthYear } from '../../utils/format.js';
import { isValid, validateDob, validatePasswordChange, validateRules } from '../../utils/validation.js';
import { Avatar, Card } from '../common/ui.jsx';
import Icon from '../common/Icon.jsx';
import { FormField, PasswordInput, PasswordMatchHint, TextInput, todayIso } from '../forms/FormControls.jsx';
import { useToast } from '../feedback/ToastProvider.jsx';
import ForgotPasswordModal from '../auth/ForgotPasswordModal.jsx';

// Same rules as tvValidateBuyerProfile / tvValidateSellerProfile.
const PROFILE_RULES = [
  { field: 'fname', label: 'First Name', required: true },
  { field: 'lname', label: 'Last Name', required: true },
  { field: 'email', label: 'Email', required: true, type: 'email' },
  { field: 'phone', label: 'Phone', required: true, type: 'phone' },
  { field: 'location', label: 'Location', required: true },
  { field: 'dob', label: 'Date of Birth', required: true },
];

/** Splits "Sarah Ann Johnson" → { fname: 'Sarah', lname: 'Ann Johnson' }. */
function splitName(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return { fname: parts[0] || '', lname: parts.slice(1).join(' ') };
}

/**
 * Hook: the signed-in account's profile.
 * storageBase – 'buyerProfile' | 'sellerProfile' (stored as `${base}:${userId}`).
 * Returns { profile, fullName, account (from /auth/me), save(profile) }.
 */
export function useAccountProfile(storageBase) {
  const user = getUser();
  // Start from what this browser saved, seeded with the real account name/email.
  const [profile, setProfile] = useState(() => {
    const saved = readUserData(storageBase, {});
    const seeded = { ...saved };
    if (!seeded.fname && !seeded.lname && user && user.name) Object.assign(seeded, splitName(user.name));
    if (!seeded.email && user && user.email) seeded.email = user.email;
    return seeded;
  });
  const [account, setAccount] = useState(null); // real profile from the API

  // GET /auth/me — real createdAt ("member since") and phone if on file.
  useEffect(() => {
    let alive = true;
    authApi
      .me()
      .then((res) => {
        if (!alive) return;
        setAccount(res.data);
        // Fill the phone from the account if this browser hasn't stored one.
        setProfile((p) => (p.phone || !res.data?.phone ? p : { ...p, phone: res.data.phone }));
      })
      .catch(() => {
        /* the profile still works from local data */
      });
    return () => {
      alive = false;
    };
  }, []);

  const save = useCallback(
    (next) => {
      writeUserData(storageBase, next); // per-account browser storage
      setProfile(next);
    },
    [storageBase],
  );

  const fullName = [profile.fname, profile.lname].filter(Boolean).join(' ').trim() || (user && user.name) || 'User';
  return { profile, fullName, account, save };
}

/** Avatar + name + email + member-since card. Props: fullName, email, accountLabel, account. */
export function ProfileSummary({ fullName, email, accountLabel, account }) {
  return (
    <Card className="profile-summary">
      <Avatar name={fullName} size="xl" color="var(--brand)" textColor="#000" />
      <div>
        <h2 className="profile-name">{fullName}</h2>
        <p className="text-secondary small">
          {email} · {accountLabel}
        </p>
        <p className="text-brand small strong">{account && account.createdAt ? 'Member since ' + monthYear(account.createdAt) : 'Loading account details…'}</p>
      </div>
    </Card>
  );
}

/**
 * Editable personal details.
 * Props: profile, onSave(profile) — called only when every field is valid.
 */
export function PersonalInfoForm({ profile, onSave }) {
  const { showToast } = useToast();
  const [values, setValues] = useState(profile); // form copy of the profile
  const [errors, setErrors] = useState({});

  // When the saved profile changes (e.g. phone arrives from /auth/me), refresh the form.
  useEffect(() => setValues(profile), [profile]);

  /** Updates one field and clears its error (old tvAttachLiveClearing). */
  const set = (field) => (value) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const submit = (event) => {
    event.preventDefault();
    const found = validateRules(values, PROFILE_RULES);
    const dobError = validateDob(values.dob);
    if (dobError) found.dob = dobError;
    // Drop undefined entries left by live clearing.
    Object.keys(found).forEach((k) => found[k] === undefined && delete found[k]);
    setErrors(found);
    if (!isValid(found)) {
      showToast('⚠️ Please complete all required profile fields.', 'error');
      return;
    }
    onSave({ ...values });
    showToast('✅ Personal info saved successfully!');
  };

  const cancel = () => {
    setValues(profile); // throw away unsaved edits
    setErrors({});
    showToast('Changes discarded.');
  };

  return (
    <Card>
      <h3 className="card-title">
        <Icon name="user" className="text-brand" /> Personal Information
      </h3>
      <form onSubmit={submit} noValidate>
        <div className="form-grid-2">
          <FormField id="prof-fname" label="First Name" required error={errors.fname}>
            <TextInput id="prof-fname" restrict="alpha" autoComplete="given-name" value={values.fname} onValueChange={set('fname')} error={errors.fname} />
          </FormField>
          <FormField id="prof-lname" label="Last Name" required error={errors.lname}>
            <TextInput id="prof-lname" restrict="alpha" autoComplete="family-name" value={values.lname} onValueChange={set('lname')} error={errors.lname} />
          </FormField>
          <FormField id="prof-email" label="Email Address" required error={errors.email}>
            <TextInput
              id="prof-email"
              type="email"
              restrict="email"
              autoComplete="email"
              value={values.email}
              onValueChange={set('email')}
              error={errors.email}
            />
          </FormField>
          <FormField id="prof-phone" label="Phone Number" required error={errors.phone}>
            <TextInput id="prof-phone" type="tel" restrict="phone" autoComplete="tel" value={values.phone} onValueChange={set('phone')} error={errors.phone} />
          </FormField>
          <FormField id="prof-dob" label="Date of Birth" required error={errors.dob}>
            <TextInput id="prof-dob" type="date" min="1900-01-01" max={todayIso()} value={values.dob} onValueChange={set('dob')} error={errors.dob} />
          </FormField>
          <FormField id="prof-gender" label="Gender">
            <select id="prof-gender" className="form-control" value={values.gender || ''} onChange={(e) => set('gender')(e.target.value)}>
              <option value="">Select…</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Prefer not to say</option>
            </select>
          </FormField>
          <FormField id="prof-location" label="City / Location" required error={errors.location} className="span-2">
            <TextInput
              id="prof-location"
              restrict="alpha"
              autoComplete="address-level2"
              value={values.location}
              onValueChange={set('location')}
              error={errors.location}
            />
          </FormField>
        </div>
        <p className="field-hint">Phone, date of birth, gender and location are saved in this browser only.</p>
        <div className="button-row">
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
          <button type="button" className="btn btn-secondary" onClick={cancel}>
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}

/**
 * Real password change. Props: idPrefix ('buyer' | 'seller'), userType (for forgot-password).
 */
export function ChangePasswordCard({ idPrefix, userType }) {
  const { showToast } = useToast();
  const empty = { currentPassword: '', newPassword: '', confirmPassword: '' };
  const [values, setValues] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const set = (field) => (value) => setValues((v) => ({ ...v, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const problem = validatePasswordChange(values); // client-side checks first
    if (problem) {
      showToast('⚠️ ' + problem, 'error');
      return;
    }
    setSaving(true);
    try {
      // PATCH /auth/change-password — the server checks the current password.
      await authApi.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      setValues(empty);
      showToast('✅ Password updated successfully!');
    } catch (err) {
      showToast('⚠️ ' + errorText(err, 'Failed to update password'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <h3 className="card-title">
        <Icon name="lock" className="text-brand" /> Change Password
      </h3>
      <form onSubmit={submit} noValidate>
        <div className="form-grid-3">
          <FormField id={idPrefix + '-current-password'} label="Current Password">
            <PasswordInput
              id={idPrefix + '-current-password'}
              autoComplete="current-password"
              value={values.currentPassword}
              onValueChange={set('currentPassword')}
            />
          </FormField>
          <FormField id={idPrefix + '-new-password'} label="New Password" hint="8–32 characters with upper & lower case, a number and a special character.">
            <PasswordInput id={idPrefix + '-new-password'} autoComplete="new-password" value={values.newPassword} onValueChange={set('newPassword')} />
          </FormField>
          <FormField id={idPrefix + '-confirm-password'} label="Confirm New Password">
            <PasswordInput
              id={idPrefix + '-confirm-password'}
              autoComplete="new-password"
              value={values.confirmPassword}
              onValueChange={set('confirmPassword')}
            />
            <PasswordMatchHint password={values.newPassword} confirm={values.confirmPassword} />
          </FormField>
        </div>
        <div className="button-row">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Updating…' : 'Update Password'}
          </button>
          <button type="button" className="btn btn-link" onClick={() => setForgotOpen(true)}>
            Forgot current password?
          </button>
        </div>
      </form>
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} userType={userType} />
    </Card>
  );
}
