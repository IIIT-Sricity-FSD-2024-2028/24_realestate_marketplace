/**
 * PropertyEditModal.jsx
 * Purpose: "Edit Property" dialog used by Admin › Manage Listings and
 *          Superuser › Property Operations (identical forms on both old pages).
 *          Staff can edit and delete listings but never create them — creating
 *          is a seller action, enforced by the API too.
 * Inputs (props): property – listing to edit (null = closed)
 *                 onClose – close handler
 *                 onSaved – called after a successful save (to reload lists)
 * Outputs: the form; shows validation and API errors inline.
 * API calls: GET /properties/:id (fresh copy), PATCH /properties/:id
 */
import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import { FormField, TextInput } from '../forms/FormControls.jsx';
import { useToast } from '../feedback/ToastProvider.jsx';
import { propertiesApi } from '../../api/services.js';
import { PROPERTY_STATUSES, PROPERTY_TYPES } from '../../utils/constants.js';
import { capitalize } from '../../utils/format.js';

/** Converts an API listing into form strings. */
function toForm(p) {
  return {
    title: p.title || '',
    description: p.description || '',
    type: p.type || 'apartment',
    listingType: p.listingType || 'sale',
    price: String(p.price ?? ''),
    areaSqft: String(p.areaSqft ?? ''),
    bedrooms: String(p.bedrooms ?? 2),
    bathrooms: String(p.bathrooms ?? 2),
    address: p.address || '',
    city: p.city || '',
    state: p.state || '',
    status: p.status || 'available',
  };
}

/** Client-side checks that mirror the API's UpdatePropertyDto limits. */
export function validatePropertyForm(f) {
  const errors = {};
  if (f.title.trim().length < 10) errors.title = 'Title must be at least 10 characters';
  else if (f.title.trim().length > 150) errors.title = 'Title must be at most 150 characters';
  if (f.description.trim().length < 20) errors.description = 'Description must be at least 20 characters';
  if (!(Number(f.price) >= 1)) errors.price = 'Price must be at least ₹1';
  if (!(Number(f.areaSqft) >= 1)) errors.areaSqft = 'Area must be at least 1 sqft';
  const beds = Number(f.bedrooms);
  if (!Number.isInteger(beds) || beds < 0 || beds > 20) errors.bedrooms = 'Bedrooms must be 0–20';
  const baths = Number(f.bathrooms);
  if (!Number.isInteger(baths) || baths < 1 || baths > 20) errors.bathrooms = 'Bathrooms must be 1–20';
  if (!f.address.trim()) errors.address = 'Address is required';
  if (!f.city.trim()) errors.city = 'City is required';
  if (!f.state.trim()) errors.state = 'State is required';
  return errors;
}

export default function PropertyEditModal({ property, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  // Fill the form when a listing is chosen, then refresh it from the API.
  useEffect(() => {
    if (!property) return undefined;
    let alive = true;
    setForm(toForm(property));
    setErrors({});
    setServerError('');
    propertiesApi
      .get(property.id)
      .then((res) => alive && setForm(toForm(res.data)))
      .catch(() => {
        /* keep the list copy if the refresh fails */
      });
    return () => {
      alive = false;
    };
  }, [property]);

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validatePropertyForm(form);
    setErrors(found);
    if (Object.keys(found).length) {
      showToast('Please fill in all required property fields.', 'error');
      return;
    }
    setSaving(true);
    setServerError('');
    try {
      // Same payload the old pages sent (numbers converted, text trimmed).
      await propertiesApi.update(property.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        listingType: form.listingType,
        price: Number(form.price),
        areaSqft: Number(form.areaSqft),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        status: form.status,
      });
      showToast('Property updated successfully');
      onSaved();
      onClose();
    } catch (err) {
      setServerError((err.errors && err.errors.join('; ')) || err.message || 'Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!property} onClose={onClose} title="Edit Property" size="lg">
      {form && (
        <form onSubmit={submit} noValidate className="form-grid-2">
          <FormField id="pe-title" label="Title" required error={errors.title} className="span-2">
            <TextInput
              id="pe-title"
              maxLength={150}
              placeholder="e.g. 3BHK Spacious Apartment in Anna Nagar"
              value={form.title}
              onValueChange={set('title')}
              error={errors.title}
            />
          </FormField>
          <FormField id="pe-description" label="Description" required error={errors.description} className="span-2">
            <textarea
              id="pe-description"
              className={'form-control' + (errors.description ? ' is-invalid' : '')}
              rows={3}
              placeholder="At least 20 characters"
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
            />
          </FormField>
          <FormField id="pe-type" label="Type">
            <select id="pe-type" className="form-control" value={form.type} onChange={(e) => set('type')(e.target.value)}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {capitalize(t)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="pe-listingType" label="Listing Type">
            <select id="pe-listingType" className="form-control" value={form.listingType} onChange={(e) => set('listingType')(e.target.value)}>
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
          </FormField>
          <FormField id="pe-price" label="Price (₹)" required error={errors.price}>
            <TextInput id="pe-price" type="number" min="1" value={form.price} onValueChange={set('price')} error={errors.price} />
          </FormField>
          <FormField id="pe-area" label="Area (sqft)" required error={errors.areaSqft}>
            <TextInput id="pe-area" type="number" min="1" value={form.areaSqft} onValueChange={set('areaSqft')} error={errors.areaSqft} />
          </FormField>
          <FormField id="pe-beds" label="Bedrooms" required error={errors.bedrooms}>
            <TextInput id="pe-beds" type="number" min="0" max="20" value={form.bedrooms} onValueChange={set('bedrooms')} error={errors.bedrooms} />
          </FormField>
          <FormField id="pe-baths" label="Bathrooms" required error={errors.bathrooms}>
            <TextInput id="pe-baths" type="number" min="1" max="20" value={form.bathrooms} onValueChange={set('bathrooms')} error={errors.bathrooms} />
          </FormField>
          <FormField id="pe-address" label="Address" required error={errors.address} className="span-2">
            <TextInput id="pe-address" value={form.address} onValueChange={set('address')} error={errors.address} />
          </FormField>
          <FormField id="pe-city" label="City" required error={errors.city}>
            <TextInput id="pe-city" restrict="alpha" value={form.city} onValueChange={set('city')} error={errors.city} />
          </FormField>
          <FormField id="pe-state" label="State" required error={errors.state}>
            <TextInput id="pe-state" restrict="alpha" value={form.state} onValueChange={set('state')} error={errors.state} />
          </FormField>
          <FormField id="pe-status" label="Status" className="span-2">
            <select id="pe-status" className="form-control" value={form.status} onChange={(e) => set('status')(e.target.value)}>
              {PROPERTY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormField>
          {serverError && (
            <p className="form-problem span-2" role="alert">
              {serverError}
            </p>
          )}
          <div className="button-row span-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Property'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
