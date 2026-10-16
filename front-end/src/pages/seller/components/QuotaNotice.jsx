/**
 * QuotaNotice.jsx
 * Purpose: Shows the seller's plan quota up front (before they fill a long
 *          form), plus the dialog shown when the API refuses a listing with
 *          402 because the plan is full.
 * Inputs (props):
 *   QuotaNotice       – billing (GET /billing/summary data), listings, onUpgrade()
 *   QuotaUpgradeModal – open, message, planName, onUpgrade(), onClose()
 * Outputs: banner / dialog JSX.
 * API calls: none.
 *
 * `listingsUsed` comes from the server so this banner can never disagree with
 * what the API will allow. Sold/rented listings still occupy a slot.
 */
import Modal from '../../../components/common/Modal.jsx';
import './QuotaNotice.css';

export function QuotaNotice({ billing, listings, onUpgrade }) {
  const plan = billing && billing.plan;
  if (!plan) return null; // billing not loaded yet
  const closed = listings.filter((p) => p.status === 'sold' || p.status === 'rented').length;
  const quota = plan.listingQuota; // null = unlimited
  const used = plan.listingsUsed;
  const full = quota !== null && used >= quota;
  return (
    <div className={'quota-notice' + (full ? ' full' : '')} role="status">
      <div className="quota-notice-main">
        <strong>{plan.planName} plan</strong> ·{' '}
        {quota === null
          ? 'unlimited properties'
          : used +
            ' of ' +
            quota +
            ' propert' +
            (quota === 1 ? 'y' : 'ies') +
            ' used' +
            (full ? ' — you have reached your limit' : ' · ' + (quota - used) + ' remaining')}
      </div>
      {quota !== null && closed > 0 && (
        <span className="quota-notice-sub">
          Includes {closed} sold/rented listing{closed === 1 ? '' : 's'} — a closed deal keeps its slot. Delete a listing to free one.
        </span>
      )}
      {full && (
        <button type="button" className="quota-notice-btn" onClick={onUpgrade}>
          Upgrade plan
        </button>
      )}
    </div>
  );
}

export function QuotaUpgradeModal({ open, message, planName, onUpgrade, onClose }) {
  return (
    <Modal open={open} onClose={onClose} size="sm" title="You have used every slot on your plan">
      <div className="lock-icon" aria-hidden="true">
        🔒
      </div>
      <p className="text-secondary mb-3">{message}</p>
      <p className="text-muted small mb-3">
        Your details are still filled in — upgrade and submit again, or delete a listing you no longer need. Sold listings still count towards your limit.
      </p>
      <button type="button" className="btn btn-primary btn-block" onClick={onUpgrade}>
        See plans{planName ? ' — you are on ' + planName : ''}
      </button>
      <button type="button" className="btn btn-link btn-block" onClick={onClose}>
        Not now
      </button>
    </Modal>
  );
}
