/**
 * ProtectedRoute.jsx
 * Purpose: Route guard — only lets a signed-in account with the right role
 *          see a dashboard (replaces TruEstate.requireAuth(role)).
 * Inputs (props): role – 'buyer' | 'seller' | 'admin' | 'superuser'
 *                 children – the dashboard to show
 * Outputs: the children, or a redirect to the matching login page.
 * API calls: none (the token is checked by the API on every request).
 */
import { Navigate } from 'react-router-dom';
import { getUser, hasRoleAccess, loginPathForRole } from './session.js';

export default function ProtectedRoute({ role, children }) {
  const user = getUser(); // this tab's stored session
  if (!hasRoleAccess(user, role)) {
    // Wrong or missing account → send to the right login page.
    return <Navigate to={loginPathForRole(role)} replace />;
  }
  return children;
}
