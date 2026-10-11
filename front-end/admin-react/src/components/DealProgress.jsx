import { Fragment } from 'react';

// The five steps every purchase moves through, in order.
export const DEAL_STEPS = ['Offer Accepted', 'Document Verification', 'Token Payment', 'Full Payment', 'Registration'];

/**
 * Horizontal 5-step tracker for a purchase.
 * Done steps are green with a ✓, the current step (while in progress) is
 * orange, later steps are grey. Connecting lines turn green once passed.
 */
export default function DealProgress({ step, dealStatus }) {
  return (
    <div className="deal-progress">
      <p className="deal-progress__label">DEAL PROGRESS</p>
      <div className="deal-progress__track">
        {DEAL_STEPS.map((name, i) => {
          const n = i + 1;
          const done = n < step || dealStatus === 'completed';
          const current = n === step && dealStatus === 'in_progress';
          return (
            <Fragment key={name}>
              <div className="deal-step">
                <div className={'deal-step__dot' + (done ? ' is-done' : current ? ' is-current' : '')}>{done ? '✓' : n}</div>
                <div className="deal-step__name">{name}</div>
              </div>
              {i < DEAL_STEPS.length - 1 && <div className={'deal-progress__line' + (n < step ? ' is-done' : '')} />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
