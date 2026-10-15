import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUser, tsUserGet, tsUserSet, tsSafeParse } from '../api/session.js';
import { getInitials } from '../utils/format.js';

const BuyerProfileContext = createContext(null);

export function BuyerProfileProvider({ children }) {
  const [user, setUserState] = useState(() => getUser() || {});

  // Load saved profile or seed from active session
  const [profile, setProfile] = useState(() => {
    const active = getUser() || {};
    const saved = tsUserGet('buyerProfile', {});
    const parts = (active.name || '').trim().split(/\s+/);
    return {
      fname: saved.fname || parts[0] || 'James',
      lname: saved.lname || parts.slice(1).join(' ') || 'Morgan',
      email: saved.email || active.email || 'james.morgan@email.com',
      phone: saved.phone || '+91 98765 43210',
      dob: saved.dob || '1990-06-15',
      gender: saved.gender || 'male',
      location: saved.location || 'Hyderabad, Telangana, India',
    };
  });

  // Shortlist state (scoped per logged-in user)
  const [shortlistIds, setShortlistIds] = useState(() => tsUserGet('slList', []));

  // Under Consideration state (scoped per logged-in user)
  const [considerationIds, setConsiderationIds] = useState(() => tsUserGet('ucList', []));

  useEffect(() => {
    const active = getUser();
    if (active) setUserState(active);
  }, []);

  const updateProfile = useCallback((updated) => {
    setProfile(updated);
    tsUserSet('buyerProfile', updated);

    // Sync back to globalUsers mock list so Super Admin / Admin views stay synced
    try {
      const fullN = [updated.fname, updated.lname].filter(Boolean).join(' ').trim();
      const gUsers = tsSafeParse('globalUsers', []);
      const entry = gUsers.find((u) => u.role === 'Buyer' || u.email === updated.email);
      if (entry) {
        if (fullN) entry.name = fullN;
        if (updated.email) entry.email = updated.email;
        localStorage.setItem('globalUsers', JSON.stringify(gUsers));
      }
    } catch (_) {}
  }, []);

  const toggleShortlist = useCallback((id) => {
    setShortlistIds((prev) => {
      const sId = String(id);
      const exists = prev.some((x) => String(x) === sId);
      const next = exists ? prev.filter((x) => String(x) !== sId) : [...prev, id];
      tsUserSet('slList', next);
      return next;
    });
  }, []);

  const isShortlisted = useCallback((id) => {
    return shortlistIds.some((x) => String(x) === String(id));
  }, [shortlistIds]);

  const addToConsideration = useCallback((id) => {
    setConsiderationIds((prev) => {
      const sId = String(id);
      if (prev.some((x) => String(x) === sId)) return prev;
      const next = [...prev, id];
      tsUserSet('ucList', next);
      return next;
    });
  }, []);

  const removeFromConsideration = useCallback((id) => {
    setConsiderationIds((prev) => {
      const next = prev.filter((x) => String(x) !== String(id));
      tsUserSet('ucList', next);
      return next;
    });
  }, []);

  const isUnderConsideration = useCallback((id) => {
    return considerationIds.some((x) => String(x) === String(id));
  }, [considerationIds]);

  const fullName = `${profile.fname} ${profile.lname}`.trim() || user.name || 'User';
  const initials = getInitials(fullName);

  return (
    <BuyerProfileContext.Provider
      value={{
        user,
        profile,
        fullName,
        initials,
        updateProfile,
        shortlistIds,
        toggleShortlist,
        isShortlisted,
        considerationIds,
        addToConsideration,
        removeFromConsideration,
        isUnderConsideration,
      }}
    >
      {children}
    </BuyerProfileContext.Provider>
  );
}

export const useBuyerProfile = () => useContext(BuyerProfileContext);
