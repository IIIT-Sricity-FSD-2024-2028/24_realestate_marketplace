import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './styles/seller.css';

// Entry point. HashRouter (#/dashboard, #/my-listings …) is used because the backend
// serves this build as plain static files — no server-side route fallback is
// needed, so the NestJS backend stays completely unchanged.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </HashRouter>
  </StrictMode>
);
