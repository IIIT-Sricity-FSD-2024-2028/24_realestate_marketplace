import { Navigate, useLocation } from 'react-router-dom';
import { getUser, isBuyerSession } from '../api/session.js';

export default function ProtectedRoute({ children }) {
  const user = getUser();
  const location = useLocation();
  const prefix = location.pathname.startsWith('/buyer') ? '/buyer' : '';
  if (!user || !isBuyerSession(user)) {
    return <Navigate to={`${prefix}/login`} replace />;
  }
  return children;
}
