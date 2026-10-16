/**
 * UserFormModal.jsx
 * Purpose: Create / edit a platform account.
 *   mode 'superuser' – full form: any role, city desk for admins, buyer/seller
 *                      type, edit existing users (superuser-dashboard.html)
 *   mode 'admin'     – create-only, role fixed to "user" (admin-dashboard.html);
 *                      handing out admin/superuser is a superuser action.
 * Inputs (props): open, mode, user (existing account to edit, or null to add),
 *                 onClose, onSaved
 * Outputs: the dialog; inline field and server errors.
 * API calls: POST /users (create), PATCH /users/:id (edit)
 */
import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import { FormField, PasswordInput, TextInput } from '../forms/FormControls.jsx';
import { useToast } from '../feedback/ToastProvider.jsx';
import { usersApi } from '../../api/services.js';
import { SERVICE_CITIES } from '../../utils/constants.js';
import { STRONG_PASSWORD, isValid, validateRules } from '../../utils/validation.js';

const EMPTY = { name: '', email: '', password: '', role: 'user', city: '', userType: '' };

export default function UserFormModal({ open, mode = 'superuser', user, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const editing = !!user; // edit vs add
  const full = mode === 'superuser'; // superuser sees every field

  // Reset (or pre-fill) the form each time it opens.
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setServerError('');
    setForm(
      user
        ? { name: user.name || '', email: user.email || '', password: '', role: user.role || 'user', city: user.city || '', userType: user.userType || '' }
        : EMPTY,
    );
  }, [open, user]);

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    // Old tvValidateUserForm rules + password policy + admin city rule.
    const found = validateRules(form, [
      { field: 'name', label: 'Full Name', required: true, minLen: 2 },
      { field: 'email', label: 'Email', required: true, type: 'email' },
    ]);
    if (!editing && !STRONG_PASSWORD.test(form.password)) {
      found.password = 'Min 8 chars with upper, lower, digit and special character (@$!%*?&)';
    }
    if (full && form.role === 'admin' && !form.city) found.city = 'Pick the city this admin will run.';
    Object.keys(found).forEach((k) => found[k] === undefined && delete found[k]);
    setErrors(found);
    if (!isValid(found)) {
      showToast('Please fill in all required user fields.', 'error');
      return;
    }

    // City is only sent for admins; userType is only meaningful for "user".
    const role = full ? form.role : 'user';
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role,
      ...(full ? { userType: form.userType || undefined, city: role === 'admin' ? form.city : undefined } : {}),
    };
    setSaving(true);
    setServerError('');
    try {
      if (editing) {
        await usersApi.update(user.id, payload); // PATCH /users/:id
        showToast('User updated successfully');
      } else {
        await usersApi.create({ ...payload, password: form.password }); // POST /users
        showToast('User created successfully');
      }
      onSaved();
      onClose();
    } catch (err) {
      setServerError((err.errors && err.errors.join('; ')) || err.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit User' : full ? 'Add New User' : 'Add User'}>
      <form onSubmit={submit} noValidate>
        <FormField id="uf-name" label="Full Name" required error={errors.name}>
          <TextInput id="uf-name" restrict="alpha" value={form.name} onValueChange={set('name')} error={errors.name} />
        </FormField>
        <FormField id="uf-email" label="Email Address" required error={errors.email}>
          <TextInput id="uf-email" type="email" restrict="email" value={form.email} onValueChange={set('email')} error={errors.email} />
        </FormField>
        {!editing && (
          <FormField id="uf-password" label="Password" required error={errors.password} hint="Min 8 chars, upper/lower/digit/special">
            <PasswordInput id="uf-password" autoComplete="new-password" value={form.password} onValueChange={set('password')} error={errors.password} />
          </FormField>
        )}
        {full ? (
          <>
            <FormField id="uf-role" label="Role">
              <select id="uf-role" className="form-control" value={form.role} onChange={(e) => set('role')(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superuser">Superuser</option>
              </select>
            </FormField>
            {/* Every admin runs exactly one city (the server enforces one admin per city). */}
            {form.role === 'admin' && (
              <FormField
                id="uf-city"
                label="City desk (admins only)"
                required
                error={errors.city}
                hint="This admin will only see listings, visits, negotiations and purchases in this city."
              >
                <select id="uf-city" className="form-control" value={form.city} onChange={(e) => set('city')(e.target.value)}>
                  <option value="">Select a city</option>
                  {SERVICE_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
            <FormField id="uf-usertype" label='User Type (buyer/seller — only applies to "User" role)'>
              <select id="uf-usertype" className="form-control" value={form.userType} onChange={(e) => set('userType')(e.target.value)}>
                <option value="">None</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </FormField>
          </>
        ) : (
          <FormField id="uf-role" label="Role" hint="Need another admin? Create it from the Superuser dashboard.">
            <select id="uf-role" className="form-control" value="user" disabled>
              <option value="user">User</option>
            </select>
          </FormField>
        )}
        {serverError && (
          <p className="form-problem" role="alert">
            {serverError}
          </p>
        )}
        <div className="button-row">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save User' : full ? 'Save User' : 'Create User'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
