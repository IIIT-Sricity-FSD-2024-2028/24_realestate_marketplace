/**
 * MyListingsSection.jsx
 * Purpose: "My Listings" — every property this seller submitted (any status)
 *          with photos, document count, featured flag, rejection reason,
 *          filter pills and delete. Links to the Add Property form.
 * Inputs (props): data – useSellerData(); goTo(section)
 * Outputs: quota banner, create card, filters and the listings table.
 * API calls: DELETE /properties/:id, GET /properties/mine (via data.reload)
 */
import { useState } from 'react';
import { Badge, Card, FilterPills, PageHeader } from '../../../components/common/ui.jsx';
import Icon from '../../../components/common/Icon.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { useDialog } from '../../../components/feedback/DialogProvider.jsx';
import { propertiesApi } from '../../../api/services.js';
import { formatINR } from '../../../utils/format.js';
import { VERIFICATION_DISPLAY } from '../../../utils/constants.js';
import { QuotaNotice } from '../components/QuotaNotice.jsx';
import './MyListingsSection.css';

export default function MyListingsSection({ data, goTo }) {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [filter, setFilter] = useState('all');
  const listings = data.listings;

  // Count per verification bucket for the pills.
  const counts = { all: listings.length, approved: 0, pending: 0, rejected: 0 };
  listings.forEach((p) => {
    const key = (VERIFICATION_DISPLAY[p.verificationStatus] || VERIFICATION_DISPLAY.pending).key;
    counts[key] += 1;
  });
  const visible = listings.filter((p) => filter === 'all' || (VERIFICATION_DISPLAY[p.verificationStatus] || VERIFICATION_DISPLAY.pending).key === filter);

  const remove = async (p) => {
    if (!(await confirm({ message: 'Delete this property listing? This cannot be undone.', confirmText: 'Delete', danger: true }))) return;
    try {
      await propertiesApi.remove(p.id);
      showToast('Property deleted');
      data.reload('listings');
      data.reload('billing'); // frees a quota slot
    } catch (err) {
      showToast(err.message || 'Failed to delete property', 'error');
    }
  };

  return (
    <>
      <PageHeader title="My Listings" subtitle="Create and manage your property listings">
        <QuotaNotice billing={data.billing} listings={listings} onUpgrade={() => goTo('billing')} />
      </PageHeader>
      <div className="content">
        <Card className="create-card">
          <span className="create-icon" aria-hidden="true">
            <Icon name="plus" size="2rem" />
          </span>
          <h2 className="card-title-lg">Create New Property Listing</h2>
          <p className="text-secondary mb-3">List your property for sale or rent. Fill out the details and submit for admin review.</p>
          <button type="button" className="btn btn-primary" onClick={() => goTo('add-property')}>
            + Add New Property
          </button>
        </Card>

        <FilterPills
          label="Listing status"
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'approved', label: 'Approved', count: counts.approved },
            { key: 'pending', label: 'Pending', count: counts.pending },
            { key: 'rejected', label: 'Rejected', count: counts.rejected },
          ]}
        />
        <h2 className="section-title-sm">All Properties</h2>
        <div className="table-card">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Property</th>
                  <th scope="col">Type</th>
                  <th scope="col">Location</th>
                  <th scope="col">Price</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.loading.listings ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      Loading…
                    </td>
                  </tr>
                ) : data.errors.listings ? (
                  <tr>
                    <td colSpan={6} className="table-empty text-danger">
                      {data.errors.listings}
                    </td>
                  </tr>
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      {listings.length
                        ? 'No listings in this category.'
                        : 'You haven\'t submitted any properties yet. Click "+ Add New Property" to get started.'}
                    </td>
                  </tr>
                ) : (
                  visible.map((p) => {
                    const st = VERIFICATION_DISPLAY[p.verificationStatus] || VERIFICATION_DISPLAY.pending;
                    return (
                      <tr key={p.id}>
                        <td>
                          <span className="strong">{p.title}</span>
                          {p.isFeatured && <span className="featured-flag">★ {String(p.featuredTier || '').toUpperCase()}</span>}
                          {/* Every uploaded photo, so the seller can see each one landed. */}
                          {p.images && p.images.length > 0 && (
                            <div className="thumb-row">
                              {p.images.map((url, i) => (
                                <a key={url} href={url} target="_blank" rel="noopener noreferrer" title={'Photo ' + (i + 1)}>
                                  <img src={url} alt={'Photo ' + (i + 1)} className="thumb thumb-sm" />
                                </a>
                              ))}
                            </div>
                          )}
                          {p.documents && p.documents.length > 0 && (
                            <div className="text-muted small">
                              📎 {p.documents.length} document{p.documents.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </td>
                        <td className="text-secondary capitalize">{p.type}</td>
                        <td className="text-secondary">{p.city}</td>
                        <td>{formatINR(p.price)}</td>
                        <td>
                          <Badge tone={st.tone}>● {st.label}</Badge>
                          {p.verificationStatus === 'rejected' && p.rejectionReason && <div className="text-danger small">{p.rejectionReason}</div>}
                        </td>
                        <td>
                          <button type="button" className="icon-btn text-danger" onClick={() => remove(p)} aria-label={'Delete ' + p.title} title="Delete">
                            🗑
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
