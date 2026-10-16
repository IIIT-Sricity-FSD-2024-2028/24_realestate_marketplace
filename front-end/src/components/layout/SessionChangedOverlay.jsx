/**
 * SessionChangedOverlay.jsx
 * Purpose: Freezes a dashboard whose tab session vanished or switched to a
 *          different account (old TruEstate.onSessionChanged), so nothing can
 *          be done "as the wrong person".
 * Inputs (props): role – which dashboard this is (for the message).
 * Outputs: a full-screen blocking panel with a Reload button.
 * API calls: none.
 */
import { getUser } from '../../auth/session.js';
import './SessionChangedOverlay.css';

export default function SessionChangedOverlay({ role }) {
  const user = getUser(); // whoever is signed in on this tab now (maybe nobody)
  const who = user && user.name ? user.name + ' (' + user.role + ')' : null;
  return (
    <div className="session-overlay" role="alertdialog" aria-modal="true" aria-labelledby="session-changed-title">
      <div className="session-box">
        <h2 id="session-changed-title">This session changed</h2>
        <p>
          {who ? (
            <>
              This tab is now signed in as <strong>{who}</strong>, but it is still showing the {role || 'previous'} dashboard, so anything you do here would run
              as the wrong account.
            </>
          ) : (
            'You are no longer signed in on this tab.'
          )}
        </p>
        <button type="button" className="btn btn-primary btn-block" onClick={() => window.location.reload()}>
          Reload this page
        </button>
      </div>
    </div>
  );
}
