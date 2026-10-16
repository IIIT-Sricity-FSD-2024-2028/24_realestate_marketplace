/**
 * SiteHeader.jsx
 * Purpose: Public-site top bar with the truEstate logo and a login button.
 * Inputs (props): onLogin – click handler for "Login / Sign Up".
 * Outputs: <header> element.
 * API calls: none.
 */
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';

export default function SiteHeader({ onLogin }) {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link to="/" className="brand" aria-label="truEstate home">
          <span className="logo-icon">
            <Icon name="home" size="1.5rem" />
          </span>
          <span>
            <span className="brand-name">truEstate</span>
            <span className="brand-tagline">Premium Real Estate Platform</span>
          </span>
        </Link>
        <button type="button" className="btn btn-primary" onClick={onLogin}>
          Login / Sign Up
        </button>
      </div>
    </header>
  );
}
