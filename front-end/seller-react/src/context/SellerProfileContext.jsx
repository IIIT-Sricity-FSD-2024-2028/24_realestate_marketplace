import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getUser } from '../api/session.js';
import { getInitials } from '../utils/format.js';

const SellerProfileContext = createContext(null);

export function SellerProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const user = getUser() || {};
    let local = {};
    try {
      const raw = localStorage.getItem('sellerProfile');
      if (raw) local = JSON.parse(raw);
    } catch { /* ignore */ }

    let fname = local.fname || '';
    let lname = local.lname || '';
    if (!fname && !lname && user.name) {
      const parts = String(user.name).trim().split(/\s+/);
      fname = parts[0] || '';
      lname = parts.slice(1).join(' ') || '';
    }

    return {
      fname,
      lname,
      email: local.email || user.email || '',
      phone: local.phone || '',
      dob: local.dob || '',
      gender: local.gender || '',
      location: local.location || '',
    };
  });

  const saveProfile = useCallback((newFields) => {
    setProfile((prev) => {
      const updated = { ...prev, ...newFields };
      try {
        localStorage.setItem('sellerProfile', JSON.stringify(updated));
      } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const fullName = useMemo(() => {
    const name = [profile.fname, profile.lname].filter(Boolean).join(' ').trim();
    if (name) return name;
    const user = getUser();
    return (user && user.name) || 'Seller';
  }, [profile.fname, profile.lname]);

  const initials = useMemo(() => {
    return getInitials(fullName);
  }, [fullName]);

  const value = useMemo(
    () => ({
      profile,
      fullName,
      initials,
      saveProfile,
    }),
    [profile, fullName, initials, saveProfile]
  );

  return (
    <SellerProfileContext.Provider value={value}>
      {children}
    </SellerProfileContext.Provider>
  );
}

export function useSellerProfile() {
  const ctx = useContext(SellerProfileContext);
  if (!ctx) {
    throw new Error('useSellerProfile must be used within SellerProfileProvider');
  }
  return ctx;
}
