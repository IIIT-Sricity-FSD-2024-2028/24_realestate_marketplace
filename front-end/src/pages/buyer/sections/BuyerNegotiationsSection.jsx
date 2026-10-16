/**
 * BuyerNegotiationsSection.jsx
 * Purpose: Buyer "Negotiate" — my offers with the seller's status/counter.
 *          Countered → accept the counter or withdraw; pending → withdraw;
 *          accepted → "Initiate Purchase" moves it to Purchase Initiation
 *          and removes it from this list.
 * Inputs (props): data – useBuyerData(); goTo(section)
 * Outputs: offer cards.
 * API calls: PATCH /negotiations/:id/accept-counter, PATCH /negotiations/:id/withdraw,
 *            GET /negotiations/mine + /purchases/mine (via data.reload('deals'))
 */
import { useState } from 'react';
import { Badge, EmptyState, PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { useDialog } from '../../../components/feedback/DialogProvider.jsx';
import { negotiationsApi } from '../../../api/services.js';
import { readUserData, writeUserData } from '../../../auth/session.js';
import { formatCompactINR, joinPlace, shortDate } from '../../../utils/format.js';
import { FALLBACK_PROPERTY_IMAGE } from '../../../utils/constants.js';

const STATUS = {
  pending: {
    tone: 'orange',
    text: '⏳ Pending Seller Response',
    note: "The seller will accept/reject your offer directly. You'll be notified when there's an update.",
  },
  countered: { tone: 'blue', text: '💬 Counter Offer Received', note: 'The seller has replied with a counter offer. You can choose to accept it or withdraw.' },
  accepted: { tone: 'green', text: '✓ Accepted', note: 'Deal agreed — track progress under Purchase Initiation.' },
  rejected: { tone: 'red', text: '✕ Rejected', note: 'This offer is closed.' },
};

export default function BuyerNegotiationsSection({ data, goTo }) {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [busyId, setBusyId] = useState(null);
  // Accepted offers the buyer has already moved to Purchase Initiation.
  const [initiated, setInitiated] = useState(() => readUserData('initiatedOffers', []));
  // Withdrawn and already-initiated offers are hidden.
  const offers = data.negotiations.filter((n) => n.status !== 'withdrawn' && !initiated.includes(n.id));

  /** Moves an accepted offer out of Negotiate and into Purchase Initiation. */
  const initiatePurchase = (o) => {
    const next = [...initiated, o.id];
    writeUserData('initiatedOffers', next);
    setInitiated(next);
    goTo('purchase-initiation');
  };

  const acceptCounter = async (o) => {
    setBusyId(o.id);
    try {
      await negotiationsApi.acceptCounter(o.id);
      showToast('🎉 Offer accepted! Moving to Purchase Initiation...');
      await data.reload('deals');
      window.setTimeout(() => goTo('purchase-initiation'), 1200);
    } catch (err) {
      showToast(err.message || 'Failed to accept offer', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const withdraw = async (o) => {
    if (
      !(await confirm({
        message: 'Withdraw your offer on ' + (o.propertyTitle || 'this property') + '?',
        confirmText: 'Withdraw',
        cancelText: 'Keep offer',
        danger: true,
      }))
    )
      return;
    setBusyId(o.id);
    try {
      await negotiationsApi.withdraw(o.id);
      showToast('Offer withdrawn');
      await data.reload('deals');
    } catch (err) {
      showToast(err.message || 'Failed to withdraw offer', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader title="Negotiate" subtitle="Active price negotiations with sellers" icon="chat" />
      <div className="content">
        <StatusLine loading={data.loading.deals && !offers.length} error={data.errors.deals} />
        {!data.loading.deals && offers.length === 0 && (
          <EmptyState icon="💬" title="No negotiations yet">
            Make an offer on a property to start negotiating with its seller.
          </EmptyState>
        )}
        {offers.map((o) => {
          const meta = STATUS[o.status] || STATUS.pending;
          return (
            <article key={o.id} className="card accent-left">
              <div className="space-between mb-3">
                <div className="row-center gap-md">
                  <img className="thumb-lg" src={o.propertyImage || FALLBACK_PROPERTY_IMAGE} alt="" />
                  <div>
                    <h3 className="strong">{o.propertyTitle || 'Property'}</h3>
                    <p className="text-secondary small">
                      📍 {joinPlace(o.propertyCity, o.propertyState) || 'Location pending'} · {o.paymentMode || 'Cash'}
                    </p>
                  </div>
                </div>
                <Badge tone={meta.tone}>{meta.text}</Badge>
              </div>
              <div className="inset-box">
                <div className="info-label">Your Offer</div>
                <div className="price-md">{formatCompactINR(o.offerAmount)}</div>
                {o.message && <div className="quote">&ldquo;{o.message}&rdquo;</div>}
                {o.status === 'rejected' && o.rejectionReason && (
                  <div className="divider-dashed">
                    <div className="info-label text-danger">REJECTION REASON</div>
                    <div>{o.rejectionReason}</div>
                  </div>
                )}
                {o.counterAmount ? (
                  <div className="divider-dashed">
                    <div className="info-label text-info">SELLER&apos;S COUNTER OFFER</div>
                    <div className="price-lg text-white">{formatCompactINR(o.counterAmount)}</div>
                  </div>
                ) : null}
                <div className="text-secondary tiny mt-2">Submitted: {shortDate(o.createdAt)}</div>
              </div>
              <div className="notice notice-blue">{meta.note}</div>
              {(o.status === 'pending' || o.status === 'countered') && (
                <div className="button-row">
                  {o.status === 'countered' && (
                    <button type="button" className="btn btn-primary grow" disabled={busyId === o.id} onClick={() => acceptCounter(o)}>
                      Accept Counter Offer
                    </button>
                  )}
                  <button type="button" className="btn btn-danger grow" disabled={busyId === o.id} onClick={() => withdraw(o)}>
                    Withdraw Offer
                  </button>
                </div>
              )}
              {o.status === 'accepted' && (
                <button type="button" className="btn btn-primary btn-block" onClick={() => initiatePurchase(o)}>
                  🏠 Initiate Purchase
                </button>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
