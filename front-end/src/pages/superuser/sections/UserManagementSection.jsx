/**
 * UserManagementSection.jsx
 * Purpose: Superuser user CRUD — search, role filter, add/edit, block/unblock,
 *          delete. A superuser may block any account, including admins.
 * Inputs:  Redux store (usersSlice — items, status, error, searchQuery, roleFilter).
 * Outputs: the users table and the add/edit dialog.
 * API calls (via Redux thunks): GET /users, POST /users, PATCH /users/:id,
 *            DELETE /users/:id
 * Local React state: modal open/closed + which user is being edited (ephemeral,
 *   not shared — these reset correctly when the modal closes).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, PageHeader, StatusLine } from '../../../components/common/ui.jsx';
import UserFormModal from '../../../components/users/UserFormModal.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { useDialog } from '../../../components/feedback/DialogProvider.jsx';
import { useAppDispatch, useAppSelector } from '../../../store/index.js';
import {
  deleteUser,
  fetchUsers,
  selectUsers,
  selectUsersError,
  selectUsersRoleFilter,
  selectUsersSearchQuery,
  selectUsersStatus,
  setRoleFilter,
  setSearchQuery,
  updateUser,
} from '../../../store/slices/usersSlice.js';

export default function UserManagementSection() {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const dispatch = useAppDispatch();

  // ── Redux state ────────────────────────────────────────────────────────
  const users = useAppSelector(selectUsers);
  const status = useAppSelector(selectUsersStatus);
  const error = useAppSelector(selectUsersError);
  const query = useAppSelector(selectUsersSearchQuery);   // persisted search box
  const role = useAppSelector(selectUsersRoleFilter);     // persisted role dropdown

  // ── Local state: modal only (ephemeral open/close — not shared) ────────
  const [modal, setModal] = useState({ open: false, user: null });

  // Fetch users once on mount (or if the slice was reset).
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUsers());
    }
  }, [dispatch, status]);

  // Callback so the UserFormModal's onSaved can re-fetch after create/edit.
  const reload = useCallback(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Client-side search over name/email/id + role filter (unchanged from before).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (!q ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.includes(q)) &&
        (role === 'all' || u.role === role),
    );
  }, [users, query, role]);

  const toggleBlock = async (u) => {
    try {
      await dispatch(updateUser({ id: u.id, payload: { isBlocked: !u.isBlocked } })).unwrap();
      showToast(u.isBlocked ? 'User unblocked' : 'User blocked');
      dispatch(fetchUsers());
    } catch (err) {
      showToast(err || 'Failed to update user', 'error');
    }
  };

  const remove = async (u) => {
    const ok = await confirm({
      message: 'Delete user "' + u.email + '"? This cannot be undone.',
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await dispatch(deleteUser(u.id)).unwrap();
      showToast('User deleted');
    } catch (err) {
      showToast(err || 'Failed to delete user', 'error');
    }
  };

  const loading = status === 'loading';

  return (
    <>
      <PageHeader
        title="User Management (CRUD)"
        subtitle="Create, Read, Update, and Delete platform users."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setModal({ open: true, user: null })}>
            + Add User
          </button>
        }
      />
      <div className="content">
        <div className="table-card">
          <div className="toolbar">
            <label className="sr-only" htmlFor="su-user-search">
              Search users
            </label>
            <input
              id="su-user-search"
              className="form-control"
              placeholder="Search users..."
              value={query}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            />
            <label className="sr-only" htmlFor="su-user-role">
              Filter by role
            </label>
            <select
              id="su-user-role"
              className="form-control toolbar-select"
              value={role}
              onChange={(e) => dispatch(setRoleFilter(e.target.value))}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="superuser">Superuser</option>
            </select>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading || error ? (
                  <tr>
                    <td colSpan={6}>
                      <StatusLine loading={loading} error={error} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id}>
                      <td className="mono">{u.id.slice(-8)}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <Badge tone="gray">{u.userType || u.role}</Badge>
                      </td>
                      <td>{u.isBlocked ? <Badge tone="red">Blocked</Badge> : <Badge tone="green">Active</Badge>}</td>
                      <td>
                        <div className="action-row">
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => setModal({ open: true, user: u })}
                            aria-label={'Edit ' + u.name}
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => toggleBlock(u)}
                            aria-label={(u.isBlocked ? 'Unblock ' : 'Block ') + u.name}
                            title={u.isBlocked ? 'Unblock' : 'Block'}
                          >
                            {u.isBlocked ? '🔓' : '🔒'}
                          </button>
                          <button type="button" className="icon-btn" onClick={() => remove(u)} aria-label={'Delete ' + u.name} title="Delete">
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
      <UserFormModal open={modal.open} mode="superuser" user={modal.user} onClose={() => setModal({ open: false, user: null })} onSaved={reload} />
    </>
  );
}
