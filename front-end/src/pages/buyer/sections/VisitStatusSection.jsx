/**
 * VisitStatusSection.jsx
 * Purpose: "Visit Status" — the buyer's site-visit requests in four tabs:
 *          Requested (awaiting admin), Upcoming (confirmed/rescheduled),
 *          Completed and Cancelled, with a Cancel button on open visits.
 * Inputs (props): data – useBuyerData()
 * Outputs: tabs with counts + visit rows.
 * API calls: PATCH /visits/:id/cancel, GET /visits/mine (via data.reload)
 */
import { useState } from 'react';
import { Avatar, Badge, PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { useDialog } from '../../../components/feedback/DialogProvider.jsx';
import { visitsApi } from '../../../api/services.js';
import { joinPlace } from '../../../utils/format.js';

const TABS = [
  {
    key: 'requested',
    label: 'Requested',
    statuses: ['pending'],
    empty: 'No pending requests — schedule a visit from any property listing and it goes to the admin team for confirmation.',
  },
  {
    key: 'upcoming',
    label: 'Upcoming',
    statuses: ['confirmed', 'rescheduled'],
    empty: 'Nothing confirmed yet. A request appears here as soon as an admin confirms the slot.',
  },
  { key: 'completed', label: 'Completed', statuses: ['completed'], empty: 'No completed visits yet.' },
  { key: 'failed', label: 'Cancelled', statuses: ['cancelled'], empty: 'No cancelled visits.' },
];
const COLORS = { pending: '#f97316', confirmed: '#1DB954', rescheduled: '#3b82f6', completed: '#1DB954', cancelled: '#ef4444' };
const LABELS = {
  pending: '⏳ Sent to admin — awaiting confirmation',
  confirmed: '✓ Confirmed by admin',
  rescheduled: '↻ Admin moved this to a new slot',
  completed: '● Visit completed',
  cancelled: '● Cancelled',
};

export default function VisitStatusSection({ data }) {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [tab, setTab] = useState('requested');
  const current = TABS.find((t) => t.key === tab);
  const visits = data.visits.filter((v) => current.statuses.includes(v.status));

  const cancel = async (v) => {
    if (
      !(await confirm({
        message: 'Cancel your visit to ' + (v.propertyTitle || 'this property') + '?',
        confirmText: 'Cancel visit',
        cancelText: 'Keep it',
        danger: true,
      }))
    )
      return;
    try {
      await visitsApi.cancel(v.id);
      showToast('Visit cancelled');
      data.reload('visits');
    } catch (err) {
      showToast(err.message || 'Failed to cancel visit', 'error');
    }
  };

  return (
    <>
      <PageHeader title="Visit Status" subtitle="Track your scheduled property visits with our admin team" />
      <div className="content">
        <div className="tab-bar" role="tablist" aria-label="Visit status">
          {TABS.map((t) => {
            const n = data.visits.filter((v) => t.statuses.includes(v.status)).length;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={'tab' + (tab === t.key ? ' tab-active' : '')}
                onClick={() => setTab(t.key)}
              >
                {t.label} {n ? '(' + n + ')' : ''}
              </button>
            );
          })}
        </div>
        <div className="table-card" role="tabpanel">
          <h2 className="table-card-title">Visits</h2>
          <StatusLine loading={data.loading.visits && !data.visits.length} error={data.errors.visits} />
          {!data.loading.visits && visits.length === 0 && <p className="state-line">{current.empty}</p>}
          <ul className="row-list">
            {visits.map((v) => {
              const open = ['pending', 'confirmed', 'rescheduled'].includes(v.status);
              return (
                <li key={v.id} className="row-item">
                  <div className="row-center gap-md">
                    <Avatar name={v.propertyTitle || 'Property Visit'} color={COLORS[v.status] || '#9ca3af'} textColor="#fff" />
                    <div>
                      <h3 className="strong">{v.propertyTitle || 'Property'}</h3>
                      <p className="text-secondary small">{joinPlace(v.propertyCity, v.propertyState) || 'Location pending'}</p>
                      <p className="text-secondary tiny">
                        📅 {v.requestedDate} &nbsp; 🕐 {v.requestedSlot}
                      </p>
                      {v.message && <p className="text-muted tiny italic">&ldquo;{v.message}&rdquo;</p>}
                      {v.status === 'cancelled' && v.cancelReason && <p className="text-danger tiny">{v.cancelReason}</p>}
                    </div>
                  </div>
                  <div className="action-row wrap">
                    <Badge tone={v.status === 'cancelled' ? 'red' : v.status === 'pending' ? 'orange' : 'green'}>{LABELS[v.status] || v.status}</Badge>
                    {open && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => cancel(v)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
