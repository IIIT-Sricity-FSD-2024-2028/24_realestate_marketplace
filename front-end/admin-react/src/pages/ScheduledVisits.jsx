import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import StateMessage, { DataState } from '../components/StateMessage.jsx';
import { cancelVisit, completeVisit, confirmVisit, getVisitQueue, rescheduleVisit } from '../api/adminApi.js';
import { useToast } from '../context/ToastContext.jsx';
import useAdminData from '../hooks/useAdminData.js';

// Which visit statuses each tab shows.
const TABS = [
  { key: 'upcoming', label: 'Upcoming', statuses: ['pending', 'confirmed', 'rescheduled'] },
  { key: 'completed', label: 'Completed', statuses: ['completed'] },
  { key: 'failed', label: 'Cancelled', statuses: ['cancelled'] },
];

const STATUS_META = {
  pending: { color: '#eab308', text: '⏳ Pending' },
  confirmed: { color: '#1DB954', text: '● Confirmed' },
  rescheduled: { color: '#3b82f6', text: '↺ Rescheduled' },
  completed: { color: '#1DB954', text: '✅ Completed' },
  cancelled: { color: '#ef4444', text: '✕ Cancelled' },
};

/**
 * Scheduled Visits (was data-section="schedule").
 * API: GET /visits/review-queue, and PATCH /visits/:id/confirm | /reschedule
 *      { requestedDate, requestedSlot } | /complete | /cancel.
 * Any admin can confirm and conduct a visit — not the seller.
 */
export default function ScheduledVisits() {
  const showToast = useToast();
  const { status, data, error, reload } = useAdminData(async () => (await getVisitQueue()).data.items);
  const [tab, setTab] = useState('upcoming');

  const statuses = TABS.find((t) => t.key === tab).statuses;
  const visible = (data || []).filter((v) => statuses.includes(v.status));

  // Runs a visit action, then reloads the queue — same toasts as before.
  const act = async (fn, success, failure) => {
    try {
      await fn();
      showToast(success);
      reload();
    } catch (err) {
      showToast(err.message || failure, 'error');
    }
  };

  const reschedule = (id) => {
    const requestedDate = window.prompt('New visit date (YYYY-MM-DD):');
    if (!requestedDate) return;
    const requestedSlot = window.prompt('New time slot (e.g. 2:00 PM):');
    if (!requestedSlot) return;
    act(() => rescheduleVisit(id, requestedDate, requestedSlot), 'Visit rescheduled', 'Failed to reschedule visit');
  };

  const cancel = (id) => {
    if (!window.confirm('Cancel this visit?')) return;
    act(() => cancelVisit(id), 'Visit cancelled', 'Failed to cancel visit');
  };

  return (
    <>
      <PageHeader title="Scheduled Visits" />
      <p className="page-note">Site visits buyers have requested — any admin can confirm and conduct these visits, not the seller.</p>

      <div className="visit-tabs">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={'tab-btn' + (tab === t.key ? ' active' : '')} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="visits-body">
        <div className="card visits-card">
          <div className="visits-card__head"><h2>Visits</h2></div>
          <DataState status={status} error={error} fallbackError="Couldn't load visits." />
          {status === 'ready' && visible.length === 0 && <StateMessage>No visits here.</StateMessage>}
          {status === 'ready' && visible.map((v) => {
            const meta = STATUS_META[v.status] || STATUS_META.pending;
            const location = [v.propertyCity, v.propertyState].filter(Boolean).join(', ');
            const open = ['pending', 'confirmed', 'rescheduled'].includes(v.status);
            return (
              <div key={v.id} className="visit-row">
                <div>
                  <h3 className="strong">{v.propertyTitle || 'Property'}</h3>
                  <p className="muted small-plus">📍 {location} · Buyer: {v.buyerName || 'Unknown'} ({v.buyerEmail || ''})</p>
                  <p className="muted small-plus" style={{ marginTop: '0.25rem' }}>📅 {v.requestedDate} &nbsp; 🕐 {v.requestedSlot}</p>
                  {v.message && <p className="quote">&quot;{v.message}&quot;</p>}
                </div>
                <div className="visit-row__actions">
                  <span className="strong small-plus" style={{ color: meta.color }}>{meta.text}</span>
                  {open ? (
                    <>
                      {v.status === 'pending' && (
                        <button type="button" className="btn btn-primary btn-md"
                          onClick={() => act(() => confirmVisit(v.id), 'Visit confirmed', 'Failed to confirm visit')}>Confirm</button>
                      )}
                      <button type="button" className="btn btn-secondary btn-md" onClick={() => reschedule(v.id)}>Reschedule</button>
                      {v.status !== 'pending' && (
                        <button type="button" className="btn btn-outline-green btn-md"
                          onClick={() => act(() => completeVisit(v.id), 'Visit marked completed', 'Failed to update visit')}>Mark Completed</button>
                      )}
                      <button type="button" className="btn btn-danger-soft btn-md" onClick={() => cancel(v.id)}>Cancel</button>
                    </>
                  ) : <span className="muted small-plus">Closed</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
