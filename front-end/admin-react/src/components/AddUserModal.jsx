import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import FormField from './FormField.jsx';
import { createUser } from '../api/adminApi.js';
import { errorText } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

const EMPTY = { name: '', email: '', password: '', role: 'user' };

/**
 * "Add User" dialog — POST /users.
 * Only the "user" role is offered: creating admins/superusers is a superuser
 * action, and the API rejects it from an admin as well.
 * The backend's password rules (upper/lower/digit/special) come back as
 * validation errors and are listed under the form.
 */
export default function AddUserModal({ open, onClose, onCreated }) {
  const showToast = useToast();
  const [values, setValues] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Fresh, empty form every time the dialog opens.
  useEffect(() => { if (open) { setValues(EMPTY); setFormError(''); } }, [open]);

  const set = (field) => (value) => setValues((v) => ({ ...v, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await createUser({ name: values.name.trim(), email: values.email.trim(), password: values.password, role: values.role });
      showToast('User created successfully');
      onCreated();
    } catch (err) {
      setFormError(errorText(err, 'Failed to create user'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add User">
      <form className="form-stack" onSubmit={submit}>
        <FormField label="Name" required minLength={2} restrict="alpha" value={values.name} onValueChange={set('name')} />
        <FormField label="Email" type="email" required restrict="email" value={values.email} onValueChange={set('email')} />
        <FormField
          label="Password"
          type="password"
          required
          minLength={8}
          placeholder="Aa1@aaaa (min 8, upper/lower/digit/special)"
          value={values.password}
          onValueChange={set('password')}
        />
        <div>
          <FormField label="Role" as="select" value={values.role} onValueChange={set('role')}>
            <option value="user">User</option>
          </FormField>
          <p className="field-note">Need another admin? Create it from the Superuser dashboard.</p>
        </div>
        {formError && <div className="form-error">{formError}</div>}
        <div className="modal-actions">
          <button type="submit" className="btn btn-primary btn-grow" disabled={saving}>{saving ? 'Creating…' : 'Create User'}</button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
