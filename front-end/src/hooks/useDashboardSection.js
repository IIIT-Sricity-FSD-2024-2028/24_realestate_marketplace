/**
 * useDashboardSection.js
 * Purpose: Decides which dashboard section is visible, keeping it in the URL
 *          (/seller/billing) and remembering it in localStorage
 *          (replaces tab-persistence.js and the old switchPage()).
 * Inputs:  basePath   – e.g. '/seller'
 *          storageName – key suffix, e.g. 'seller' → localStorage 'activeTab_seller'
 *          validKeys  – list of section keys this dashboard has
 *          defaultKey – section to show first time
 * Outputs: [activeKey, goTo(key)]
 * API calls: none.
 */
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/** Reads the last remembered section (safe in private mode). */
function readSaved(storageKey) {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export function useDashboardSection(basePath, storageName, validKeys, defaultKey) {
  const { section } = useParams(); // the ":section" part of the URL
  const navigate = useNavigate();
  const storageKey = 'activeTab_' + storageName;
  const isValid = section && validKeys.includes(section);

  // No (or unknown) section in the URL → restore the last one, else the default.
  useEffect(() => {
    if (isValid) return;
    const saved = readSaved(storageKey);
    const target = saved && validKeys.includes(saved) ? saved : defaultKey;
    navigate(basePath + '/' + target, { replace: true });
  }, [isValid, storageKey, validKeys, defaultKey, basePath, navigate]);

  // Remember the visible section for the next visit.
  useEffect(() => {
    if (!isValid) return;
    try {
      localStorage.setItem(storageKey, section);
    } catch {
      /* private mode */
    }
  }, [isValid, section, storageKey]);

  // Called by the sidebar (and buttons like "View my offers").
  const goTo = useCallback((key) => navigate(basePath + '/' + key), [navigate, basePath]);

  return [isValid ? section : defaultKey, goTo];
}
