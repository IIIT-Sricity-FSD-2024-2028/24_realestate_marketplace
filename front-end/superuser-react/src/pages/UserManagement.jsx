import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import UserModal from '../components/UserModal.jsx';
import Icon from '../components/Icons.jsx';
import { TableRowMessage } from '../components/StateMessage.jsx';
import { deleteUser, listUsers, setUserBlocked } from '../api/superuserApi.js';
import useSuperuserData from '../hooks/useSuperuserData.js';
import { useToast } from '../context/ToastContext.jsx';

export default function UserManagement() {
  const showToast = useToast();
  const { data, status, error, reload } = useSuperuserData(async () => {
    const res = await listUsers();
    return res.data || [];
  }, { live: false });

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const users = data || [];

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.id || '').toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, query, roleFilter]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleToggleBlock = async (user) => {
    const nextBlocked = !user.isBlocked;
    setBusyId(user.id);
    try {
      await setUserBlocked(user.id, nextBlocked);
      showToast(user.name + (nextBlocked ? ' has been blocked' : ' has been unblocked'));
      reload(true);
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.email}"? This cannot be undone.`)) {
      return;
    }
    setBusyId(user.id);
    try {
      await deleteUser(user.id);
      showToast('User deleted successfully');
      reload(true);
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="section active">
      <PageHeader
        title="User Management (CRUD)"
        subtitle="Create, Read, Update, and Delete platform users."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAdd}
          >
            <Icon name="plus" size="1.1rem" />
            <span>Add User</span>
          </button>
        }
      />

      <div className="section-body">
        {status === 'error' && (
          <div className="form-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error?.message || 'Failed to load user list.'}
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
                  placeholder="Search users by name, email, or ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                className="select-field"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="superuser">Superuser</option>
              </select>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '6rem' }}>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ width: '8.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' && !data && (
                <TableRowMessage>Loading users…</TableRowMessage>
              )}

              {status !== 'loading' && filteredUsers.length === 0 && (
                <TableRowMessage>No users found matching criteria.</TableRowMessage>
              )}

              {filteredUsers.map((u) => {
                const isBlocked = !!u.isBlocked;
                const isBusy = busyId === u.id;

                return (
                  <tr key={u.id}>
                    <td className="code-font">{u.id ? u.id.slice(-8) : '—'}</td>
                    <td className="strong">{u.name}</td>
                    <td className="muted">{u.email}</td>
                    <td>
                      <span className="badge default">
                        {u.role === 'admin' && u.city
                          ? `Admin · ${u.city}`
                          : u.userType || u.role}
                      </span>
                    </td>
                    <td>
                      {isBlocked ? (
                        <span className="badge badge--danger">Blocked</span>
                      ) : (
                        <span className="badge primary">Active</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="actions-cell">
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit User"
                          onClick={() => handleOpenEdit(u)}
                          disabled={isBusy}
                        >
                          <Icon name="edit" size="1.1rem" />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          title={isBlocked ? 'Unblock User' : 'Block User'}
                          onClick={() => handleToggleBlock(u)}
                          disabled={isBusy}
                        >
                          <Icon name={isBlocked ? 'unlock' : 'lock'} size="1.1rem" />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon--danger"
                          title="Delete User"
                          onClick={() => handleDelete(u)}
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

      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={editingUser}
        onSaved={() => reload(true)}
      />
    </div>
  );
}
