import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import PropertyModal from '../components/PropertyModal.jsx';
import Icon from '../components/Icons.jsx';
import { TableRowMessage } from '../components/StateMessage.jsx';
import { deleteProperty, listProperties } from '../api/superuserApi.js';
import useSuperuserData from '../hooks/useSuperuserData.js';
import { formatINR } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';

export default function PropertyOperations() {
  const showToast = useToast();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, status, error, reload } = useSuperuserData(async () => {
    const res = await listProperties({ status: statusFilter, limit: 100 });
    return (res.data && res.data.items) || [];
  }, { live: false });

  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProp, setEditingProp] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const properties = data || [];

  const filteredProperties = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((p) => {
      if (!q) return true;
      return (
        (p.title || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q) ||
        (p.address || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q)
      );
    });
  }, [properties, query]);

  const handleOpenEdit = (p) => {
    setEditingProp(p);
    setModalOpen(true);
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete listing "${p.title}"? This cannot be undone.`)) {
      return;
    }
    setBusyId(p.id);
    try {
      await deleteProperty(p.id);
      showToast('Property deleted successfully');
      reload(true);
    } catch (err) {
      showToast(err.message || 'Failed to delete property', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="section active">
      <PageHeader
        title="Property Operations (CRUD)"
        subtitle="Global property catalog. Sellers create listings — you edit and delete them."
      />

      <div className="section-body">
        {status === 'error' && (
          <div className="form-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error?.message || 'Failed to load property listings.'}
          </div>
        )}

        <div className="table-container">
          <div className="table-filter-bar">
            <div className="search-bar">
              <div className="search-input-wrap">
                <Icon name="search" size="1.1rem" className="search-icon" />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search properties by title, city, or address..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                className="select-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="under_offer">Under Offer</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '6.5rem' }}>Property ID</th>
                <th>Details</th>
                <th>Price</th>
                <th>Status</th>
                <th style={{ width: '6.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' && !data && (
                <TableRowMessage colSpan={5}>Loading properties…</TableRowMessage>
              )}

              {status !== 'loading' && filteredProperties.length === 0 && (
                <TableRowMessage colSpan={5}>No properties found.</TableRowMessage>
              )}

              {filteredProperties.map((p) => {
                const isBusy = busyId === p.id;

                return (
                  <tr key={p.id}>
                    <td className="code-font">{p.id ? p.id.slice(-8) : '—'}</td>
                    <td>
                      <div className="strong" style={{ fontSize: '0.9375rem' }}>
                        {p.title}
                      </div>
                      <div className="table-subtitle">
                        {p.city}{p.state ? `, ${p.state}` : ''} · {p.type || 'property'}
                      </div>
                    </td>
                    <td className="strong price-cell">{formatINR(p.price)}</td>
                    <td>
                      <span className="badge default capitalize">
                        {p.status ? p.status.replace('_', ' ') : 'available'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="actions-cell">
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit Property"
                          onClick={() => handleOpenEdit(p)}
                          disabled={isBusy}
                        >
                          <Icon name="edit" size="1.1rem" />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon--danger"
                          title="Delete Property"
                          onClick={() => handleDelete(p)}
                          disabled={isBusy}
                        >
                          <Icon name="trash" size="1.1rem" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PropertyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        property={editingProp}
        onSaved={() => reload(true)}
      />
    </div>
  );
}
