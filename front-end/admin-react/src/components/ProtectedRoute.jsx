import { Navigate, useLocation } from 'react-router-dom';
import { isAdminSession } from '../api/session.js';

/**
 * Route guard (RBAC). Only a session whose role is exactly "admin" may open
 * the dashboard — anyone else is sent to the admin login, just like
 * TruEstate.requireAuth('admin') did. The backend still enforces the role on
 * every API call; this only keeps the UI out of reach.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const prefix = location.pathname.startsWith('/admin') ? '/admin' : '';
  if (!isAdminSession()) return <Navigate to={`${prefix}/login`} replace />;
  return children;
}
