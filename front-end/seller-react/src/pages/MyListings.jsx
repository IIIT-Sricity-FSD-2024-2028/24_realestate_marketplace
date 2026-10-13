import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import PillFilters from '../components/PillFilters.jsx';
import Modal from '../components/Modal.jsx';
import { PlusIcon, TrashIcon } from '../components/Icons.jsx';
import { sellerApi } from '../api/sellerApi.js';
import { formatINR } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';
import useLiveRefresh from '../hooks/useLiveRefresh.js';
import { LoadingState } from '../components/StateMessage.jsx';

export default function MyListings() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadListings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await sellerApi.getMyListings();
      setListings(res.data || []);
    } catch (err) {
      if (!silent) showToast(err.message || 'Failed to load your listings', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useLiveRefresh(() => loadListings(true));

  // Filter and counts
  const counts = useMemo(() => {
    return {
      all: listings.length,
      approved: listings.filter((p) => p.verificationStatus === 'verified').length,
      pending: listings.filter((p) => p.verificationStatus === 'pending').length,
      rejected: listings.filter((p) => p.verificationStatus === 'rejected').length,
    };
  }, [listings]);

  const filteredListings = useMemo(() => {
    if (filter === 'approved') return listings.filter((p) => p.verificationStatus === 'verified');
    if (filter === 'pending') return listings.filter((p) => p.verificationStatus === 'pending');
    if (filter === 'rejected') return listings.filter((p) => p.verificationStatus === 'rejected');
    return listings;
  }, [listings, filter]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await sellerApi.deleteProperty(deleteTarget.id);
      showToast('Property deleted successfully');
      setDeleteTarget(null);
      loadListings(true);
    } catch (err) {
      showToast(err.message || 'Failed to delete property', 'error');
    } finally {
      setDeleting(false);
    }
  }

  const filterOptions = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'approved', label: 'Approved', count: counts.approved },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  return (
    <div>
      <PageHeader
        title="My Listings"
        subtitle="Create and manage your property listings"
        action={
          <button className="btn-primary" onClick={() => navigate('/add-property')}>
            <PlusIcon size={18} /> Add New Property
          </button>
        }
      />

      <div className="content-section">
        {/* Banner CTA if no listings */}
        {listings.length === 0 && !loading && (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', marginBottom: '2rem' }}>
            <div
              style={{
                width: '4.5rem',
                height: '4.5rem',
                borderRadius: '9999px',
                backgroundColor: '#1DB954',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <PlusIcon size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Create New Property Listing
            </h2>
            <p style={{ color: '#9ca3af', marginBottom: '1.75rem', maxWidth: '30rem', margin: '0 auto 1.75rem' }}>
              List your property for sale or rent. Upload high-res photos and title documents for fast city-admin verification.
            </p>
            <button className="btn-primary" onClick={() => navigate('/add-property')}>
              + Add New Property
            </button>
          </div>
        )}

        {/* Filter Pills */}
        <PillFilters
          filters={filterOptions}
          active={filter}
          onChange={setFilter}
        />

        {/* Listings Table / Card List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <LoadingState message="Loading your listings…" />
          ) : filteredListings.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '3rem 1.5rem' }}>
              <p>No listings match this filter.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody id="listings-table">
                  {filteredListings.map((prop) => {
                    const isApproved = prop.verificationStatus === 'verified';
                    const isRejected = prop.verificationStatus === 'rejected';
                    const badgeClass = isApproved ? 'badge-green' : isRejected ? 'badge-red' : 'badge-orange';
                    const label = isApproved ? '● Approved' : isRejected ? '● Rejected' : '● Pending';

                    return (
                      <tr key={prop.id} data-status={prop.verificationStatus}>
                        <td style={{ minWidth: '16rem' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <div>
                              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                                {prop.title}
                                {prop.isFeatured && (
                                  <span className="featured-flag" style={{ marginLeft: '0.5rem' }}>
                                    ★ {String(prop.featuredTier || 'FEATURED').toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                                {prop.bedrooms ? `${prop.bedrooms} BHK · ` : ''}
                                {prop.areaSqft ? `${prop.areaSqft} sqft` : ''}
                              </div>

                              {/* Document counter */}
                              {prop.documents && prop.documents.length > 0 && (
                                <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                                  📎 {prop.documents.length} verification document{prop.documents.length > 1 ? 's' : ''}
                                </div>
                              )}

                              {/* Photo thumbnails */}
                              {prop.images && prop.images.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                  {prop.images.map((imgUrl, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => setSelectedImage(imgUrl)}
                                      style={{
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        background: 'none',
                                        padding: 0,
                                        borderRadius: '0.35rem',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                      }}
                                      title={`View Photo ${i + 1}`}
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Property photo ${i + 1}`}
                                        style={{ width: '3.25rem', height: '2.5rem', objectFit: 'cover', display: 'block' }}
                                      />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ color: '#9ca3af', textTransform: 'capitalize' }}>
                          {prop.type || 'Apartment'}
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            For {prop.listingType === 'rent' ? 'Rent' : 'Sale'}
                          </div>
                        </td>
                        <td style={{ color: '#9ca3af' }}>{prop.city}</td>
                        <td style={{ color: '#1DB954', fontWeight: 700, fontSize: '0.95rem' }}>
                          {formatINR(prop.price)}
                          {prop.listingType === 'rent' && <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>/mo</span>}
                        </td>
                        <td>
                          <span className={`status-badge ${badgeClass}`}>{label}</span>
                          {isRejected && prop.rejectionReason && (
                            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
                              Reason: {prop.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(prop)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              transition: 'background 0.2s',
                            }}
                            title="Delete listing"
                          >
                            <TrashIcon size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Lightbox Modal */}
      {selectedImage && (
        <Modal onClose={() => setSelectedImage(null)} maxWidth="700px">
          <div style={{ textAlign: 'center' }}>
            <img
              src={selectedImage}
              alt="Property preview"
              style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '0.5rem' }}
            />
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <a
                href={selectedImage}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
                style={{ textDecoration: 'none', display: 'inline-block' }}
              >
                Open Full Size ↗
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal title="Delete Property Listing?" onClose={() => setDeleteTarget(null)} maxWidth="420px">
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: '#fff' }}>{deleteTarget.title}</strong>?
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              This will remove the listing and all its uploaded documents and images. This action cannot be undone.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn-outline"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              disabled={deleting}
              onClick={confirmDelete}
              style={{ background: '#ef4444', color: '#fff', border: 'none' }}
            >
              {deleting ? 'Deleting…' : 'Delete Property'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
