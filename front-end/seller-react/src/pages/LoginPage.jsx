import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
    const target = window.location.port === '5175'
      ? 'http://127.0.0.1:3000/index.html#login'
      : '../index.html#login';
    window.location.replace(target);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#9ca3af', fontFamily: 'sans-serif' }}>
      <p>Redirecting to <a href="../index.html#login" style={{ color: '#1DB954' }}>login page</a>...</p>
    </div>
  );
}
