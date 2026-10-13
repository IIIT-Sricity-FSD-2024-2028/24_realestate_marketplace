import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Icon from '../components/Icons.jsx';
import { TableRowMessage } from '../components/StateMessage.jsx';
import { getRevenueReport } from '../api/superuserApi.js';
import useSuperuserData from '../hooks/useSuperuserData.js';
import { formatDate, formatINR } from '../utils/format.js';

const STREAM_LABELS = {
  subscription: 'Seller plans',
  featured_listing: 'Featured listings',
  commission: 'Deal commission',
};

export default function Revenue() {
  const { data, status, error, reload } = useSuperuserData(async () => {
    const res = await getRevenueReport();
    return res.data || {};
  });

  const report = data || {};
  const totalCollected = report.totalCollected || 0;
  const receivable = report.receivable || 0;
  const mrr = report.mrr || 0;
  const waived = report.waived || 0;

  const monthly = report.monthly || [];
  const peakMonthly = Math.max(...monthly.map((m) => m.amount || 0), 0);

  const byStream = report.byStream || {};
  const streamKeys = Object.keys(byStream).sort(
    (a, b) => (byStream[b]?.amount || 0) - (byStream[a]?.amount || 0)
  );

  const funnel = report.checkoutFunnel || { created: 0, paid: 0, failed: 0 };
  const openedOrders = funnel.created + funnel.paid + funnel.failed;
  const funnelRate = openedOrders > 0 ? Math.round((funnel.paid / openedOrders) * 100) : 0;

  const byCity = report.byCity || [];
  const peakCity = Math.max(...byCity.map((c) => c.amount || 0), 0);

  const subscriptions = report.subscriptions || {};
  const subEntries = Object.entries(subscriptions);
  const peakSub = Math.max(...subEntries.map((e) => e[1] || 0), 0);

  const recentPayments = report.recentPayments || [];

  return (
    <div className="section active">
      <PageHeader
        title="Revenue"
        subtitle="What the platform earns, where it comes from, and what is still owed."
        actions={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => reload(false)}
          >
            <Icon name="refresh" size="1rem" />
            <span>Refresh</span>
          </button>
        }
      />

      <div className="section-body">
        {status === 'error' && (
          <div className="form-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error?.message || 'Failed to load platform revenue report.'}
          </div>
        )}

        <div className="stats-grid">
          <StatCard
            icon="revenue"
            iconType="primary"
            value={formatINR(totalCollected)}
            label="Collected — verified payments only"
          />
          <StatCard
            icon="revenue"
            iconType="warning"
            value={formatINR(receivable)}
            label="Receivable — earned, not yet settled"
          />
          <StatCard
            icon="revenue"
            iconType="info"
            value={formatINR(mrr)}
            label="MRR from live seller plans"
          />
          <StatCard
            icon="close"
            iconType="danger"
            value={formatINR(waived)}
            label="Written off"
          />
        </div>

        {/* Row 1: Monthly Chart & Streams */}
        <div className="revenue-split" style={{ marginTop: '1.5rem' }}>
          <div className="panel">
            <div className="panel-head">
              <h3>Collected per month</h3>
              <span className="panel-note">Last 6 months</span>
            </div>
            <div className="rev-chart">
              {monthly.length === 0 ? (
                <div className="rev-empty">No monthly records yet.</div>
              ) : (
                monthly.map((m) => {
                  const amt = m.amount || 0;
                  const pct = peakMonthly > 0 ? Math.max(4, Math.round((amt / peakMonthly) * 100)) : 4;
                  const label = new Date(m.month + '-01').toLocaleDateString('en-IN', {
                    month: 'short',
                  });
                  return (
                    <div key={m.month} className="rev-bar-col">
                      <div className="rev-bar-track">
                        <div
                          className={'rev-bar' + (amt ? '' : ' empty')}
                          style={{ height: `${pct}%` }}
                        >
                          {amt > 0 && (
                            <span className="rev-bar-value">{formatINR(amt)}</span>
                          )}
                        </div>
                      </div>
                      <div className="rev-bar-label">{label}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Revenue streams</h3>
            </div>
            <div className="rev-streams-wrap">
              {streamKeys.length === 0 ? (
                <div className="rev-empty">No revenue collected yet.</div>
              ) : (
                streamKeys.map((key) => {
                  const s = byStream[key] || {};
                  const pct = totalCollected > 0 ? Math.round((s.amount / totalCollected) * 100) : 0;
                  return (
                    <div key={key} className="rev-row">
                      <div className="rev-row-head">
                        <span className="rev-row-name">
                          {STREAM_LABELS[key] || key}{' '}
                          <span className="rev-row-meta">· {s.count || 0} txn</span>
                        </span>
                        <span className="rev-row-value">{formatINR(s.amount)}</span>
                      </div>
                      <div className="rev-track">
                        <div
                          className={`rev-track-fill ${key}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="panel-head" style={{ marginTop: '1.5rem' }}>
              <h3>Checkout funnel</h3>
            </div>
            <div className="rev-funnel-wrap">
              <div className="rev-row">
                <div className="rev-row-head">
                  <span className="rev-row-name">
                    Completed{' '}
                    <span className="rev-row-meta">
                      · {funnel.paid} of {openedOrders} orders
                    </span>
                  </span>
                  <span className="rev-row-value">{funnelRate}%</span>
                </div>
                <div className="rev-track">
                  <div
                    className="rev-track-fill subscription"
                    style={{ width: `${funnelRate}%` }}
                  />
                </div>
              </div>
              <div className="rev-row-meta" style={{ marginTop: '0.5rem' }}>
                {funnel.created} abandoned at checkout · {funnel.failed} failed
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Commission by city & Live plans */}
        <div className="revenue-split" style={{ marginTop: '1.5rem' }}>
          <div className="panel">
            <div className="panel-head">
              <h3>Commission earned by city</h3>
            </div>
            {byCity.length === 0 ? (
              <div className="rev-empty">No deals have closed yet.</div>
            ) : (
              byCity.map((c) => {
                const pct = peakCity > 0 ? Math.round((c.amount / peakCity) * 100) : 0;
                return (
                  <div key={c.city} className="rev-row">
                    <div className="rev-row-head">
                      <span className="rev-row-name">
                        {c.city}{' '}
                        <span className="rev-row-meta">
                          · {c.deals} deal{c.deals === 1 ? '' : 's'}
                        </span>
                      </span>
                      <span className="rev-row-value">{formatINR(c.amount)}</span>
                    </div>
                    <div className="rev-track">
                      <div
                        className="rev-track-fill commission"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Live seller plans</h3>
            </div>
            {subEntries.length === 0 ? (
              <div className="rev-empty">No sellers on a paid plan yet.</div>
            ) : (
              subEntries.map(([tier, count]) => {
                const pct = peakSub > 0 ? Math.round((count / peakSub) * 100) : 0;
                return (
                  <div key={tier} className="rev-row">
                    <div className="rev-row-head">
                      <span className="rev-row-name capitalize">{tier}</span>
                      <span className="rev-row-value">
                        {count} seller{count === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="rev-track">
                      <div
                        className="rev-track-fill subscription"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Row 3: Recent Payments Table */}
        <div className="table-container" style={{ marginTop: '1.5rem' }}>
          <div className="table-filter-bar">
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Transactions</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Payer</th>
                <th>For</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' && !data && (
                <TableRowMessage colSpan={6}>Loading transactions…</TableRowMessage>
              )}

              {status !== 'loading' && recentPayments.length === 0 && (
                <TableRowMessage colSpan={6}>No payments recorded yet.</TableRowMessage>
              )}

              {recentPayments.map((p, idx) => {
                const statusClass =
                  p.status === 'paid'
                    ? 'status-paid'
                    : p.status === 'failed'
                    ? 'status-failed'
                    : 'status-pending';

                return (
                  <tr key={p.receipt || idx}>
                    <td className="code-font">{p.receipt || '—'}</td>
                    <td className="strong">{p.payerName || '—'}</td>
                    <td>{p.description || '—'}</td>
                    <td className="strong price-cell">{formatINR(p.amount)}</td>
                    <td>
                      <span className={`status-pill ${statusClass} capitalize`}>
                        {p.status || 'pending'}
                      </span>
                    </td>
                    <td className="muted">{formatDate(p.paidAt || p.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
