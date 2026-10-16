/**
 * DealProgress.jsx
 * Purpose: The 5-step purchase tracker (Offer Accepted → Registration) shown
 *          to admins (Purchase Tracking) and buyers (Purchase Initiation).
 * Inputs (props): step – current step number 1..5
 *                 status – 'in_progress' | 'completed' | 'cancelled'
 *                 title – small heading above the steps
 * Outputs: an ordered list of steps with done / current / upcoming styling.
 * API calls: none.
 */
import { DEAL_STEPS } from '../../utils/constants.js';
import './DealProgress.css';

export default function DealProgress({ step, status, title = 'DEAL PROGRESS' }) {
  const current = Math.min(DEAL_STEPS.length, Number(step) || 1); // clamp to 1..5
  const completed = status === 'completed';
  return (
    <div className="deal-progress">
      <p className="deal-progress-title">{title}</p>
      <ol className="deal-steps">
        {DEAL_STEPS.map((name, index) => {
          const number = index + 1;
          // Done = earlier step, or every step once the deal completed.
          const done = number < current || completed;
          const isCurrent = number === current && status === 'in_progress';
          const state = done ? 'done' : isCurrent ? 'current' : 'todo';
          return (
            <li key={name} className={'deal-step deal-step-' + state} aria-current={isCurrent ? 'step' : undefined}>
              <span className="deal-dot">{done ? '✓' : number}</span>
              <span className="deal-name">{name}</span>
              {/* Connector line to the next step (green when this one is done). */}
              {index < DEAL_STEPS.length - 1 && <span className={'deal-line' + (number < current ? ' deal-line-done' : '')} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
