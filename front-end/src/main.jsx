import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import App from './App.jsx';
import './styles/unified.css';

/**
 * LegacyHashSync:
 * Smoothly synchronizes any legacy hash-based links/bookmarks (e.g., #/seller/dashboard, #/buyer/explore)
 * directly into the unified BrowserRouter path structure without full page reloads.
 */
function LegacyHashSync() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/')) {
      const targetPath = hash.slice(1);
      window.history.replaceState(null, '', targetPath);
      navigate(targetPath, { replace: true });
    }
  }, [navigate, location]);

  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LegacyHashSync />
      <App />
    </BrowserRouter>
  </StrictMode>
);
