import { Navigate, useLocation } from 'react-router-dom';
import { isSellerSession } from '../api/session.js';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const prefix = location.pathname.startsWith('/seller') ? '/seller' : '';
  if (!isSellerSession()) {
    if (prefix) {
      return <Navigate to={`${prefix}/login`} replace />;
    }
    const target = window.location.port === '5175'
      ? 'http://127.0.0.1:3000/index.html#login'
      : '../index.html#login';
    window.location.replace(target);
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#9ca3af', fontFamily: 'sans-serif' }}>
        <p>Redirecting to login...</p>
      </div>
    );
  }
  return children;
}
