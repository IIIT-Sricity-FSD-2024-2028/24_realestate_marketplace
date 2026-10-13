import { Navigate, Route, Routes } from 'react-router-dom';
import SellerLayout from './components/SellerLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { SessionProvider } from './context/SessionContext.jsx';
import { SellerProfileProvider } from './context/SellerProfileContext.jsx';
import { CheckoutProvider } from './context/CheckoutContext.jsx';

import LoginPage from './pages/LoginPage.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import MyListings from './pages/MyListings.jsx';
import AddProperty from './pages/AddProperty.jsx';
import Negotiations from './pages/Negotiations.jsx';
import TrackPayments from './pages/TrackPayments.jsx';
import SoldProperties from './pages/SoldProperties.jsx';
import RentGivenProperties from './pages/RentGivenProperties.jsx';
import BillingPlans from './pages/BillingPlans.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <SessionProvider>
              <SellerProfileProvider>
                <CheckoutProvider>
                  <SellerLayout />
                </CheckoutProvider>
              </SellerProfileProvider>
            </SessionProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/negotiate" element={<Negotiations />} />
        <Route path="/track-payment" element={<TrackPayments />} />
        <Route path="/sold" element={<SoldProperties />} />
        <Route path="/rent-given" element={<RentGivenProperties />} />
        <Route path="/billing" element={<BillingPlans />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
