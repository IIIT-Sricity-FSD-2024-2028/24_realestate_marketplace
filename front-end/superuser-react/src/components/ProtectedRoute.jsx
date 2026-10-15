import { Navigate, useLocation } from 'react-router-dom';
import { isSuperuserSession } from '../api/session.js';

/**
 * Route guard (RBAC): Only accounts with role === 'superuser' can access
 * the superuser portal. Others are redirected to the login page.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const prefix = location.pathname.startsWith('/superuser') ? '/superuser' : '';
  if (!isSuperuserSession()) {
    return <Navigate to={`${prefix}/login`} replace />;
  }
  return children;
}
