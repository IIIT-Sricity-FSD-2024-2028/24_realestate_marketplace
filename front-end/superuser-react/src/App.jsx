import { Navigate, Route, Routes } from 'react-router-dom';
import SuperuserLayout from './components/SuperuserLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardOverview from './pages/DashboardOverview.jsx';
import UserManagement from './pages/UserManagement.jsx';
import PropertyOperations from './pages/PropertyOperations.jsx';
import Revenue from './pages/Revenue.jsx';
import SystemLogs from './pages/SystemLogs.jsx';
import SystemSettings from './pages/SystemSettings.jsx';

/**
 * Route table of the superuser portal.
 * /login is public. Every other route sits behind ProtectedRoute (superuser role
 * only) inside SuperuserLayout (sidebar + active page).
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <SuperuserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/properties" element={<PropertyOperations />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/logs" element={<SystemLogs />} />
        <Route path="/settings" element={<SystemSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
