import { createContext, useContext, useState } from 'react';
import { getUser, setUser } from '../api/session.js';

const SuperuserProfileContext = createContext(null);

export function SuperuserProfileProvider({ children }) {
  const [profile, setProfileState] = useState(() => {
    const u = getUser() || {};
    return {
      name: u.name || 'Super Admin',
      email: u.email || 'superuser@gmail.com',
      role: 'Superuser',
      title: 'System Creator',
      initials: 'SU',
    };
  });

  const updateProfile = (updates) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates };
      const u = getUser();
      if (u) {
        setUser({ ...u, ...updates });
      }
      return next;
    });
  };

  return (
    <SuperuserProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </SuperuserProfileContext.Provider>
  );
}

export const useSuperuserProfile = () => useContext(SuperuserProfileContext);
