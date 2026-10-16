/**
 * ManageListingsSection.jsx
 * Purpose: "Manage Listings" — every verified listing in this admin's city,
 *          8 per page, with Edit and Delete. Admins never create listings.
 * Inputs:  none (reads the admin's city from the session).
 * Outputs: paginated table + edit dialog.
 * API calls: GET /properties?page=N&limit=8[&city=…], PATCH /properties/:id
 *            (PropertyEditModal), DELETE /properties/:id
 */
import { useCallback, useEffect, useState } from 'react';
import { Badge, PageHeader, Pager, StatusLine } from '../../../components/common/ui.jsx';
import PropertyEditModal from '../../../components/property/PropertyEditModal.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { useDialog } from '../../../components/feedback/DialogProvider.jsx';
import { propertiesApi } from '../../../api/services.js';
import { getUser } from '../../../auth/session.js';
import { formatINR, joinPlace } from '../../../utils/format.js';

const PAGE_SIZE = 8;

export default function ManageListingsSection() {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  // GET /properties is the public, all-city catalogue; an admin only manages their own city.
  const city = (getUser() || {}).city || undefined;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await propertiesApi.list({ page, limit: PAGE_SIZE, city });
      setData(res.data);
      setError('');
    } catch (err) {
      setError(err.message || "Couldn't load properties from the API.");
    } finally {
      setLoading(false);
    }
  }, [page, city]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (p) => {
    if (!(await confirm({ message: 'Delete this property? This cannot be undone.', confirmText: 'Delete', danger: true }))) return;
    try {
      await propertiesApi.remove(p.id);
      showToast('Property deleted');
      load();
    } catch (err) {
      showToast(err.message || 'Failed to delete property', 'error');
    }
  };

  return (
    <>
      <PageHeader title="Manage Listings" subtitle="Every listing on the platform. Sellers create them — you verify, edit, and delete." />
      <div className="content">
        <StatusLine error={error} />
        <div className="table-card">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Location</th>
                  <th scope="col">Type</th>
                  <th scope="col">Price</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && !data.items.length ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      Loading…
                    </td>
                  </tr>
                ) : data.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No properties yet. Listings appear here once a seller submits one.
                    </td>
                  </tr>
                ) : (
                  data.items.map((p) => (
                    <tr key={p.id}>
                      <td>{p.title}</td>
                      <td className="text-secondary">{joinPlace(p.city, p.state)}</td>
                      <td className="capitalize">{p.type}</td>
                      <td className="text-brand strong">{formatINR(p.price)}</td>
                      <td>
                        <Badge tone="green" className="capitalize">
                          {p.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="action-row">
                          <button type="button" className="btn btn-sm btn-outline-green" onClick={() => setEditing(p)}>
                            Edit
                          </button>
                          <button type="button" className="btn btn-sm btn-outline-red" onClick={() => remove(p)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Pager page={data.page || page} totalPages={data.totalPages} total={data.total} onPage={(n) => setPage(Math.max(1, n))} />
      </div>
      <PropertyEditModal property={editing} onClose={() => setEditing(null)} onSaved={load} />
    </>
  );
}
