/**
 * ManageListingsSection.jsx
 * Purpose: "Manage Listings" — every verified listing in this admin's city,
 *          8 per page, with Edit and Delete. Admins never create listings.
 * Inputs:  none (reads the admin's city from the session).
 * Outputs: paginated table + edit dialog.
 * API calls: GET /properties?page=N&limit=8[&city=…], PATCH /properties/:id
 *            (PropertyEditModal), DELETE /properties/:id
 */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, PageHeader, Pager, StatusLine } from '../../../components/common/ui.jsx';
import PropertyEditModal from '../../../components/property/PropertyEditModal.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { useDialog } from '../../../components/feedback/DialogProvider.jsx';
import { deleteProperty, fetchProperties } from '../../../store/actions/apiActions.js';
import { formatINR, joinPlace } from '../../../utils/format.js';

const PAGE_SIZE = 8;

export default function ManageListingsSection() {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const data = useSelector((state) => state.properties.public);
  const loading = useSelector((state) => state.properties.loading.public);
  const error = useSelector((state) => state.properties.error);
  const city = useSelector((state) => state.auth.user?.city || undefined);
  const [editing, setEditing] = useState(null);
  const load = () => dispatch(fetchProperties({ page, limit: PAGE_SIZE, city }));
  useEffect(() => {
    dispatch(fetchProperties({ page, limit: PAGE_SIZE, city }));
  }, [dispatch, page, city]);

  const remove = async (p) => {
    if (!(await confirm({ message: 'Delete this property? This cannot be undone.', confirmText: 'Delete', danger: true }))) return;
    try {
      await dispatch(deleteProperty(p.id)).unwrap();
      showToast('Property deleted');
      load();
    } catch (err) {
      showToast((typeof err === 'string' ? err : err.message) || 'Failed to delete property', 'error');
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
