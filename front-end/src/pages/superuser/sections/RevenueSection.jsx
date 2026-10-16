/**
 * RevenueSection.jsx
 * Purpose: Platform revenue report (superuser only). Keeps "collected"
 *          (verified payments) and "receivable" (earned, unpaid commission)
 *          separate so the numbers are never flattered.
 * Inputs:  none.
 * Outputs: stat cards, a 6-month bar chart, stream/city/plan breakdowns,
 *          checkout funnel and the recent payments table.
 * API calls: GET /billing/revenue
 */
import { useCallback, useEffect, useState } from 'react';
import { Badge, PageHeader, StatCard, StatusLine } from '../../../components/common/ui.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { billingApi } from '../../../api/services.js';
import { formatINR, shortDate } from '../../../utils/format.js';
import { STREAM_LABELS } from '../../../utils/constants.js';
import './RevenueSection.css';

/** One labelled horizontal bar (name · meta · value + track). */
function BarRow({ name, meta, value, percent, tone }) {
  return (
    <div className="rev-row">
      <div className="rev-row-head">
        <span className="rev-row-name">
          {name} {meta && <span className="rev-row-meta">· {meta}</span>}
        </span>
        <span className="rev-row-value">{value}</span>
      </div>
      <div className="rev-track" role="img" aria-label={name + ': ' + percent + '%'}>
        <div className={'rev-track-fill ' + tone} style={{ width: percent + '%' }} />
      </div>
    </div>
  );
}

export default function RevenueSection() {
  const { showToast } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReport((await billingApi.revenue()).data);
    } catch (err) {
      showToast(err.message || 'Failed to load the revenue report', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const r = report || {};
  const monthly = r.monthly || [];
  const peakMonth = Math.max(0, ...monthly.map((m) => m.amount)); // tallest bar
  const streams = Object.entries(r.byStream || {}).sort((a, b) => b[1].amount - a[1].amount);
  const funnel = r.checkoutFunnel || { created: 0, paid: 0, failed: 0 };
  const opened = funnel.created + funnel.paid + funnel.failed;
  const rate = opened > 0 ? Math.round((funnel.paid / opened) * 100) : 0; // checkout success %
  const cities = r.byCity || [];
  const peakCity = Math.max(0, ...cities.map((c) => c.amount));
  const plans = Object.entries(r.subscriptions || {});
  const peakPlan = Math.max(0, ...plans.map(([, count]) => count));
  const payments = r.recentPayments || [];

  return (
    <>
      <PageHeader
        title="Revenue"
        subtitle="What the platform earns, where it comes from, and what is still owed."
        actions={
          <button type="button" className="btn btn-secondary" onClick={load} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        }
      />
      <div className="content">
        <StatusLine loading={loading && !report} />
        <div className="stats-grid">
          <StatCard label="Collected — verified payments only" value={formatINR(r.totalCollected)} icon="dollar" />
          <StatCard label="Receivable — earned, not yet settled" value={formatINR(r.receivable)} icon="clock" tone="yellow" />
          <StatCard label="MRR from live seller plans" value={formatINR(r.mrr)} icon="trending" tone="blue" />
          <StatCard label="Written off" value={formatINR(r.waived)} icon="xCircle" tone="red" />
        </div>

        <div className="split-grid">
          <section className="panel" aria-labelledby="rev-monthly">
            <div className="panel-head">
              <h3 id="rev-monthly">Collected per month</h3>
              <span className="panel-note">Last 6 months</span>
            </div>
            {/* Plain-div bar chart: height = share of the best month. */}
            <div className="rev-chart">
              {monthly.map((m) => {
                const pct = peakMonth > 0 ? Math.max(2, Math.round((m.amount / peakMonth) * 100)) : 0;
                const label = new Date(m.month + '-01').toLocaleDateString('en-IN', { month: 'short' });
                return (
                  <div key={m.month} className="rev-bar-col">
                    <div className="rev-bar-track">
                      <div
                        className={'rev-bar' + (m.amount ? '' : ' empty')}
                        style={{ height: (m.amount ? pct : 2) + '%' }}
                        title={label + ': ' + formatINR(m.amount)}
                      >
                        {m.amount ? <span className="rev-bar-value">{formatINR(m.amount)}</span> : null}
                      </div>
                    </div>
                    <div className="rev-bar-label">{label}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel" aria-labelledby="rev-streams">
            <div className="panel-head">
              <h3 id="rev-streams">Revenue streams</h3>
            </div>
            {streams.length ? (
              streams.map(([key, s]) => (
                <BarRow
                  key={key}
                  name={STREAM_LABELS[key] || key}
                  meta={s.count + ' txn'}
                  value={formatINR(s.amount)}
                  percent={r.totalCollected > 0 ? Math.round((s.amount / r.totalCollected) * 100) : 0}
                  tone={key}
                />
              ))
            ) : (
              <div className="rev-empty">No revenue collected yet.</div>
            )}
            <div className="panel-head mt-4">
              <h3>Checkout funnel</h3>
            </div>
            <BarRow name="Completed" meta={funnel.paid + ' of ' + opened + ' orders'} value={rate + '%'} percent={rate} tone="subscription" />
            <div className="rev-row-meta">
              {funnel.created} abandoned at checkout · {funnel.failed} failed
            </div>
          </section>
        </div>

        <div className="split-grid mt-4">
          <section className="panel" aria-labelledby="rev-cities">
            <div className="panel-head">
              <h3 id="rev-cities">Commission earned by city</h3>
            </div>
            {cities.length ? (
              cities.map((c) => (
                <BarRow
                  key={c.city}
                  name={c.city}
                  meta={c.deals + ' deal' + (c.deals === 1 ? '' : 's')}
                  value={formatINR(c.amount)}
                  percent={peakCity > 0 ? Math.round((c.amount / peakCity) * 100) : 0}
                  tone="commission"
                />
              ))
            ) : (
              <div className="rev-empty">No deals have closed yet.</div>
            )}
          </section>
          <section className="panel" aria-labelledby="rev-plans">
            <div className="panel-head">
              <h3 id="rev-plans">Live seller plans</h3>
            </div>
            {plans.length ? (
              plans.map(([tier, count]) => (
                <BarRow
                  key={tier}
                  name={tier.charAt(0).toUpperCase() + tier.slice(1)}
                  value={count + ' seller' + (count === 1 ? '' : 's')}
                  percent={peakPlan > 0 ? Math.round((count / peakPlan) * 100) : 0}
                  tone="subscription"
                />
              ))
            ) : (
              <div className="rev-empty">No sellers on a paid plan yet.</div>
            )}
          </section>
        </div>

        <div className="table-card mt-4">
          <div className="table-scroll">
            <table className="data-table">
              <caption className="sr-only">Recent payments</caption>
              <thead>
                <tr>
                  <th scope="col">Receipt</th>
                  <th scope="col">Payer</th>
                  <th scope="col">For</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      {loading ? 'Loading…' : 'No payments recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.receipt + p.createdAt}>
                      <td className="mono">{p.receipt}</td>
                      <td>{p.payerName || '—'}</td>
                      <td>{p.description}</td>
                      <td className="strong">{formatINR(p.amount)}</td>
                      <td>
                        <Badge tone={p.status === 'paid' ? 'green' : p.status === 'failed' ? 'red' : 'yellow'}>{p.status}</Badge>
                      </td>
                      <td className="text-secondary small">{shortDate(p.paidAt || p.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
