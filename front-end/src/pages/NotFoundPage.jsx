/**
 * NotFoundPage.jsx
 * Purpose: Shown for any URL that is neither a page nor an old .html link.
 * Inputs:  none.
 * Outputs: a short message with links back into the app.
 * API calls: none.
 */
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="staff-login-page">
      <div className="staff-login-card center">
        <h1 className="page-title">Page not found</h1>
        <p className="text-secondary mb-3">The page you asked for doesn&apos;t exist.</p>
        <div className="button-row center-row">
          <Link className="btn btn-primary" to="/">
            Go to home
          </Link>
          <Link className="btn btn-secondary" to="/login">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
