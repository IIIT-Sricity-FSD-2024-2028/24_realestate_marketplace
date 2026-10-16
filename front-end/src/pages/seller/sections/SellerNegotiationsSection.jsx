/**
 * SellerNegotiationsSection.jsx
 * Purpose: "Negotiate" — buyer offers on this seller's approved listings.
 *          The seller can accept (creates a purchase), counter, or reject
 *          with an optional reason. An empty list explains *why* it is empty.
 * Inputs (props): data – useSellerData()
 * Outputs: filter pills, offer cards and the counter-offer dialog.
 * API calls: PATCH /negotiations/:id/accept | /counter | /reject,
 *            GET /negotiations/seller-queue (via data.reload)
 */
import { useState } from 'react';
import { Badge, Card, FilterPills, PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import Modal from '../../../components/common/Modal.jsx';
import Icon from '../../../components/common/Icon.jsx';
import { FormField, TextInput } from '../../../components/forms/FormControls.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { useDialog } from '../../../components/feedback/DialogProvider.jsx';
import { negotiationsApi } from '../../../api/services.js';
import { formatCompactINR, joinPlace } from '../../../utils/format.js';
import { isPositiveNumber, toNumber } from '../../../utils/validation.js';

const STATUS_META = {
  pending: { tone: 'orange', text: '⏳ Pending — awaiting your response' },
  countered: { tone: 'blue', text: '💬 You countered' },
  accepted: { tone: 'green', text: '✓ Accepted' },
  rejected: { tone: 'red', text: '✕ Rejected' },
  withdrawn: { tone: 'red', text: '↩ Withdrawn by buyer' },
};

/** Groups statuses into the three filter buckets. */
export function negBucket(status) {
  if (status === 'accepted') return 'completed';
  if (status === 'rejected' || status === 'withdrawn') return 'rejected';
  return 'ongoing'; // pending, countered
}

/** Explains an empty list instead of leaving the seller guessing. */
function EmptyExplanation({ total, filter, listings }) {
  if (total && filter !== 'all') return <p>No negotiations in this category. Switch to “All” to see your other offers.</p>;
  if (!listings.length)
    return (
      <>
        <p>No offers yet — because you have no listings.</p>
        <p className="text-muted small">
          Buyer offers only appear here for properties <strong>you</strong> submitted. Add one under <strong>My Listings</strong>; once an admin approves it,
          any offer on it lands here to accept, counter, or reject.
        </p>
      </>
    );
  const approved = listings.filter((p) => p.verificationStatus === 'verified').length;
  if (!approved) {
    const pending = listings.filter((p) => p.verificationStatus === 'pending').length;
    return (
      <>
        <p>
          No offers yet — none of your {listings.length} listing{listings.length > 1 ? 's are' : ' is'} approved.
        </p>
        <p className="text-muted small">
          {pending ? pending + ' listing' + (pending > 1 ? 's are' : ' is') + ' still awaiting admin approval. ' : ''}A listing is invisible to buyers until an
          admin approves it.
        </p>
      </>
    );
  }
  return (
    <>
      <p>
        No offers yet on your {approved} approved listing{approved > 1 ? 's' : ''}.
      </p>
      <p className="text-muted small">When a buyer makes an offer, it appears here for you to accept, counter, or reject.</p>
    </>
  );
}

export default function SellerNegotiationsSection({ data }) {
  const { showToast } = useToast();
  const { prompt } = useDialog();
  const [filter, setFilter] = useState('all');
  const [countering, setCountering] = useState(null); // negotiation in the counter dialog
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const list = filter === 'all' ? data.negotiations : data.negotiations.filter((n) => negBucket(n.status) === filter);

  /** Runs an action then refreshes offers (and deals, since accept creates one). */
  const run = async (id, call, success, failure) => {
    setBusyId(id);
    try {
      await call();
      showToast(success);
      await Promise.all([data.reload('negotiations'), data.reload('purchases')]);
    } catch (err) {
      showToast(err.message || failure, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (n) => {
    const reason = await prompt({
      title: 'Reject offer',
      message: 'Reject this offer?',
      label: 'Reason for rejection (optional, shown to the buyer)',
      confirmText: 'Reject',
      danger: true,
    });
    if (reason === null) return;
    run(n.id, () => negotiationsApi.reject(n.id, reason.trim()), 'Offer rejected', 'Failed to reject offer');
  };

  const submitCounter = (event) => {
    event.preventDefault();
    // Old tvValidateCounterOffer: required, positive number.
    if (!isPositiveNumber(amount)) {
      setAmountError('Counter Offer Amount must be a valid positive number');
      return;
    }
    const value = toNumber(amount);
    const n = countering;
    setCountering(null);
    run(
      n.id,
      () => negotiationsApi.counter(n.id, value),
      'Counter offer of ' + formatCompactINR(value) + ' submitted successfully!',
      'Failed to submit counter offer',
    );
  };

  return (
    <>
      <PageHeader title="Negotiate" subtitle="Active price negotiations with buyers" icon="chat" />
      <div className="content">
        <h2 className="section-title-sm">All Negotiations</h2>
        <FilterPills
          label="Negotiation status"
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: 'All' },
            { key: 'ongoing', label: 'Ongoing' },
            { key: 'completed', label: 'Completed' },
            { key: 'rejected', label: 'Rejected' },
          ]}
        />
        <StatusLine loading={data.loading.negotiations} error={data.errors.negotiations} />
        {!data.loading.negotiations && !data.errors.negotiations && list.length === 0 && (
          <Card className="center text-secondary">
            <EmptyExplanation total={data.negotiations.length} filter={filter} listings={data.listings} />
          </Card>
        )}
        {list.map((n) => {
          const meta = STATUS_META[n.status] || STATUS_META.pending;
          const canRespond = n.status === 'pending' || n.status === 'countered';
          return (
            <Card key={n.id}>
              <div className="space-between mb-3">
                <div className="row-center gap-md">
                  <span className="mini-icon gray">
                    <Icon name="home" />
                  </span>
                  <div>
                    <h3 className="strong">{n.propertyTitle || 'Property'}</h3>
                    <p className="text-secondary small">📍 {joinPlace(n.propertyCity, n.propertyState) || 'Location pending'}</p>
                    <p className="text-secondary small">
                      Buyer: <span className="text-white">{n.buyerName || 'Unknown'}</span>
                    </p>
                  </div>
                </div>
                <Badge tone={meta.tone}>{meta.text}</Badge>
              </div>
              <div className="inset-box">
                <div className="space-between">
                  <div>
                    <div className="info-label">Buyer&apos;s Offer</div>
                    <div className="price-md">{formatCompactINR(n.offerAmount)}</div>
                  </div>
                  {n.counterAmount ? (
                    <div className="align-right">
                      <div className="info-label">Your Counter Offer</div>
                      <div className="price-md">{formatCompactINR(n.counterAmount)}</div>
                    </div>
                  ) : null}
                </div>
                {n.paymentMode && <div className="text-secondary small mt-2">Payment mode: {n.paymentMode}</div>}
                {n.message && <div className="quote">&ldquo;{n.message}&rdquo;</div>}
              </div>
              {canRespond && (
                <div className="button-row">
                  <button
                    type="button"
                    className="btn btn-outline-green"
                    disabled={busyId === n.id}
                    onClick={() => {
                      setCountering(n);
                      setAmount('');
                      setAmountError('');
                    }}
                  >
                    Make Counter Offer
                  </button>
                  {n.status === 'pending' && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={busyId === n.id}
                      onClick={() => run(n.id, () => negotiationsApi.accept(n.id), 'Offer accepted — purchase created', 'Failed to accept offer')}
                    >
                      Accept Offer
                    </button>
                  )}
                  <button type="button" className="btn btn-danger push-right" disabled={busyId === n.id} onClick={() => reject(n)}>
                    Reject Offer
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Modal open={!!countering} onClose={() => setCountering(null)} title="Make Counter Offer">
        {countering && (
          <form onSubmit={submitCounter} noValidate>
            <div className="inset-box mb-3">
              <h3 className="strong">{countering.propertyTitle || 'Property'}</h3>
              <p className="text-secondary small">{joinPlace(countering.propertyCity, countering.propertyState)}</p>
              <div className="info-label mt-2">Buyer&apos;s Offer</div>
              <div className="price-md">{formatCompactINR(countering.offerAmount)}</div>
            </div>
            <FormField id="counter-amount" label="How much will you offer? (₹)" error={amountError}>
              <TextInput
                id="counter-amount"
                restrict="number"
                inputMode="numeric"
                placeholder="e.g. 4350000"
                value={amount}
                onValueChange={(v) => {
                  setAmount(v);
                  setAmountError('');
                }}
                error={amountError}
              />
            </FormField>
            <button type="submit" className="btn btn-primary btn-block">
              Submit Counter Offer
            </button>
            <p className="text-secondary small center mt-2">The buyer will be notified of your counter offer</p>
          </form>
        )}
      </Modal>
    </>
  );
}
