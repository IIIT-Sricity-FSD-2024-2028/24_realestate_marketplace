import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import PillFilters from '../components/PillFilters.jsx';
import { SummaryCard } from '../components/StatCard.jsx';
import StateMessage, { DataState } from '../components/StateMessage.jsx';
import Icon from '../components/Icons.jsx';
import { getPropertyReviewQueue, rejectProperty, verifyProperty } from '../api/adminApi.js';
import { useToast } from '../context/ToastContext.jsx';
import useAdminData from '../hooks/useAdminData.js';
import { rupees } from '../utils/format.js';

// Badge colour + text for each verification status.
const STATUS_META = {
  pending: { className: 'badge--yellow', text: '● Pending' },
  verified: { className: 'badge--green', text: '✓ Verified' },
  rejected: { className: 'badge--red', text: '✕ Rejected' },
};

/**
 * Property Document Verification (was data-section="property-mgmt").
 * API: GET /properties/review-queue (city-scoped on the server),
 *      PATCH /properties/:id/verify, PATCH /properties/:id/reject { reason }.
 * Shows totals, a status filter + search, and one card per submission with
 * photos and the private documents only admins can see.
 */
export default function PropertyVerification() {
  const showToast = useToast();
  const { status, data, error, reload } = useAdminData(async () => (await getPropertyReviewQueue()).data.items);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const queue = data || [];
  const counts = useMemo(() => ({
    all: queue.length,
    pending: queue.filter((p) => p.verificationStatus === 'pending').length,
    verified: queue.filter((p) => p.verificationStatus === 'verified').length,
    rejected: queue.filter((p) => p.verificationStatus === 'rejected').length,
  }), [queue]);

  // Status pill + free-text search on seller name or property title.
  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return queue.filter((p) => (filter === 'all' || p.verificationStatus === filter)
      && (!q || (p.sellerName || '').toLowerCase().includes(q) || (p.title || '').toLowerCase().includes(q)));
  }, [queue, filter, query]);

  const verify = async (id) => {
    try {
      await verifyProperty(id);
      showToast('Property verified ✓');
      reload();
    } catch (err) {
      showToast(err.message || 'Failed to verify property', 'error');
    }
  };

  const reject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional, shown to the seller):');
    if (reason === null) return; // cancelled
    try {
      await rejectProperty(id, reason.trim() || undefined);
      showToast('Property rejected ✕');
      reload();
    } catch (err) {
      showToast(err.message || 'Failed to reject property', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="Property Document Verification"
        subtitle="Review and verify seller document submissions"
        icon={<div className="header-icon"><Icon name="home" size="1.5rem" color="#1DB954" /></div>}
      />
      <div className="page-body">
        <div className="grid grid-4 section-gap">
          <SummaryCard label="Total Documents" value={counts.all} color="#fff" tint="rgba(255,255,255,0.05)" icon="file" />
          <SummaryCard label="Pending Review" value={counts.pending} color="#eab308" tint="rgba(234,179,8,0.1)" icon="clock" />
          <SummaryCard label="Verified" value={counts.verified} color="#1DB954" tint="rgba(29,185,84,0.1)" icon="checkCircle" />
          <SummaryCard label="Rejected" value={counts.rejected} color="#ef4444" tint="rgba(239,68,68,0.1)" icon="xCircle" />
        </div>

        <div className="toolbar toolbar--wrap">
          <div className="search-box">
            <Icon name="search" className="search-box__icon" />
            <input
              className="input input--search input--with-icon"
              type="text"
              placeholder="Search by seller, property, or document type..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <PillFilters
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: counts.all },
              { value: 'pending', label: 'Pending', count: counts.pending, countBg: 'rgba(234,179,8,0.2)' },
              { value: 'verified', label: 'Verified', count: counts.verified, countBg: 'rgba(29,185,84,0.2)' },
              { value: 'rejected', label: 'Rejected', count: counts.rejected, countBg: 'rgba(239,68,68,0.2)' },
            ]}
          />
        </div>

        <div className="grid grid-2">
          <DataState status={status} error={error} fallbackError="Couldn't load properties from the API." fullRow />
          {status === 'ready' && visible.length === 0 && <StateMessage fullRow>No properties match.</StateMessage>}
          {status === 'ready' && visible.map((prop) => (
            <ReviewCard key={prop.id} prop={prop} onVerify={verify} onReject={reject} />
          ))}
        </div>
      </div>
    </>
  );
}

/** One submission: price/type, photos, private documents, seller info and actions. */
function ReviewCard({ prop, onVerify, onReject }) {
  const meta = STATUS_META[prop.verificationStatus] || STATUS_META.pending;
  return (
    <div className="card review-card">
      <div className="review-card__head">
        <div className="review-card__title">
          <div className="icon-tile"><Icon name="home" size="1.125rem" color="#1DB954" /></div>
          <div>
            <div className="strong">{prop.title}</div>
            <div className="muted small">📍 {prop.city}, {prop.state}</div>
          </div>
        </div>
        <span className={'badge ' + meta.className}>{meta.text}</span>
      </div>

      <div className="info-grid">
        <InfoBox label="Price">{rupees(prop.price)}</InfoBox>
        <InfoBox label="Property Type"><span className="capitalize">{prop.type}</span></InfoBox>
        <InfoBox label="Photos" wide>
          {prop.images && prop.images.length ? prop.images.map((url) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer"><img className="thumb" src={url} alt="" /></a>
          )) : <span className="faint">No photos uploaded</span>}
        </InfoBox>
        <InfoBox label="Documents (private — visible only to admins)" wide>
          {prop.documents && prop.documents.length ? prop.documents.map((d) => (
            <a key={d.url} className="doc-chip" href={d.url} target="_blank" rel="noopener noreferrer">📄 {d.originalName}</a>
          )) : <span className="faint">No documents uploaded</span>}
        </InfoBox>
        <InfoBox label="Submitted" wide>{new Date(prop.createdAt).toLocaleDateString()}</InfoBox>
      </div>

      <div className="review-card__section">
        <div className="info-box">
          <div className="info-box__label">👤 Seller Information</div>
          <div className="strong small-plus">{prop.sellerName || 'Admin-created listing'}</div>
          <div className="muted small">{prop.sellerEmail || '—'}</div>
        </div>
      </div>

      {prop.verificationStatus === 'rejected' && prop.rejectionReason && (
        <div className="review-card__section">
          <div className="alert alert--red">
            <div className="alert__title">⚠ Rejection Reason</div>
            <div>{prop.rejectionReason}</div>
          </div>
        </div>
      )}

      <div className="review-card__actions">
        {prop.verificationStatus === 'pending' ? (
          <>
            <button type="button" className="btn btn-primary btn-grow" onClick={() => onVerify(prop.id)}>✓ Verify</button>
            <button type="button" className="btn btn-danger-soft btn-grow" onClick={() => onReject(prop.id)}>✕ Reject</button>
          </>
        ) : <div className="muted center btn-grow small-plus">Already reviewed</div>}
      </div>
    </div>
  );
}

/** Small dark box with a caption — used for the card's detail grid. */
function InfoBox({ label, wide = false, children }) {
  return (
    <div className={'info-box' + (wide ? ' info-box--wide' : '')}>
      <div className="info-box__label">{label}</div>
      <div className="info-box__value">{children}</div>
    </div>
  );
}
