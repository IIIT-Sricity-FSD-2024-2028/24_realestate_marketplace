import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BuyerLayout from './components/BuyerLayout.jsx';
import { SessionProvider } from './context/SessionContext.jsx';
import { BuyerProfileProvider } from './context/BuyerProfileContext.jsx';
import { CheckoutProvider } from './context/CheckoutContext.jsx';

import LoginPage from './pages/LoginPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import ShortlistPage from './pages/ShortlistPage.jsx';
import VisitStatusPage from './pages/VisitStatusPage.jsx';
import UnderConsiderationPage from './pages/UnderConsiderationPage.jsx';
import NegotiationsPage from './pages/NegotiationsPage.jsx';
import PurchaseInitiationPage from './pages/PurchaseInitiationPage.jsx';
import RentedPropertiesPage from './pages/RentedPropertiesPage.jsx';
import PurchasedPropertiesPage from './pages/PurchasedPropertiesPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <SessionProvider>
              <BuyerProfileProvider>
                <CheckoutProvider>
                  <BuyerLayout />
                </CheckoutProvider>
              </BuyerProfileProvider>
            </SessionProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/shortlist" element={<ShortlistPage />} />
        <Route path="/visit-status" element={<VisitStatusPage />} />
        <Route path="/under-consideration" element={<UnderConsiderationPage />} />
        <Route path="/negotiate" element={<NegotiationsPage />} />
        <Route path="/purchase-initiation" element={<PurchaseInitiationPage />} />
        <Route path="/rented" element={<RentedPropertiesPage />} />
        <Route path="/purchased" element={<PurchasedPropertiesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Default fallback: redirect to explore */}
      <Route path="*" element={<Navigate to="/explore" replace />} />
    </Routes>
  );
}
