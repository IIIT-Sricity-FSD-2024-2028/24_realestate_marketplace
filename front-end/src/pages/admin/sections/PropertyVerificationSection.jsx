/**
 * PropertyVerificationSection.jsx
 * Purpose: "Property Document Verification" — review seller submissions in
 *          this city: photos, private ownership documents, seller details;
 *          verify or reject (with an optional reason shown to the seller).
 * Inputs (props): desk – shared data (desk.listings = review queue) + reload
 * Outputs: counts, search, status pills and one card per listing.
 * API calls: PATCH /properties/:id/verify, PATCH /properties/:id/reject,
 *            GET /properties/review-queue (via desk.reload)
 */
import { useMemo, useState } from 'react';
import { Badge, FilterPills, PageHeader, StatCard, StatusLine } from '../../../components/common/ui.jsx';
import Icon from '../../../components/common/Icon.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { useDialog } from '../../../components/feedback/DialogProvider.jsx';
import { propertiesApi } from '../../../api/services.js';
import { formatINR, joinPlace, shortDate } from '../../../utils/format.js';

// verificationStatus → badge colour + text.
const STATUS_META = {
  pending: { tone: 'yellow', text: '● Pending' },
  verified: { tone: 'green', text: '✓ Verified' },
  rejected: { tone: 'red', text: '✕ Rejected' },
};

export default function PropertyVerificationSection({ desk }) {
  const { showToast } = useToast();
  const { prompt } = useDialog();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState(null);
  const listings = desk.listings;

  // Counts for the stat cards and pills.
  const counts = useMemo(
    () => ({
      all: listings.length,
      pending: listings.filter((p) => p.verificationStatus === 'pending').length,
      verified: listings.filter((p) => p.verificationStatus === 'verified').length,
      rejected: listings.filter((p) => p.verificationStatus === 'rejected').length,
    }),
    [listings],
  );

  // Status pill + search by seller or listing title.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter(
      (p) =>
        (filter === 'all' || p.verificationStatus === filter) &&
        (!q || (p.sellerName || '').toLowerCase().includes(q) || (p.title || '').toLowerCase().includes(q)),
    );
  }, [listings, filter, query]);

  const verify = async (p) => {
    setBusyId(p.id);
    try {
      await propertiesApi.verify(p.id);
      showToast('Property verified ✓');
      await desk.reload('listings');
    } catch (err) {
      showToast(err.message || 'Failed to verify property', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (p) => {
    const reason = await prompt({
      title: 'Reject listing',
      message: 'Reject "' + p.title + '"?',
      label: 'Reason for rejection (optional, shown to the seller)',
      confirmText: 'Reject',
      danger: true,
    });
    if (reason === null) return; // cancelled
    setBusyId(p.id);
    try {
      await propertiesApi.reject(p.id, reason.trim());
      showToast('Property rejected ✕');
      await desk.reload('listings');
    } catch (err) {
      showToast(err.message || 'Failed to reject property', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader title="Property Document Verification" subtitle="Review and verify seller document submissions" icon="home" />
      <div className="content">
        <div className="stats-grid">
          <StatCard label="Total Documents" value={counts.all} icon="file" tone="gray" />
          <StatCard label="Pending Review" value={counts.pending} icon="clock" tone="yellow" valueClassName="text-warning" />
          <StatCard label="Verified" value={counts.verified} icon="checkCircle" valueClassName="text-brand" />
          <StatCard label="Rejected" value={counts.rejected} icon="xCircle" tone="red" valueClassName="text-danger" />
        </div>

        <div className="toolbar toolbar-bare">
          <div className="search-with-icon">
            <Icon name="search" />
            <label className="sr-only" htmlFor="verify-search">
              Search by seller or property
            </label>
            <input
              id="verify-search"
              className="form-control"
              placeholder="Search by seller or property..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <FilterPills
            label="Verification status"
            value={filter}
            onChange={setFilter}
            options={[
              { key: 'all', label: 'All', count: counts.all },
              { key: 'pending', label: 'Pending', count: counts.pending },
              { key: 'verified', label: 'Verified', count: counts.verified },
              { key: 'rejected', label: 'Rejected', count: counts.rejected },
            ]}
          />
        </div>

        <StatusLine loading={desk.loading.listings} error={desk.errors.listings} />
        {!desk.loading.listings && !desk.errors.listings && visible.length === 0 && <p className="state-line">No properties match.</p>}

        <div className="card-grid-2">
          {visible.map((p) => {
            const meta = STATUS_META[p.verificationStatus] || STATUS_META.pending;
            return (
              <article key={p.id} className="card verify-card">
                <div className="verify-head">
                  <div className="row-center gap-sm">
                    <span className="mini-icon">
                      <Icon name="home" size="1.1rem" />
                    </span>
                    <div>
                      <h3 className="strong">{p.title}</h3>
                      <p className="text-secondary small">📍 {joinPlace(p.city, p.state)}</p>
                    </div>
                  </div>
                  <Badge tone={meta.tone}>{meta.text}</Badge>
                </div>
                <div className="fact-grid">
                  <div className="fact">
                    <div className="fact-label">Price</div>
                    <div className="fact-value">{formatINR(p.price)}</div>
                  </div>
                  <div className="fact">
                    <div className="fact-label">Property Type</div>
                    <div className="fact-value capitalize">{p.type}</div>
                  </div>
                  <div className="fact span-2">
                    <div className="fact-label">Photos</div>
                    {p.images && p.images.length ? (
                      <div className="thumb-row">
                        {p.images.map((url, i) => (
                          <a key={url} href={url} target="_blank" rel="noopener noreferrer" aria-label={'Open photo ' + (i + 1)}>
                            <img src={url} alt={'Photo ' + (i + 1) + ' of ' + p.title} className="thumb" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted small">No photos uploaded</span>
                    )}
                  </div>
                  <div className="fact span-2">
                    <div className="fact-label">Documents (private — visible only to admins)</div>
                    {p.documents && p.documents.length ? (
                      <div className="chip-row">
                        {p.documents.map((d) => (
                          <a key={d.url} className="doc-chip" href={d.url} target="_blank" rel="noopener noreferrer">
                            📄 {d.originalName}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted small">No documents uploaded</span>
                    )}
                  </div>
                  <div className="fact span-2">
                    <div className="fact-label">Submitted</div>
                    <div className="fact-value">{shortDate(p.createdAt)}</div>
                  </div>
                  <div className="fact span-2">
                    <div className="fact-label">👤 Seller Information</div>
                    <div className="fact-value">{p.sellerName || 'Admin-created listing'}</div>
                    <div className="text-secondary small">{p.sellerEmail || '—'}</div>
                  </div>
                </div>
                {p.verificationStatus === 'rejected' && p.rejectionReason && (
                  <div className="notice notice-red">
                    <strong>⚠ Rejection Reason</strong>
                    <div>{p.rejectionReason}</div>
                  </div>
                )}
                <div className="button-row">
                  {p.verificationStatus === 'pending' ? (
                    <>
                      <button type="button" className="btn btn-primary grow" disabled={busyId === p.id} onClick={() => verify(p)}>
                        ✓ Verify
                      </button>
                      <button type="button" className="btn btn-danger grow" disabled={busyId === p.id} onClick={() => reject(p)}>
                        ✕ Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-secondary small grow center">Already reviewed</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
