import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getUser } from '../api/session.js';
import { initials } from '../utils/format.js';

/**
 * The admin's profile card (sidebar + Profile page).
 *
 * Same behaviour as loadAdminProfile/saveAdminProfile in the old dashboard:
 * name and email come from the logged-in account; fields the backend does not
 * store (phone, location, DOB, coverage area) — and any name/email the admin
 * edits here — are kept in localStorage under "adminProfile" and win once set.
 */
const STORAGE_KEY = 'adminProfile';

// Values the old Profile form showed before anything was saved.
const FORM_DEFAULTS = {
  name: 'Admin User',
  phone: '+91 99887 76655',
  email: 'admin@truestate.com',
  location: 'Hyderabad, India',
  dob: '1990-01-01',
  area: 'Banjara Hills, Jubilee Hills, Gachibowli',
};

function readStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch { return {}; }
}

/** Stored profile merged with the real account's name/email. */
function loadProfile() {
  const profile = readStored();
  const user = getUser();
  if (user) {
    if (!profile.name && user.name) profile.name = user.name;
    if (!profile.email && user.email) profile.email = user.email;
  }
  return profile;
}

const AdminProfileContext = createContext(null);

export function AdminProfileProvider({ children }) {
  const [profile, setProfile] = useState(loadProfile);

  /** Re-reads storage (used by Cancel → "Changes discarded."). */
  const reload = useCallback(() => setProfile(loadProfile()), []);

  /** Persists the edited form; returns false when the name is missing. */
  const save = useCallback((values) => {
    const existing = readStored();
    const next = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      location: values.location.trim(),
      area: values.area.trim(),
      dob: values.dob.trim() || existing.dob,
    };
    if (!next.name) return false;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* private mode */ }
    setProfile(loadProfile());
    return true;
  }, []);

  const value = useMemo(() => {
    const user = getUser();
    // Only fields that exist override the defaults (old set() skipped undefined).
    const formValues = { ...FORM_DEFAULTS };
    Object.keys(FORM_DEFAULTS).forEach((k) => { if (profile[k] !== undefined) formValues[k] = profile[k]; });
    return {
      profile,
      formValues,
      displayName: profile.name || 'Admin User',
      avatarText: initials(profile.name || 'Admin User', 'AU'),
      // Every queue is scoped to the admin's city, so the sidebar names the desk.
      cityLabel: user ? (user.city ? user.city + ' Admin' : 'All Cities') : 'Admin Account',
      reload,
      save,
    };
  }, [profile, reload, save]);

  return <AdminProfileContext.Provider value={value}>{children}</AdminProfileContext.Provider>;
}

export const useAdminProfile = () => useContext(AdminProfileContext);
