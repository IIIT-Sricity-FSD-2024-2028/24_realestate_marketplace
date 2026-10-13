import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import FormField from './FormField.jsx';
import { createUser, updateUser } from '../api/superuserApi.js';
import { errorText } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

const CITIES = ['Hyderabad', 'Chennai', 'Bangalore', 'Kochi'];

export default function UserModal({ open, onClose, user, onSaved }) {
  const showToast = useToast();
  const isEditing = !!user;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [userType, setUserType] = useState('');
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword('');
      setRole(user.role || 'user');
      setUserType(user.userType || '');
      setCity(user.city || '');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
      setUserType('');
      setCity('');
    }
    setError('');
  }, [user, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Please provide both name and email.');
      return;
    }

    if (!isEditing && !password) {
      setError('Please provide an initial password for the user.');
      return;
    }

    if (role === 'admin' && !city) {
      setError('Pick the city desk this admin will run.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await updateUser(user.id, {
          name: name.trim(),
          email: email.trim(),
          role,
          userType: role === 'user' ? (userType || undefined) : undefined,
          city: role === 'admin' ? city : undefined,
        });
        showToast('User updated successfully');
      } else {
        await createUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          userType: role === 'user' ? (userType || undefined) : undefined,
          city: role === 'admin' ? city : undefined,
        });
        showToast('User created successfully');
      }
      onClose();
      onSaved();
    } catch (err) {
      setError(errorText(err, 'Failed to save user'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit User' : 'Add New User'}
      maxWidth="30rem"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-body">
          {error && <div className="form-alert-error">{error}</div>}

          <FormField
            label="Full Name"
            type="text"
            required
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <FormField
            label="Email Address"
            type="email"
            required
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {!isEditing && (
            <FormField
              label="Password"
              type="password"
              required
              placeholder="Min 8 chars, upper/lower/digit/special"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          <FormField
            label="Role"
            as="select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superuser">Superuser</option>
          </FormField>

          {role === 'admin' && (
            <FormField
              label="City desk (admins only)"
              as="select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">Select a city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </FormField>
          )}

          {role === 'user' && (
            <FormField
              label="User Type (optional for User role)"
              as="select"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="">None / Both</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </FormField>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving…' : 'Save User'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
