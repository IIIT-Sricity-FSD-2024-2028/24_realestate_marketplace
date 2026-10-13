import { getUser } from '../api/session.js';

/**
 * Full-screen notice shown when this tab's session ended or switched to a
 * different account while the superuser dashboard was open.
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
            <>This tab is now signed in as <strong>{who}</strong>, but it is still showing the superuser dashboard, so anything you do here would run as the wrong account.</>
          ) : 'You are no longer signed in as superuser on this tab.'}
        </p>
        <button type="button" className="btn btn-primary btn-block" onClick={() => window.location.reload()}>
          Reload this page
        </button>
      </div>
    </div>
  );
}
