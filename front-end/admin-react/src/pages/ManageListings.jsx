import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import EditPropertyModal from '../components/EditPropertyModal.jsx';
import { deleteProperty, listProperties } from '../api/adminApi.js';
import { getUser } from '../api/session.js';
import { useToast } from '../context/ToastContext.jsx';
import { rupees } from '../utils/format.js';

const PAGE_SIZE = 8;

/**
 * Manage Listings (was data-section="properties-crud").
 * API: GET /properties?page=&limit=8[&city=] (paginated catalogue),
 *      PATCH /properties/:id (Edit dialog), DELETE /properties/:id.
 * There is deliberately no "Add Property": only sellers create listings.
 */
export default function ManageListings() {
  const showToast = useToast();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ status: 'loading', items: [], page: 1, totalPages: 1, total: 0, error: '' });
  const [editId, setEditId] = useState(null);

  // Loads one page. GET /properties is not city-scoped server-side, so an admin
  // with a city on their session only sees that city (superusers see all).
  const load = async (target) => {
    const nextPage = Math.max(1, target || 1);
    setPage(nextPage);
    setResult((r) => ({ ...r, status: 'loading', error: '' }));
    try {
      const ownCity = (getUser() || {}).city;
      const { items, page: current, totalPages, total } = (await listProperties(nextPage, PAGE_SIZE, ownCity)).data;
      setResult({ status: 'ready', items, page: current, totalPages, total, error: '' });
    } catch (err) {
      setResult((r) => ({ ...r, status: 'error', items: [], error: err.message || "Couldn't load properties from the API." }));
    }
  };

  // First load when the section opens.
  useEffect(() => { load(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (id) => {
    if (!window.confirm('Delete this property? This cannot be undone.')) return;
    try {
      await deleteProperty(id);
      showToast('Property deleted');
      load(page);
    } catch (err) {
      showToast(err.message || 'Failed to delete property', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="Manage Listings"
        subtitle="Every listing on the platform. Sellers create them — you verify, edit, and delete."
      />
      <div className="page-body">
        {result.status === 'error' && <div className="form-error" style={{ marginBottom: '1rem' }}>{result.error}</div>}

        <div className="card table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>TITLE</th><th>LOCATION</th><th>TYPE</th><th>PRICE</th><th>STATUS</th><th>ACTIONS</th></tr>
            </thead>
            <tbody>
              {result.status === 'loading' && <tr><td colSpan="6" className="table-msg">Loading…</td></tr>}
              {result.status === 'ready' && result.items.length === 0 && (
                <tr><td colSpan="6" className="table-msg">No properties yet. Listings appear here once a seller submits one.</td></tr>
              )}
              {result.status === 'ready' && result.items.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td className="muted">{p.city}, {p.state}</td>
                  <td className="capitalize">{p.type}</td>
                  <td className="price">{rupees(p.price)}</td>
                  <td><span className="tag tag--green capitalize">{p.status}</span></td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn btn-sm btn-outline-green" onClick={() => setEditId(p.id)}>Edit</button>
                      <button type="button" className="btn btn-sm btn-outline-red" onClick={() => remove(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <button type="button" className="btn btn-secondary" onClick={() => load(page - 1)}>← Prev</button>
          <span className="muted small-plus">
            {result.status === 'ready' ? `Page ${result.page} of ${Math.max(result.totalPages, 1)} (${result.total} total)` : `Page ${page}`}
          </span>
          <button type="button" className="btn btn-secondary" onClick={() => load(page + 1)}>Next →</button>
        </div>
      </div>

      <EditPropertyModal
        propertyId={editId}
        onClose={() => setEditId(null)}
        onSaved={() => { setEditId(null); load(page); }}
      />
    </>
  );
}
