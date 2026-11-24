/**
 * PropertyOperationsSection.jsx
 * Purpose: Global property catalogue for the superuser — search, status
 *          filter (server-side), edit and delete. No "Add": sellers create listings.
 * Inputs:  none.
 * Outputs: properties table + edit dialog.
 * API calls: GET /properties?limit=50[&status=…], PATCH /properties/:id,
 *            DELETE /properties/:id
 */
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import PropertyEditModal from '../../../components/property/PropertyEditModal.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { useDialog } from '../../../components/feedback/DialogProvider.jsx';
import { deleteProperty, fetchProperties } from '../../../store/actions/apiActions.js';
import { formatINR, joinPlace } from '../../../utils/format.js';
import { PROPERTY_STATUSES } from '../../../utils/constants.js';

export default function PropertyOperationsSection() {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const dispatch = useDispatch();
  const items = useSelector((state) => state.properties.public.items);
  const loading = useSelector((state) => state.properties.loading.public);
  const error = useSelector((state) => state.properties.error);
  const [status, setStatus] = useState('all'); // server-side filter
  const [query, setQuery] = useState(''); // client-side search
  const [editing, setEditing] = useState(null); // listing in the edit dialog

  useEffect(() => {
    dispatch(fetchProperties({ limit: 50, status: status === 'all' ? undefined : status }));
  }, [dispatch, status]);
  const load = () => dispatch(fetchProperties({ limit: 50, status: status === 'all' ? undefined : status }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => !q || p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || (p.address || '').toLowerCase().includes(q));
  }, [items, query]);

  const remove = async (p) => {
    const ok = await confirm({ message: 'Delete "' + p.title + '"? This cannot be undone.', confirmText: 'Delete', danger: true });
    if (!ok) return;
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
      <PageHeader title="Property Operations (CRUD)" subtitle="Global property catalog. Sellers create listings — you edit and delete them." />
      <div className="content">
        <div className="table-card">
          <div className="toolbar">
            <label className="sr-only" htmlFor="su-prop-search">
              Search properties
            </label>
            <input id="su-prop-search" className="form-control" placeholder="Search properties..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <label className="sr-only" htmlFor="su-prop-status">
              Filter by status
            </label>
            <select id="su-prop-status" className="form-control toolbar-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              {PROPERTY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Property ID</th>
                  <th scope="col">Details</th>
                  <th scope="col">Price</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(loading && !items.length) || error ? (
                  <tr>
                    <td colSpan={5}>
                      <StatusLine loading={loading} error={error} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-empty">
                      No properties found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="mono">{p.id.slice(-8)}</td>
                      <td>
                        <strong>{p.title}</strong>
                        <div className="text-secondary small">{joinPlace(p.city, p.state)}</div>
                      </td>
                      <td>{formatINR(p.price)}</td>
                      <td>
                        <Badge tone="gray">{p.status}</Badge>
                      </td>
                      <td>
                        <div className="action-row">
                          <button type="button" className="icon-btn" onClick={() => setEditing(p)} aria-label={'Edit ' + p.title} title="Edit">
                            ✎
                          </button>
                          <button type="button" className="icon-btn" onClick={() => remove(p)} aria-label={'Delete ' + p.title} title="Delete">
                            🗑
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
      </div>
      <PropertyEditModal property={editing} onClose={() => setEditing(null)} onSaved={load} />
    </>
  );
}
