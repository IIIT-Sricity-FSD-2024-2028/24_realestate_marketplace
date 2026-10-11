import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import UserManagement from './pages/UserManagement.jsx';
import PropertyVerification from './pages/PropertyVerification.jsx';
import ManageListings from './pages/ManageListings.jsx';
import CurrentBuyers from './pages/CurrentBuyers.jsx';
import CurrentSellers from './pages/CurrentSellers.jsx';
import ExploreSellers from './pages/ExploreSellers.jsx';
import ScheduledVisits from './pages/ScheduledVisits.jsx';
import Negotiations from './pages/Negotiations.jsx';
import PurchaseTracking from './pages/PurchaseTracking.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';

/**
 * Route table of the admin portal.
 * /login is public; every other route sits behind ProtectedRoute (admin role
 * only) inside AdminLayout (sidebar + page). Each old dashboard section is
 * now its own route, so a reload keeps the admin on the same section.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/property-verification" element={<PropertyVerification />} />
        <Route path="/listings" element={<ManageListings />} />
        <Route path="/buyers" element={<CurrentBuyers />} />
        <Route path="/sellers" element={<CurrentSellers />} />
        <Route path="/explore-sellers" element={<ExploreSellers />} />
        <Route path="/visits" element={<ScheduledVisits />} />
        <Route path="/negotiations" element={<Negotiations />} />
        <Route path="/purchases" element={<PurchaseTracking />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      {/* Anything else → dashboard (which itself redirects to login if signed out). */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
