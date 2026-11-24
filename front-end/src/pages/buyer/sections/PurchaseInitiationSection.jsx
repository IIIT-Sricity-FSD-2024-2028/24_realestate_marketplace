/**
 * PurchaseInitiationSection.jsx
 * Purpose: "Purchase Initiation" — live progress of the buyer's accepted
 *          deals. At Registration, the buyer's share of the platform
 *          commission is shown right on the card with a Pay button; once the
 *          buyer has paid, the card explains it is waiting on the seller.
 * Inputs (props): data – useBuyerData()
 * Outputs: info banner + one tracking card per active/completed deal.
 * API calls: payment flow via usePayment (POST /billing/checkout → verify),
 *            GET /purchases/mine + /billing/summary (via data.reload)
 */
import { Badge, EmptyState, PageHeader } from '../../../components/common/ui.jsx';
import Icon from '../../../components/common/Icon.jsx';
import DealProgress from '../../../components/deals/DealProgress.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { usePayment } from '../../../components/payments/PaymentProvider.jsx';
import { formatCompactINR, formatINR, joinPlace } from '../../../utils/format.js';
import { DEAL_STEPS } from '../../../utils/constants.js';

/** The "Registration is waiting on commission" panel. */
function CommissionPanel({ purchase, onPay }) {
  const mine = (purchase.commissions || []).find((c) => c.side === 'buyer' && c.status === 'accrued');
  const theirs = (purchase.commissions || []).find((c) => c.side === 'seller' && c.status === 'accrued');
  return (
    <div className="notice notice-amber">
      <strong>Final step — platform commission due</strong>
      <p className="small">
        Registration is the last step of this purchase. Your registration is completed once the platform commission on this deal has been paid.
      </p>
      {mine ? (
        <div className="inset-box space-between wrap gap-md">
          <div>
            <div className="info-label">Your share (buyer-side)</div>
            <div className="price-lg text-amber">{formatINR(mine.amount)}</div>
            <div className="text-muted tiny">
              {mine.ratePercent}% of {formatINR(mine.dealValue)} · incl. {formatINR(mine.taxAmount)} GST
            </div>
          </div>
          <button type="button" className="btn btn-amber" onClick={() => onPay(mine.id)}>
            Pay {formatINR(mine.amount)}
          </button>
        </div>
      ) : (
        <div className="inset-box">
          <div className="text-brand strong">
            ✓ Your side is settled{purchase.commissionPaid ? ' — ' + formatINR(purchase.commissionPaid) + ' received' : ''}
          </div>
          <p className="text-secondary small">
            Waiting on the seller to pay their share{theirs ? ' of ' + formatINR(theirs.amount) : ''} before registration can be closed. This page updates on
            its own the moment they do — you do not need to refresh.
          </p>
        </div>
      )}
    </div>
  );
}

export default function PurchaseInitiationSection({ data }) {
  const { showToast } = useToast();
  const { pay } = usePayment();
  // Newest first; cancelled deals are not shown here (as before).
  const deals = data.purchases
    .filter((p) => p.dealStatus !== 'cancelled')
    .slice()
    .reverse();

  const payCommission = async (commissionId) => {
    try {
      const result = await pay({ purpose: 'commission', commissionId });
      if (!result) return;
      showToast(result.message);
      await Promise.all([data.reload('deals'), data.reload('billing')]);
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    }
  };

  return (
    <>
      <PageHeader title="Purchase Initiation" subtitle="Track your ongoing property purchases — all steps managed by your property manager" icon="card" />
      <div className="content">
        <div className="notice notice-blue row-start gap-md">
          <Icon name="info" className="text-info" />
          <div>
            <strong className="text-white">How Purchase Initiation Works</strong>
            <p className="small">
              The property payment and all legal steps happen <strong className="text-white">offline</strong>. Your assigned property manager handles each stage
              physically and updates the status here once confirmed. The one thing you pay here is the{' '}
              <strong className="text-white">platform commission at the final Registration step</strong>— your purchase is completed once that is settled.
            </p>
          </div>
        </div>
        <h2 className="section-title-sm">Active Purchase Tracking</h2>
        {deals.length === 0 ? (
          <EmptyState icon="🏠" title="No active purchases yet">
            Once a seller accepts one of your offers, it&apos;ll show up here with live progress.
          </EmptyState>
        ) : (
          deals.map((p) => {
            const completed = p.dealStatus === 'completed';
            const step = Math.min(5, p.dealStep);
            return (
              <article key={p.id} className="card accent-left">
                <div className="space-between mb-3">
                  <div className="row-center gap-md">
                    <span className="mini-icon">
                      <Icon name="home" />
                    </span>
                    <div>
                      <h3 className="strong">{p.propertyTitle || 'Property'}</h3>
                      <p className="text-secondary small">
                        📍 {joinPlace(p.propertyCity, p.propertyState) || '—'} · Agreed Price:{' '}
                        <span className="text-brand strong">{formatCompactINR(p.agreedPrice)}</span>
                      </p>
                    </div>
                  </div>
                  <Badge tone={completed ? 'green' : 'orange'}>{completed ? '✅ Completed' : '⏳ In Progress'}</Badge>
                </div>
                <DealProgress step={step} status={p.dealStatus} title="PURCHASE PROGRESS" />
                {p.awaitingCommission ? (
                  <CommissionPanel purchase={p} onPay={payCommission} />
                ) : (
                  <div className="notice notice-green row-center gap-md">
                    <span className="step-dot">{completed ? '✓' : step}</span>
                    <div>
                      <div className="strong small">
                        {completed ? 'All steps complete — registration done.' : 'Current step: ' + (DEAL_STEPS[step - 1] || '—')}
                      </div>
                      <div className="text-brand small">
                        {completed && p.commissionPaid
                          ? 'Platform commission of ' + formatINR(p.commissionPaid) + ' settled.'
                          : 'Your admin advances each step — this updates automatically.'}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </>
  );
}
