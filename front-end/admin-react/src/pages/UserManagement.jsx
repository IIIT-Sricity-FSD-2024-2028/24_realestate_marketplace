import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import AddUserModal from '../components/AddUserModal.jsx';
import { deleteUser, listUsers, setUserBlocked } from '../api/adminApi.js';
import { useToast } from '../context/ToastContext.jsx';
import useAdminData from '../hooks/useAdminData.js';

/**
 * User Management (was data-section="users").
 * APIs: GET /users (list), POST /users (Add User modal),
 *       PATCH /users/:id { isBlocked } (Block/Unblock), DELETE /users/:id.
 * Search (name / email / ID) and the role filter run in the browser.
 */
export default function UserManagement() {
  const showToast = useToast();
  // The old page loaded users once (no live refresh), so live is off here too.
  const { status, data, error, reload } = useAdminData(async () => (await listUsers()).data, { live: false });
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const users = data || [];
  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter((u) => {
      const matchesSearch = !q
        || (u.name || '').toLowerCase().includes(q)
        || (u.email || '').toLowerCase().includes(q)
        || u.id.slice(-8).toLowerCase().includes(q);
      return matchesSearch && (role === 'all' || u.role === role);
    });
  }, [users, query, role]);

  // Blocked accounts are rejected at login and their open sessions stop working.
  const toggleBlock = async (user) => {
    const nextBlocked = !user.isBlocked;
    setBusyId(user.id);
    try {
      await setUserBlocked(user.id, nextBlocked);
      showToast(user.name + (nextBlocked ? ' has been blocked' : ' has been unblocked'));
      reload(true);
    } catch (err) {
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (user) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await deleteUser(user.id);
      showToast('User deleted');
      reload(true);
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Manage platform users"
        actions={<button type="button" className="btn btn-primary" onClick={() => setAddOpen(true)}>+ Add User</button>}
      />
      <div className="page-body">
        <div className="toolbar">
          <input
            className="input input--search"
            type="text"
            placeholder="Search users by name, email, or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="input input--search input--auto" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {status === 'error' && <div className="form-error" style={{ marginBottom: '1rem' }}>{error.message || "Couldn't load users from the API."}</div>}

        <div className="card table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>USER ID</th><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>STATUS</th><th>ACTION</th></tr>
            </thead>
            <tbody>
              {status === 'loading' && !data && <tr><td colSpan="6" className="table-msg">Loading…</td></tr>}
              {status === 'ready' && users.length === 0 && <tr><td colSpan="6" className="table-msg">No users yet.</td></tr>}
              {status !== 'error' && visible.map((u) => (
                <tr key={u.id}>
                  <td className="muted">{u.id.slice(-8)}</td>
                  <td>{u.name}</td>
                  <td className="muted">{u.email}</td>
                  <td><span className="tag tag--green">{u.userType || u.role}</span></td>
                  <td>
                    {u.isBlocked
                      ? <span className="tag tag--red">Blocked</span>
                      : <span className="tag tag--green">Active</span>}
                  </td>
                  <td>
                    {u.role === 'superuser' ? (
                      // An admin cannot block/delete a superuser — the API returns 403 anyway.
                      <span className="protected-note">Protected (superuser)</span>
                    ) : (
                      <div className="row-actions">
                        <button
                          type="button"
                          className={'btn btn-sm ' + (u.isBlocked ? 'btn-outline-green' : 'btn-outline-red')}
                          disabled={busyId === u.id}
                          onClick={() => toggleBlock(u)}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-red" onClick={() => remove(u)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => { setAddOpen(false); reload(true); }}
      />
    </>
  );
}
