/**
 * AdminUsersSection.jsx
 * Purpose: Admin "User Management" — search, role filter, block/unblock,
 *          delete, and add a regular user. Superuser accounts are shown as
 *          protected (the API refuses admin actions on them anyway).
 * Inputs (props): desk – shared data (desk.users) + reload
 * Outputs: users table and the Add User dialog.
 * API calls: PATCH /users/:id { isBlocked }, DELETE /users/:id,
 *            POST /users (through UserFormModal), GET /users (via desk.reload)
 */
import { useMemo, useState } from 'react';
import { Badge, PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import UserFormModal from '../../../components/users/UserFormModal.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { useDialog } from '../../../components/feedback/DialogProvider.jsx';
import { usersApi } from '../../../api/services.js';

export default function AdminUsersSection({ desk }) {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState(null); // disables a row's buttons mid-request

  const users = useMemo(() => {
    const q = query.trim().toLowerCase();
    return desk.users.filter(
      (u) =>
        (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)) && (role === 'all' || u.role === role),
    );
  }, [desk.users, query, role]);

  const toggleBlock = async (u) => {
    setBusyId(u.id);
    try {
      // Blocked accounts are refused at login and their sessions end at once.
      await usersApi.update(u.id, { isBlocked: !u.isBlocked });
      showToast(u.name + (u.isBlocked ? ' has been unblocked' : ' has been blocked'));
      await desk.reload('users');
    } catch (err) {
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (u) => {
    if (!(await confirm({ message: 'Delete this user? This cannot be undone.', confirmText: 'Delete', danger: true }))) return;
    try {
      await usersApi.remove(u.id);
      showToast('User deleted');
      desk.reload('users');
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Manage platform users"
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
            + Add User
          </button>
        }
      />
      <div className="content">
        <div className="toolbar toolbar-bare">
          <label className="sr-only" htmlFor="admin-user-search">
            Search users
          </label>
          <input
            id="admin-user-search"
            className="form-control"
            placeholder="Search users by name, email, or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="sr-only" htmlFor="admin-user-role">
            Filter by role
          </label>
          <select id="admin-user-role" className="form-control toolbar-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
        <StatusLine error={desk.errors.users} />
        <div className="table-card">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">User ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {desk.loading.users ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      Loading…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No users yet.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td className="mono text-secondary">{u.id.slice(-8)}</td>
                      <td>{u.name}</td>
                      <td className="text-secondary">{u.email}</td>
                      <td>
                        <Badge tone="green" className="capitalize">
                          {u.userType || u.role}
                        </Badge>
                      </td>
                      <td>{u.isBlocked ? <Badge tone="red">Blocked</Badge> : <Badge tone="green">Active</Badge>}</td>
                      <td>
                        {u.role === 'superuser' ? (
                          <span className="text-secondary small italic">Protected (superuser)</span>
                        ) : (
                          <div className="action-row">
                            <button
                              type="button"
                              className={'btn btn-sm ' + (u.isBlocked ? 'btn-outline-green' : 'btn-outline-red')}
                              disabled={busyId === u.id}
                              onClick={() => toggleBlock(u)}
                            >
                              {u.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-red" onClick={() => remove(u)}>
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <UserFormModal open={adding} mode="admin" user={null} onClose={() => setAdding(false)} onSaved={() => desk.reload('users')} />
    </>
  );
}
