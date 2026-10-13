import { Navigate } from 'react-router-dom';
import { isSuperuserSession } from '../api/session.js';

/**
 * Route guard (RBAC): Only accounts with role === 'superuser' can access
 * the superuser portal. Others are redirected to the login page.
 */
export default function ProtectedRoute({ children }) {
  if (!isSuperuserSession()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
