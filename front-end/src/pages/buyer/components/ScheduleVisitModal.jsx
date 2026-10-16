/**
 * ScheduleVisitModal.jsx
 * Purpose: "Choose Visit Date & Time" — a month calendar (Monday first, past
 *          days disabled), six time slots and an optional message to the admin
 *          team who will accompany the buyer.
 * Inputs (props): card – listing (null = closed); onClose; onRequested()
 * Outputs: the dialog; toasts on validation / API errors.
 * API calls: POST /visits { propertyId, requestedDate: 'YYYY-MM-DD', requestedSlot, message? }
 */
import { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { visitsApi } from '../../../api/services.js';
import { VISIT_SLOTS } from '../../../utils/constants.js';
import './ScheduleVisitModal.css';

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

/** Builds the calendar cells for a month: leading blanks + day numbers. */
export function monthCells(year, month) {
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const offset = firstDay === 0 ? 6 : firstDay - 1; // shift so Monday is first
  const days = new Date(year, month + 1, 0).getDate();
  return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
}

/** YYYY-MM-DD for the backend. */
export function isoDate(year, month, day) {
  return year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
}

export default function ScheduleVisitModal({ card, onClose, onRequested }) {
  const { showToast } = useToast();
  const [view, setView] = useState(() => new Date()); // month on screen
  const [day, setDay] = useState(null);
  const [slot, setSlot] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Reset each time the dialog opens.
  useEffect(() => {
    if (card) {
      setView(new Date());
      setDay(null);
      setSlot(null);
      setMessage('');
    }
  }, [card]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const changeMonth = (delta) => {
    setView(new Date(year, month + delta, 1));
    setDay(null); // a picked day belongs to the old month
  };

  const confirm = async () => {
    if (!day) return showToast('⚠️ Please pick a date for the visit.', 'error');
    if (!slot) return showToast('⚠️ Please pick a time slot for the visit.', 'error');
    setSending(true);
    try {
      await visitsApi.create({ propertyId: card.id, requestedDate: isoDate(year, month, day), requestedSlot: slot, message: message.trim() || undefined });
      showToast('📅 Visit requested for ' + card.title + '! An admin will confirm shortly.');
      onRequested();
    } catch (err) {
      showToast(err.message || 'Failed to schedule the visit', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open={!!card} onClose={onClose} title="Choose Visit Date & Time">
      {card && (
        <>
          <p className="text-secondary small mb-3">{card.title} — an admin from our team will accompany you on the visit.</p>
          <div className="calendar">
            <div className="calendar-head">
              <button type="button" className="icon-btn" onClick={() => changeMonth(-1)} aria-label="Previous month">
                ‹
              </button>
              <span className="strong" aria-live="polite">
                {view.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }).toUpperCase()}
              </span>
              <button type="button" className="icon-btn" onClick={() => changeMonth(1)} aria-label="Next month">
                ›
              </button>
            </div>
            <div className="calendar-grid" role="grid" aria-label="Choose a day">
              {WEEKDAYS.map((w) => (
                <div key={w} className="calendar-weekday" role="columnheader">
                  {w}
                </div>
              ))}
              {monthCells(year, month).map((d, i) => {
                if (!d) return <div key={'blank-' + i} />;
                const date = new Date(year, month, d);
                const past = date < startOfToday; // can't visit in the past
                const isToday = date.getTime() === startOfToday.getTime();
                return (
                  <button
                    key={d}
                    type="button"
                    className={'calendar-day' + (d === day ? ' selected' : '') + (isToday ? ' today' : '')}
                    disabled={past}
                    aria-pressed={d === day}
                    aria-label={date.toDateString()}
                    onClick={() => setDay(d)}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
          <fieldset className="slot-grid">
            <legend className="eyebrow">Available Slots</legend>
            {VISIT_SLOTS.map((s) => (
              <button key={s} type="button" className={'slot-btn' + (slot === s ? ' selected' : '')} aria-pressed={slot === s} onClick={() => setSlot(s)}>
                {s}
              </button>
            ))}
          </fieldset>
          <div className="form-group">
            <label className="form-label" htmlFor="sv-message">
              Message to Admin (Optional)
            </label>
            <textarea
              id="sv-message"
              className="form-control"
              rows={3}
              maxLength={500}
              placeholder="e.g. I'm particularly interested in the kitchen size and natural light..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="button-row">
            <button type="button" className="btn btn-secondary grow" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary grow-2" onClick={confirm} disabled={sending}>
              {sending ? 'Sending…' : 'Confirm Request'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
