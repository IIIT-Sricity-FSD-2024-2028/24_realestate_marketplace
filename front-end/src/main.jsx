/**
 * main.jsx
 * Purpose: Entry point — mounts the React app into <div id="root">.
 * Inputs:  none.
 * Outputs: renders <App /> wrapped in the browser router.
 * API calls: none.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
// Global design tokens, layout and component styles (shared by every page).
import './styles/global.css';

// Find the empty div from index.html and hand it to React.
createRoot(document.getElementById('root')).render(
  // StrictMode surfaces unsafe patterns during development only.
  <StrictMode>
    {/* BrowserRouter keeps the URL in sync with the page being shown. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
