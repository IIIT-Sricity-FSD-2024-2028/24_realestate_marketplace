import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';

// =========================================================================
// Buyer Portal Components & Contexts
// =========================================================================
import BuyerLoginPage from '@buyer/pages/LoginPage.jsx';
import BuyerProtectedRoute from '@buyer/components/ProtectedRoute.jsx';
import BuyerLayout from '@buyer/components/BuyerLayout.jsx';
import { SessionProvider as BuyerSessionProvider } from '@buyer/context/SessionContext.jsx';
import { BuyerProfileProvider } from '@buyer/context/BuyerProfileContext.jsx';
import { CheckoutProvider as BuyerCheckoutProvider } from '@buyer/context/CheckoutContext.jsx';
import { ToastProvider as BuyerToastProvider } from '@buyer/context/ToastContext.jsx';

import BuyerExplorePage from '@buyer/pages/ExplorePage.jsx';
import BuyerShortlistPage from '@buyer/pages/ShortlistPage.jsx';
import BuyerVisitStatusPage from '@buyer/pages/VisitStatusPage.jsx';
import BuyerUnderConsiderationPage from '@buyer/pages/UnderConsiderationPage.jsx';
import BuyerNegotiationsPage from '@buyer/pages/NegotiationsPage.jsx';
import BuyerPurchaseInitiationPage from '@buyer/pages/PurchaseInitiationPage.jsx';
import BuyerRentedPropertiesPage from '@buyer/pages/RentedPropertiesPage.jsx';
import BuyerPurchasedPropertiesPage from '@buyer/pages/PurchasedPropertiesPage.jsx';
import BuyerPaymentsPage from '@buyer/pages/PaymentsPage.jsx';
import BuyerNotificationsPage from '@buyer/pages/NotificationsPage.jsx';
import BuyerProfilePage from '@buyer/pages/ProfilePage.jsx';

// =========================================================================
// Seller Portal Components & Contexts
// =========================================================================
import SellerProtectedRoute from '@seller/components/ProtectedRoute.jsx';
import SellerLayout from '@seller/components/SellerLayout.jsx';
import { SessionProvider as SellerSessionProvider } from '@seller/context/SessionContext.jsx';
import { SellerProfileProvider } from '@seller/context/SellerProfileContext.jsx';
import { CheckoutProvider as SellerCheckoutProvider } from '@seller/context/CheckoutContext.jsx';
import { ToastProvider as SellerToastProvider } from '@seller/context/ToastContext.jsx';

import SellerDashboardHome from '@seller/pages/DashboardHome.jsx';
import SellerMyListings from '@seller/pages/MyListings.jsx';
import SellerAddProperty from '@seller/pages/AddProperty.jsx';
import SellerNegotiations from '@seller/pages/Negotiations.jsx';
import SellerTrackPayments from '@seller/pages/TrackPayments.jsx';
import SellerSoldProperties from '@seller/pages/SoldProperties.jsx';
import SellerRentGivenProperties from '@seller/pages/RentGivenProperties.jsx';
import SellerBillingPlans from '@seller/pages/BillingPlans.jsx';
import SellerNotifications from '@seller/pages/Notifications.jsx';
import SellerProfile from '@seller/pages/Profile.jsx';

// =========================================================================
// Admin Portal Components & Contexts
// =========================================================================
import AdminLoginPage from '@admin/pages/LoginPage.jsx';
import AdminProtectedRoute from '@admin/components/ProtectedRoute.jsx';
import AdminLayout from '@admin/components/AdminLayout.jsx';
import { ToastProvider as AdminToastProvider } from '@admin/context/ToastContext.jsx';

import AdminDashboardHome from '@admin/pages/DashboardHome.jsx';
import AdminUserManagement from '@admin/pages/UserManagement.jsx';
import AdminPropertyVerification from '@admin/pages/PropertyVerification.jsx';
import AdminManageListings from '@admin/pages/ManageListings.jsx';
import AdminCurrentBuyers from '@admin/pages/CurrentBuyers.jsx';
import AdminCurrentSellers from '@admin/pages/CurrentSellers.jsx';
import AdminExploreSellers from '@admin/pages/ExploreSellers.jsx';
import AdminScheduledVisits from '@admin/pages/ScheduledVisits.jsx';
import AdminNegotiations from '@admin/pages/Negotiations.jsx';
import AdminPurchaseTracking from '@admin/pages/PurchaseTracking.jsx';
import AdminNotifications from '@admin/pages/Notifications.jsx';
import AdminProfile from '@admin/pages/Profile.jsx';

// =========================================================================
// Superuser Portal Components & Contexts
// =========================================================================
import SuperuserLoginPage from '@superuser/pages/LoginPage.jsx';
import SuperuserProtectedRoute from '@superuser/components/ProtectedRoute.jsx';
import SuperuserLayout from '@superuser/components/SuperuserLayout.jsx';
import { ToastProvider as SuperuserToastProvider } from '@superuser/context/ToastContext.jsx';

import SuperuserDashboardOverview from '@superuser/pages/DashboardOverview.jsx';
import SuperuserUserManagement from '@superuser/pages/UserManagement.jsx';
import SuperuserPropertyOperations from '@superuser/pages/PropertyOperations.jsx';
import SuperuserRevenue from '@superuser/pages/Revenue.jsx';
import SuperuserSystemLogs from '@superuser/pages/SystemLogs.jsx';
import SuperuserSystemSettings from '@superuser/pages/SystemSettings.jsx';

// =========================================================================
// Smart Role Redirect Helpers
// =========================================================================
function RoleDashboardRedirect() {
  try {
    const raw = sessionStorage.getItem('truEstate_user') || localStorage.getItem('truEstate_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.role === 'seller' || user?.userType === 'seller') return <Navigate to="/seller/dashboard" replace />;
      if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (user?.role === 'superuser') return <Navigate to="/superuser/dashboard" replace />;
      if (user?.role === 'buyer' || user?.userType === 'buyer') return <Navigate to="/buyer/explore" replace />;
    }
  } catch {}
  return <Navigate to="/login" replace />;
}

function RoleProfileRedirect() {
  try {
    const raw = sessionStorage.getItem('truEstate_user') || localStorage.getItem('truEstate_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.role === 'seller' || user?.userType === 'seller') return <Navigate to="/seller/profile" replace />;
      if (user?.role === 'admin') return <Navigate to="/admin/profile" replace />;
      if (user?.role === 'buyer' || user?.userType === 'buyer') return <Navigate to="/buyer/profile" replace />;
    }
  } catch {}
  return <Navigate to="/buyer/profile" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* =========================================================
          LANDING PAGE & PUBLIC ROUTES
          ========================================================= */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LandingPage openLoginOnMount={true} />} />

      {/* =========================================================
          BUYER PORTAL (/buyer/*)
          ========================================================= */}
      <Route
        path="/buyer/login"
        element={
          <BuyerToastProvider>
            <BuyerLoginPage />
          </BuyerToastProvider>
        }
      />
      <Route
        path="/buyer"
        element={
          <BuyerToastProvider>
            <BuyerProtectedRoute>
              <BuyerSessionProvider>
                <BuyerProfileProvider>
                  <BuyerCheckoutProvider>
                    <BuyerLayout />
                  </BuyerCheckoutProvider>
                </BuyerProfileProvider>
              </BuyerSessionProvider>
            </BuyerProtectedRoute>
          </BuyerToastProvider>
        }
      >
        <Route index element={<Navigate to="explore" replace />} />
        <Route path="explore" element={<BuyerExplorePage />} />
        <Route path="shortlist" element={<BuyerShortlistPage />} />
        <Route path="visit-status" element={<BuyerVisitStatusPage />} />
        <Route path="under-consideration" element={<BuyerUnderConsiderationPage />} />
        <Route path="negotiate" element={<BuyerNegotiationsPage />} />
        <Route path="purchase-initiation" element={<BuyerPurchaseInitiationPage />} />
        <Route path="rented" element={<BuyerRentedPropertiesPage />} />
        <Route path="purchased" element={<BuyerPurchasedPropertiesPage />} />
        <Route path="payments" element={<BuyerPaymentsPage />} />
        <Route path="notifications" element={<BuyerNotificationsPage />} />
        <Route path="profile" element={<BuyerProfilePage />} />
        <Route path="*" element={<Navigate to="explore" replace />} />
      </Route>

      {/* =========================================================
          SELLER PORTAL (/seller/*)
          ========================================================= */}
      <Route
        path="/seller/login"
        element={
          <SellerToastProvider>
            <LandingPage openLoginOnMount={true} initialRole="seller" />
          </SellerToastProvider>
        }
      />
      <Route
        path="/seller"
        element={
          <SellerToastProvider>
            <SellerProtectedRoute>
              <SellerSessionProvider>
                <SellerProfileProvider>
                  <SellerCheckoutProvider>
                    <SellerLayout />
                  </SellerCheckoutProvider>
                </SellerProfileProvider>
              </SellerSessionProvider>
            </SellerProtectedRoute>
          </SellerToastProvider>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SellerDashboardHome />} />
        <Route path="my-listings" element={<SellerMyListings />} />
        <Route path="add-property" element={<SellerAddProperty />} />
        <Route path="negotiate" element={<SellerNegotiations />} />
        <Route path="track-payment" element={<SellerTrackPayments />} />
        <Route path="sold" element={<SellerSoldProperties />} />
        <Route path="rent-given" element={<SellerRentGivenProperties />} />
        <Route path="billing" element={<SellerBillingPlans />} />
        <Route path="notifications" element={<SellerNotifications />} />
        <Route path="profile" element={<SellerProfile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* =========================================================
          ADMIN PORTAL (/admin/*)
          ========================================================= */}
      <Route
        path="/admin/login"
        element={
          <AdminToastProvider>
            <AdminLoginPage />
          </AdminToastProvider>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminToastProvider>
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          </AdminToastProvider>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardHome />} />
        <Route path="users" element={<AdminUserManagement />} />
        <Route path="property-verification" element={<AdminPropertyVerification />} />
        <Route path="listings" element={<AdminManageListings />} />
        <Route path="buyers" element={<AdminCurrentBuyers />} />
        <Route path="sellers" element={<AdminCurrentSellers />} />
        <Route path="explore-sellers" element={<AdminExploreSellers />} />
        <Route path="visits" element={<AdminScheduledVisits />} />
        <Route path="negotiations" element={<AdminNegotiations />} />
        <Route path="purchases" element={<AdminPurchaseTracking />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* =========================================================
          SUPERUSER PORTAL (/superuser/*)
          ========================================================= */}
      <Route
        path="/superuser/login"
        element={
          <SuperuserToastProvider>
            <SuperuserLoginPage />
          </SuperuserToastProvider>
        }
      />
      <Route
        path="/superuser"
        element={
          <SuperuserToastProvider>
            <SuperuserProtectedRoute>
              <SuperuserLayout />
            </SuperuserProtectedRoute>
          </SuperuserToastProvider>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperuserDashboardOverview />} />
        <Route path="users" element={<SuperuserUserManagement />} />
        <Route path="properties" element={<SuperuserPropertyOperations />} />
        <Route path="revenue" element={<SuperuserRevenue />} />
        <Route path="logs" element={<SuperuserSystemLogs />} />
        <Route path="settings" element={<SuperuserSystemSettings />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* =========================================================
          LEGACY ALIASES & DIRECT SHORTCUTS
          ========================================================= */}
      <Route path="/dashboard" element={<RoleDashboardRedirect />} />
      <Route path="/explore" element={<Navigate to="/buyer/explore" replace />} />
      <Route path="/profile" element={<RoleProfileRedirect />} />
      <Route path="/shortlist" element={<Navigate to="/buyer/shortlist" replace />} />
      <Route path="/visit-status" element={<Navigate to="/buyer/visit-status" replace />} />
      <Route path="/under-consideration" element={<Navigate to="/buyer/under-consideration" replace />} />
      <Route path="/negotiate" element={<Navigate to="/buyer/negotiate" replace />} />
      <Route path="/purchase-initiation" element={<Navigate to="/buyer/purchase-initiation" replace />} />
      <Route path="/rented" element={<Navigate to="/buyer/rented" replace />} />
      <Route path="/purchased" element={<Navigate to="/buyer/purchased" replace />} />
      <Route path="/payments" element={<Navigate to="/buyer/payments" replace />} />
      <Route path="/notifications" element={<Navigate to="/buyer/notifications" replace />} />
      <Route path="/my-listings" element={<Navigate to="/seller/my-listings" replace />} />
      <Route path="/add-property" element={<Navigate to="/seller/add-property" replace />} />
      <Route path="/track-payment" element={<Navigate to="/seller/track-payment" replace />} />
      <Route path="/property-verification" element={<Navigate to="/admin/property-verification" replace />} />
      <Route path="/revenue" element={<Navigate to="/superuser/revenue" replace />} />

      {/* Default Catch-all: Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
