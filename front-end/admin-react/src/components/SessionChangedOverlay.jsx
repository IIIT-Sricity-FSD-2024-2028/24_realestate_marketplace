import { getUser } from '../api/session.js';

/**
 * Full-screen notice shown when this tab's session ended or switched to a
 * different account while the admin dashboard was open (port of
 * TruEstate.onSessionChanged). The only way forward is to reload.
 */
export default function SessionChangedOverlay() {
  const user = getUser();
  const who = user && user.name ? `${user.name} (${user.role})` : null;

  return (
    <div className="session-overlay">
      <div className="session-overlay__card">
        <h2>This session changed</h2>
        <p>
          {who ? (
            <>This tab is now signed in as <strong>{who}</strong>, but it is still showing the admin dashboard, so anything you do here would run as the wrong account.</>
          ) : 'You are no longer signed in on this tab.'}
        </p>
        <button type="button" className="btn btn-primary btn-block" onClick={() => window.location.reload()}>
          Reload this page
        </button>
      </div>
    </div>
  );
}
