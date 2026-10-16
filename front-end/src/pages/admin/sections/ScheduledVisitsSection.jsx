/**
 * ScheduledVisitsSection.jsx
 * Purpose: "Scheduled Visits" — site visits buyers requested in this city.
 *          Any admin can confirm, reschedule, mark completed or cancel.
 * Inputs (props): desk – shared visits + reload
 * Outputs: Upcoming / Completed / Cancelled tabs, a visit list, and a
 *          reschedule dialog (date picker + slot — replaces two prompts).
 * API calls: PATCH /visits/:id/confirm | /reschedule | /complete | /cancel,
 *            GET /visits/review-queue (via desk.reload)
 */
import { useState } from 'react';
import { PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import Modal from '../../../components/common/Modal.jsx';
import { FormField } from '../../../components/forms/FormControls.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { useDialog } from '../../../components/feedback/DialogProvider.jsx';
import { visitsApi } from '../../../api/services.js';
import { joinPlace } from '../../../utils/format.js';
import { VISIT_SLOTS } from '../../../utils/constants.js';
import './ScheduledVisitsSection.css';

// Tab → which visit statuses it shows.
const TABS = [
  { key: 'upcoming', label: 'Upcoming', statuses: ['pending', 'confirmed', 'rescheduled'] },
  { key: 'completed', label: 'Completed', statuses: ['completed'] },
  { key: 'failed', label: 'Cancelled', statuses: ['cancelled'] },
];
const STATUS_META = {
  pending: { cls: 'text-warning', text: '⏳ Pending' },
  confirmed: { cls: 'text-brand', text: '● Confirmed' },
  rescheduled: { cls: 'text-info', text: '↺ Rescheduled' },
  completed: { cls: 'text-brand', text: '✅ Completed' },
  cancelled: { cls: 'text-danger', text: '✕ Cancelled' },
};

/** Today as YYYY-MM-DD (earliest date a visit can be moved to). */
function todayIso() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export default function ScheduledVisitsSection({ desk }) {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [tab, setTab] = useState('upcoming');
  const [busyId, setBusyId] = useState(null);
  const [moving, setMoving] = useState(null); // visit being rescheduled
  const [slot, setSlot] = useState({ date: '', time: '' });
  const [slotError, setSlotError] = useState('');

  const statuses = TABS.find((t) => t.key === tab).statuses;
  const visits = desk.visits.filter((v) => statuses.includes(v.status));

  /** Runs one visit action, then refreshes the queue. */
  const act = async (visit, call, success, failure) => {
    setBusyId(visit.id);
    try {
      await call();
      showToast(success);
      await desk.reload('visits');
    } catch (err) {
      showToast(err.message || failure, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (v) => {
    if (!(await confirm({ message: 'Cancel this visit?', confirmText: 'Cancel visit', cancelText: 'Keep it', danger: true }))) return;
    act(v, () => visitsApi.cancel(v.id), 'Visit cancelled', 'Failed to cancel visit');
  };

  const openReschedule = (v) => {
    setMoving(v);
    setSlot({ date: '', time: VISIT_SLOTS.includes(v.requestedSlot) ? v.requestedSlot : '' });
    setSlotError('');
  };

  const saveReschedule = async (event) => {
    event.preventDefault();
    if (!slot.date) return setSlotError('Please pick a new visit date.');
    if (slot.date < todayIso()) return setSlotError('The new date cannot be in the past.');
    if (!slot.time) return setSlotError('Please pick a time slot.');
    const v = moving;
    setMoving(null);
    act(v, () => visitsApi.reschedule(v.id, slot.date, slot.time), 'Visit rescheduled', 'Failed to reschedule visit');
  };

  return (
    <>
      <PageHeader title="Scheduled Visits" subtitle="Site visits buyers have requested — any admin can confirm and conduct these visits, not the seller." />
      <div className="content">
        <div className="tab-bar" role="tablist" aria-label="Visit status">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={'tab' + (tab === t.key ? ' tab-active' : '')}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="table-card">
          <h2 className="table-card-title">Visits</h2>
          <StatusLine loading={desk.loading.visits && !desk.visits.length} error={desk.errors.visits} />
          {!desk.loading.visits && visits.length === 0 && <p className="state-line">No visits here.</p>}
          <ul className="row-list">
            {visits.map((v) => {
              const meta = STATUS_META[v.status] || STATUS_META.pending;
              const open = ['pending', 'confirmed', 'rescheduled'].includes(v.status);
              return (
                <li key={v.id} className="row-item">
                  <div>
                    <h3 className="strong">{v.propertyTitle || 'Property'}</h3>
                    <p className="text-secondary small">
                      📍 {joinPlace(v.propertyCity, v.propertyState)} · Buyer: {v.buyerName || 'Unknown'} ({v.buyerEmail || ''})
                    </p>
                    <p className="text-secondary small">
                      📅 {v.requestedDate} &nbsp; 🕐 {v.requestedSlot}
                    </p>
                    {v.message && <p className="text-muted small italic">&ldquo;{v.message}&rdquo;</p>}
                  </div>
                  <div className="action-row wrap">
                    <span className={'strong small ' + meta.cls}>{meta.text}</span>
                    {open ? (
                      <>
                        {v.status === 'pending' && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={busyId === v.id}
                            onClick={() => act(v, () => visitsApi.confirm(v.id), 'Visit confirmed', 'Failed to confirm visit')}
                          >
                            Confirm
                          </button>
                        )}
                        <button type="button" className="btn btn-secondary btn-sm" disabled={busyId === v.id} onClick={() => openReschedule(v)}>
                          Reschedule
                        </button>
                        {v.status !== 'pending' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-green"
                            disabled={busyId === v.id}
                            onClick={() => act(v, () => visitsApi.complete(v.id), 'Visit marked completed', 'Failed to update visit')}
                          >
                            Mark Completed
                          </button>
                        )}
                        <button type="button" className="btn btn-danger btn-sm" disabled={busyId === v.id} onClick={() => cancel(v)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <span className="text-secondary small">Closed</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <Modal open={!!moving} onClose={() => setMoving(null)} title="Reschedule visit" size="sm">
        {moving && (
          <form onSubmit={saveReschedule} noValidate>
            <p className="text-secondary small mb-3">{moving.propertyTitle}</p>
            <FormField id="resched-date" label="New visit date">
              <input
                id="resched-date"
                type="date"
                className="form-control"
                min={todayIso()}
                value={slot.date}
                onChange={(e) => setSlot((s) => ({ ...s, date: e.target.value }))}
              />
            </FormField>
            <fieldset className="slot-grid">
              <legend className="form-label">New time slot</legend>
              {VISIT_SLOTS.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={'slot-btn' + (slot.time === time ? ' selected' : '')}
                  aria-pressed={slot.time === time}
                  onClick={() => setSlot((s) => ({ ...s, time }))}
                >
                  {time}
                </button>
              ))}
            </fieldset>
            {slotError && (
              <p className="form-problem" role="alert">
                {slotError}
              </p>
            )}
            <div className="button-row">
              <button type="submit" className="btn btn-primary grow">
                Save new slot
              </button>
              <button type="button" className="btn btn-secondary grow" onClick={() => setMoving(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
