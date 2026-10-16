/**
 * App.jsx
 * Purpose: Root component — wraps the app in shared providers (toasts,
 *          dialogs, payments) and maps every URL to a page.
 * Inputs:  the current URL (from BrowserRouter in main.jsx).
 * Outputs: the matching page component.
 * API calls: none.
 *
 * Old static file → React route:
 *   index.html                        → /            (LandingPage) and /login (AuthPage)
 *   admin-login.html                  → /admin/login (AdminLoginPage)
 *   superuser-login.html              → /superuser/login (SuperuserLoginPage)
 *   Buyer Dashboard - truEstate.html  → /buyer/:section (BuyerDashboardPage)
 *   seller-dashboard.html             → /seller/:section (SellerDashboardPage)
 *   admin-dashboard.html              → /admin/:section (AdminDashboardPage)
 *   superuser-dashboard.html          → /superuser/:section (SuperuserDashboardPage)
 * The old .html URLs still work: LegacyRedirect forwards them.
 */
import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/feedback/ToastProvider.jsx';
import { DialogProvider } from './components/feedback/DialogProvider.jsx';
import { PaymentProvider } from './components/payments/PaymentProvider.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import SuperuserLoginPage from './pages/SuperuserLoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Dashboards are loaded on demand: a visitor on the home page never
// downloads the admin or superuser code.
const BuyerDashboardPage = lazy(() => import('./pages/buyer/BuyerDashboardPage.jsx'));
const SellerDashboardPage = lazy(() => import('./pages/seller/SellerDashboardPage.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
const SuperuserDashboardPage = lazy(() => import('./pages/superuser/SuperuserDashboardPage.jsx'));

/** Shown for a moment while a dashboard's code downloads. */
function PageLoading() {
  return (
    <p className="state-line" role="status">
      Loading…
    </p>
  );
}

// Old static page names → their new routes (bookmarks keep working).
export const LEGACY_PATHS = {
  '/index.html': '/',
  '/admin-login.html': '/admin/login',
  '/superuser-login.html': '/superuser/login',
  '/admin-dashboard.html': '/admin',
  '/seller-dashboard.html': '/seller',
  '/superuser-dashboard.html': '/superuser',
  '/buyer dashboard - truestate.html': '/buyer',
};

/** Forwards a legacy .html URL to its React route, otherwise shows 404. */
function LegacyRedirect() {
  const location = useLocation();
  // "%20" etc. are decoded and case is ignored before the lookup.
  const path = decodeURIComponent(location.pathname).toLowerCase();
  const target = LEGACY_PATHS[path];
  if (target) return <Navigate to={target} replace />;
  return <NotFoundPage />;
}

export default function App() {
  return (
    <ToastProvider>
      <DialogProvider>
        <PaymentProvider>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              {/* Public pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/superuser/login" element={<SuperuserLoginPage />} />

              {/* Dashboards — each guarded by role; ":section" picks the tab. */}
              <Route
                path="/buyer/:section?"
                element={
                  <ProtectedRoute role="buyer">
                    <BuyerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/:section?"
                element={
                  <ProtectedRoute role="seller">
                    <SellerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/:section?"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superuser/:section?"
                element={
                  <ProtectedRoute role="superuser">
                    <SuperuserDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Everything else: old .html links or a real 404. */}
              <Route path="*" element={<LegacyRedirect />} />
            </Routes>
          </Suspense>
        </PaymentProvider>
      </DialogProvider>
    </ToastProvider>
  );
}
