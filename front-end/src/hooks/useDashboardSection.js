/**
 * useDashboardSection.js
 * Purpose: Decides which dashboard section is visible, keeping it in the URL
 *          (/seller/billing). Navigation state belongs in the URL, not
 *          browser persistence, so a fresh session always starts cleanly.
 * Inputs:  basePath   – e.g. '/seller'
 *          storageName – retained for call-site compatibility; not persisted
 *          validKeys  – list of section keys this dashboard has
 *          defaultKey – section to show first time
 * Outputs: [activeKey, goTo(key)]
 * API calls: none.
 */
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function useDashboardSection(basePath, _storageName, validKeys, defaultKey) {
  const { section } = useParams(); // the ":section" part of the URL
  const navigate = useNavigate();
  const isValid = section && validKeys.includes(section);

  // No (or unknown) section in the URL → select the declared default.
  useEffect(() => {
    if (isValid) return;
    navigate(basePath + '/' + defaultKey, { replace: true });
  }, [isValid, defaultKey, basePath, navigate]);

  // Called by the sidebar (and buttons like "View my offers").
  const goTo = useCallback((key) => navigate(basePath + '/' + key), [navigate, basePath]);

  return [isValid ? section : defaultKey, goTo];
}
